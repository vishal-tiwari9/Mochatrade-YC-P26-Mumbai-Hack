import React, { useState } from "react"
import {
  RefreshCw,
  MoreHorizontal,
  Info,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChartFilters } from "@/components/charts/ChartFilters"
import { AnalyticsSummary } from "@/components/charts/AnalyticsSummary"
import { ExposureTrendChart } from "@/components/charts/ExposureTrendChart"
import { RiskBreakdownChart } from "@/components/charts/RiskBreakdownChart"
import { CurrencyExposureChart } from "@/components/charts/CurrencyExposureChart"
import { RiskImpactChart } from "@/components/charts/RiskImpactChart"
import { RiskIntelligence } from "@/components/charts/RiskIntelligence"
import { HedgedExposureChart } from "@/components/charts/HedgedExposureChart"
import { PaymentExposureChart } from "@/components/charts/PaymentExposureChart"
import { ExposureSnapshot } from "@/components/charts/ExposureSnapshot"

import {
  analyticsSummaryData,
  exposureTrendData,
  riskBreakdownData,
  currencyExposureData,
  marketImpactSensitivityData,
  hedgedVsUnhedgedData,
  upcomingPaymentTimelineData,
  exposureSnapshotData,
} from "@/data/charts-demo"

export function ChartsPage() {
  const [currency, setCurrency] = useState("all")
  const [timeRange, setTimeRange] = useState("30d")
  const [riskType, setRiskType] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleResetFilters = () => {
    setCurrency("all")
    setTimeRange("30d")
    setRiskType("all")
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Actions */}
      <div className="flex items-center justify-end gap-2">
        {/* Refresh button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 gap-1.5 text-xs border-slate-200 dark:border-slate-800"
          aria-label="Refresh Data"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>

        {/* More options menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              aria-label="More Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleResetFilters} className="cursor-pointer text-xs">
              Reset All Filters
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRefresh} className="cursor-pointer text-xs">
              Force Re-calculate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Filter Toolbar */}
      <ChartFilters
        currency={currency}
        setCurrency={setCurrency}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        riskType={riskType}
        setRiskType={setRiskType}
        onReset={handleResetFilters}
      />

      {/* 3. Analytics Summary (4 KPI Cards) */}
      <AnalyticsSummary
        summaryData={analyticsSummaryData}
        currency={currency}
      />

      {/* 4. 12-Column Bento Grid Layout */}
      <div className="space-y-5">
        {/* ROW 1: Exposure Trend (8 cols) + Risk Breakdown (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <ExposureTrendChart
              trendData={exposureTrendData}
              timeRange={timeRange}
              currency={currency}
            />
          </div>
          <div className="lg:col-span-4">
            <RiskBreakdownChart
              breakdownData={riskBreakdownData}
              riskType={riskType}
            />
          </div>
        </div>

        {/* ROW 2: Currency Exposure (4 cols) + Potential Impact (4 cols) + Risk Intelligence (4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4">
            <CurrencyExposureChart
              currencyData={currencyExposureData}
              selectedCurrency={currency}
            />
          </div>
          <div className="lg:col-span-4">
            <RiskImpactChart
              impactData={marketImpactSensitivityData}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <RiskIntelligence />
          </div>
        </div>

        {/* ROW 3: Hedged vs Unhedged Exposure (8 cols) + Upcoming Payment Exposure (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <HedgedExposureChart
              hedgedData={hedgedVsUnhedgedData}
            />
          </div>
          <div className="lg:col-span-4">
            <PaymentExposureChart
              paymentData={upcomingPaymentTimelineData}
            />
          </div>
        </div>

        {/* ROW 4: Exposure Snapshot (12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-12">
            <ExposureSnapshot
              snapshotData={exposureSnapshotData}
            />
          </div>
        </div>
      </div>

      {/* 5. Financial Disclaimer Footnote */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-3 text-xs text-slate-500 dark:text-slate-400">
        <Info className="h-4 w-4 text-blue-500 shrink-0" />
        <p>
          <strong>Illustrative Demo Data:</strong> All exposure figures, Value at Risk projections, and scenario curves shown on this analytics workstation are simulated models intended for prototype evaluation.
        </p>
      </div>
    </div>
  )
}

export default ChartsPage
