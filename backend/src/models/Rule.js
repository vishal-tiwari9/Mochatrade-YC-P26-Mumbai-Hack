const mongoose = require("mongoose");

const RuleSchema = new mongoose.Schema(
  {
    ruleCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["HARD_REJECT", "EXCEPTION_L1", "EXCEPTION_L2", "PRICING"],
    },
    metric: { type: String, required: true, trim: true },
    operator: {
      type: String,
      required: true,
      enum: ["<", "<=", ">", ">=", "==", "!="],
    },
    thresholdValue: { type: mongoose.Schema.Types.Mixed, required: true },
    action: {
      type: String,
      required: true,
      enum: ["REJECT", "FLAG_L1", "FLAG_L2", "ADJUST_RATE"],
    },
    reasonCode: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    priority: { type: Number, default: 100 },
    // Only meaningful for category: "PRICING" — percentage points added to
    // (or subtracted from, if negative) the base CIBIL-band interest rate
    // when this rule triggers. Ignored for every other category.
    rateAdjustmentPct: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    lastModifiedBy: { type: String, default: "SYSTEM" },
  },
  { timestamps: true }
);

RuleSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Rule", RuleSchema);
