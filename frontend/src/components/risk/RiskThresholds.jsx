import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sliders, AlertOctagon, CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { riskThresholdsData } from "@/data/risk-analysis-demo"

export function RiskThresholds({ thresholds = riskThresholdsData }) {
  const getBadgeVariant = (status) => {
    switch (status) {
      case "Normal":
        return "safe"
      case "Elevated":
        return "warning"
      case "Near Limit":
        return "destructive"
      case "Exceeded":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <BentoCard
      glowColor="rgba(239, 68, 68, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <Sliders className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Risk Thresholds
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Current utilization against internal treasury board policy limits.
            </p>
          </div>

          <span className="text-[10px] font-mono font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            1 NEAR LIMIT
          </span>
        </div>

        {/* Threshold Utilization Bars */}
        <div className="mt-4 space-y-4">
          {thresholds.map((item) => {
            const isNearLimit = item.status === "Near Limit"
            const isElevated = item.status === "Elevated"
            const isNormal = item.status === "Normal"

            return (
              <div key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 ml-2">
                      ({item.currentValue} of {item.limitValue})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`text-xs font-black ${
                        isNearLimit
                          ? "text-red-600 dark:text-red-400"
                          : isElevated
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {item.currentUtilization}%
                    </span>
                    <Badge
                      variant={getBadgeVariant(item.status)}
                      className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>

                {/* Progress bar with internal limit marker */}
                <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.barColor}`}
                    style={{ width: `${Math.min(100, item.currentUtilization)}%` }}
                  />
                  {/* Warning line at 80% */}
                  <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-slate-400/40" />
                  {/* Critical line at 90% */}
                  <div className="absolute top-0 bottom-0 left-[90%] w-0.5 bg-red-400/60" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                  <span>0%</span>
                  <span>Warn: 80%</span>
                  <span>Crit: 90%</span>
                  <span>Cap: 100%</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Semantic States Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
            Internal Risk Limit States:
          </span>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-mono">
            <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-0.5">
              Normal
            </span>
            <span className="rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 py-0.5">
              Elevated
            </span>
            <span className="rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 py-0.5 font-bold">
              Near Limit
            </span>
            <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 py-0.5">
              Exceeded
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3 text-blue-500" />
          Mandated by Board Risk Governance Policy
        </span>
        <span className="font-mono text-slate-600 dark:text-slate-400">
          Daily Sync
        </span>
      </div>
    </BentoCard>
  )
}

export default RiskThresholds
