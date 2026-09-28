import React, { useState } from "react"
import { useApp } from "@/context/AppContext"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight, Zap, RefreshCw } from "lucide-react"
import { getMitigation } from "@/services/riskService"
import { toast } from "sonner"

export function MitigationPanel() {
  const { liveExposures, liveVolatility, liveMitigation, setLiveMitigation } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Default to the engine's recommendation, or 50%
  const defaultRatio = liveVolatility?.recommended_hedge_ratio || 0.5
  const [hedgeRatio, setHedgeRatio] = useState(defaultRatio)

  const fetchRecommendations = async () => {
    if (!liveExposures || liveExposures.length === 0) {
      setError("No exposures available to mitigate.")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const primary = liveExposures[0]
      const payload = {
        amount: primary.amount,
        currency: primary.currency,
        days_to_payment: primary.days_to_payment,
        exposure_type: primary.exposure_type || "payable",
        base_rate: primary.base_rate || 88.5,
        scenario_rate: liveVolatility?.upside_scenario_rate || 92.0,
        hedge_ratio: hedgeRatio,
        assumed_hedge_rate: (primary.base_rate || 88.5) * 1.005
      }
      
      const res = await getMitigation(payload)
      setLiveMitigation(res)
      toast.success("Hedge mitigation strategies generated")
    } catch (err) {
      setError(err.message)
      toast.error("Failed to generate mitigation strategies")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BentoCard glowColor="rgba(34, 197, 94, 0.15)">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Hedge Mitigation</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchRecommendations} 
          disabled={isLoading || !liveExposures || liveExposures.length === 0}
          className="h-8 gap-2 border-slate-200 dark:border-slate-800"
        >
          {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-orange-500" />}
          <span>{liveMitigation ? "Recalculate" : "Generate"}</span>
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Hedge Ratio Interactive Slider */}
      <div className="mb-5 p-3 rounded-lg border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Adjust Hedge Coverage:
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(hedgeRatio * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={hedgeRatio * 100}
          onChange={(e) => setHedgeRatio(Number(e.target.value) / 100)}
          className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
        />
      </div>

      {!liveMitigation && !error && (
        <div className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
          {(!liveExposures || liveExposures.length === 0) 
            ? "Upload exposures first to get hedging impact calculations."
            : "Click generate to see deterministic hedge ratios based on your exposure."}
        </div>
      )}

      {liveMitigation && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                Selected Hedge: {Math.round(liveMitigation.hedge_ratio * 100)}% Coverage
              </div>
              <div className="text-xs font-mono font-bold bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded border border-green-500/20">
                Rate: {liveMitigation.assumed_hedge_rate.toFixed(4)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <div className="text-slate-500 text-xs">Unhedged Scenario Cost</div>
                <div className="font-mono mt-1 text-red-500">
                  ₹{Math.round(liveMitigation.unhedged_scenario_cost).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-xs">Hedged Scenario Cost</div>
                <div className="font-mono mt-1 text-green-500">
                  ₹{Math.round(liveMitigation.illustrative_hedged_scenario_cost).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-green-500/20 flex justify-between items-center">
              <span className="text-xs font-medium text-slate-400">Projected Savings</span>
              <span className="font-mono font-bold text-green-500 flex items-center gap-1">
                <ArrowRight className="h-3.5 w-3.5" />
                ₹{liveMitigation.illustrative_benefit.toLocaleString()}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-4 text-center px-4">
              Illustrative scenario model. The assumed protected rate is not a live derivative quote or execution price. 
              <br/>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Illustrative hedge rate: base rate + 0.5% premium assumption.</span>
            </div>
          </div>
        </div>
      )}
    </BentoCard>
  )
}
