import React from "react"
import { ShieldAlert, ArrowUpRight } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"

export function RiskScoreCard({
  score = 72,
  maxScore = 100,
  level = "HIGH",
  change = "+8.4%",
  period = "from last month",
}) {
  // SVG circular arc parameters for gauge
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / maxScore) * circumference

  return (
    <BentoCard glowColor="rgba(239, 68, 68, 0.12)" className="flex flex-col justify-between">
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Overall Risk
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
          <ShieldAlert className="h-4 w-4" />
        </div>
      </div>

      {/* Center: Score + Gauge */}
      <div className="my-3 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {score}
            </span>
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500">
              / {maxScore}
            </span>
          </div>
          <div className="mt-1">
            <Badge variant="destructive" className="font-mono text-[11px] px-2 py-0.5">
              {level}
            </Badge>
          </div>
        </div>

        {/* Circular gauge indicator */}
        <div className="relative flex items-center justify-center">
          <svg className="h-16 w-16 -rotate-90 transform">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              className="text-slate-200 dark:text-slate-800"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-red-500 transition-all duration-1000 ease-out"
              fill="transparent"
            />
          </svg>
          <div className="absolute text-[11px] font-mono font-bold text-red-500 dark:text-red-400">
            {score}%
          </div>
        </div>
      </div>

      {/* Bottom: Change context */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
        <span className="inline-flex items-center text-red-500 dark:text-red-400 font-medium font-mono">
          <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
          {change}
        </span>
        <span className="text-slate-400 dark:text-slate-500">{period}</span>
      </div>
    </BentoCard>
  )
}

export default RiskScoreCard
