/**
 * HedgeMind Corporate Treasury Risk - Exposure Service
 * Handles file upload communication, basic client-side UX checks,
 * backend API interaction, and graceful mock fallback.
 * STRICTLY NO CLIENT-SIDE FINANCIAL RECALCULATIONS.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

/**
 * Basic UX validation of uploaded file format
 */
export function validateFileFormat(file) {
  if (!file) {
    return { valid: false, error: "No file selected." }
  }

  const name = file.name.toLowerCase()
  const isCsv = name.endsWith(".csv")
  const isXlsx = name.endsWith(".xlsx") || name.endsWith(".xls")

  if (!isCsv && !isXlsx) {
    return {
      valid: false,
      error: "Unsupported file format. Please upload a CSV or XLSX file.",
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "The uploaded file contains no exposure records (file is empty).",
    }
  }

  return { valid: true }
}

/**
 * Parse CSV text to preview rows and detect column aliases
 */
export function parseCsvText(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length <= 1) {
    throw new Error("The uploaded file contains no data records beyond headers.")
  }

  const headerLine = lines[0]
  const rawHeaders = headerLine.split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""))

  // Check column alias: supplier -> counterparty
  let columnMapping = null
  const normalizedHeaders = rawHeaders.map((h) => {
    if (h === "supplier") {
      columnMapping = { detected: true, original: "supplier", mapped: "counterparty" }
      return "counterparty"
    }
    return h
  })

  // Required columns
  const required = ["counterparty", "currency", "amount", "days_to_payment"]
  const missing = required.filter((req) => !normalizedHeaders.includes(req))

  if (missing.length > 0) {
    throw new Error(`Required columns are missing: ${missing.join(", ")}`)
  }

  const counterpartyIdx = normalizedHeaders.indexOf("counterparty")
  const currencyIdx = normalizedHeaders.indexOf("currency")
  const amountIdx = normalizedHeaders.indexOf("amount")
  const daysIdx = normalizedHeaders.indexOf("days_to_payment")

  const exposures = []
  const rejectedRows = []

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""))

    const counterparty = cols[counterpartyIdx] || `Counterparty-${rowNum}`
    const currency = (cols[currencyIdx] || "USD").toUpperCase()
    const rawAmount = cols[amountIdx]
    const rawDays = cols[daysIdx]

    const numAmount = parseFloat(rawAmount)
    const numDays = parseInt(rawDays, 10)

    // UX Validation Checks
    if (isNaN(numAmount) || numAmount <= 0) {
      rejectedRows.push({
        row: rowNum,
        counterparty,
        currency,
        amount: rawAmount,
        days_to_payment: rawDays,
        reason: "amount must be greater than zero",
        status: "Rejected",
      })
      exposures.push({
        id: `row-${rowNum}`,
        row: rowNum,
        counterparty,
        currency,
        amount: rawAmount,
        days_to_payment: rawDays,
        status: "Rejected",
        reason: "amount must be greater than zero",
      })
      continue
    }

    if (isNaN(numDays) || isNaN(Number(rawDays)) || numDays < 0) {
      rejectedRows.push({
        row: rowNum,
        counterparty,
        currency,
        amount: numAmount,
        days_to_payment: rawDays,
        reason: "days_to_payment must be numeric",
        status: "Rejected",
      })
      exposures.push({
        id: `row-${rowNum}`,
        row: rowNum,
        counterparty,
        currency,
        amount: numAmount,
        days_to_payment: rawDays,
        status: "Rejected",
        reason: "days_to_payment must be numeric",
      })
      continue
    }

    exposures.push({
      id: `row-${rowNum}`,
      row: rowNum,
      counterparty,
      currency,
      amount: numAmount,
      days_to_payment: numDays,
      status: "Valid",
    })
  }

  const validExposures = exposures.filter((e) => e.status === "Valid")

  return {
    rows_processed: lines.length - 1,
    accepted_rows: validExposures.length,
    rejected_rows: rejectedRows,
    column_mapping: columnMapping,
    exposures,
  }
}

/**
 * Upload exposure file to backend API or process via client parser
 */
export async function uploadExposureFile(file, baseRate = 88.5) {
  const formatCheck = validateFileFormat(file)
  if (!formatCheck.valid) {
    throw new Error(formatCheck.error)
  }

  // First try calling real backend
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || "Backend /api/upload failed.")
  }

  const data = await response.json()
  
  // Format the exposures for the frontend table
  const exposures = (data.exposures || []).map((exp, idx) => ({
    id: `row-${idx + 1}`,
    row: idx + 1,
    counterparty: exp.counterparty || `Counterparty-${idx + 1}`,
    currency: exp.currency,
    amount: exp.amount,
    days_to_payment: exp.days_to_payment,
    base_rate: exp.base_rate,
    status: "Valid"
  }))

  return {
    filename: file.name,
    fileSize: `${(file.size / 1024).toFixed(1)} KB`,
    fileType: file.type || "text/csv",
    rows_processed: data.rows_processed,
    accepted_rows: exposures.length,
    rejected_rows: [],
    column_mapping: null,
    exposures,
  }
}

/**
 * Submit valid exposures to backend for financial analysis
 */
export async function analyzeExposures(exposures, baseRate = 88.5) {
  if (!exposures || exposures.length === 0) {
    throw new Error("No valid exposure records available to analyze.")
  }

  const validPayload = exposures
    .filter((e) => e.status === "Valid" || !e.status)
    .map((e) => ({
      counterparty: e.counterparty,
      currency: e.currency,
      amount: e.amount,
      days_to_payment: e.days_to_payment,
      base_rate: e.base_rate,
    }))

  if (validPayload.length === 0) {
    throw new Error("No valid exposures found in current dataset.")
  }

  // Attempt real backend call
  console.log("Analyzing exposures payload:", JSON.stringify(validPayload, null, 2))
  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validPayload),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    console.error("Analyze error:", err)
    throw new Error(err.detail ? JSON.stringify(err.detail) : "Backend /api/analyze failed.")
  }

  const data = await response.json()
  return {
    success: true,
    analyzedCount: data.exposures?.length || 0,
    exposures: data.exposures,
  }
}

/**
 * Send raw text to the backend to be extracted into a structured exposure using Gemini AI
 */
export async function extractExposureFromText(text) {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty.")
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || "Backend /api/extract failed.")
  }

  const data = await response.json()
  return data
}
