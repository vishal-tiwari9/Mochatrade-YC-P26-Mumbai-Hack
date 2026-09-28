import React from "react"
import { Sparkles, ArrowRight, ShieldAlert, Cpu } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import { useNavigation } from "@/context/NavigationContext"

export function RiskIntelligence() {
  const { navigate } = useNavigation()

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.12)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Risk Intelligence
            </h3>
            <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
              AI COPILOT
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Cpu className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Continuous algorithmic surveillance and portfolio diagnostics.
        </p>

        {/* Intelligence Insights List */}
        <div className="mt-3 space-y-2">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-2.5">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-blue-600 dark:text-blue-400">FX exposure</strong> is currently the dominant risk driver across consolidated balance sheets.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-2.5">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong className="text-red-500">USD exposure increased 8.2%</strong> over the selected period, elevating single-currency concentration.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-2.5">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Potential sensitivity is highest around the <strong className="text-amber-500">+5% movement scenario</strong> with unhedged payables.
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-slate-800/60 pt-2.5 text-center">
          <div className="rounded-md bg-slate-100 dark:bg-slate-800/60 p-1.5">
            <span className="block text-[9px] text-slate-400 uppercase font-semibold">Primary</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">FX Exposure</span>
          </div>
          <div className="rounded-md bg-slate-100 dark:bg-slate-800/60 p-1.5">
            <span className="block text-[9px] text-slate-400 uppercase font-semibold">Risk Level</span>
            <span className="text-xs font-bold text-red-500">High</span>
          </div>
          <div className="rounded-md bg-slate-100 dark:bg-slate-800/60 p-1.5">
            <span className="block text-[9px] text-slate-400 uppercase font-semibold">Confidence</span>
            <span className="text-xs font-bold font-mono text-blue-500">Demo</span>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="mt-3 border-t border-slate-200 dark:border-slate-800/60 pt-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Algorithmic risk model</span>
        <button
          type="button"
          onClick={() => navigate("risk-analysis")}
          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-semibold cursor-pointer transition-colors"
        >
          <span>View Risk Analysis</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </BentoCard>
  )
}

export default RiskIntelligence
