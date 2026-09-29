/**
 * HedgeMind Corporate Treasury Risk - Exposure Batch Demo Data
 * Entry point for UPLOAD → VALIDATE → REVIEW → ANALYZE workflow.
 * STRICTLY ILLUSTRATIVE DEMO DATA FOR PROTOTYPE EVALUATION.
 */

// Sample CSV template content for download or manual testing
export const sampleCsvTemplate = `counterparty,currency,amount,days_to_payment
ABC Components,USD,450000,1
Global Metals,USD,180000,4
Tech Supplies,USD,220000,7
Industrial Parts,USD,125000,32
Munich Engineering,EUR,310000,12
Tokyo Dynamics,JPY,42000000,18
London Logistics,GBP,140000,5
EuroChem GMBH,EUR,-50000,15
Zurich Precision,CHF,95000,22
Seoul Semiconductor,USD,380000,45
Nordic Paper,EUR,215000,8
Pacific Freight,USD,165000,14
Apex Tooling,USD,290000,28
Bavaria Auto,EUR,175000,INVALID_DAYS
Shenzhen Electronics,USD,520000,3
Milan Fabrics,EUR,110000,30
Osaka Optics,JPY,28000000,60
Cambridge BioTech,GBP,90000,9
Lyon Chemicals,EUR,195000,21
Taipei Micro,USD,340000,16
Stockholm Power,EUR,150000,40
Frankfurt Logistics,EUR,85000,2
Kyoto Robotics,JPY,35000000,25
Manchester Energy,GBP,210000,11
Delta Manufacturing,USD,410000,19`

