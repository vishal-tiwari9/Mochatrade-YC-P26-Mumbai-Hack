import React from "react"
import { Eye, Download, FileText, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BentoCard } from "@/components/aceternity/BentoCard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ReportStatusBadge } from "./ReportStatusBadge"

export function RecentReportsTable({ reports, onPreview, onDownload }) {
  if (!reports || reports.length === 0) {
    return null
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <BentoCard className="p-0 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Reports
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {reports.length} report{reports.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden sm:table-cell">Period</TableHead>
              <TableHead className="hidden md:table-cell">Generated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {report.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {report.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {report.type}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {report.period}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(report.generatedAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <ReportStatusBadge status={report.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {report.status === "Ready" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onPreview(report)}
                          className="h-7 w-7 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
                          aria-label={`Preview ${report.name}`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDownload(report)}
                          className="h-7 w-7 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                          aria-label={`Download ${report.name}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {report.status === "Failed" && (
                      <span className="text-[11px] text-red-500 font-medium">
                        Retry
                      </span>
                    )}
                    {report.status === "Generating" && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Processing...
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </BentoCard>
  )
}
