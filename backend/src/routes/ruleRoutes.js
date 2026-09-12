const express = require("express");
const Rule = require("../models/Rule");
const { logAction } = require("../services/auditService");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { writeLimiter } = require("../middleware/rateLimit");
const { validateRuleDraft } = require("../services/ruleValidation");

const router = express.Router();

router.use(protect, authorizeRoles("ADMIN"));

const EDITABLE_FIELDS = [
  "name",
  "category",
  "metric",
  "operator",
  "thresholdValue",
  "action",
  "reasonCode",
  "description",
  "severity",
  "priority",
  "isActive",
  "rateAdjustmentPct",
];

router.get("/", async (req, res) => {
  try {
    const rules = await Rule.find().sort({ category: 1, priority: 1, ruleCode: 1 });
    res.json(rules);
  } catch (err) {
    console.error("GET /rules failed:", err.message);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const draft = req.body?.draft || {};
    const excludeId = req.body?.excludeId;
    const otherRules = await Rule.find(excludeId ? { _id: { $ne: excludeId } } : {});
    const { errors, warnings } = validateRuleDraft(draft, otherRules);
    res.json({ errors, warnings });
  } catch (err) {
    console.error("POST /rules/validate failed:", err.message);
    res.status(500).json({ error: "Failed to validate rule" });
  }
});

router.post("/", writeLimiter, async (req, res) => {
  try {
    const payload = req.body || {};
    const draft = {
      ruleCode: payload.ruleCode,
      name: payload.name,
      category: payload.category,
      metric: payload.metric,
      operator: payload.operator,
      thresholdValue: payload.thresholdValue,
      action: payload.action || "FLAG_L1",
      reasonCode: payload.reasonCode || payload.ruleCode,
      severity: payload.severity || "MEDIUM",
      priority: payload.priority ?? 100,
      rateAdjustmentPct: payload.rateAdjustmentPct ?? 0,
    };

    const otherRules = await Rule.find();
    const { errors, warnings } = validateRuleDraft(draft, otherRules);
    if (errors.length) {
      return res.status(400).json({ error: errors[0], errors, warnings });
    }

    const rule = await Rule.create({
      ...draft,
      description: payload.description || "",
      version: 1,
      isActive: payload.isActive ?? true,
      lastModifiedBy: req.user.email,
    });

    await logAction({
      action: "RULE_UPDATE",
      actorId: req.user.id,
      actorRole: req.user.role,
      targetEntity: "Rule",
      targetId: rule._id.toString(),
      previousSnapshot: null,
      newSnapshot: rule.toObject(),
    });

    res.status(201).json({ ...rule.toObject(), _warnings: warnings });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: `A rule with code ${req.body?.ruleCode} already exists` });
    }
    console.error("POST /rules failed:", err.message);
    res.status(500).json({ error: "Failed to create rule" });
  }
});

router.put("/:id", writeLimiter, async (req, res) => {
  try {
    const existing = await Rule.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Rule not found" });

    const previousSnapshot = existing.toObject();
    let changed = false;

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined && req.body[field] !== existing[field]) {
        existing[field] = req.body[field];
        changed = true;
      }
    }

    if (!changed) {
      return res.status(400).json({ error: "No editable fields were changed" });
    }

    const draft = {
      ruleCode: existing.ruleCode,
      name: existing.name,
      category: existing.category,
      metric: existing.metric,
      operator: existing.operator,
      thresholdValue: existing.thresholdValue,
      action: existing.action,
      reasonCode: existing.reasonCode,
      severity: existing.severity,
      priority: existing.priority,
      rateAdjustmentPct: existing.rateAdjustmentPct,
    };
    const otherRules = await Rule.find({ _id: { $ne: existing._id } });
    const { errors, warnings } = validateRuleDraft(draft, otherRules);
    if (errors.length) {
      return res.status(400).json({ error: errors[0], errors, warnings });
    }

    existing.version += 1;
    existing.lastModifiedBy = req.user.email;

    await existing.save();

    await logAction({
      action: "RULE_UPDATE",
      actorId: req.user.id,
      actorRole: req.user.role,
      targetEntity: "Rule",
      targetId: existing._id.toString(),
      previousSnapshot: { thresholdValue: previousSnapshot.thresholdValue, version: previousSnapshot.version, isActive: previousSnapshot.isActive },
      newSnapshot: { thresholdValue: existing.thresholdValue, version: existing.version, isActive: existing.isActive },
    });

    res.json({ ...existing.toObject(), _warnings: warnings });
  } catch (err) {
    console.error("PUT /rules/:id failed:", err.message);
    res.status(500).json({ error: "Failed to update rule" });
  }
});

router.post("/:id/duplicate", writeLimiter, async (req, res) => {
  try {
    const existing = await Rule.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Rule not found" });

    const source = existing.toObject();
    const newCode = `${source.ruleCode}_COPY_${Date.now().toString(36).toUpperCase()}`;

    const duplicate = await Rule.create({
      ruleCode: newCode,
      name: `${source.name} (copy)`,
      category: source.category,
      metric: source.metric,
      operator: source.operator,
      thresholdValue: source.thresholdValue,
      action: source.action,
      reasonCode: source.reasonCode,
      description: source.description,
      severity: source.severity,
      priority: source.priority,
      rateAdjustmentPct: source.rateAdjustmentPct,
      version: 1,
      isActive: false,
      lastModifiedBy: req.user.email,
    });

    await logAction({
      action: "RULE_UPDATE",
      actorId: req.user.id,
      actorRole: req.user.role,
      targetEntity: "Rule",
      targetId: duplicate._id.toString(),
      previousSnapshot: null,
      newSnapshot: { duplicatedFrom: source.ruleCode, ruleCode: newCode },
    });

    res.status(201).json(duplicate);
  } catch (err) {
    console.error("POST /rules/:id/duplicate failed:", err.message);
    res.status(500).json({ error: "Failed to duplicate rule" });
  }
});

router.delete("/:id", writeLimiter, async (req, res) => {
  try {
    const existing = await Rule.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Rule not found" });

    if (existing.isActive) {
      return res.status(400).json({ error: "Disable this rule before deleting it, to confirm it's no longer meant to affect live decisions." });
    }

    const previousSnapshot = existing.toObject();
    await existing.deleteOne();

    await logAction({
      action: "RULE_UPDATE",
      actorId: req.user.id,
      actorRole: req.user.role,
      targetEntity: "Rule",
      targetId: previousSnapshot._id.toString(),
      previousSnapshot,
      newSnapshot: { deleted: true },
    });

    res.status(204).end();
  } catch (err) {
    console.error("DELETE /rules/:id failed:", err.message);
    res.status(500).json({ error: "Failed to delete rule" });
  }
});

module.exports = router;