// Pre-packaged demo batch containing 25 processed records: 23 valid, 2 rejected
export const demoBatchUpload = {
  filename: "corporate_exposures_q3_import.csv",
  fileSize: "14.2 KB",
  fileType: "text/csv",
  rows_processed: 25,
  accepted_rows: 23,
  rejected_rows: [
    {
      row: 8,
      counterparty: "EuroChem GMBH",
      currency: "EUR",
      amount: -50000,
      days_to_payment: 15,
      reason: "amount must be greater than zero",
      status: "Rejected",
    },
    {
      row: 14,
      counterparty: "Bavaria Auto",
      currency: "EUR",
      amount: 175000,
      days_to_payment: "INVALID_DAYS",
      reason: "days_to_payment must be numeric",
      status: "Rejected",
    },
  ],
  column_mapping: {
    detected: true,
    original: "supplier",
    mapped: "counterparty",
  },
  exposures: [
    {
      id: "exp-1",
      row: 1,
      counterparty: "ABC Components",
      currency: "USD",
      amount: 450000,
      days_to_payment: 1,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-2",
      row: 2,
      counterparty: "Global Metals",
      currency: "USD",
      amount: 180000,
      days_to_payment: 4,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-3",
      row: 3,
      counterparty: "Tech Supplies",
      currency: "USD",
      amount: 220000,
      days_to_payment: 7,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-4",
      row: 4,
      counterparty: "Industrial Parts",
      currency: "USD",
      amount: 125000,
      days_to_payment: 32,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-5",
      row: 5,
      counterparty: "Munich Engineering",
      currency: "EUR",
      amount: 310000,
      days_to_payment: 12,
      status: "Valid",
      base_rate: 96.20
    },
    {
      id: "exp-6",
      row: 6,
      counterparty: "Tokyo Dynamics",
      currency: "JPY",
      amount: 42000000,
      days_to_payment: 18,
      status: "Valid",
      base_rate: 0.60
    },
    {
      id: "exp-7",
      row: 7,
      counterparty: "London Logistics",
      currency: "GBP",
      amount: 140000,
      days_to_payment: 5,
      status: "Valid",
      base_rate: 112.40
    },
    {
      id: "exp-8",
      row: 8,
      counterparty: "EuroChem GMBH",
      currency: "EUR",
      amount: -50000,
      days_to_payment: 15,
      status: "Rejected",
      reason: "amount must be greater than zero",
    },
    {
      id: "exp-9",
      row: 9,
      counterparty: "Zurich Precision",
      currency: "CHF",
      amount: 95000,
      days_to_payment: 22,
      status: "Valid",
      base_rate: 98.10
    },
    {
      id: "exp-10",
      row: 10,
      counterparty: "Seoul Semiconductor",
      currency: "USD",
      amount: 380000,
      days_to_payment: 45,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-11",
      row: 11,
      counterparty: "Nordic Paper",
      currency: "EUR",
      amount: 215000,
      days_to_payment: 8,
      status: "Valid",
      base_rate: 96.20
    },
    {
      id: "exp-12",
      row: 12,
      counterparty: "Pacific Freight",
      currency: "USD",
      amount: 165000,
      days_to_payment: 14,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-13",
      row: 13,
      counterparty: "Apex Tooling",
      currency: "USD",
      amount: 290000,
      days_to_payment: 28,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-14",
      row: 14,
      counterparty: "Bavaria Auto",
      currency: "EUR",
      amount: 175000,
      days_to_payment: "INVALID_DAYS",
      status: "Rejected",
      reason: "days_to_payment must be numeric",
    },
    {
      id: "exp-15",
      row: 15,
      counterparty: "Shenzhen Electronics",
      currency: "USD",
      amount: 520000,
      days_to_payment: 3,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-16",
      row: 16,
      counterparty: "Milan Fabrics",
      currency: "EUR",
      amount: 110000,
      days_to_payment: 30,
      status: "Valid",
      base_rate: 96.20
    },
    {
      id: "exp-17",
      row: 17,
      counterparty: "Osaka Optics",
      currency: "JPY",
      amount: 28000000,
      days_to_payment: 60,
      status: "Valid",
      base_rate: 0.60
    },
    {
      id: "exp-18",
      row: 18,
      counterparty: "Cambridge BioTech",
      currency: "GBP",
      amount: 90000,
      days_to_payment: 9,
      status: "Valid",
      base_rate: 112.40
    },
    {
      id: "exp-19",
      row: 19,
      counterparty: "Lyon Chemicals",
      currency: "EUR",
      amount: 195000,
      days_to_payment: 21,
      status: "Valid",
      base_rate: 96.20
    },
    {
      id: "exp-20",
      row: 20,
      counterparty: "Taipei Micro",
      currency: "USD",
      amount: 340000,
      days_to_payment: 16,
      status: "Valid",
      base_rate: 88.50
    },
    {
      id: "exp-21",
      row: 21,
      counterparty: "Stockholm Power",
      currency: "EUR",
      amount: 150000,
      days_to_payment: 40,
      status: "Valid",
      base_rate: 96.20
    },
    {
      id: "exp-22",
      row: 22,
      counterparty: "Frankfurt Logistics",
      currency: "EUR",
      amount: 85000,
      days_to_payment: 2,
      status: "Valid",
      base_rate: 96.20
    },
    {
      id: "exp-23",
      row: 23,
      counterparty: "Kyoto Robotics",
      currency: "JPY",
      amount: 35000000,
      days_to_payment: 25,
      status: "Valid",
      base_rate: 0.60
    },
    {
      id: "exp-24",
      row: 24,
      counterparty: "Manchester Energy",
      currency: "GBP",
      amount: 210000,
      days_to_payment: 11,
      status: "Valid",
      base_rate: 112.40
    },
    {
      id: "exp-25",
      row: 25,
      counterparty: "Delta Manufacturing",
      currency: "USD",
      amount: 410000,
      days_to_payment: 19,
      status: "Valid",
      base_rate: 88.50
    },
  ],
}

