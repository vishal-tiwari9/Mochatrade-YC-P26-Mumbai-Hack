const express = require("express");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin-only user directory (e.g. user management screens in a later phase).
// RM assignment is now derived from the authenticated user's own token —
// see underwritingController.evaluateApplication — so this is no longer on
// the intake form's critical path.
router.get("/", protect, authorizeRoles("ADMIN"), async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).select("name email role");
    res.json(users);
  } catch (err) {
    console.error("GET /users failed:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;
