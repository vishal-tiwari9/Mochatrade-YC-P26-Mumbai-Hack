const express = require("express");
const {
  evaluateApplication,
  simulateApplication,
  listApplications,
  getApplication,
  getExceptionQueue,
  decideException,
  getDashboardStats,
} = require("../controllers/underwritingController");
const { protect, authorizeRoles, enforceDataIsolation } = require("../middleware/authMiddleware");
const { writeLimiter } = require("../middleware/rateLimit");

const router = express.Router();

router.use(protect);

router.post("/evaluate", writeLimiter, authorizeRoles("RM", "ADMIN"), evaluateApplication);
router.post("/simulate", authorizeRoles("RM", "ADMIN"), simulateApplication);

// Must be registered before the "/:id" route below, or these literal
// segments would otherwise be captured as an :id param.
router.get("/dashboard", getDashboardStats);
router.get("/exceptions", authorizeRoles("L1_APPROVER", "L2_APPROVER", "ADMIN"), getExceptionQueue);

router.get("/", listApplications);
router.get("/:id", enforceDataIsolation, getApplication);
router.post(
  "/:id/decision",
  writeLimiter,
  authorizeRoles("L1_APPROVER", "L2_APPROVER", "ADMIN"),
  decideException
);

module.exports = router;
