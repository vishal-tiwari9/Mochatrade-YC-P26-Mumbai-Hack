const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      "RULE_UPDATE",
      "EXCEPTION_DECISION",
      "APPLICATION_SUBMISSION",
      "SECURITY_VIOLATION",
    ],
  },
  actorId: { type: String, required: true },
  actorRole: { type: String, required: true },
  targetEntity: { type: String, required: true },
  targetId: { type: String },
  previousSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  newSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
  hash: { type: String, required: true },
  prevHash: { type: String, default: "GENESIS_HASH" },
  timestamp: { type: Date, default: Date.now },
});

AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
