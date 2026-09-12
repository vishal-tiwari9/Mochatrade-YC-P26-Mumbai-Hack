const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // ignore
}

require("dotenv").config({ path: __dirname + "/../../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { calculateEmi, maxPrincipalForEmi, round2 } = require("../services/emiCalculator");
const { riskBandFor } = require("../services/riskBand");
const { normalizeApplicantData } = require("../services/normalizer");
const { evaluateRules } = require("../services/ruleEngine");
const { calculateEligibility } = require("../services/pricingService");
const { maskApplicationData, maskPan } = require("../utils/masking");
const User = require("../models/User");
const Rule = require("../models/Rule");
const Applicant = require("../models/Applicant");
const AuditLog = require("../models/AuditLog");

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runComprehensiveTests() {
  console.log("\n=======================================================");
  console.log("🧪 STARTING NBFC UNDERWRITING 20-PHASE SYSTEM AUDIT TEST");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------------
  // TEST GROUP 1: FINANCIAL MATHEMATICS
  // -------------------------------------------------------------------------
  console.log("📊 1. Testing Financial Mathematics (EMI, FOIR, Amortization, Inversion)...");
  {
    // Test EMI calculation
    const emi1 = calculateEmi(1000000, 10.5, 60); // 10 Lakhs @ 10.5% for 5 years
    assert(emi1 === 21493.9, `Amortized EMI for 10L @ 10.5% 60m should be ~21493.90 (got ${emi1})`);

    // Edge case: 0% interest
    const emiZeroRate = calculateEmi(600000, 0, 60);
    assert(emiZeroRate === 10000, `EMI for 6L @ 0% 60m should be exactly 10,000 (got ${emiZeroRate})`);

    // Edge case: Inverted principal capacity from budget
    const maxP = maxPrincipalForEmi(21493.9, 10.5, 60);
    assert(Math.abs(maxP - 1000000) < 5, `Inverting EMI budget 21493.90 should recover ~1,000,000 principal (got ${maxP})`);

    // Test FOIR calculation in normalizer
    const norm = normalizeApplicantData({
      monthlyIncome: 100000,
      existingObligations: 20000,
      cibilScore: 780,
      tenureMonths: 60,
      itrYear1: 1000000,
      itrYear2: 1200000,
    }, 500000);

    assert(norm.status === "SUCCESS", "Normalizer should succeed for complete data");
    assert(norm.normalizedMetrics.obligationRatio === 20, "Obligation ratio should be 20%");
    assert(norm.normalizedMetrics.incomeTrendPct === 20, "Income trend should be +20% YoY");
    assert(norm.normalizedMetrics.incomeStability === "GROWING", "Income stability should be GROWING");
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 2: CIBIL RISK BANDS
  // -------------------------------------------------------------------------
  console.log("\n🎯 2. Testing CIBIL Risk Band & Pricing Engine...");
  {
    assert(riskBandFor(780).riskGrade === "LOW" && riskBandFor(780).rateOfInterest === 10.5, "780 CIBIL = Grade LOW, 10.5% ROI");
    assert(riskBandFor(720).riskGrade === "MEDIUM" && riskBandFor(720).rateOfInterest === 12.0, "720 CIBIL = Grade MEDIUM, 12.0% ROI");
    assert(riskBandFor(660).riskGrade === "HIGH" && riskBandFor(660).rateOfInterest === 13.5, "660 CIBIL = Grade HIGH, 13.5% ROI");
    assert(riskBandFor(580).riskGrade === "HIGH" && riskBandFor(580).rateOfInterest === 14.0, "580 CIBIL = Grade HIGH, 14.0% ROI");
    assert(riskBandFor(500).riskGrade === "CRITICAL" && riskBandFor(500).rateOfInterest === null, "500 CIBIL = Grade CRITICAL, null ROI");
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 3: BUSINESS RULE ENGINE (BRE) EVALUATION & PRIORITY
  // -------------------------------------------------------------------------
  console.log("\n⚙️ 3. Testing Business Rule Engine (BRE) Logic & Auto-Escalation...");
  {
    const sampleRules = [
      { ruleCode: "HR_CIBIL_MIN", name: "Min CIBIL", category: "HARD_REJECT", metric: "cibilScore", operator: "<", thresholdValue: 550, priority: 10 },
      { ruleCode: "HR_WRITE_OFF", name: "Write-off", category: "HARD_REJECT", metric: "hasWriteOff", operator: "==", thresholdValue: true, priority: 10 },
      { ruleCode: "EX_CIBIL_L1", name: "Borderline CIBIL", category: "EXCEPTION_L1", metric: "cibilScore", operator: "<", thresholdValue: 700, priority: 30 },
      { ruleCode: "EX_BOUNCE_L1", name: "Recent Bounces", category: "EXCEPTION_L1", metric: "bounceCountLast6M", operator: ">", thresholdValue: 1, priority: 40 },
      { ruleCode: "EX_FOIR_L2", name: "Excessive FOIR", category: "EXCEPTION_L2", metric: "foir", operator: ">", thresholdValue: 65, priority: 20 },
    ];

    // Scenario A: Clean applicant -> APPROVED
    const evalClean = evaluateRules({ cibilScore: 780, hasWriteOff: false, bounceCountLast6M: 0, foir: 35 }, sampleRules);
    assert(evalClean.finalStatus === "APPROVED" && evalClean.triggeredRules.length === 0, "Clean applicant evaluates to APPROVED with 0 triggers");

    // Scenario B: 1 L1 trigger -> EXCEPTION_L1
    const evalL1 = evaluateRules({ cibilScore: 660, hasWriteOff: false, bounceCountLast6M: 0, foir: 35 }, sampleRules);
    assert(evalL1.finalStatus === "EXCEPTION_L1" && evalL1.triggeredRules.length === 1, "1 L1 deviation evaluates to EXCEPTION_L1");

    // Scenario C: 2 L1 triggers -> Compound Risk AUTO-ESCALATES to EXCEPTION_L2
    const evalAutoEsc = evaluateRules({ cibilScore: 660, hasWriteOff: false, bounceCountLast6M: 3, foir: 35 }, sampleRules);
    assert(evalAutoEsc.finalStatus === "EXCEPTION_L2" && evalAutoEsc.autoEscalated === true, "2 L1 deviations automatically escalate to EXCEPTION_L2");

    // Scenario D: Hard reject triggers -> HARD_REJECT overrides everything
    const evalReject = evaluateRules({ cibilScore: 500, hasWriteOff: true, bounceCountLast6M: 3, foir: 70 }, sampleRules);
    assert(evalReject.finalStatus === "HARD_REJECT", "Hard reject takes absolute precedence over exceptions");
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 4: DATA MASKING & SECURITY
  // -------------------------------------------------------------------------
  console.log("\n🔒 4. Testing PAN Masking & Role Data Masking...");
  {
    assert(maskPan("ABCDE1234F") === "XXXXX1234F", "maskPan masks first 5 chars with XXXXX");
    assert(maskPan("XYZ") === "XYZ", "maskPan handles short/invalid strings safely");
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 5: MONGODB ATLAS CONNECTIVITY & PERSISTENCE
  // -------------------------------------------------------------------------
  console.log("\n☁️ 5. Testing MongoDB Atlas Connectivity & Live Models...");
  {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "nbfc_credit_db", serverSelectionTimeoutMS: 8000 });
    assert(mongoose.connection.readyState === 1, `Connected to MongoDB Atlas: ${mongoose.connection.host}`);

    const userCount = await User.countDocuments();
    assert(userCount >= 4, `User collection contains seeded accounts (found ${userCount})`);

    const rulesCount = await Rule.countDocuments();
    assert(rulesCount >= 7, `Rule collection contains baseline BRE rules (found ${rulesCount})`);
  }

  // -------------------------------------------------------------------------
  // TEST GROUP 6: AUDIT CHAIN SHA-256 TAMPER EVIDENCE
  // -------------------------------------------------------------------------
  console.log("\n🛡️ 6. Testing Cryptographic Audit Log Chain & Verification...");
  {
    const logs = await AuditLog.find().sort({ timestamp: 1, _id: 1 });
    assert(logs.length > 0, `Audit log collection has active chain records (found ${logs.length})`);

    let prev = "GENESIS_HASH";
    let isValid = true;
    for (const l of logs) {
      if (l.prevHash !== prev) {
        isValid = false;
        break;
      }
      prev = l.hash;
    }
    assert(isValid, "Audit log hash chain is continuous and valid from genesis");
  }

  console.log("\n=======================================================");
  console.log(`🎉 ALL ${passedCount}/${totalCount} TEST ASSERTIONS PASSED!`);
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

runComprehensiveTests().catch((err) => {
  console.error("Test suite encountered failure:", err.message);
  process.exit(1);
});