// Simulated backend analysis results for valid exposures (as returned by Risk Engine)
export const demoAnalyzedExposures = [
  {
    counterparty: "ABC Components",
    currency: "USD",
    amount: 450000,
    days_to_payment: 1,
    inr_exposure: 39825000,
    risk_score: 82,
    risk_level: "HIGH",
  },
  {
    counterparty: "Global Metals",
    currency: "USD",
    amount: 180000,
    days_to_payment: 4,
    inr_exposure: 15930000,
    risk_score: 68,
    risk_level: "MEDIUM",
  },
  {
    counterparty: "Tech Supplies",
    currency: "USD",
    amount: 220000,
    days_to_payment: 7,
    inr_exposure: 19470000,
    risk_score: 64,
    risk_level: "MEDIUM",
  },
  {
    counterparty: "Industrial Parts",
    currency: "USD",
    amount: 125000,
    days_to_payment: 32,
    inr_exposure: 11062500,
    risk_score: 52,
    risk_level: "MODERATE",
  },
  {
    counterparty: "Munich Engineering",
    currency: "EUR",
    amount: 310000,
    days_to_payment: 12,
    inr_exposure: 28520000,
    risk_score: 59,
    risk_level: "MODERATE",
  },
  {
    counterparty: "Tokyo Dynamics",
    currency: "JPY",
    amount: 42000000,
    days_to_payment: 18,
    inr_exposure: 23520000,
    risk_score: 48,
    risk_level: "LOW",
  },
  {
    counterparty: "London Logistics",
    currency: "GBP",
    amount: 140000,
    days_to_payment: 5,
    inr_exposure: 15400000,
    risk_score: 61,
    risk_level: "MEDIUM",
  },
  {
    counterparty: "Zurich Precision",
    currency: "CHF",
    amount: 95000,
    days_to_payment: 22,
    inr_exposure: 9215000,
    risk_score: 44,
    risk_level: "LOW",
  },
  {
    counterparty: "Seoul Semiconductor",
    currency: "USD",
    amount: 380000,
    days_to_payment: 45,
    inr_exposure: 33630000,
    risk_score: 71,
    risk_level: "HIGH",
  },
  {
    counterparty: "Nordic Paper",
    currency: "EUR",
    amount: 215000,
    days_to_payment: 8,
    inr_exposure: 19780000,
    risk_score: 55,
    risk_level: "MODERATE",
  },
  {
    counterparty: "Pacific Freight",
    currency: "USD",
    amount: 165000,
    days_to_payment: 14,
    inr_exposure: 14602500,
    risk_score: 58,
    risk_level: "MODERATE",
  },
  {
    counterparty: "Apex Tooling",
    currency: "USD",
    amount: 290000,
    days_to_payment: 28,
    inr_exposure: 25665000,
    risk_score: 66,
    risk_level: "MEDIUM",
  },
  {
    counterparty: "Shenzhen Electronics",
    currency: "USD",
    amount: 520000,
    days_to_payment: 3,
    inr_exposure: 46020000,
    risk_score: 86,
    risk_level: "CRITICAL",
  },
  {
    counterparty: "Milan Fabrics",
    currency: "EUR",
    amount: 110000,
    days_to_payment: 30,
    inr_exposure: 10120000,
    risk_score: 46,
    risk_level: "LOW",
  },
  {
    counterparty: "Osaka Optics",
    currency: "JPY",
    amount: 28000000,
    days_to_payment: 60,
    inr_exposure: 15680000,
    risk_score: 42,
    risk_level: "LOW",
  },
  {
    counterparty: "Cambridge BioTech",
    currency: "GBP",
    amount: 90000,
    days_to_payment: 9,
    inr_exposure: 9900000,
    risk_score: 51,
    risk_level: "MODERATE",
  },
  {
    counterparty: "Lyon Chemicals",
    currency: "EUR",
    amount: 195000,
    days_to_payment: 21,
    inr_exposure: 17940000,
    risk_score: 57,
    risk_level: "MODERATE",
  },
  {
    counterparty: "Taipei Micro",
    currency: "USD",
    amount: 340000,
    days_to_payment: 16,
    inr_exposure: 30090000,
    risk_score: 69,
    risk_level: "MEDIUM",
  },
  {
    counterparty: "Stockholm Power",
    currency: "EUR",
    amount: 150000,
    days_to_payment: 40,
    inr_exposure: 13800000,
    risk_score: 53,
    risk_level: "MODERATE",
  },
  {
    counterparty: "Frankfurt Logistics",
    currency: "EUR",
    amount: 85000,
    days_to_payment: 2,
    inr_exposure: 7820000,
    risk_score: 63,
    risk_level: "MEDIUM",
  },
  {
    counterparty: "Kyoto Robotics",
    currency: "JPY",
    amount: 35000000,
    days_to_payment: 25,
    inr_exposure: 19600000,
    risk_score: 47,
    risk_level: "LOW",
  },
  {
    counterparty: "Manchester Energy",
    currency: "GBP",
    amount: 210000,
    days_to_payment: 11,
    inr_exposure: 23100000,
    risk_score: 67,
    risk_level: "MEDIUM",
  },
  {
    counterparty: "Delta Manufacturing",
    currency: "USD",
    amount: 410000,
    days_to_payment: 19,
    inr_exposure: 36285000,
    risk_score: 75,
    risk_level: "HIGH",
  },
]
