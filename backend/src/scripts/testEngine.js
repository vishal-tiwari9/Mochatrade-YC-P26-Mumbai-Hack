require("dotenv").config();

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:5000";
const RM_EMAIL = process.env.TEST_RM_EMAIL || "rm@nbfc.com";
const RM_PASSWORD = process.env.TEST_RM_PASSWORD || "Password@123";

async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed (${res.status}) — run \`npm run seed\` first.`);
  }
  return res.json();
}

const payload = {
  applicantId: `TEST-BORDERLINE-${Date.now()}`,
  personalDetails: {
    fullName: "Test Borderline Applicant",
    panNumber: "ABCDE1234F",
    phone: "9999999999",
    email: "borderline.applicant@example.com",
    employmentType: "SALARIED",
  },
  rawFinancials: {
    monthlyIncome: 80000,
    requestedAmount: 1500000,
    existingObligations: 25000,
    tenureMonths: 60,
    cibilScore: 660,
    hasWriteOff: false,
    dpd90Count: 0,
    bounceCountLast6M: 0,
    avgMonthlyBalance: 60000,
    itrYear1: 900000,
    itrYear2: 1020000,
    declaredAssets: 200000,
  },
};

async function run() {
  const { token } = await login(RM_EMAIL, RM_PASSWORD);
  console.log(`Logged in as ${RM_EMAIL}`);

  const res = await fetch(`${BASE_URL}/api/applications/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log(`HTTP ${res.status}`);
  console.log(JSON.stringify(data, null, 2));

  const status = data?.evaluation?.status;
  const foir = data?.normalizedMetrics?.foir;
  const rate = data?.normalizedMetrics?.rateOfInterest;
  const panMasked = data?.personalDetails?.panNumber?.startsWith("XXXXX");

  if (status === "EXCEPTION_L1" && typeof foir === "number" && rate !== null && panMasked) {
    console.log(`\nPASS — status=${status}, foir=${foir}, rateOfInterest=${rate}, panMasked=${panMasked}`);
  } else {
    console.log(`\nFAIL — expected EXCEPTION_L1 with a computed FOIR/rate and a masked PAN, got status=${status}`);
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error("Test script failed:", err.message);
  process.exitCode = 1;
});
