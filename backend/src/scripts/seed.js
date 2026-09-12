require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Rule = require("../models/Rule");

const DEFAULT_PASSWORD = "Password@123";

const USERS = [
  { name: "Relationship Manager Rohit", email: "rm@nbfc.com", role: "RM" },
  { name: "Credit Approver Priya", email: "l1@nbfc.com", role: "L1_APPROVER" },
  { name: "Credit Head Vikram", email: "l2@nbfc.com", role: "L2_APPROVER" },
  { name: "System Admin Ananya", email: "admin@nbfc.com", role: "ADMIN" },
];

const RULES = [
  {
    ruleCode: "RULE_MIN_CIBIL",
    name: "Minimum CIBIL Score",
    category: "HARD_REJECT",
    metric: "cibilScore",
    operator: "<",
    thresholdValue: 550,
    action: "REJECT",
    reasonCode: "REJ_CIBIL_BELOW_MINIMUM",
    description: "Immediate hard reject for CIBIL below 550",
    severity: "CRITICAL",
    priority: 10,
  },
  {
    ruleCode: "RULE_PRIOR_WRITEOFF",
    name: "Prior Write-Off on Record",
    category: "HARD_REJECT",
    metric: "hasWriteOff",
    operator: "==",
    thresholdValue: true,
    action: "REJECT",
    reasonCode: "REJ_HISTORICAL_WRITEOFF",
    description: "Hard reject if a past loan write-off exists",
    severity: "CRITICAL",
    priority: 20,
  },
  {
    ruleCode: "RULE_PRIOR_SETTLEMENT",
    name: "Prior Settlement on Record",
    category: "HARD_REJECT",
    metric: "hasSettlement",
    operator: "==",
    thresholdValue: true,
    action: "REJECT",
    reasonCode: "REJ_HISTORICAL_SETTLEMENT",
    description: "Hard reject if a past loan settlement (paid less than owed) exists on the bureau record",
    severity: "CRITICAL",
    priority: 21,
  },
  {
    ruleCode: "RULE_PRIOR_DEFAULT",
    name: "Prior Default Indicator",
    category: "HARD_REJECT",
    metric: "hasDefault",
    operator: "==",
    thresholdValue: true,
    action: "REJECT",
    reasonCode: "REJ_HISTORICAL_DEFAULT",
    description: "Hard reject if a bureau default indicator is present",
    severity: "CRITICAL",
    priority: 22,
  },
  {
    ruleCode: "RULE_MAX_DPD_90",
    name: "Serious Delinquency (DPD 90+)",
    category: "HARD_REJECT",
    metric: "dpd90Count",
    operator: ">",
    thresholdValue: 0,
    action: "REJECT",
    reasonCode: "REJ_SERIOUS_DELINQUENCY",
    description: "Hard reject for 90+ days past due delinquencies",
    severity: "CRITICAL",
    priority: 30,
  },
  {
    ruleCode: "RULE_BORDERLINE_CIBIL",
    name: "Borderline Credit Score",
    category: "EXCEPTION_L1",
    metric: "cibilScore",
    operator: "<",
    thresholdValue: 680,
    action: "FLAG_L1",
    reasonCode: "EXC_L1_BORDERLINE_CREDIT",
    description: "Requires L1 approval if CIBIL is between 550 and 679",
    severity: "MEDIUM",
    priority: 100,
  },
  {
    ruleCode: "RULE_MAX_FOIR_L1",
    name: "High FOIR",
    category: "EXCEPTION_L1",
    metric: "foir",
    operator: ">",
    thresholdValue: 50,
    action: "FLAG_L1",
    reasonCode: "EXC_L1_HIGH_FOIR",
    description: "Flag for L1 review if FOIR exceeds 50%",
    severity: "MEDIUM",
    priority: 110,
  },
  {
    ruleCode: "RULE_MAX_BOUNCES",
    name: "Multiple Recent Bounces",
    category: "EXCEPTION_L1",
    metric: "bounceCountLast6M",
    operator: ">",
    thresholdValue: 2,
    action: "FLAG_L1",
    reasonCode: "EXC_L1_MULTIPLE_BOUNCES",
    description:
      "Flag for L1 review if bank bounces in last 6 months exceed 2",
    severity: "MEDIUM",
    priority: 120,
  },
  {
    ruleCode: "RULE_EXCESSIVE_ENQUIRIES",
    name: "Excessive Recent Credit Enquiries",
    category: "EXCEPTION_L1",
    metric: "creditEnquiriesCount",
    operator: ">",
    thresholdValue: 6,
    action: "FLAG_L1",
    reasonCode: "EXC_L1_CREDIT_HUNGRY",
    description: "Flag for L1 review if 6+ credit enquiries were made recently — a common early signal of credit-seeking stress",
    severity: "MEDIUM",
    priority: 125,
  },
  {
    ruleCode: "RULE_OVERDUE_BALANCE",
    name: "Existing Overdue Balance",
    category: "EXCEPTION_L1",
    metric: "overdueAmount",
    operator: ">",
    thresholdValue: 0,
    action: "FLAG_L1",
    reasonCode: "EXC_L1_OVERDUE_BALANCE",
    description: "Flag for L1 review if the bureau report shows any currently overdue amount",
    severity: "MEDIUM",
    priority: 126,
  },
  {
    ruleCode: "RULE_HIGH_TICKET",
    name: "Large Exposure Ticket Size",
    category: "EXCEPTION_L2",
    metric: "requestedAmount",
    operator: ">",
    thresholdValue: 2500000,
    action: "FLAG_L2",
    reasonCode: "EXC_L2_LARGE_EXPOSURE",
    description: "Escalate to L2 / Credit Head if loan request exceeds 25 Lakhs",
    severity: "HIGH",
    priority: 50,
  },
  {
    ruleCode: "RULE_ML_HIGH_RISK",
    name: "ML Model — Elevated Default Risk",
    category: "EXCEPTION_L1",
    metric: "mlRiskScore",
    operator: ">",
    thresholdValue: 0.65,
    action: "FLAG_L1",
    reasonCode: "EXC_L1_ML_RISK_SCORE",
    description:
      "Flag for L1 review if the trained risk model's default-probability score exceeds 0.65. Advisory input only — this rule, like any other, is Admin-tweakable in the BRE; the model itself never decides.",
    severity: "MEDIUM",
    priority: 130,
  },
];

