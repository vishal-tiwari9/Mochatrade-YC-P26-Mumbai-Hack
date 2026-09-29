import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  FileWarning,
  Info,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"

export function ValidationIssues({ rejectedRows = [] }) {
  if (!rejectedRows || rejectedRows.length === 0) {
    return null
  }

  return (
    <BentoCard
      glowColor="rgba(239, 68, 68, 0.15)"
      className="flex flex-col justify-between border-red-500/20 dark:border-red-500/20"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-red-500/20">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <FileWarning className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Validation Issues
              </h3>
              <Badge
                variant="destructive"
                className="text-[10px] font-mono px-2 py-0 uppercase tracking-wider font-bold"
              >
                {rejectedRows.length} REJECTED {rejectedRows.length === 1 ? "ROW" : "ROWS"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              These records failed ingestion rules and are excluded from financial analysis. Never silently ignored.
            </p>
          </div>
        </div>

        {/* Rejected Rows Table */}
        <div className="mt-3.5 rounded-lg border border-red-500/20 overflow-hidden bg-red-50/20 dark:bg-red-950/10">
          <table className="w-full text-xs font-mono">
            <thead className="bg-red-500/10 text-red-700 dark:text-red-300 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-2.5 text-center w-16">Row</th>
                <th className="p-2.5 text-left min-w-[140px]">Counterparty</th>
                <th className="p-2.5 text-left">Issue / Failure Reason</th>
                <th className="p-2.5 text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-500/15">
              {rejectedRows.map((item) => (
                <tr
                  key={item.row}
                  className="hover:bg-red-500/10 transition-colors"
                >
                  <td className="p-2.5 text-center font-bold text-red-600 dark:text-red-400">
                    #{item.row}
                  </td>
                  <td className="p-2.5 text-slate-800 dark:text-slate-200 font-sans font-medium">
                    {item.counterparty || "Unknown"}
                  </td>
                  <td className="p-2.5 text-red-600 dark:text-red-300 font-medium">
                    {item.reason}
                  </td>
                  <td className="p-2.5 text-center">
                    <Badge
                      variant="destructive"
                      className="text-[9px] font-mono uppercase px-2 py-0"
                    >
                      {item.status || "Rejected"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Remediation Note */}
        <div className="mt-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-3 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
          <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Recommended action:</strong> You can proceed to analyze the valid records now, or update your spreadsheet with corrected values and re-upload to include these positions.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Zero silent row drops</span>
        <span className="font-mono text-red-500 font-semibold">
          Strict Audit Compliance
        </span>
      </div>
    </BentoCard>
  )
}

export default ValidationIssues
