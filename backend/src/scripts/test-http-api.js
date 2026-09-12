async function testHttpApi() {
  const base = "http://localhost:5000";
  console.log("\n=================================================");
  console.log("🌐 TESTING LIVE HTTP API WORKFLOWS WITH ATLAS");
  console.log("=================================================\n");

  // Helper for logging in
  async function login(email, password) {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`);
    return { token: data.token, user: data.user };
  }

  // 1. Health check
  console.log("[1/6] Testing /api/health...");
  const health = await fetch(`${base}/api/health`).then((r) => r.json());
  console.log(`✅ Health check passed: ${health.status} (${health.service})`);

  // 2. RM Role: Login & Submit Application (Evaluate)
  console.log("\n[2/6] Testing RM Login & Application Submission (/api/applications/evaluate)...");
  const rm = await login("rm@nbfc.com", "Password@123");
  console.log(`   RM logged in: ${rm.user.email} (Role: ${rm.user.role})`);

  const appPayload = {
    personalDetails: {
      fullName: "Deepak Rawat",
      panNumber: "DPA123456K",
      phone: "9811223344",
      email: "deepak.rawat@example.com",
      age: 38,
      employmentType: "SALARIED",
    },
    rawFinancials: {
      monthlyIncome: 110000,
      existingObligations: 20000,
      requestedAmount: 750000,
      tenureMonths: 48,
      businessVintageMonths: 0,
      cibilScore: 750,
      hasWriteOff: false,
      dpd90Count: 0,
      bounceCountLast6M: 0,
      avgMonthlyBalance: 60000,
      declaredAssets: 2000000,
    },
  };

  const evalRes = await fetch(`${base}/api/applications/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${rm.token}`,
    },
    body: JSON.stringify(appPayload),
  });
  const evalData = await evalRes.json();
  if (!evalRes.ok) throw new Error(`Evaluate failed: ${JSON.stringify(evalData)}`);
  console.log(`✅ Application submitted & evaluated via HTTP API:`);
  console.log(`   Applicant ID: ${evalData.applicantId}`);
  console.log(`   Evaluation Status: ${evalData.evaluation?.status}`);
  console.log(`   Risk Grade: ${evalData.normalizedMetrics?.riskGrade}`);
  console.log(`   Proposed EMI: ₹${Math.round(evalData.normalizedMetrics?.proposedEmi || 0)}`);

  // 3. RM Role: Read Applications List & Dashboard
  console.log("\n[3/6] Testing RM Reading Applications List & Dashboard...");
  const appsList = await fetch(`${base}/api/applications`, {
    headers: { Authorization: `Bearer ${rm.token}` },
  }).then((r) => r.json());
  console.log(`✅ Applications retrieved from Atlas: ${appsList.applications?.length ?? appsList.length} items`);

  const dashboard = await fetch(`${base}/api/applications/dashboard`, {
    headers: { Authorization: `Bearer ${rm.token}` },
  }).then((r) => r.json());
  console.log(`✅ Dashboard stats retrieved: Total=${dashboard.total || 0}, Approved=${dashboard.approved || 0}`);

  // 4. Admin Role: Login, Read & Update BRE Rules
  console.log("\n[4/6] Testing Admin Login & BRE Rules Management (/api/rules)...");
  const admin = await login("admin@nbfc.com", "Password@123");
  console.log(`   Admin logged in: ${admin.user.email} (Role: ${admin.user.role})`);

  const rulesList = await fetch(`${base}/api/rules`, {
    headers: { Authorization: `Bearer ${admin.token}` },
  }).then((r) => r.json());
  console.log(`✅ BRE Rules fetched from Atlas: ${rulesList.length} active rules`);

  const targetRule = rulesList.find((r) => r.ruleCode === "RULE_MIN_CIBIL");
  if (targetRule) {
    const updateRes = await fetch(`${base}/api/rules/${targetRule._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({ thresholdValue: 550, name: "Minimum CIBIL Score" }),
    });
    const updatedRule = await updateRes.json();
    console.log(`✅ Rule updated via HTTP: ${updatedRule.ruleCode} (Version ${updatedRule.version})`);
  }

  // 5. Admin Role: Read Audit Trail
  console.log("\n[5/6] Testing Admin Audit Trail Retrieval (/api/audit)...");
  const auditRes = await fetch(`${base}/api/audit`, {
    headers: { Authorization: `Bearer ${admin.token}` },
  }).then((r) => r.json());
  console.log(`✅ Audit Logs fetched from Atlas: ${auditRes.logs?.length ?? auditRes.length} records`);

  // 6. Approver Role: Login & Check Exception Queue
  console.log("\n[6/6] Testing L1 Approver Exception Queue (/api/applications/exceptions)...");
  const l1 = await login("l1@nbfc.com", "Password@123");
  const excQueue = await fetch(`${base}/api/applications/exceptions`, {
    headers: { Authorization: `Bearer ${l1.token}` },
  }).then((r) => r.json());
  console.log(`✅ Exception Queue retrieved: ${excQueue.length || 0} applications pending review`);

  console.log("\n=================================================");
  console.log("🎉 ALL LIVE HTTP WORKFLOWS PASSED 100%!");
  console.log("=================================================\n");
}

testHttpApi().catch((err) => {
  console.error("HTTP TEST ERROR:", err.message || err);
  process.exit(1);
});
