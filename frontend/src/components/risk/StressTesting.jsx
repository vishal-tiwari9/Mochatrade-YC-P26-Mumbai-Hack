import React, { useState } from "react"
import { useApp } from "@/context/AppContext"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SlidersHorizontal,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react"
import { simulateScenario } from "@/services/riskService"
import { toast } from "sonner"

export function StressTesting() {
  const { liveRiskScore, liveExposures, liveVolatility } = useApp()
  const [selectedExposureIndex, setSelectedExposureIndex] = useState("0")
  const [customShift, setCustomShift] = useState(5) // default fallback
  const [hasSetDefault, setHasSetDefault] = useState(false)
  
  React.useEffect(() => {
    if (liveVolatility?.stress_cost_ratio && !hasSetDefault) {
      const defaultShift = Number((liveVolatility.stress_cost_ratio * 100).toFixed(1))
      setCustomShift(defaultShift)
      setHasSetDefault(true)
    }
  }, [liveVolatility, hasSetDefault])
  const [simulationResult, setSimulationResult] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)

  // Debounced Simulation Effect
  React.useEffect(() => {
    if (!liveExposures || liveExposures.length === 0) return

    const timeoutId = setTimeout(async () => {
      setIsSimulating(true)
      try {
        const primary = liveExposures[parseInt(selectedExposureIndex, 10)] || liveExposures[0]
        const baseRate = primary.base_rate || 88.5
        
        let scenarioRate = baseRate * (1 + (customShift / 100))
        
        const res = await simulateScenario({
          amount: primary.amount,
          currency: primary.currency,
          days_to_payment: primary.days_to_payment,
          exposure_type: primary.exposure_type || "payable",
          base_rate: baseRate,
          scenario_rate: scenarioRate
        })
        setSimulationResult(res)
      } catch(err) {
        console.error("Simulation failed:", err)
      } finally {
        setIsSimulating(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [customShift, selectedExposureIndex, liveExposures])


  
  const baseScore = liveRiskScore || 0
  
  const stressedScore = simulationResult ? simulationResult.risk_score : null
  const additionalImpact = simulationResult 
    ? `${simulationResult.rate_change > 0 ? "+" : ""}₹${Math.round(simulationResult.additional_unhedged_cost).toLocaleString()}`
    : "—"

  const riskLevel = stressedScore === null 
    ? "PENDING"
    : stressedScore >= 85
      ? "CRITICAL"
      : stressedScore >= 70
      ? "HIGH"
      : stressedScore >= 55
      ? "ELEVATED"
      : "MODERATE"

  const riskLevelColor =
    riskLevel === "CRITICAL"
      ? "text-red-600 dark:text-red-400 bg-red-500/15 border-red-500/30"
      : riskLevel === "HIGH"
      ? "text-orange-600 dark:text-orange-400 bg-orange-500/15 border-orange-500/30"
      : riskLevel === "ELEVATED"
      ? "text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30"
      : riskLevel === "PENDING"
      ? "text-slate-500 bg-slate-500/15 border-slate-500/30"
      : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30"

  return (
    <BentoCard
      glowColor="rgba(239, 68, 68, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header and Scenario Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Stress Testing
              </h3>
              <span className="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
                SCENARIO ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Evaluate how adverse market conditions could affect financial risk.
            </p>
          </div>

          {/* Exposure Selector Dropdown */}
          <div className="w-full sm:w-64 shrink-0">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Select Exposure
            </label>
            <Select
              value={selectedExposureIndex}
              onValueChange={setSelectedExposureIndex}
              disabled={!liveExposures || liveExposures.length === 0}
            >
              <SelectTrigger className="h-9 text-xs font-semibold">
                <SelectValue placeholder="Select exposure" />
              </SelectTrigger>
              <SelectContent align="end" className="max-h-72">
                {(liveExposures || []).map((exp, idx) => (
                  <SelectItem
                    key={idx}
                    value={idx.toString()}
                    className="text-xs py-2"
                  >
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {exp.currency} {exp.amount?.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2 capitalize">
                      ({exp.exposure_type})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interactive Scenario Slider */}
        <div className="mt-4 p-3 rounded-lg border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-500" />
              Adjust Macroeconomic Shock (% shift):
            </span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
              {customShift >= 0 ? `+${customShift}%` : `${customShift}%`}
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            step="0.5"
            value={customShift}
            onChange={(e) => setCustomShift(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        </div>

        {/* Scenario Result Panel (4 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-4">
          {/* Current Risk Score */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Current Risk Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {baseScore}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Baseline Position
            </span>
          </div>

          {/* Stressed Risk Score */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Stressed Risk Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-2xl font-black font-mono ${
                  stressedScore === null 
                    ? "text-slate-400"
                    : stressedScore >= 80
                    ? "text-red-600 dark:text-red-400"
                    : stressedScore >= 70
                    ? "text-orange-500"
                    : "text-emerald-500"
                }`}
              >
                {stressedScore !== null ? stressedScore : "—"}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] font-mono text-red-600 dark:text-red-400 mt-1 block">
              {stressedScore !== null ? (stressedScore > baseScore ? `+${stressedScore - baseScore} pts shock` : `${stressedScore - baseScore} pts relief`) : "Pending calculation..."}
            </span>
          </div>

          {/* Risk Level */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Risk Level
            </span>
            <div className="mt-1">
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-bold tracking-wider uppercase border ${riskLevelColor}`}
              >
                {riskLevel}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
              Scenario: Custom ({customShift >= 0 ? `+${customShift}%` : `${customShift}%`})
            </span>
          </div>

          {/* Additional Impact */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Est. Additional Impact
            </span>
            <span
              className={`text-xl font-black font-mono mt-0.5 block ${
                customShift < 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {additionalImpact}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block truncate">
              Incremental liability shift
            </span>
          </div>
        </div>

        {/* Visual Baseline vs Stressed Comparison Gauge */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              Score Shift Comparison:
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-400">
                Baseline: <strong className="text-slate-900 dark:text-white">{baseScore}</strong>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-red-600 dark:text-red-400">
                Stressed: <strong>{stressedScore !== null ? stressedScore : "—"}</strong>
              </span>
            </div>
          </div>

          {/* Baseline Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>BASELINE</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{baseScore} / 100</span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${baseScore}%` }}
              />
            </div>
          </div>

          {/* Stressed Bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-red-600 dark:text-red-400 font-semibold uppercase">
                STRESSED ({(customShift >= 0 ? "+" : "") + customShift}%)
              </span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400">
                {stressedScore !== null ? stressedScore : "—"} / 100
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stressedScore === null ? "bg-transparent" : stressedScore >= 85 ? "bg-red-600" : stressedScore >= 70 ? "bg-orange-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, stressedScore || 0)}%` }}
              />
            </div>
          </div>

          {/* Scenario Context Note */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p>
              <strong>Impact Pathway:</strong> A {customShift}% {customShift > 0 ? "depreciation" : "appreciation"} in the base currency rate.
              <span className="text-slate-400 dark:text-slate-500">
                 Increases downside liability for payable exposures.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Deterministic stress matrix</span>
        <span className="font-mono text-slate-600 dark:text-slate-400">
          Threshold Alert: {stressedScore >= 80 ? "CRITICAL RISK LEVEL" : "ELEVATED LEVEL"}
        </span>
      </div>
    </BentoCard>
  )
}

export default StressTesting
