// riskService.js
// Handles all risk, volatility, and AI explanation endpoints

const API_BASE = "http://127.0.0.1:8000/api/v1"

export async function calculateVolatility(currency, targetCurrency = "INR", days = 30, amount = 0) {
  try {
    const response = await fetch(`${API_BASE}/volatility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currency,
        target_currency: targetCurrency,
        days,
        amount
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.detail || "Failed to calculate volatility")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("RiskService - Volatility Error:", error)
    throw error
  }
}

export async function simulateScenario(payload) {
  try {
    const response = await fetch(`${API_BASE}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error("Failed to simulate scenario")
    return await response.json()
  } catch (error) {
    console.error("RiskService - Simulate Error:", error)
    throw error
  }
}

export async function getMitigation(payload) {
  try {
    const response = await fetch(`${API_BASE}/mitigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error("Failed to get mitigation recommendations")
    return await response.json()
  } catch (error) {
    console.error("RiskService - Mitigation Error:", error)
    throw error
  }
}

export async function explainRisk(contextData) {
  try {
    const response = await fetch(`${API_BASE}/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: contextData }),
    })
    if (!response.ok) throw new Error("Failed to get AI explanation")
    const data = await response.json()
    return data
  } catch (error) {
    console.error("RiskService - Explain Error:", error)
    throw error
  }
}
