import React from "react"
import { RiskScoreCard } from "./RiskScoreCard"
import { ExposureCard } from "./ExposureCard"
import { PotentialImpactCard } from "./PotentialImpactCard"
import { UpcomingPayments } from "./UpcomingPayments"

export function DashboardBentoGrid({
  exposures = [],
  riskScore = 0,
  volatility = null,
}) {
  
  // Calculate total INR exposure
  const totalInr = exposures.reduce((acc, exp) => acc + (exp.inr_exposure || 0), 0)
  const formattedTotalInr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(totalInr)

  // Calculate unique currencies
  const uniqueCurrencies = new Set(exposures.map(e => e.currency))
  const currencyBreakdown = `Across ${uniqueCurrencies.size} currenc${uniqueCurrencies.size === 1 ? "y" : "ies"}`

  // Format Volatility Impact
  const potentialImpactValue = volatility?.potential_additional_cost 
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
      }).format(volatility.potential_additional_cost)
    : "₹0"

  // Map exposures to payments
  const payments = exposures.map((e, idx) => ({
    id: e.id || `exp-${idx}`,
    supplier: e.counterparty || "Unknown",
    currency: e.currency,
    amount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: e.currency,
      maximumFractionDigits: 0
    }).format(e.amount),
    inrEquivalent: new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(e.inr_exposure || 0),
    dueDate: `${e.days_to_payment} Days`,
    hedgeStatus: "Unhedged"
  }))

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ROW 1: KPI Metrics (3 Cards) */}
      <section aria-label="Key Risk Indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
        <RiskScoreCard
          score={riskScore}
          maxScore={100}
          level={riskScore >= 80 ? "HIGH" : riskScore >= 60 ? "MEDIUM" : "LOW"}
          change="Live"
          period="from uploaded file"
        />
        <ExposureCard
          value={formattedTotalInr}
          currencyBreakdown={currencyBreakdown}
        />
        <PotentialImpactCard
          value={potentialImpactValue}
          description="Potential additional cost based on historical volatility."
          stressScenario="1-Sigma Historical Volatility Scenario"
        />
      </section>

      {/* ROW 2: Upcoming Payments Schedule */}
      <section aria-label="Scheduled Payables">
        <UpcomingPayments payments={payments} />
      </section>
    </div>
  )
}

