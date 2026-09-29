import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import {
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Info,
  Layers,
  Zap,
} from "lucide-react"
import { tailRiskData } from "@/data/risk-analysis-demo"

export function TailRiskAnalysis({ data = tailRiskData }) {
  return (
    <BentoCard
      glowColor="rgba(239, 68, 68, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <AlertOctagon className="h-4 w-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Tail Risk Analysis
              </h3>
              <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                FAT-TAIL DOWNSIDE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Estimate potential downside under increasingly severe conditions. Extreme events produce disproportionate losses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">
              Distribution Kurtosis: 4.8 (Leptokurtic)
            </span>
          </div>
        </div>

        {/* 3-Level Progression Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
          {data.map((tier, idx) => {
            const isNormal = tier.tier === "NORMAL"
            const isAdverse = tier.tier === "ADVERSE"
            const isExtreme = tier.tier === "EXTREME"

            return (
              <div
                key={tier.tier}
                className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all duration-200 ${
                  isExtreme
                    ? "border-red-500/40 bg-red-500/5 dark:bg-red-950/20 shadow-sm shadow-red-500/5"
                    : isAdverse
                    ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20"
                    : "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                }`}
              >
                {/* Step indicator & severity badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Level 0{idx + 1} · {tier.tier}
                    </span>
                    <Badge
                      variant={
                        isExtreme
                          ? "destructive"
                          : isAdverse
                          ? "warning"
                          : "safe"
                      }
                      className="text-[9px] font-mono px-1.5 py-0 uppercase"
                    >
                      {tier.severity}
                    </Badge>
                  </div>

                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Potential Loss
                  </div>
                  <div
                    className="text-2xl sm:text-3xl font-black font-mono tracking-tight my-1"
                    style={{ color: tier.color }}
                  >
                    {tier.potentialLoss}
                  </div>

                  <div className="flex items-center gap-2 my-2">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      {tier.probability}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {tier.ratioMultiplier} leap
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Progress bar visual showing non-linear scale */}
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Downside Severity</span>
                    <span>{tier.lossInCr} Cr / 2.5 Cr</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(tier.lossInCr / 2.31) * 100}%`,
                        backgroundColor: tier.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Non-Linearity Insight Panel */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Non-Linear Downside Expansion:
              </span>{" "}
              <span className="text-slate-500 dark:text-slate-400">
                A 1σ to 3σ deviation causes a <strong>550% surge</strong> in potential financial loss due to portfolio unhedged delta.
              </span>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
            Tail Risk Factor: 5.5x
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3 text-blue-500" />
          Conditional tail expectation (CTE) modeled across historical stress events
        </span>
        <span className="font-mono text-slate-600 dark:text-slate-400">
          Tail Convexity: High
        </span>
      </div>
    </BentoCard>
  )
}

export default TailRiskAnalysis
