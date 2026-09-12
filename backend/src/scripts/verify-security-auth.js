const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const { env } = require("../config/env");

const mongoose = require("mongoose");
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");

const authRoutes = require("../routes/authRoutes");
const applicationRoutes = require("../routes/applicationRoutes");
const ruleRoutes = require("../routes/ruleRoutes");
const userRoutes = require("../routes/userRoutes");
const auditRoutes = require("../routes/auditRoutes");

const User = require("../models/User");
const Applicant = require("../models/Applicant");

async function runSecurityAudit() {
  console.log("\n=======================================================");
  console.log("  NBFC UNDERWRITING PLATFORM — SECURITY & RBAC AUDIT  ");
  console.log("=======================================================\n");

  await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log("✓ MongoDB Atlas connected for security audit.");

  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/rules", ruleRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/audit", auditRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`✓ Test server running on port ${port}.\n`);

  let passed = 0;
  let failed = 0;

  async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { status: res.status, data };
  }

  function assert(title, condition, extra = "") {
    if (condition) {
      console.log(`  [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${title} — ${extra}`);
      failed++;
    }
  }

  // --- 1. Authentic User Logins ---
  console.log("SECTION 1: Core Authentication & Role Determination");

  const rmRes = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "rm@nbfc.com", password: "Password@123" }),
  });
  assert("Valid RM Login generates JWT and determines role RM", rmRes.status === 200 && rmRes.data.user?.role === "RM" && !!rmRes.data.token);
  const rmToken = rmRes.data.token;

  const l1Res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "l1@nbfc.com", password: "Password@123" }),
  });
  assert("Valid L1 Login generates JWT and determines role L1_APPROVER", l1Res.status === 200 && l1Res.data.user?.role === "L1_APPROVER" && !!l1Res.data.token);
  const l1Token = l1Res.data.token;

  const l2Res = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "l2@nbfc.com", password: "Password@123" }),
  });
  assert("Valid L2 Login generates JWT and determines role L2_APPROVER", l2Res.status === 200 && l2Res.data.user?.role === "L2_APPROVER" && !!l2Res.data.token);
  const l2Token = l2Res.data.token;

  const adminRes = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@nbfc.com", password: "Password@123" }),
  });
  assert("Valid ADMIN Login generates JWT and determines role ADMIN", adminRes.status === 200 && adminRes.data.user?.role === "ADMIN" && !!adminRes.data.token);
  const adminToken = adminRes.data.token;

  // --- 2. Invalid Credentials Handling ---
  console.log("\nSECTION 2: Invalid Credentials & Tamper Defense");

  const wrongPass = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "rm@nbfc.com", password: "WrongPassword" }),
  });
  assert("Invalid password rejected with 401 Unauthorized", wrongPass.status === 401);

  const nonExistent = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "fake.officer@nbfc.com", password: "Password@123" }),
  });
  assert("Non-existent email rejected with 401 Unauthorized", nonExistent.status === 401);

  const emptyCreds = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "", password: "" }),
  });
  assert("Empty credentials rejected with 400 Bad Request", emptyCreds.status === 400);

  const forgedToken = jwt.sign({ id: "654321654321654321654321", role: "ADMIN" }, "fake-secret-key-12345");
  const forgedRes = await request("/rules", {
    headers: { Authorization: `Bearer ${forgedToken}` },
  });
  assert("Forged / unverified JWT rejected with 401 Unauthorized", forgedRes.status === 401);

  const unauthenticated = await request("/applications");
  assert("Unauthenticated request to protected endpoint rejected with 401", unauthenticated.status === 401);

  // --- 3. Server-Side RBAC Enforcement ---
  console.log("\nSECTION 3: Server-Side RBAC & Authority Boundaries");

  const rmRules = await request("/rules", {
    headers: { Authorization: `Bearer ${rmToken}` },
  });
  assert("RM accessing ADMIN-only /api/rules blocked with 403 Forbidden", rmRules.status === 403);

  const l1Rules = await request("/rules", {
    headers: { Authorization: `Bearer ${l1Token}` },
  });
  assert("L1 Approver accessing ADMIN-only /api/rules blocked with 403 Forbidden", l1Rules.status === 403);

  const l2Rules = await request("/rules", {
    headers: { Authorization: `Bearer ${l2Token}` },
  });
  assert("L2 Approver accessing ADMIN-only /api/rules blocked with 403 Forbidden", l2Rules.status === 403);

  const adminRules = await request("/rules", {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert("ADMIN accessing /api/rules authorized with 200 OK", adminRules.status === 200 && Array.isArray(adminRules.data));

  const rmExceptions = await request("/applications/exceptions", {
    headers: { Authorization: `Bearer ${rmToken}` },
  });
  assert("RM accessing /api/applications/exceptions blocked with 403 Forbidden", rmExceptions.status === 403);

  const l1Exceptions = await request("/applications/exceptions", {
    headers: { Authorization: `Bearer ${l1Token}` },
  });
  assert("L1 Approver accessing /api/applications/exceptions authorized with 200 OK", l1Exceptions.status === 200 && Array.isArray(l1Exceptions.data));

  const l2Exceptions = await request("/applications/exceptions", {
    headers: { Authorization: `Bearer ${l2Token}` },
  });
  assert("L2 Approver accessing /api/applications/exceptions authorized with 200 OK", l2Exceptions.status === 200 && Array.isArray(l2Exceptions.data));

  // --- 4. Exception Decision Cross-Tier Authority Isolation ---
  console.log("\nSECTION 4: Exception Decision Cross-Tier Authority Isolation");

  // Create a test L2 exception case
  const testL2Case = await Applicant.create({
    applicantId: `SEC-L2-${Date.now().toString().slice(-4)}`,
    assignedToRMId: new mongoose.Types.ObjectId(rmRes.data.user.id),
    personalDetails: { fullName: "Security Test L2 Case", panNumber: "SECL29999A" },
    rawFinancials: { monthlyIncome: 100000, requestedAmount: 1000000, cibilScore: 630 },
    evaluation: {
      status: "EXCEPTION_L2",
      exceptionLevelRequired: "L2",
      triggeredRules: [{ ruleCode: "EX_CIBIL_L2", ruleName: "CIBIL L2", category: "EXCEPTION_L2", severity: "HIGH", passed: false }],
    },
  });

  const l1DecideL2 = await request(`/applications/${testL2Case._id}/decision`, {
    method: "POST",
    headers: { Authorization: `Bearer ${l1Token}` },
    body: JSON.stringify({ decision: "APPROVED", note: "Unauthorized L1 override attempt" }),
  });
  assert("L1 token attempting to decide L2 case blocked with 403 Forbidden", l1DecideL2.status === 403);

  const l2DecideL2 = await request(`/applications/${testL2Case._id}/decision`, {
    method: "POST",
    headers: { Authorization: `Bearer ${l2Token}` },
    body: JSON.stringify({ decision: "APPROVED", note: "Authorized L2 credit sign-off" }),
  });
  assert("L2 token deciding L2 case successfully authorized with 200 OK", l2DecideL2.status === 200 && l2DecideL2.data.evaluation?.status === "APPROVED");

  // Cleanup test case
  await Applicant.findByIdAndDelete(testL2Case._id);

  console.log("\n=======================================================");
  console.log(`  SECURITY AUDIT RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("=======================================================\n");

  await mongoose.disconnect();
  server.close();

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSecurityAudit().catch((err) => {
  console.error("Security audit script failed:", err);
  process.exit(1);
});
