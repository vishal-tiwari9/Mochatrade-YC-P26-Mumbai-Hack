import React from "react"
import { TrendingDown, AlertTriangle } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"

export function PotentialImpactCard({
  value = "₹2.14 Cr",
  description = "Estimated impact under adverse market movement",
  stressScenario = "99% VaR (30-day horizon)",
}) {
  return (
    <BentoCard glowColor="rgba(245, 158, 11, 0.12)" className="flex flex-col justify-between">
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Potential Impact
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <TrendingDown className="h-4 w-4" />
        </div>
      </div>

      {/* Center: Value */}
      <div className="my-3">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400/90 font-medium">
          <AlertTriangle className="h-3 w-3 text-amber-500" />
          <span>{stressScenario}</span>
        </div>
      </div>

      {/* Bottom: Description context */}
      <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60 leading-snug line-clamp-1">
        {description}
      </div>
    </BentoCard>
  )
}

export default PotentialImpactCard
