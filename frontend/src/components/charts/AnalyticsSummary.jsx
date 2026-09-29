import React from "react"
import {
  Wallet,
  ShieldAlert,
  CircleDollarSign,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"

export function AnalyticsSummary({
  summaryData,
  currency = "all",
}) {
  const data = summaryData || {}
  const total = data.totalExposure || {}
  const highest = data.highestRisk || {}
  const impact = data.potentialImpact || {}
  const hedged = data.hedgedExposure || {}

  // Filter-adapted display values if a specific currency is active
  const displayExposure =
    currency === "USD"
      ? "₹8.2 Cr"
      : currency === "EUR"
      ? "₹3.1 Cr"
      : currency === "GBP"
      ? "₹1.2 Cr"
      : currency !== "all"
      ? "₹0.6 Cr"
      : total.value || "₹12.5 Cr"

  const displayScope =
    currency === "all" ? "Gross Portfolio" : `${currency} Position`

  return (
    <section aria-label="Analytics KPI Summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Total Exposure */}
      <BentoCard glowColor="rgba(59, 130, 246, 0.12)" className="flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Exposure
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {displayExposure}
          </div>
          <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
            {displayScope}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium font-mono">
            <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
            {total.change || "+8.4%"}
          </span>
          <span>{total.comparison || "vs previous period"}</span>
        </div>
      </BentoCard>

      {/* CARD 2: Highest Risk */}
      <BentoCard glowColor="rgba(239, 68, 68, 0.12)" className="flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Highest Risk
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3 flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {highest.percentage || "62%"}
            </div>
            <div className="mt-1 text-xs text-red-500 dark:text-red-400 font-semibold font-mono">
              {highest.category || "FX Risk"}
            </div>
          </div>
          <Badge variant="destructive" className="font-mono text-[10px] px-1.5 py-0.5 uppercase">
            {highest.severity || "High"}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
          <span>Dominant Factor</span>
          <span className="text-slate-600 dark:text-slate-400 font-mono">3 Currencies</span>
        </div>
      </BentoCard>

      {/* CARD 3: Potential Impact */}
      <BentoCard glowColor="rgba(245, 158, 11, 0.12)" className="flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Potential Impact
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <CircleDollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {impact.value || "₹2.14 Cr"}
          </div>
          <div className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
            {impact.subtitle || "Estimated"}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
          <span>99% 30-Day Horizon</span>
          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
            Stress VaR
          </Badge>
        </div>
      </BentoCard>

      {/* CARD 4: Hedged Exposure */}
      <BentoCard glowColor="rgba(16, 185, 129, 0.12)" className="flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hedged Exposure
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="my-3">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {hedged.value || "68%"}
          </div>
          <div className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Portfolio Ratio
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium font-mono">
            <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
            {hedged.change || "+4.2%"}
          </span>
          <span>{hedged.comparison || "vs target"}</span>
        </div>
      </BentoCard>
    </section>
  )
}

export default AnalyticsSummary
