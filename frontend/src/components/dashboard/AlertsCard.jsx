import React from "react"
import { Bell, AlertCircle, TriangleAlert } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"

export function AlertsCard({
  total = 7,
  critical = 2,
  medium = 5,
  description = "2 Critical, 5 Medium",
}) {
  return (
    <BentoCard glowColor="rgba(239, 68, 68, 0.12)" className="flex flex-col justify-between">
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Active Alerts
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
          <Bell className="h-4 w-4" />
        </div>
      </div>

      {/* Center: Total Alerts + Badges */}
      <div className="my-3 flex items-baseline justify-between">
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {total}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 gap-1 font-mono">
              <AlertCircle className="h-2.5 w-2.5" />
              {critical} Critical
            </Badge>
            <Badge variant="warning" className="text-[10px] px-1.5 py-0.5 gap-1 font-mono">
              <TriangleAlert className="h-2.5 w-2.5" />
              {medium} Medium
            </Badge>
          </div>
        </div>
      </div>

      {/* Bottom: Action prompt */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/60">
        <span>{description}</span>
        <span className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium cursor-pointer text-[11px]">
          Action Needed
        </span>
      </div>
    </BentoCard>
  )
}

export default AlertsCard
