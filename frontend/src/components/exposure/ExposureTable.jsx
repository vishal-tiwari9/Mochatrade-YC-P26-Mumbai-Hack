import React, { useState, useMemo } from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Filter,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Currency symbols formatter
const formatCurrencyAmount = (amount, currency = "USD") => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return String(amount || "—")
  }
  const symbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CHF: "CHF ",
  }
  const sym = symbols[currency] || `${currency} `
  return `${sym}${amount.toLocaleString("en-US")}`
}

// INR Formatter
const formatInrCr = (val) => {
  if (typeof val !== "number" || isNaN(val)) return "—"
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} L`
  }
  return `₹${val.toLocaleString("en-IN")}`
}

export function ExposureTable({ exposures = [], isAnalyzed = false }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filteredExposures = useMemo(() => {
    return exposures.filter((item) => {
      const matchesSearch =
        item.counterparty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currency?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.amount).includes(searchQuery)

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "valid"
          ? item.status === "Valid"
          : item.status === "Rejected"

      return matchesSearch && matchesStatus
    })
  }, [exposures, searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredExposures.length / pageSize) || 1
  const paginatedExposures = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExposures.slice(start, start + pageSize)
  }, [filteredExposures, currentPage, pageSize])

  const validCount = exposures.filter((e) => e.status === "Valid").length
  const rejectedCount = exposures.filter((e) => e.status === "Rejected").length

  return (
    <BentoCard
      glowColor="rgba(59, 130, 246, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Exposure Data
              </h3>
              {isAnalyzed ? (
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ANALYSIS COMPLETE
                </span>
              ) : (
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  PREVIEW ({exposures.length})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review imported exposure positions before submitting for risk calculations.
            </p>
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/80 self-start sm:self-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all")
                setCurrentPage(1)
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === "all"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({exposures.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("valid")
                setCurrentPage(1)
              }}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === "valid"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-emerald-500"
              }`}
            >
              Valid ({validCount})
            </button>
            {rejectedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("rejected")
                  setCurrentPage(1)
                }}
                className={`px-2.5 py-1 rounded transition-colors ${
                  statusFilter === "rejected"
                    ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-red-500"
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            )}
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="my-3 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search counterparty or currency..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 w-full pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
            Showing {filteredExposures.length} of {exposures.length} records
          </div>
        </div>

        {/* Data Table with Horizontal Scroll inside card */}
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/80">
                <TableRow>
                  <TableHead className="w-12 text-center">Row</TableHead>
                  <TableHead className="min-w-[160px]">Counterparty</TableHead>
                  <TableHead className="w-24">Currency</TableHead>
                  <TableHead className="min-w-[120px] text-right">Amount</TableHead>
                  <TableHead className="min-w-[130px] text-center">Days to Payment</TableHead>
                  <TableHead className="w-24 text-center">Status</TableHead>
                  {isAnalyzed && (
                    <>
                      <TableHead className="min-w-[130px] text-right">INR Exposure</TableHead>
                      <TableHead className="min-w-[110px] text-center">Risk Score</TableHead>
                      <TableHead className="min-w-[100px] text-center">Risk Level</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExposures.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={isAnalyzed ? 9 : 6}
                      className="text-center py-8 text-slate-400 text-xs"
                    >
                      No matching exposure records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedExposures.map((item, idx) => {
                    const isRejected = item.status === "Rejected"
                    const rowNumber = item.row || idx + 1

                    return (
                      <TableRow
                        key={item.id || `row-${rowNumber}`}
                        className={`transition-colors text-xs ${
                          isRejected
                            ? "bg-red-500/5 hover:bg-red-500/10 dark:bg-red-950/20"
                            : ""
                        }`}
                      >
                        {/* Row # */}
                        <TableCell className="font-mono text-center text-slate-400 text-[11px]">
                          {rowNumber}
                        </TableCell>

                        {/* Counterparty */}
                        <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.counterparty || "—"}
                          {isRejected && item.reason && (
                            <span className="block text-[10px] font-normal text-red-500 mt-0.5">
                              {item.reason}
                            </span>
                          )}
                        </TableCell>

                        {/* Currency */}
                        <TableCell>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {item.currency}
                          </span>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="text-right font-mono font-semibold text-slate-900 dark:text-white">
                          {formatCurrencyAmount(item.amount, item.currency)}
                        </TableCell>

                        {/* Days to Payment */}
                        <TableCell className="text-center font-mono">
                          {item.days_to_payment !== null && !isNaN(Number(item.days_to_payment)) ? (
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {item.days_to_payment} days
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold">
                              {String(item.days_to_payment)}
                            </span>
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <Badge
                            variant={isRejected ? "destructive" : "safe"}
                            className="text-[10px] font-mono uppercase tracking-wider px-2 py-0"
                          >
                            {item.status || "Valid"}
                          </Badge>
                        </TableCell>

                        {/* Analyzed Result Columns */}
                        {isAnalyzed && (
                          <>
                            <TableCell className="text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                              {item.inr_exposure ? formatInrCr(item.inr_exposure) : "—"}
                            </TableCell>

                            <TableCell className="text-center font-mono font-bold">
                              {item.risk_score ? (
                                <span
                                  className={
                                    item.risk_score >= 80
                                      ? "text-red-600 dark:text-red-400"
                                      : item.risk_score >= 60
                                      ? "text-amber-500"
                                      : "text-emerald-500"
                                  }
                                >
                                  {item.risk_score} / 100
                                </span>
                              ) : (
                                "—"
                              )}
                            </TableCell>

                            <TableCell className="text-center">
                              {item.risk_level ? (
                                <Badge
                                  variant={
                                    item.risk_level === "CRITICAL" || item.risk_level === "HIGH"
                                      ? "destructive"
                                      : item.risk_level === "MEDIUM"
                                      ? "warning"
                                      : "safe"
                                  }
                                  className="text-[9px] font-mono uppercase px-1.5 py-0"
                                >
                                  {item.risk_level}
                                </Badge>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 w-7"
                aria-label="Previous Page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-7 w-7"
                aria-label="Next Page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Foreign exchange payable positions</span>
        <span className="font-mono text-slate-400">
          Source of truth: Risk Engine API
        </span>
      </div>
    </BentoCard>
  )
}

export default ExposureTable
