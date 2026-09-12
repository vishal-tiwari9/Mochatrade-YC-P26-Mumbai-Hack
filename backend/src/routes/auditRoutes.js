const express = require("express");
const AuditLog = require("../models/AuditLog");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// ADMIN sees the full chain (needed to verify tamper-evidence); every other
// role only sees audit entries they themselves generated.
router.get("/", async (req, res) => {
  try {
    const filter = req.user.role === "ADMIN" ? {} : { actorId: req.user.id };

    if (req.query.targetId) filter.targetId = req.query.targetId;
    if (req.query.action) filter.action = req.query.action;

    const logs = await AuditLog.find(filter).sort({ _id: -1 }).limit(200);
    res.json(logs);
  } catch (err) {
    console.error("GET /audit failed:", err.message);
    res.status(500).json({ error: "Failed to fetch audit trail" });
  }
});

// Verifies the SHA-256 hash chain hasn't been tampered with — admin only.
router.get("/verify", async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden — ADMIN only" });
  }
  try {
    const crypto = require("crypto");
    const logs = await AuditLog.find().sort({ _id: 1 });

    let prevHash = "GENESIS_HASH";
    let brokenAt = null;

    for (const log of logs) {
      const expectedHash = crypto
        .createHash("sha256")
        .update(
          JSON.stringify({
            action: log.action,
            actorId: log.actorId,
            targetEntity: log.targetEntity,
            targetId: log.targetId,
            previousSnapshot: log.previousSnapshot,
            newSnapshot: log.newSnapshot,
            prevHash: log.prevHash,
          })
        )
        .digest("hex");

      if (log.prevHash !== prevHash || log.hash !== expectedHash) {
        brokenAt = log._id.toString();
        break;
      }
      prevHash = log.hash;
    }

    res.json({ verified: brokenAt === null, brokenAt, totalEntries: logs.length });
  } catch (err) {
    console.error("GET /audit/verify failed:", err.message);
    res.status(500).json({ error: "Failed to verify audit chain" });
  }
});

module.exports = router;
