/**
 * Mock Fraud Case Data Layer for FraudNexus
 * 
 * In a production environment, this data would be fetched asynchronously from an API:
 * 
 * export async function fetchFraudCase(caseId) {
 *   const response = await fetch(`/api/fraud-cases/${caseId}`);
 *   if (!response.ok) throw new Error(`Failed to load case ${caseId}`);
 *   return response.json();
 * }
 */

export const fraudCase = {
  caseId: "FN-2291",
  title: "Mule Account Ring & Coordinated UPI Drain",
  status: "ACTIVE_HOLD",
  priority: "CRITICAL",
  createdAt: "2026-09-09 20:14:00 IST",
  detectedBy: "NexusAI Realtime Stream Engine v4.2",
  
  // Flagged anchor transaction
  transaction: {
    id: "TXN-904128",
    amount: "₹1,48,500.00",
    currency: "INR",
    channel: "UPI Instant Transfer",
    timestamp: "2026-09-09 20:12:44 IST",
    status: "FLAGGED_HOLD",
    merchant: "QuickGold Exchange Pvt Ltd",
    ipAddress: "103.21.144.67",
    location: "Mumbai, MH (Proxy / Commercial VPN)",
    riskScore: 94
  },

  // Configurable severity bands for the Risk Score Panel
  riskScoreBands: [
    { label: "LOW", min: 0, max: 39, color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.4)" },
    { label: "MEDIUM", min: 40, max: 69, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.4)" },
    { label: "HIGH", min: 70, max: 89, color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.4)" },
    { label: "CRITICAL", min: 90, max: 100, color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.5)" }
  ],

  riskScore: 94,
  severity: "CRITICAL",

  // Contributing reasons that sum to riskScore (32 + 24 + 18 + 14 + 6 = 94)
  riskFactors: [
    {
      id: "RF-1",
      label: "Shared device across accounts",
      points: 32,
      severity: "CRITICAL",
      nodeIds: ["node-dev-1", "node-acc-1", "node-acc-2", "node-acc-3"],
      description: "Hardware fingerprint matches device registered to banned account ACC-8891 and 2 other unverified profiles.",
      evidence: "Hardware UUID hash: 9a7f...2d81 matched 3 distinct KYC names in < 24h."
    },
    {
      id: "RF-2",
      label: "Common UPI ID / beneficiary",
      points: 24,
      severity: "HIGH",
      nodeIds: ["node-upi-1", "node-acc-1", "node-acc-2"],
      description: "Virtual Payment Address (VPA) linked to 3 active chargebacks and high-velocity money-routing pattern.",
      evidence: "VPA quickdrain@okhdfcbank receives from 4 distinct sender accounts and drains immediately."
    },
    {
      id: "RF-3",
      label: "High transaction frequency",
      points: 18,
      severity: "HIGH",
      nodeIds: ["node-txn-1", "node-acc-1"],
      description: "Transaction velocity is 14.5x above standard baseline for this account age (< 14 days old).",
      evidence: "7 high-value debits totaling ₹4,82,000 executed within a 12-minute window."
    },
    {
      id: "RF-4",
      label: "Previous fraud connection",
      points: 14,
      severity: "MEDIUM",
      nodeIds: ["node-phone-1", "node-dev-1"],
      description: "SIM phone number flagged in NCRP (National Cyber Crime Reporting Portal) syndicated ring database.",
      evidence: "MSISDN +91 98765-43210 tagged in Case CYB-2025-0819 (Investment Scheme Scam)."
    },
    {
      id: "RF-5",
      label: "Multiple linked accounts",
      points: 6,
      severity: "LOW",
      nodeIds: ["node-acc-2", "node-acc-3"],
      description: "Secondary mule receiver account opened with disposable digital KYC credentials.",
      evidence: "Account opened 3 days ago; zero prior transaction history prior to receiving transfer."
    }
  ],

  // Graph nodes: revealed in step order (0 to 6)
  // Sequence: Transaction (0) → Account (1) → UPI ID (2) → Phone (3) → Device (4) → Mule Account 1 (5) → Mule Account 2 (6)
  // Branching: Account connects to UPI & Phone; Device is shared between Phone, Acc 1, and branches to Acc 2 & Acc 3!
  nodes: [
    {
      id: "node-txn-1",
      step: 0,
      type: "TRANSACTION",
      label: "Flagged Transfer",
      subtitle: "TXN-904128",
      x: 130,
      y: 280,
      riskLevel: "CRITICAL",
      riskFactorIds: ["RF-3"],
      meta: {
        id: "TXN-904128",
        amount: "₹1,48,500.00",
        channel: "UPI / IMPS",
        timestamp: "2026-09-09 20:12:44 IST",
        status: "FLAGGED & FROZEN",
        merchant: "QuickGold Exchange",
        ip: "103.21.144.67 (VPN)",
        anomalyScore: "0.96 / 1.00",
        kycStatus: "N/A"
      },
      tags: ["High Velocity", "Off-Hours", "VPN"]
    },
    {
      id: "node-acc-1",
      step: 1,
      type: "ACCOUNT",
      label: "Source Account",
      subtitle: "ACC-40912",
      x: 320,
      y: 280,
      riskLevel: "HIGH",
      riskFactorIds: ["RF-1", "RF-2", "RF-3"],
      meta: {
        id: "ACC-40912-IN-HDFC",
        holderName: "Rajesh K. Verma (Suspect Alias)",
        bank: "HDFC Bank Ltd",
        accountAge: "11 days",
        kycStatus: "Tier-1 OTP Verified (Minimal)",
        firstSeen: "2026-08-29",
        currentBalance: "₹12,410.00",
        linkedEntitiesCount: 4,
        totalInflow30d: "₹8,45,000.00"
      },
      tags: ["New Account", "High Turnover", "Mule Source"]
    },
    {
      id: "node-upi-1",
      step: 2,
      type: "UPI",
      label: "UPI VPA Handle",
      subtitle: "quickdrain@okhdfc",
      x: 520,
      y: 150,
      riskLevel: "HIGH",
      riskFactorIds: ["RF-2"],
      meta: {
        id: "quickdrain@okhdfcbank",
        psp: "Google Pay / HDFC PSP",
        registeredName: "Quick Solutions Hub",
        firstSeen: "2026-09-01",
        chargebackCount: 3,
        linkedEntitiesCount: 3,
        dailyVelocity: "42 transfers / day"
      },
      tags: ["Chargeback Risk", "Rapid Funnel"]
    },
    {
      id: "node-phone-1",
      step: 3,
      type: "PHONE",
      label: "Registered Mobile",
      subtitle: "+91 98765-43210",
      x: 520,
      y: 410,
      riskLevel: "MEDIUM",
      riskFactorIds: ["RF-4"],
      meta: {
        id: "+91 98765 43210",
        carrier: "Jio Infocomm (Prepaid)",
        circle: "Maharashtra & Goa",
        simAge: "18 days",
        ncrpFlag: "MATCH FOUND (Scam Ring #819)",
        linkedEntitiesCount: 2,
        roamingStatus: "Active Roaming"
      },
      tags: ["Prepaid Burner", "NCRP Flagged"]
    },
    {
      id: "node-dev-1",
      step: 4,
      type: "DEVICE",
      label: "Hardware Device",
      subtitle: "DEV-88321 (Pixel 7)",
      x: 720,
      y: 280,
      riskLevel: "CRITICAL",
      riskFactorIds: ["RF-1", "RF-4"],
      meta: {
        id: "DEV-88321-FP-HASH",
        model: "Google Pixel 7 Pro (Android 14)",
        fingerprint: "sha256:9a7f43b...2d81ce4",
        ipAddress: "103.21.144.67 (Datacenter ASN)",
        rootDetected: "YES (Magisk v27.0)",
        appClonerDetected: "YES (Dual Space)",
        linkedAccountsCount: 3,
        firstSeen: "2026-07-15"
      },
      tags: ["Rooted OS", "App Cloner", "Shared Fingerprint"]
    },
    {
      id: "node-acc-2",
      step: 5,
      type: "ACCOUNT",
      label: "Mule Account #2",
      subtitle: "ACC-88914 (ICICI)",
      x: 940,
      y: 160,
      riskLevel: "CRITICAL",
      riskFactorIds: ["RF-1", "RF-2", "RF-5"],
      meta: {
        id: "ACC-88914-IN-ICICI",
        holderName: "Vikas P. Singh",
        bank: "ICICI Bank Ltd",
        accountAge: "4 days",
        kycStatus: "Digital Video KYC Failed Audit",
        firstSeen: "2026-09-05",
        currentBalance: "₹1,42,000.00",
        linkedEntitiesCount: 3,
        status: "FREEZE REQUEST PENDING"
      },
      tags: ["Mule Destination", "Fake KYC", "Frozen Pending"]
    },
    {
      id: "node-acc-3",
      step: 6,
      type: "ACCOUNT",
      label: "Mule Account #3",
      subtitle: "ACC-33109 (Axis)",
      x: 940,
      y: 400,
      riskLevel: "HIGH",
      riskFactorIds: ["RF-1", "RF-5"],
      meta: {
        id: "ACC-33109-IN-AXIS",
        holderName: "Anil R. Shinde",
        bank: "Axis Bank",
        accountAge: "6 days",
        kycStatus: "Basic Aadhaar eKYC",
        firstSeen: "2026-09-03",
        currentBalance: "₹89,500.00",
        linkedEntitiesCount: 2,
        status: "UNDER INVESTIGATION"
      },
      tags: ["Secondary Mule", "Cash Out Ring"]
    }
  ],

  // Graph edges connecting entities in discovery order
  edges: [
    {
      id: "edge-1",
      from: "node-txn-1",
      to: "node-acc-1",
      step: 1,
      label: "Originates From",
      type: "DEBIT",
      riskFactorIds: ["RF-3"]
    },
    {
      id: "edge-2",
      from: "node-acc-1",
      to: "node-upi-1",
      step: 2,
      label: "Linked VPA Handle",
      type: "AUTH",
      riskFactorIds: ["RF-2"]
    },
    {
      id: "edge-3",
      from: "node-acc-1",
      to: "node-phone-1",
      step: 3,
      label: "Registered MSISDN",
      type: "IDENTITY",
      riskFactorIds: ["RF-4"]
    },
    {
      id: "edge-4",
      from: "node-phone-1",
      to: "node-dev-1",
      step: 4,
      label: "Active Session Device",
      type: "TELEMETRY",
      riskFactorIds: ["RF-1", "RF-4"]
    },
    {
      id: "edge-5",
      from: "node-dev-1",
      to: "node-acc-2",
      step: 5,
      label: "Shared Device Fingerprint",
      type: "FINGERPRINT_LINK",
      riskFactorIds: ["RF-1", "RF-5"]
    },
    {
      id: "edge-6",
      from: "node-upi-1",
      to: "node-acc-2",
      step: 5,
      label: "Beneficiary Payout Routing",
      type: "MONEY_FLOW",
      riskFactorIds: ["RF-2", "RF-5"]
    },
    {
      id: "edge-7",
      from: "node-dev-1",
      to: "node-acc-3",
      step: 6,
      label: "Shared Hardware UUID",
      type: "FINGERPRINT_LINK",
      riskFactorIds: ["RF-1", "RF-5"]
    }
  ]
};

