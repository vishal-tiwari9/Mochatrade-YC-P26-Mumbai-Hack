import React from "react"
import { useApp } from "@/context/AppContext"
import { Dashboard } from "@/components/dashboard/Dashboard"

export function DashboardPage({ selectedPeriod = "30D" }) {
  const { liveExposures, liveRiskScore, liveVolatility } = useApp()
  return (
    <Dashboard 
      exposures={liveExposures} 
      riskScore={liveRiskScore} 
      volatility={liveVolatility} 
    />
  )
}

export default DashboardPage
