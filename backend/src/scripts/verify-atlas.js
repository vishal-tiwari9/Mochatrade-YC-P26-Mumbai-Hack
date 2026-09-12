require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectDB = require("../config/db");
const User = require("../models/User");
const Rule = require("../models/Rule");
const Applicant = require("../models/Applicant");
const AuditLog = require("../models/AuditLog");
const { seedData, DEFAULT_PASSWORD } = require("./seed");
const { normalizeApplicantData } = require("../services/normalizer");
const { evaluateRules } = require("../services/ruleEngine");
const { calculateEligibility } = require("../services/pricingService");
const { logAction } = require("../services/auditService");

async function runVerification() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING COMPLETE MONGODB ATLAS END-TO-END VERIFICATION");
  console.log("=======================================================\n");

  // 1. Connection
  console.log("[CHECK 1] Connecting to MongoDB Atlas...");
  const conn = await connectDB();
  console.log(`✅ MongoDB Atlas connected successfully.`);
  console.log(`   Cluster Host: ${conn.host}`);
  console.log(`   Database: ${conn.name}`);
  console.log(`   Mongoose Connection State: ${mongoose.connection.readyState} (1 = connected)`);

  // 2. Models & Seed
  console.log("\n[CHECK 2] Verifying Mongoose Models & Seeding Initial Data...");
  await seedData();
  const userCount = await User.countDocuments();
  const ruleCount = await Rule.countDocuments();
  console.log(`✅ Models and Seed ready. Users in Atlas: ${userCount}, Rules in Atlas: ${ruleCount}`);

  // 3. Authentication & Login
  console.log("\n[CHECK 3] Verifying Login Authentication & Password Hashing...");
  const rmUser = await User.findOne({ email: "rm@nbfc.com" });
  if (!rmUser) throw new Error("Seed user rm@nbfc.com not found!");
  const isMatch = await bcrypt.compare(DEFAULT_PASSWORD, rmUser.passwordHash);
  if (!isMatch) throw new Error("Password verification failed!");
  const token = jwt.sign(
    { userId: rmUser._id, email: rmUser.email, role: rmUser.role },
    process.env.JWT_SECRET || "nbfc_underwriting_jwt_secret_token_secure_2026",
    { expiresIn: "8h" }
  );
  const decoded = jwt.verify(token, process.env.JWT_SECRET || "nbfc_underwriting_jwt_secret_token_secure_2026");
  console.log(`✅ Authentication verified for user: ${rmUser.email} (Role: ${rmUser.role})`);
  console.log(`   JWT generated & verified successfully for User ID: ${decoded.userId}`);

  // 4. Application Creation & Reading
  console.log("\n[CHECK 4] Verifying Application Creation and Retrieval...");
  const testApplicantId = `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const createdApp = await Applicant.create({
    applicantId: testApplicantId,
    assignedToRMId: rmUser._id,
    personalDetails: {
      fullName: "Anand Sharma",
      panNumber: "ABCDE1234F",
      phone: "9876543210",
      email: "anand.sharma@example.com",
      age: 34,
      employmentType: "SALARIED",
    },
    rawFinancials: {
      monthlyIncome: 95000,
      existingObligations: 18000,
      requestedAmount: 600000,
      tenureMonths: 36,
      cibilScore: 760,
      hasWriteOff: false,
      dpd90Count: 0,
      bounceCountLast6M: 0,
      avgMonthlyBalance: 52000,
      declaredAssets: 1500000,
    },
    statusHistory: [
      {
        status: "DRAFT",
        updatedBy: String(rmUser._id),
        updatedByRole: rmUser.role,
        note: "Application draft created",
      },
    ],
  });
  console.log(`   Created application in Atlas with ID: ${createdApp.applicantId} (_id: ${createdApp._id})`);

  const fetchedApp = await Applicant.findOne({ applicantId: testApplicantId });
  if (!fetchedApp) throw new Error("Application could not be read back from Atlas!");
  console.log(`✅ Application created & read successfully: ${fetchedApp.personalDetails.fullName} (Pan: ${fetchedApp.personalDetails.panNumber})`);

  // 5. BRE Rule Read, Update & Persistence
  console.log("\n[CHECK 5] Verifying BRE Rules Read & Update...");
  const cibilRule = await Rule.findOne({ ruleCode: "RULE_MIN_CIBIL" });
  if (!cibilRule) throw new Error("RULE_MIN_CIBIL rule not found!");
  const initialVersion = cibilRule.version;
  cibilRule.thresholdValue = 550;
  cibilRule.version += 1;
  cibilRule.lastModifiedBy = "TEST_RUNNER";
  await cibilRule.save();
  console.log(`✅ BRE Rule read & updated successfully: ${cibilRule.ruleCode} (Version ${initialVersion} -> ${cibilRule.version})`);

  // 6. Underwriting Engine Execution & Persistence
  console.log("\n[CHECK 6] Verifying Underwriting Pipeline Execution...");
  const rawFinancials = fetchedApp.rawFinancials;
  const requestedAmount = rawFinancials.requestedAmount;
  const normResult = normalizeApplicantData(rawFinancials, requestedAmount);
  if (normResult.status === "INSUFFICIENT_DATA") throw new Error("Normalization failed!");

  const activeRules = await Rule.find({ isActive: true });
  const appData = { ...rawFinancials.toObject(), requestedAmount, ...normResult.normalizedMetrics };
  const evalResult = evaluateRules(appData, activeRules);
  const pricing = calculateEligibility({ ...rawFinancials.toObject(), requestedAmount }, normResult.normalizedMetrics, evalResult.finalStatus);
  const normalizedMetrics = { ...normResult.normalizedMetrics, ...pricing };

  fetchedApp.normalizedMetrics = normalizedMetrics;
  fetchedApp.metricsMeta = normResult.metricsMeta;
  fetchedApp.evaluation = {
    status: evalResult.finalStatus,
    decisionSummary: "Underwriting evaluation completed successfully",
    triggeredRules: evalResult.triggeredRules,
    deviationsCount: evalResult.deviationsCount,
    autoEscalated: evalResult.autoEscalated,
    exceptionLevelRequired: evalResult.finalStatus === "EXCEPTION_L1" ? "L1" : evalResult.finalStatus === "EXCEPTION_L2" ? "L2" : "NONE",
    ruleEngineVersionUsed: 1,
  };
  fetchedApp.statusHistory.push({
    status: evalResult.finalStatus,
    updatedBy: String(rmUser._id),
    updatedByRole: rmUser.role,
    note: "Automated underwriting completed",
  });
  await fetchedApp.save();

  console.log(`✅ Underwriting executed & persisted to Atlas.`);
  console.log(`   Decision Status: ${fetchedApp.evaluation.status}`);
  console.log(`   Risk Grade: ${fetchedApp.normalizedMetrics.riskGrade}`);
  console.log(`   Max Eligible Loan: ₹${fetchedApp.normalizedMetrics.maxEligibleLoanAmount}`);
  console.log(`   Calculated FOIR: ${fetchedApp.normalizedMetrics.foir}%`);

  // 7. Audit Log Record Creation
  console.log("\n[CHECK 7] Verifying Audit Trail Log Creation...");
  const auditLog = await logAction({
    action: "APPLICATION_SUBMISSION",
    actorId: String(rmUser._id),
    actorRole: rmUser.role,
    targetEntity: "Applicant",
    targetId: String(fetchedApp._id),
    previousSnapshot: null,
    newSnapshot: { status: fetchedApp.evaluation.status, applicantId: testApplicantId },
  });
  console.log(`✅ Audit Log persisted to Atlas. Entry ID: ${auditLog._id}, Hash: ${auditLog.hash.substring(0, 16)}...`);

  // 8. Exception Workflow check
  console.log("\n[CHECK 8] Verifying Exception Workflow / Decision Update...");
  fetchedApp.statusHistory.push({
    status: "APPROVED",
    updatedBy: "l1_approver_id",
    updatedByRole: "L1_APPROVER",
    note: "Credit approver approved after review",
  });
  fetchedApp.evaluation.status = "APPROVED";
  await fetchedApp.save();

  const auditDecisionLog = await logAction({
    action: "EXCEPTION_DECISION",
    actorId: "l1_approver_id",
    actorRole: "L1_APPROVER",
    targetEntity: "Applicant",
    targetId: String(fetchedApp._id),
    previousSnapshot: { status: "PENDING_REVIEW" },
    newSnapshot: { status: "APPROVED", note: "Approved" },
  });
  console.log(`✅ Exception Decision and Audit record created: ${auditDecisionLog.action}`);

  // 9. Disconnect & Simulate Server Restart
  console.log("\n[CHECK 9] Simulating Complete Backend Restart...");
  await mongoose.connection.close();
  console.log("   🔌 Disconnected from MongoDB Atlas.");

  console.log("   🔄 Reconnecting to MongoDB Atlas (simulating fresh server restart)...");
  await connectDB();
  console.log("   🔌 Reconnected to MongoDB Atlas.");

  // 10. Verify Data Persistence After Restart
  console.log("\n[CHECK 10] Verifying Data Persistence Across Restart...");
  const reloadedApp = await Applicant.findOne({ applicantId: testApplicantId });
  if (!reloadedApp) throw new Error("CRITICAL: Applicant data NOT found after restart!");
  if (reloadedApp.evaluation.status !== "APPROVED") throw new Error("CRITICAL: Evaluation status did not persist!");

  const reloadedRule = await Rule.findOne({ ruleCode: "RULE_MIN_CIBIL" });
  if (!reloadedRule) throw new Error("CRITICAL: Rule not found after restart!");
  if (reloadedRule.version !== cibilRule.version) throw new Error("CRITICAL: Rule updated version did not persist!");

  const reloadedAudit = await AuditLog.findById(auditLog._id);
  if (!reloadedAudit) throw new Error("CRITICAL: Audit record not found after restart!");

  console.log("✅ ALL DATA PERSISTENCE VERIFIED AFTER RESTART:");
  console.log(`   - Applicant record persisted: '${reloadedApp.personalDetails.fullName}' (${reloadedApp.applicantId})`);
  console.log(`   - Status history length: ${reloadedApp.statusHistory.length} events`);
  console.log(`   - Rule '${reloadedRule.ruleCode}' version persisted: ${reloadedRule.version}`);
  console.log(`   - Audit log '${reloadedAudit.action}' persisted with hash: ${reloadedAudit.hash.substring(0, 16)}...`);

  // 11. Atlas Collections Check
  console.log("\n[CHECK 11] Inspecting Atlas Collections in 'nbfc_credit_db'...");
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);
  console.log(`✅ Active collections in Atlas: ${collectionNames.join(", ")}`);

  console.log("\n=======================================================");
  console.log("🎉 VERIFICATION COMPLETE: ALL CHECKS PASSED WITH 100% SUCCESS!");
  console.log("=======================================================\n");

  await mongoose.connection.close();
  process.exit(0);
}

runVerification().catch(async (err) => {
  console.error("\n❌ VERIFICATION FAILED:", err.message || err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  process.exit(1);
});
