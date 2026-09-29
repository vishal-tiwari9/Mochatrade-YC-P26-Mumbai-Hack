import React from "react"
import { AlertCircle, TriangleAlert, Info, ExternalLink } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"

const iconMap = {
  AlertCircle: AlertCircle,
  TriangleAlert: TriangleAlert,
  Info: Info,
}

const severityConfig = {
  Critical: {
    icon: AlertCircle,
    borderClass: "border-red-500/30 bg-red-500/10 text-red-500 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-400",
    bgHover: "hover:border-red-500/40",
  },
  Warning: {
    icon: TriangleAlert,
    borderClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-amber-400",
    bgHover: "hover:border-amber-500/40",
  },
  Info: {
    icon: Info,
    borderClass: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:border-sky-500/20 dark:bg-sky-950/20 dark:text-sky-400",
    bgHover: "hover:border-sky-500/40",
  },
}

export function RecentAlerts({ alerts = [] }) {
  const items = alerts.length
    ? alerts
    : [
        {
          id: "alt-1",
          severity: "Critical",
          title: "USD exposure increased by 8%",
          details: "Exceeded corporate risk threshold for Q3 supplier payables.",
          timestamp: "12 minutes ago",
          iconType: "AlertCircle",
        },
        {
          id: "alt-2",
          severity: "Warning",
          title: "Supplier payment delayed",
          details: "ABC Components invoice #INV-4901 shifted payment window.",
          timestamp: "1 hour ago",
          iconType: "TriangleAlert",
        },
        {
          id: "alt-3",
          severity: "Warning",
          title: "Commodity exposure crossed threshold",
          details: "Aluminium raw material hedge coverage fell below 40%.",
          timestamp: "3 hours ago",
          iconType: "TriangleAlert",
        },
        {
          id: "alt-4",
          severity: "Info",
          title: "EUR exposure decreased by 3%",
          details: "European receivables settled ahead of scheduled due date.",
          timestamp: "5 hours ago",
          iconType: "Info",
        },
      ]

  return (
    <BentoCard glowColor="rgba(239, 68, 68, 0.1)" className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Alerts
            </h3>
            <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-mono text-red-600 dark:text-red-400 border border-red-500/20">
              LIVE STREAM
            </span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium transition-colors cursor-pointer"
          >
            <span>View all</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Automated threshold breaches and corporate risk events.
        </p>

        {/* Alert Items List */}
        <div className="space-y-2">
          {items.map((alert) => {
            const config = severityConfig[alert.severity] || severityConfig.Info
            const Icon = iconMap[alert.iconType] || config.icon

            return (
              <div
                key={alert.id || alert.title}
                className={`group flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 p-2.5 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 ${config.bgHover}`}
              >
                {/* Severity Icon Box */}
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${config.borderClass}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-white transition-colors">
                      {alert.title}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>
                  {alert.details && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {alert.details}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500 flex justify-between">
        <span>Channel: Corporate Treasury</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">Real-time Sync</span>
      </div>
    </BentoCard>
  )
}

export default RecentAlerts
