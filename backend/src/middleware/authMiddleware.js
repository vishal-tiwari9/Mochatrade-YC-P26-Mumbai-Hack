const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Applicant = require("../models/Applicant");

async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid or inactive user" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden — insufficient role" });
    }
    next();
  };
}

// Accepts either the Mongo _id (original API contract) or the human-facing
// applicantId (e.g. "APP-...") — lets the frontend use readable URLs without
// breaking any existing caller that already passes the Mongo _id.
async function findApplicantByRouteParam(idParam) {
  if (mongoose.isValidObjectId(idParam)) {
    const byMongoId = await Applicant.findById(idParam);
    if (byMongoId) return byMongoId;
  }
  return Applicant.findOne({ applicantId: idParam });
}

async function enforceDataIsolation(req, res, next) {
  try {
    const application = await findApplicantByRouteParam(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (req.user.role === "RM" && application.assignedToRMId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Forbidden — not your assigned applicant" });
    }

    req.application = application;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid application id" });
  }
}

module.exports = { protect, authorizeRoles, enforceDataIsolation, findApplicantByRouteParam };