// Alternative case for testing dynamic data swapping
export const secondaryFraudCase = {
  caseId: "FN-3840",
  title: "Synthetic Identity & Stolen Card Velocity Burst",
  status: "ESCALATED",
  priority: "HIGH",
  createdAt: "2026-09-09 18:40:12 IST",
  detectedBy: "NexusAI Card Shield v3.1",
  
  transaction: {
    id: "TXN-774019",
    amount: "₹64,200.00",
    currency: "INR",
    channel: "Credit Card (POS CNP)",
    timestamp: "2026-09-09 18:38:02 IST",
    status: "SUSPICIOUS_VELOCITY",
    merchant: "ElectroMart Global",
    ipAddress: "45.134.22.90",
    location: "Bengaluru, KA (TOR Exit Node)",
    riskScore: 78
  },

  riskScoreBands: [
    { label: "LOW", min: 0, max: 39, color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.4)" },
    { label: "MEDIUM", min: 40, max: 69, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.4)" },
    { label: "HIGH", min: 70, max: 89, color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", border: "rgba(249, 115, 22, 0.4)" },
    { label: "CRITICAL", min: 90, max: 100, color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.5)" }
  ],

  riskScore: 78,
  severity: "HIGH",

  riskFactors: [
    {
      id: "RF-B1",
      label: "TOR Exit Node IP Address",
      points: 28,
      severity: "HIGH",
      nodeIds: ["b-node-txn", "b-node-ip"],
      description: "Transaction originated from known anonymization network and darknet exit relay.",
      evidence: "IP 45.134.22.90 listed in Tor Consensus Directory."
    },
    {
      id: "RF-B2",
      label: "Card BIN Geographic Mismatch",
      points: 22,
      severity: "HIGH",
      nodeIds: ["b-node-card", "b-node-acc"],
      description: "Card issuing country (UK) differs from shipping destination and device geo-locale.",
      evidence: "BIN 414720 issued by Barclays UK, used from Bangalore VPN."
    },
    {
      id: "RF-B3",
      label: "Velocity Spurt (5 attempts / 90s)",
      points: 18,
      severity: "MEDIUM",
      nodeIds: ["b-node-txn", "b-node-card"],
      description: "5 rapid authorization micro-charges preceded this high-value checkout attempt.",
      evidence: "Failed CVV retry spike within 90 seconds."
    },
    {
      id: "RF-B4",
      label: "Burner Email Domain",
      points: 10,
      severity: "LOW",
      nodeIds: ["b-node-email", "b-node-acc"],
      description: "Temporary inbox domain with disposable MX records.",
      evidence: "Domain @tempmail-box.ninja registered 2 days ago."
    }
  ],

  nodes: [
    {
      id: "b-node-txn",
      step: 0,
      type: "TRANSACTION",
      label: "POS CNP Checkout",
      subtitle: "TXN-774019",
      x: 130,
      y: 280,
      riskLevel: "HIGH",
      riskFactorIds: ["RF-B1", "RF-B3"],
      meta: {
        id: "TXN-774019",
        amount: "₹64,200.00",
        channel: "Visa Credit Card CNP",
        timestamp: "2026-09-09 18:38:02 IST",
        status: "FLAGGED VELOCITY",
        merchant: "ElectroMart Global",
        ip: "45.134.22.90 (TOR Exit)",
        anomalyScore: "0.82 / 1.00"
      },
      tags: ["TOR Exit Node", "Rapid Retry"]
    },
    {
      id: "b-node-card",
      step: 1,
      type: "ACCOUNT",
      label: "Visa Platinum Card",
      subtitle: "•••• 8412 (Barclays)",
      x: 350,
      y: 280,
      riskLevel: "HIGH",
      riskFactorIds: ["RF-B2", "RF-B3"],
      meta: {
        id: "CARD-414720-XXXX-8412",
        issuer: "Barclays Bank UK",
        cardType: "Visa Infinite Platinum",
        billingCountry: "United Kingdom (GB)",
        firstSeen: "2026-09-09 (First Online Order)",
        linkedEntitiesCount: 3
      },
      tags: ["BIN Mismatch", "Cross-Border"]
    },
    {
      id: "b-node-email",
      step: 2,
      type: "UPI",
      label: "Customer Email",
      subtitle: "alex99@tempmail-box",
      x: 580,
      y: 160,
      riskLevel: "MEDIUM",
      riskFactorIds: ["RF-B4"],
      meta: {
        id: "alex99@tempmail-box.ninja",
        domain: "tempmail-box.ninja (Disposable)",
        deliverability: "Temporary MX",
        firstSeen: "2026-09-09",
        linkedEntitiesCount: 2
      },
      tags: ["Burner Domain", "Disposable Inbox"]
    },
    {
      id: "b-node-ip",
      step: 3,
      type: "DEVICE",
      label: "TOR Relay Gateway",
      subtitle: "IP 45.134.22.90",
      x: 580,
      y: 400,
      riskLevel: "HIGH",
      riskFactorIds: ["RF-B1"],
      meta: {
        id: "IP-45.134.22.90",
        asn: "AS197019 / DataCloud EU",
        threatCategory: "Tor Anonymizer Exit Node",
        country: "Germany (Routed)",
        abuseScore: "98% High Risk"
      },
      tags: ["Tor Relay", "Anonymizer"]
    },
    {
      id: "b-node-acc",
      step: 4,
      type: "ACCOUNT",
      label: "Merchant Profile",
      subtitle: "USER-99214",
      x: 810,
      y: 280,
      riskLevel: "HIGH",
      riskFactorIds: ["RF-B2", "RF-B4"],
      meta: {
        id: "USER-99214",
        registeredName: "Alex Turner",
        accountAge: "2 hours",
        kycStatus: "Guest Checkout",
        linkedEntitiesCount: 3
      },
      tags: ["Synthetic Identity", "Zero History"]
    }
  ],

  edges: [
    {
      id: "b-edge-1",
      from: "b-node-txn",
      to: "b-node-card",
      step: 1,
      label: "Charged Card",
      type: "PAYMENT_METHOD",
      riskFactorIds: ["RF-B2", "RF-B3"]
    },
    {
      id: "b-edge-2",
      from: "b-node-card",
      to: "b-node-email",
      step: 2,
      label: "Billing Email",
      type: "IDENTITY",
      riskFactorIds: ["RF-B4"]
    },
    {
      id: "b-edge-3",
      from: "b-node-txn",
      to: "b-node-ip",
      step: 3,
      label: "Source IP Connection",
      type: "NETWORK",
      riskFactorIds: ["RF-B1"]
    },
    {
      id: "b-edge-4",
      from: "b-node-email",
      to: "b-node-acc",
      step: 4,
      label: "Associated Guest Profile",
      type: "ACCOUNT_LINK",
      riskFactorIds: ["RF-B4"]
    },
    {
      id: "b-edge-5",
      from: "b-node-ip",
      to: "b-node-acc",
      step: 4,
      label: "Device / IP Association",
      type: "NETWORK_LINK",
      riskFactorIds: ["RF-B1"]
    }
  ]
};
