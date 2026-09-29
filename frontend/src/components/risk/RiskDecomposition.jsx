import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import { Layers, TrendingUp, Info } from "lucide-react"
import { riskDecompositionData } from "@/data/risk-analysis-demo"

export function RiskDecomposition({ data = riskDecompositionData }) {
  const { currentScore, maxScore, factors } = data

  return (
    <BentoCard
      glowColor="rgba(239, 68, 68, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Risk Decomposition
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Factor attribution: why is the current risk score at 72?
            </p>
          </div>

          <div className="text-right">
            <span className="text-lg font-black font-mono text-red-600 dark:text-red-400">
              {currentScore}
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                /{maxScore}
              </span>
            </span>
            <span className="block text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
              HIGH RISK
            </span>
          </div>
        </div>

        {/* Contributing Factors List */}
        <div className="mt-4 space-y-3.5">
          {factors.map((factor) => {
            // Factor contribution width relative to score of 72
            const widthPercentage = (factor.contribution / currentScore) * 100

            return (
              <div key={factor.id} className="group">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {factor.name}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium"
                      style={{
                        backgroundColor: `${factor.color}15`,
                        color: factor.color,
                        border: `1px solid ${factor.color}30`,
                      }}
                    >
                      {factor.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      +{factor.contribution}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({factor.percentageOfScore}%)
                    </span>
                  </div>
                </div>

                {/* Contribution bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${widthPercentage}%`,
                      backgroundColor: factor.color,
                    }}
                  />
                </div>

                {/* Subtext explanation */}
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {factor.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Total */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-red-500" />
            <span className="font-medium">Total Risk Attribution</span>
          </div>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
            72 / 100 pts
          </span>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
          Top 2 drivers (Volatility + FX Sensitivity) account for 62.5% of total portfolio risk.
        </p>
      </div>
    </BentoCard>
  )
}

export default RiskDecomposition
