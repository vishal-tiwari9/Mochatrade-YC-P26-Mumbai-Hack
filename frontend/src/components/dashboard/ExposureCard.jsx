import React from "react"
import { Wallet, Globe } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"

export function ExposureCard({
  value = "₹12.5 Cr",
  currencyBreakdown = "Across 3 currencies",
}) {
  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.12)" className="flex flex-col justify-between">
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Total Exposure
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <Wallet className="h-4 w-4" />
        </div>
      </div>

      {/* Center: Exposure Amount */}
      <div className="my-3">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
          {value}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Gross Notional Position
        </div>
      </div>

      {/* Bottom: Currency breakdown context */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
        <Globe className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        <span>{currencyBreakdown}</span>
      </div>
    </BentoCard>
  )
}

export default ExposureCard
