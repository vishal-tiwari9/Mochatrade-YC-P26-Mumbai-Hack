import React from "react"
import { ShieldAlert, Sparkles, Info, ArrowRight } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { useNavigation } from "@/context/NavigationContext"
import { Button } from "@/components/ui/button"
import { ExposureSummary } from "@/components/risk/ExposureSummary"
import { StressTesting } from "@/components/risk/StressTesting"
import { MitigationPanel } from "@/components/risk/MitigationPanel"
import { RiskAssessment } from "@/components/risk/RiskAssessment"

export function RiskAnalysisPage() {
  const { liveExposures, liveRiskScore, liveRiskLevel } = useApp()
  const { navigate } = useNavigation()

  const hasData = liveExposures && liveExposures.length > 0 && liveRiskScore !== null

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 border border-blue-100 dark:border-blue-800/50">
          <ShieldAlert className="h-8 w-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Risk Data Available</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Upload and analyze exposure data in the Exposure workspace to run simulations and generate mitigation strategies.
        </p>
        <Button 
          onClick={() => navigate('exposure')}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
        >
          Go to Exposure Workspace
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Exposure Summary */}
      <ExposureSummary 
        exposures={liveExposures} 
        riskScore={liveRiskScore} 
        riskLevel={liveRiskLevel} 
      />

      {/* 2. Main Risk Flow Workspace */}
      <div className="space-y-5">
        {/* ROW 1: Scenario Simulator & Mitigation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <StressTesting />
          <MitigationPanel />
        </div>

        {/* ROW 2: AI Risk Assessment */}
        <div className="grid grid-cols-1 gap-5">
          <RiskAssessment />
        </div>
      </div>

      {/* 3. Footer Disclaimer */}
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="h-4 w-4 text-blue-500 shrink-0" />
        <p className="leading-relaxed">
          <strong>Risk Engine Disclosure:</strong> The metrics presented (Scenario Simulator, Mitigation, AI Explanation) are derived from the uploaded financial exposures and calculated via the HedgeMind risk engine logic.
        </p>
      </div>
    </div>
  )
}

export default RiskAnalysisPage
