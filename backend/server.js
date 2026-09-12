const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "1.0.0.1"]);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {
  // Ignore if unsupported
}

const { env } = require("./src/config/env");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const { seedData } = require("./src/scripts/seed");
const authRoutes = require("./src/routes/authRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");
const ruleRoutes = require("./src/routes/ruleRoutes");
const userRoutes = require("./src/routes/userRoutes");
const auditRoutes = require("./src/routes/auditRoutes");

const app = express();

// Configure CORS for local development and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, postman, server-to-server) or listed origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid CORS roadblocks
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Minimal security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});

// Comprehensive health endpoint
app.get("/api/health", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: isDbConnected ? "ok" : "degraded",
    service: "backend",
    port: env.PORT,
    database: {
      status: isDbConnected ? "connected" : "disconnected",
      name: mongoose.connection.name || "nbfc_credit_db",
      host: mongoose.connection.host || null,
    },
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/rules", ruleRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit", auditRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Internal server error:", err.message || err);
  res.status(500).json({ error: "Internal server error" });
});

console.log("\n=======================================================");
console.log("🚀 NBFC SMART UNDERWRITING BACKEND INITIALIZING");
console.log("=======================================================");
console.log(`   Port: ${env.PORT}`);
console.log(`   Environment: ${env.NODE_ENV}`);
console.log(`   Connecting to MongoDB Atlas...`);

connectDB()
  .then(async () => {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("   Empty database detected — seeding baseline data...");
      await seedData();
    }
  })
  .then(() => {
    const server = app.listen(env.PORT, () => {
      console.log(`✅ MongoDB Atlas connected (${mongoose.connection.name})`);
      console.log(`✅ Backend server listening on http://localhost:${env.PORT}`);
      console.log(`✅ Health check available at http://localhost:${env.PORT}/api/health`);
      console.log("=======================================================\n");
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n❌ [STARTUP ERROR] Port ${env.PORT} is already in use by another process.`);
        console.error(`   Please terminate the existing process on port ${env.PORT} or change PORT in backend/.env.\n`);
      } else {
        console.error("\n❌ [STARTUP ERROR] Server failed to start:", err.message || err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("\n❌ [DATABASE ERROR] Startup halted because MongoDB Atlas connection failed:");
    console.error(`   ${err.message || err}`);
    console.error("   Please verify MONGO_URI in backend/.env and Atlas IP Whitelist (0.0.0.0/0).\n");
    process.exit(1);
  });
