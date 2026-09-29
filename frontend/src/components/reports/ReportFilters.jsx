import React from "react"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ReportFilters({
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  periodFilter,
  setPeriodFilter,
  searchQuery,
  setSearchQuery,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search */}
      <div className="relative w-full sm:w-52">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          aria-label="Search reports"
        />
      </div>

      {/* Type filter */}
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full sm:w-36 h-8 text-xs" aria-label="Filter by report type">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Executive">Executive</SelectItem>
          <SelectItem value="Exposure">Exposure</SelectItem>
          <SelectItem value="Risk Analysis">Risk Analysis</SelectItem>
          <SelectItem value="Scenario">Scenario</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full sm:w-28 h-8 text-xs" aria-label="Filter by status">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Ready">Ready</SelectItem>
          <SelectItem value="Generating">Generating</SelectItem>
          <SelectItem value="Failed">Failed</SelectItem>
        </SelectContent>
      </Select>

      {/* Period filter */}
      <Select value={periodFilter} onValueChange={setPeriodFilter}>
        <SelectTrigger className="w-full sm:w-28 h-8 text-xs" aria-label="Filter by period">
          <SelectValue placeholder="All Periods" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Periods</SelectItem>
          <SelectItem value="7d">7 Days</SelectItem>
          <SelectItem value="30d">30 Days</SelectItem>
          <SelectItem value="90d">90 Days</SelectItem>
          <SelectItem value="1y">1 Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
