import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
} from "lucide-react"

export function ExposureSummary({
  rowsProcessed = 0,
  acceptedRows = 0,
  rejectedRowsCount = 0,
  status = "Ready",
}) {
  const getStatusConfig = (currentStatus) => {
    switch (currentStatus) {
      case "Validated":
        return {
          badgeVariant: "safe",
          badgeColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          glow: "rgba(16, 185, 129, 0.12)",
          description: "All records passed schema validation",
        }
      case "Validation Issues":
        return {
          badgeVariant: "warning",
          badgeColor: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
          glow: "rgba(245, 158, 11, 0.12)",
          description: "Rejected rows require review",
        }
      case "Processing":
        return {
          badgeVariant: "default",
          badgeColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
          glow: "rgba(59, 130, 246, 0.12)",
          description: "Parsing records & validating schema",
        }
      case "Error":
        return {
          badgeVariant: "destructive",
          badgeColor: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
          glow: "rgba(239, 68, 68, 0.12)",
          description: "Batch validation failed",
        }
      case "Ready":
      default:
        return {
          badgeVariant: "secondary",
          badgeColor: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          glow: "rgba(100, 116, 139, 0.08)",
          description: "Waiting for exposure file import",
        }
    }
  }

  const statusConfig = getStatusConfig(status)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* CARD 1: Rows Processed */}
      <BentoCard
        glowColor="rgba(59, 130, 246, 0.12)"
        className="flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rows Processed
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {rowsProcessed}
            </span>
            <span className="text-xs text-slate-400 font-mono">records</span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20">
              Raw File Intake
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          Total imported line items
        </div>
      </BentoCard>

      {/* CARD 2: Valid Exposures */}
      <BentoCard
        glowColor="rgba(16, 185, 129, 0.12)"
        className="flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Valid Exposures
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {acceptedRows}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {rowsProcessed > 0 ? `(${Math.round((acceptedRows / rowsProcessed) * 100)}%)` : ""}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <Badge
              variant="safe"
              className="text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider"
            >
              Ready for Analysis
            </Badge>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          Clean records meeting all criteria
        </div>
      </BentoCard>

      {/* CARD 3: Rejected Rows */}
      <BentoCard
        glowColor="rgba(239, 68, 68, 0.12)"
        className="flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Rejected Rows
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-3xl font-extrabold font-mono tracking-tight ${
                rejectedRowsCount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {rejectedRowsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {rejectedRowsCount === 1 ? "issue" : "issues"}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <Badge
              variant={rejectedRowsCount > 0 ? "destructive" : "secondary"}
              className="text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider"
            >
              {rejectedRowsCount > 0 ? "Action Required" : "Zero Issues"}
            </Badge>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {rejectedRowsCount > 0 ? "Excluded from financial calculation" : "All rows validated cleanly"}
        </div>
      </BentoCard>

      {/* CARD 4: Processing Status */}
      <BentoCard
        glowColor={statusConfig.glow}
        className="flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Processing Status
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight truncate">
              {status}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase border ${statusConfig.badgeColor}`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {statusConfig.description}
        </div>
      </BentoCard>
    </div>
  )
}

export default ExposureSummary
