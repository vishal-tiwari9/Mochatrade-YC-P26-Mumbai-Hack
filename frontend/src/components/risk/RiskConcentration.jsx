import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PieChart, AlertTriangle, Info, CheckCircle2 } from "lucide-react"
import { riskConcentrationData } from "@/data/risk-analysis-demo"

export function RiskConcentration({ data = riskConcentrationData }) {
  const {
    topDependencyName,
    topDependencyPercentage,
    concentrationStatus,
    explanation,
    benchmarkLimit,
    factors,
  } = data

  return (
    <BentoCard
      glowColor="rgba(245, 158, 11, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <PieChart className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Risk Concentration
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Single-factor dependency and portfolio clustering.
            </p>
          </div>

          <Badge
            variant="warning"
            className="text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider font-bold"
          >
            {concentrationStatus}
          </Badge>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-3.5">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              USD Dependency
            </span>
            <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
              {topDependencyPercentage}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Target: &lt;{benchmarkLimit}%
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Top Exposure Dependency
            </span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
              {topDependencyPercentage}%
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono block mt-0.5">
              +{topDependencyPercentage - benchmarkLimit}% Above Cap
            </span>
          </div>
        </div>

        {/* Multi-factor stacked concentration bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Factor Sensitivity Distribution</span>
            <span className="font-mono text-[11px] text-slate-400">
              HHI: {data.herfindahlIndex} (Concentrated)
            </span>
          </div>

          {/* Segmented Bar */}
          <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {factors.map((f) => (
              <div
                key={f.name}
                style={{
                  width: `${f.share}%`,
                  backgroundColor: f.color,
                }}
                className="h-full transition-all duration-500"
                title={`${f.name}: ${f.share}%`}
              />
            ))}
          </div>

          {/* Factor legend pills */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-1">
            {factors.map((f) => (
              <span key={f.name} className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
                {f.name.split(" ")[0]}: {f.share}%
              </span>
            ))}
          </div>
        </div>

        {/* Analytical Explanation Callout */}
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 p-3 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
            <strong>{explanation}</strong> Over-reliance on USD creates systemic vulnerability to unilateral dollar strength without offsetting receivables.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Portfolio Herfindahl-Hirschman Index</span>
        <span className="font-mono text-amber-600 dark:text-amber-400">
          Limit: 50% max
        </span>
      </div>
    </BentoCard>
  )
}

export default RiskConcentration
