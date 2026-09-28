import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import {
  ShieldAlert,
  TrendingDown,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Info,
} from "lucide-react"

export function RiskMetricCards({ metrics }) {
  if (!metrics) return null

  const { overallRisk, varMetric, expectedShortfall, portfolioVolatility } = metrics

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* CARD 1: Overall Risk Score */}
      <BentoCard
        glowColor="rgba(239, 68, 68, 0.15)"
        className="flex flex-col justify-between border-red-500/20 dark:border-red-500/20"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {overallRisk.title}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {overallRisk.score}
            </span>
            <span className="text-sm font-semibold text-slate-400 dark:text-slate-500 font-mono">
              / {overallRisk.maxScore}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <Badge
              variant="destructive"
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
            >
              {overallRisk.level}
            </Badge>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-red-600 dark:text-red-400 font-mono">
              <ArrowUpRight className="h-3 w-3" />
              {overallRisk.trend}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {overallRisk.subtext}
        </div>
      </BentoCard>

      {/* CARD 2: Value at Risk (VaR) */}
      <BentoCard
        glowColor="rgba(245, 158, 11, 0.15)"
        className="flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {varMetric.title}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {varMetric.value}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
              {varMetric.confidence}
            </span>
            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {varMetric.horizon}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {varMetric.subtext}
        </div>
      </BentoCard>

      {/* CARD 3: Expected Shortfall (CVaR) */}
      <BentoCard
        glowColor="rgba(239, 68, 68, 0.15)"
        className="flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {expectedShortfall.title}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {expectedShortfall.value}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-700 dark:text-rose-300 border border-rose-500/20">
              {expectedShortfall.confidence}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Tail Loss Avg
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {expectedShortfall.subtext}
        </div>
      </BentoCard>

      {/* CARD 4: Portfolio Volatility */}
      <BentoCard
        glowColor="rgba(59, 130, 246, 0.15)"
        className="flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {portfolioVolatility.title}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Activity className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {portfolioVolatility.value}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20">
              {portfolioVolatility.annualized}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono">
              {portfolioVolatility.trend}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {portfolioVolatility.subtext}
        </div>
      </BentoCard>
    </div>
  )
}

export default RiskMetricCards
