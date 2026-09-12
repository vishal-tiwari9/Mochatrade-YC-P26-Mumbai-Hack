const crypto = require("crypto");
const Applicant = require("../models/Applicant");
const Rule = require("../models/Rule");
const { normalizeApplicantData } = require("../services/normalizer");
const { evaluateRules } = require("../services/ruleEngine");
const { calculateEligibility } = require("../services/pricingService");
const { maskApplicationData } = require("../utils/masking");
const { logAction } = require("../services/auditService");
const { findApplicantByRouteParam } = require("../middleware/authMiddleware");
const { getMlRiskScore } = require("../services/mlRiskService");

const EXCEPTION_LEVEL_BY_STATUS = {
  EXCEPTION_L1: "L1",
  EXCEPTION_L2: "L2",
};

const EXCEPTION_STATUSES = ["EXCEPTION_L1", "EXCEPTION_L2"];

// A resubmission of the exact same payload for the same applicant within
// this window is treated as a duplicate (double-click, retry, replay) and
// returns the cached result instead of re-running rules / re-logging audit.
const IDEMPOTENCY_WINDOW_MS = 5000;

function generateApplicantId() {
  return `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function hashPayload(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

// declaredAssets is derived from the mutual-funds/equities/other breakdown
// whenever any of those three were actually submitted — computed here
// server-side (not trusted from the client) so it's always the true sum,
// not whatever total a caller happened to type in.
function withDerivedAssetTotal(rawFinancials = {}) {
  const { mutualFundsValue, equitiesValue, otherAssetsValue } = rawFinancials;
  const breakdownProvided =
    mutualFundsValue !== undefined || equitiesValue !== undefined || otherAssetsValue !== undefined;

  if (!breakdownProvided) return rawFinancials;

  return {
    ...rawFinancials,
    declaredAssets: (mutualFundsValue || 0) + (equitiesValue || 0) + (otherAssetsValue || 0),
  };
}

function summarize(finalStatus, triggeredRules, autoEscalated) {
  if (finalStatus === "APPROVED") return "All rules passed — straight-through approval.";
  if (finalStatus === "HARD_REJECT") {
    const reasons = triggeredRules
      .filter((r) => r.category === "HARD_REJECT")
      .map((r) => r.reasonCode)
      .join(", ");
    return `Hard rejected: ${reasons}`;
  }
  const level = finalStatus === "EXCEPTION_L2" ? "L2" : "L1";
  const reasons = triggeredRules.map((r) => r.reasonCode).join(", ");
  const escalationNote = autoEscalated
    ? " (auto-escalated to L2 — multiple L1 deviations triggered)"
    : "";
  return `Routed for ${level} exception review${escalationNote}: ${reasons}`;
}

async function runEvaluation({ rawFinancials, requestedAmount }) {
  const activeRules = await Rule.find({ isActive: true });
  const ruleEngineVersionUsed = activeRules.length ? Math.max(...activeRules.map((r) => r.version)) : 1;

  // Decision hierarchy is HARD_REJECT > INSUFFICIENT_DATA > EXCEPTION_L2 >
  // EXCEPTION_L1 > APPROVED. That means a clear-cut reject condition (e.g. a
  // prior write-off, CIBIL below floor, active 90+ DPD) must win even if
  // *other*, unrelated data is missing and full normalization can't proceed
  // — a missing bank-balance field shouldn't let someone with a write-off
  // slip through as merely "insufficient data". So HARD_REJECT rules are
  // checked first, against whatever raw fields are actually present, before
  // we ever decide the application can't be evaluated.
  const hardRejectRules = activeRules.filter((r) => r.category === "HARD_REJECT");
  const rawApplicantData = { ...rawFinancials, requestedAmount };
  const preCheck = evaluateRules(rawApplicantData, hardRejectRules);

  if (preCheck.finalStatus === "HARD_REJECT") {
    const pricing = calculateEligibility(rawApplicantData, {}, "HARD_REJECT", []);
    return {
      status: "SUCCESS",
      normalizedMetrics: pricing,
      metricsMeta: {},
      evaluation: {
        status: "HARD_REJECT",
        decisionSummary: summarize("HARD_REJECT", preCheck.triggeredRules, false),
        triggeredRules: preCheck.triggeredRules,
        deviationsCount: preCheck.triggeredRules.length,
        autoEscalated: false,
        exceptionLevelRequired: "NONE",
        ruleEngineVersionUsed,
      },
    };
  }

  const normalizationResult = normalizeApplicantData(rawFinancials, requestedAmount);

  if (normalizationResult.status === "INSUFFICIENT_DATA") {
    return {
      status: "INSUFFICIENT_DATA",
      normalizedMetrics: {},
      metricsMeta: {},
      evaluation: {
        status: "INSUFFICIENT_DATA",
        decisionSummary: `Missing critical fields: ${normalizationResult.missingFields.join(", ")}`,
        triggeredRules: [],
        deviationsCount: 0,
        autoEscalated: false,
        exceptionLevelRequired: "NONE",
        ruleEngineVersionUsed: null,
      },
      missingFields: normalizationResult.missingFields,
    };
  }

  const { normalizedMetrics: derivedMetrics, metricsMeta } = normalizationResult;

  // Advisory ML risk score — computed before the rule engine runs so that
  // (if an admin has configured a rule against it) mlRiskScore can be
  // referenced exactly like any other metric. Never blocks evaluation: a
  // null score just means no rule keyed on mlRiskScore will trigger.
  const mlResult = await getMlRiskScore({ rawFinancials, derivedMetrics });

  const applicantData = {
    ...rawFinancials,
    requestedAmount,
    ...derivedMetrics,
    ...(mlResult ? { mlRiskScore: mlResult.mlRiskScore } : {}),
  };
  const { finalStatus, triggeredRules, deviationsCount, autoEscalated } = evaluateRules(
    applicantData,
    activeRules
  );

  // Only *triggered* PRICING rules affect the rate — an inactive/non-matching
  // pricing rule has no effect, same as any other category.
  const triggeredPricingRules = triggeredRules.filter((r) => r.category === "PRICING");
  const pricing = calculateEligibility(
    { ...rawFinancials, requestedAmount },
    derivedMetrics,
    finalStatus,
    triggeredPricingRules
  );
  const normalizedMetrics = { ...derivedMetrics, ...pricing, ...(mlResult || {}) };

  if (mlResult) {
    metricsMeta.mlRiskScore = {
      value: mlResult.mlRiskScore,
      available: true,
      source: "ml-model",
      description: `Advisory default-risk probability from the trained risk model (${mlResult.mlModelVersion}). Informational input to the rule engine, not a decision authority.`,
    };
  } else {
    metricsMeta.mlRiskScore = {
      value: null,
      available: false,
      source: "unavailable",
      description: "ML risk service unreachable or model not yet trained.",
    };
  }

  return {
    status: "SUCCESS",
    normalizedMetrics,
    metricsMeta,
    evaluation: {
      status: finalStatus,
      decisionSummary: summarize(finalStatus, triggeredRules, autoEscalated),
      triggeredRules,
      deviationsCount,
      autoEscalated,
      exceptionLevelRequired: EXCEPTION_LEVEL_BY_STATUS[finalStatus] || "NONE",
      ruleEngineVersionUsed,
    },
  };
}

async function evaluateApplication(req, res) {
  try {
    const body = req.body || {};
    const { applicantId, personalDetails } = body;
    const rawFinancials = withDerivedAssetTotal(body.rawFinancials || {});

    // RMs can only ever submit under their own identity — the client-supplied
    // assignedToRMId is only honoured for ADMIN (e.g. reassigning on intake).
    const assignedToRMId =
      req.user.role === "ADMIN" && body.assignedToRMId ? body.assignedToRMId : req.user.id;

    if (!personalDetails?.fullName || !personalDetails?.panNumber) {
      return res.status(400).json({ error: "personalDetails.fullName and panNumber are required" });
    }

    const resolvedApplicantId = applicantId || generateApplicantId();
    const requestedAmount = rawFinancials.requestedAmount;

    const requestHash = hashPayload({ personalDetails, rawFinancials, assignedToRMId });

    const existing = await Applicant.findOne({ applicantId: resolvedApplicantId });
    if (
      existing &&
      existing.lastRequestHash === requestHash &&
      existing.lastRequestAt &&
      Date.now() - existing.lastRequestAt.getTime() < IDEMPOTENCY_WINDOW_MS
    ) {
      return res.status(200).json({
        ...maskApplicationData(existing, req.user.role),
        idempotentReplay: true,
      });
    }

    const result = await runEvaluation({ rawFinancials, requestedAmount });

    const update = {
      assignedToRMId,
      personalDetails,
      rawFinancials,
      evaluation: result.evaluation,
      lastRequestHash: requestHash,
      lastRequestAt: new Date(),
    };
    // Always set these keys, even to {} — Mongoose otherwise omits the whole
    // nested path from a freshly-upserted doc when no leaf field is written,
    // which crashes any consumer expecting `normalizedMetrics.foir` to exist.
    update.normalizedMetrics = result.status === "SUCCESS" ? result.normalizedMetrics : {};
    update.metricsMeta = result.status === "SUCCESS" ? result.metricsMeta : {};

    const applicant = await Applicant.findOneAndUpdate(
      { applicantId: resolvedApplicantId },
      {
        $set: update,
        $push: {
          statusHistory: {
            status: result.evaluation.status,
            updatedBy: req.user.email,
            updatedByRole: req.user.role,
            previousStatus: existing?.evaluation?.status,
            note: result.evaluation.decisionSummary,
          },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logAction({
      action: "APPLICATION_SUBMISSION",
      actorId: req.user.id,
      actorRole: req.user.role,
      targetEntity: "Applicant",
      targetId: applicant._id.toString(),
      newSnapshot: {
        status: result.evaluation.status,
        deviationsCount: result.evaluation.deviationsCount,
        ruleEngineVersionUsed: result.evaluation.ruleEngineVersionUsed,
        missingFields: result.missingFields,
      },
    });

    return res.status(200).json(maskApplicationData(applicant, req.user.role));
  } catch (err) {
    console.error("evaluateApplication failed:", err.message);
    return res.status(500).json({ error: "Evaluation failed" });
  }
}

async function simulateApplication(req, res) {
  try {
    const { applicantId, overrides = {} } = req.body || {};
    if (!applicantId) {
      return res.status(400).json({ error: "applicantId is required" });
    }

    const applicant = await Applicant.findOne({ applicantId });
    if (!applicant) return res.status(404).json({ error: "Application not found" });

    if (req.user.role === "RM" && applicant.assignedToRMId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden — not your assigned applicant" });
    }

    const original = applicant.toObject().rawFinancials;
    const mergedFinancials = withDerivedAssetTotal({ ...original, ...overrides });
    const requestedAmount = mergedFinancials.requestedAmount;

    const result = await runEvaluation({ rawFinancials: mergedFinancials, requestedAmount });

    // Deliberately not persisted — this is a safe, read-only projection so an
    // underwriter can explore alternative terms without mutating the record.
    return res.json({
      simulated: true,
      rawFinancials: mergedFinancials,
      evaluation: result.evaluation,
      normalizedMetrics: result.normalizedMetrics,
      metricsMeta: result.metricsMeta,
      missingFields: result.missingFields,
    });
  } catch (err) {
    console.error("simulateApplication failed:", err.message);
    return res.status(500).json({ error: "Simulation failed" });
  }
}

async function listApplications(req, res) {
  try {
    const filter = req.user.role === "RM" ? { assignedToRMId: req.user.id } : {};

    if (req.query.status) filter["evaluation.status"] = req.query.status;
    if (req.query.riskGrade) filter["normalizedMetrics.riskGrade"] = req.query.riskGrade;
    if (req.query.search) {
      const term = req.query.search.trim();
      filter.$or = [
        { applicantId: { $regex: term, $options: "i" } },
        { "personalDetails.fullName": { $regex: term, $options: "i" } },
      ];
    }

    const applications = await Applicant.find(filter).sort({ createdAt: -1 }).limit(500);
    return res.json(applications.map((a) => maskApplicationData(a, req.user.role)));
  } catch (err) {
    console.error("listApplications failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
}

async function getApplication(req, res) {
  // req.application is populated by the enforceDataIsolation middleware,
  // which already fetched the document and checked RM ownership.
  return res.json(maskApplicationData(req.application, req.user.role));
}

// L1_APPROVER only ever sees L1 cases, L2_APPROVER only L2 — enforced here,
// server-side, regardless of what the client requests. ADMIN may pass
// ?level=L1|L2 to filter, or omit it to see everything.
function resolveQueueLevel(req) {
  if (req.user.role === "L1_APPROVER") return "L1";
  if (req.user.role === "L2_APPROVER") return "L2";
  return req.query.level && ["L1", "L2"].includes(req.query.level) ? req.query.level : null;
}

async function getExceptionQueue(req, res) {
  try {
    const level = resolveQueueLevel(req);
    const status = req.query.status; // PENDING | APPROVED | REJECTED (client label, mapped below)

    const filter = {};
    if (level) {
      filter["evaluation.status"] = level === "L1" ? "EXCEPTION_L1" : "EXCEPTION_L2";
    } else {
      filter["evaluation.status"] = { $in: EXCEPTION_STATUSES };
    }

    if (status === "APPROVED" || status === "REJECTED") {
      // Resolved cases: status has moved off EXCEPTION_* to APPROVED/HARD_REJECT,
      // so we instead look at the most recent status-history entry.
      filter["evaluation.status"] = status === "APPROVED" ? "APPROVED" : "HARD_REJECT";
      filter["statusHistory.previousStatus"] = level
        ? level === "L1"
          ? "EXCEPTION_L1"
          : "EXCEPTION_L2"
        : { $in: EXCEPTION_STATUSES };
    }

    const applications = await Applicant.find(filter).sort({ createdAt: 1 });
    return res.json(applications.map((a) => maskApplicationData(a, req.user.role)));
  } catch (err) {
    console.error("getExceptionQueue failed:", err.message);
    return res.status(500).json({ error: "Failed to fetch exception queue" });
  }
}

async function decideException(req, res) {
  try {
    const { decision, note } = req.body || {};
    if (!["APPROVED", "REJECTED", "ESCALATE"].includes(decision)) {
      return res.status(400).json({ error: "decision must be APPROVED, REJECTED, or ESCALATE" });
    }

    const applicant = await findApplicantByRouteParam(req.params.id);
    if (!applicant) return res.status(404).json({ error: "Application not found" });

    const currentStatus = applicant.evaluation.status;
    if (!EXCEPTION_STATUSES.includes(currentStatus)) {
      return res.status(400).json({ error: "Application is not currently pending an exception decision" });
    }

    // Strict authority: an L1 approver may only act on L1 cases, an L2/Credit
    // Head only on L2 cases. This is enforced here — not just by hiding UI —
    // so a manipulated request can never cross the authority boundary. ADMIN
    // is the one exception: an explicit, always-audited override authority
    // above the normal ladder (common in production credit platforms), never
    // silent — decisionSummary below always names it as an override.
    const requiredRole = currentStatus === "EXCEPTION_L1" ? "L1_APPROVER" : "L2_APPROVER";
    const isAdminOverride = req.user.role === "ADMIN";
    if (req.user.role !== requiredRole && !isAdminOverride) {
      return res.status(403).json({
        error: `Forbidden — ${currentStatus} requires ${requiredRole} authority, you are ${req.user.role}`,
      });
    }

    if (decision === "ESCALATE" && currentStatus !== "EXCEPTION_L1") {
      return res.status(400).json({ error: "Only an L1 exception can be escalated to L2" });
    }

    const previousSnapshot = { status: currentStatus };
    let newStatus;
    if (decision === "ESCALATE") {
      newStatus = "EXCEPTION_L2";
      applicant.evaluation.exceptionLevelRequired = "L2";
    } else {
      newStatus = decision === "APPROVED" ? "APPROVED" : "HARD_REJECT";
      applicant.evaluation.exceptionLevelRequired = "NONE";
    }

    const actionLabel =
      decision === "APPROVED" ? "Exception approved" : decision === "REJECTED" ? "Exception rejected" : "Escalated to L2";
    const actorDescriptor = isAdminOverride ? `ADMIN OVERRIDE (${req.user.email})` : `${req.user.role} (${req.user.email})`;
    applicant.evaluation.status = newStatus;
    applicant.evaluation.decisionSummary = `${actionLabel} by ${actorDescriptor}${note ? `: ${note}` : ""}`;

    applicant.statusHistory.push({
      status: newStatus,
      updatedBy: req.user.email,
      updatedByRole: req.user.role,
      previousStatus: currentStatus,
      note: note || "",
    });

    await applicant.save();

    await logAction({
      action: "EXCEPTION_DECISION",
      actorId: req.user.id,
      actorRole: req.user.role,
      targetEntity: "Applicant",
      targetId: applicant._id.toString(),
      previousSnapshot,
      newSnapshot: { status: newStatus, decision, note: note || "", adminOverride: isAdminOverride },
    });

    return res.json(maskApplicationData(applicant, req.user.role));
  } catch (err) {
    console.error("decideException failed:", err.message);
    return res.status(500).json({ error: "Failed to record decision" });
  }
}

async function getDashboardStats(req, res) {
  try {
    const filter = req.user.role === "RM" ? { assignedToRMId: req.user.id } : {};

    const [statusCounts, riskCounts, total] = await Promise.all([
      Applicant.aggregate([{ $match: filter }, { $group: { _id: "$evaluation.status", count: { $sum: 1 } } }]),
      Applicant.aggregate([
        { $match: { ...filter, "normalizedMetrics.riskGrade": { $ne: null } } },
        { $group: { _id: "$normalizedMetrics.riskGrade", count: { $sum: 1 } } },
      ]),
      Applicant.countDocuments(filter),
    ]);

    const byStatus = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
    const byRisk = Object.fromEntries(riskCounts.map((r) => [r._id, r.count]));

    const approved = byStatus.APPROVED || 0;
    const evaluated = total - (byStatus.PENDING_REVIEW || 0);
    const approvalRate = evaluated > 0 ? Math.round((approved / evaluated) * 1000) / 10 : 0;

    const recent = await Applicant.find(filter).sort({ createdAt: -1 }).limit(10);

    // An L1/L2 approver can only ever decide their own tier (see the strict
    // authority check in decideException) — so the dashboard's "actionable"
    // queue must be scoped the same way, or it shows cases the viewer has no
    // power to act on. ADMIN/RM keep the unscoped oversight view.
    const decidableStatus =
      req.user.role === "L1_APPROVER"
        ? "EXCEPTION_L1"
        : req.user.role === "L2_APPROVER"
          ? "EXCEPTION_L2"
          : null;

    const pendingExceptions = await Applicant.find({
      ...filter,
      "evaluation.status": { $in: decidableStatus ? [decidableStatus] : EXCEPTION_STATUSES },
    })
      .sort({ createdAt: 1 })
      .limit(10);

    return res.json({
      totals: {
        applications: total,
        approved,
        hardRejected: byStatus.HARD_REJECT || 0,
        exceptionL1: byStatus.EXCEPTION_L1 || 0,
        exceptionL2: byStatus.EXCEPTION_L2 || 0,
        insufficientData: byStatus.INSUFFICIENT_DATA || 0,
        approvalRate,
      },
      funnel: {
        applications: total,
        evaluated,
        approved,
        exception: (byStatus.EXCEPTION_L1 || 0) + (byStatus.EXCEPTION_L2 || 0),
        rejected: byStatus.HARD_REJECT || 0,
      },
      riskDistribution: { LOW: byRisk.LOW || 0, MEDIUM: byRisk.MEDIUM || 0, HIGH: byRisk.HIGH || 0, CRITICAL: byRisk.CRITICAL || 0 },
      recentApplications: recent.map((a) => maskApplicationData(a, req.user.role)),
      pendingExceptions: pendingExceptions.map((a) => maskApplicationData(a, req.user.role)),
    });
  } catch (err) {
    console.error("getDashboardStats failed:", err.message);
    return res.status(500).json({ error: "Failed to compute dashboard stats" });
  }
}

module.exports = {
  evaluateApplication,
  simulateApplication,
  listApplications,
  getApplication,
  getExceptionQueue,
  decideException,
  getDashboardStats,
};