/**
 * Seeds users + rules into active connection idempotently.
 */
async function seedData({ force = false } = {}) {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  if (force) {
    console.log("Clearing existing users and rules (force mode)...");
    await Promise.all([User.deleteMany({}), Rule.deleteMany({})]);
  }

  for (const u of USERS) {
    await User.updateOne(
      { email: u.email },
      { $setOnInsert: { ...u, passwordHash, isActive: true } },
      { upsert: true }
    );
  }

  for (const r of RULES) {
    await Rule.updateOne(
      { ruleCode: r.ruleCode },
      {
        $setOnInsert: {
          ...r,
          version: 1,
          isActive: true,
          lastModifiedBy: "SYSTEM",
        },
      },
      { upsert: true }
    );
  }

  const userCount = await User.countDocuments();
  const ruleCount = await Rule.countDocuments();
  console.log(`Database ready with ${userCount} users and ${ruleCount} rules.`);
}

module.exports = { seedData, USERS, RULES, DEFAULT_PASSWORD };

// Standalone CLI execution (`npm run seed`)
if (require.main === module) {
  connectDB()
    .then(() => seedData({ force: process.argv.includes("--force") }))
    .then(() => {
      console.log("Seed complete.");
      return mongoose.connection.close();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err.message || err);
      mongoose.connection.close().finally(() => process.exit(1));
    });
}
