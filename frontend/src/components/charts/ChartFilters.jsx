import React from "react"
import { RotateCcw, Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ChartFilters({
  currency = "all",
  setCurrency,
  timeRange = "30d",
  setTimeRange,
  riskType = "all",
  setRiskType,
  onReset,
}) {
  const isFiltered = currency !== "all" || timeRange !== "30d" || riskType !== "all"

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 p-3.5 shadow-xs backdrop-blur-md">
      {/* Left: Toolbar Label & Active Filter Badge */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <SlidersHorizontal className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Analytics Filters
            </span>
            {isFiltered && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 font-mono">
                Active
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Interactive multi-dimensional portfolio filtering
          </span>
        </div>
      </div>

      {/* Right: Dropdowns + Reset Button */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Currency Filter */}
        <div className="w-36 sm:w-40">
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger aria-label="Select Currency">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
              <SelectItem value="CHF">CHF</SelectItem>
              <SelectItem value="SGD">SGD</SelectItem>
              <SelectItem value="AED">AED</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range Filter */}
        <div className="w-32 sm:w-36">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger aria-label="Select Time Range">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Risk Type Filter */}
        <div className="w-40 sm:w-44">
          <Select value={riskType} onValueChange={setRiskType}>
            <SelectTrigger aria-label="Select Risk Type">
              <SelectValue placeholder="Risk Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="fx">FX Risk</SelectItem>
              <SelectItem value="commodity">Commodity Risk</SelectItem>
              <SelectItem value="interest_rate">Interest Rate Risk</SelectItem>
              <SelectItem value="payment_timing">Payment Timing Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reset Filters Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={!isFiltered}
          className="h-9 gap-1.5 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          aria-label="Reset Filters"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          <span className="hidden sm:inline">Reset Filters</span>
        </Button>
      </div>
    </div>
  )
}

export default ChartFilters
