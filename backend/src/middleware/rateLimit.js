const rateLimit = require("express-rate-limit");

// Tight limiter for login — the primary brute-force surface.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait a few minutes and try again." },
});

// Looser limiter for privileged write actions (evaluate, rule changes,
// exception decisions) — enough headroom for legitimate hackathon-demo
// bursts (re-running a scenario a few times) while still bounding abuse.
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." },
});

module.exports = { loginLimiter, writeLimiter };
