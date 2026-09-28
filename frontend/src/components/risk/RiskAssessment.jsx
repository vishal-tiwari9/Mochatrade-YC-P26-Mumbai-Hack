import React, { useState } from "react"
import { useApp } from "@/context/AppContext"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { explainRisk } from "@/services/riskService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShieldAlert,
  SlidersHorizontal,
  GitBranch,
  ArrowRight,
  AlertCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { useNavigation } from "@/context/NavigationContext"
import { toast } from "sonner"

export function RiskAssessment() {
  const { liveRiskScore, liveExposures, liveVolatility, liveMitigation } = useApp()
  const [aiExplanation, setAiExplanation] = useState(null)
  const [isExplaining, setIsExplaining] = useState(false)

  const handleExplain = async () => {
    if (!liveExposures || liveExposures.length === 0) return
    setIsExplaining(true)
    try {
      const summary = await explainRisk({
        risk_score: liveRiskScore || 72,
        exposures: liveExposures,
        volatility: liveVolatility,
        mitigation: liveMitigation
      })
      setAiExplanation(summary)
      toast.success("AI risk analysis explained successfully")
    } catch (e) {
      console.error(e)
      toast.error("Failed to generate AI explanation")
    } finally {
      setIsExplaining(false)
    }
  }

  const { navigate } = useNavigation()

  return (
    <BentoCard
      glowColor="rgba(37, 99, 235, 0.15)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* AI Assistant Box */}
        <div className="rounded-xl border border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20 p-4 mb-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                AI Risk Assistant
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click below to generate a human-readable, structured explanation of your current exposure risk profile using Google Gemini.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <button 
            onClick={handleExplain}
            disabled={isExplaining || !liveExposures || liveExposures.length === 0}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-slate-900 transition-colors hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
          >
            {isExplaining ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isExplaining ? "Analyzing Context..." : "Explain Risk"}
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Risk Assessment
              </h3>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                EXECUTIVE SUMMARY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Holistic downside risk diagnosis and next steps in the treasury workflow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overall Risk:
            </span>
            <Badge
              variant={liveRiskScore >= 80 ? "destructive" : liveRiskScore >= 60 ? "warning" : "safe"}
              className="text-xs font-mono font-bold px-2.5 py-0.5 uppercase tracking-wider"
            >
              {liveRiskScore >= 80 ? "HIGH" : liveRiskScore >= 60 ? "MEDIUM" : "LOW"} ({liveRiskScore || 0}/100)
            </Badge>
          </div>
        </div>

        {/* 4 Core AI Assessment Blocks (Only visible after AI generation) */}
        {aiExplanation ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
              {/* 1. Primary Concern */}
              <div className="rounded-xl border border-red-500/20 bg-red-50/50 dark:bg-red-950/20 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Primary Concern</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {aiExplanation.primary_concern}
                  </p>
                </div>
              </div>

              {/* 2. Key Observation */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <Eye className="h-4 w-4 shrink-0" />
                    <span>Key Observation</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {aiExplanation.key_observation}
                  </p>
                </div>
              </div>

              {/* 3. Current Status */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Current Status</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {aiExplanation.current_status}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Recommended Action Pill */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Treasury Action Item:
                  </span>{" "}
                  <span className="text-slate-600 dark:text-slate-400">
                    {aiExplanation.recommended_action}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="my-8 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            Click "Explain Risk" to generate an AI risk assessment based on your current exposures.
          </div>
        )}
      </div>
    </BentoCard>
  )
}

export default RiskAssessment
