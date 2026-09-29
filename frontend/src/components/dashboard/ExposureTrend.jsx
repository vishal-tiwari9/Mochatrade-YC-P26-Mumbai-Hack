import React, { useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Calendar } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Custom sleek Tooltip designed to fit dark and light fintech aesthetic
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg dark:shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" />
          <span>{label}</span>
        </div>
        <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-2">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Total Exposure
          </div>
          <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
            {data.formatted || `₹${data.exposure} Cr`}
          </div>
        </div>
        {data.usdPart && (
          <div className="mt-1.5 grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-slate-800/60 pt-1.5 text-[10px] font-mono text-slate-600 dark:text-slate-400">
            <div>
              <span className="text-slate-400 dark:text-slate-500">USD:</span> ₹{data.usdPart}Cr
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">EUR:</span> ₹{data.eurPart}Cr
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500">GBP:</span> ₹{data.gbpPart}Cr
            </div>
          </div>
        )}
      </div>
    )
  }
  return null
}

export function ExposureTrend({
  trendData,
  defaultPeriod = "30D",
}) {
  const [activeRange, setActiveRange] = useState(defaultPeriod)

  // Get data for selected range
  const chartData = (trendData && trendData[activeRange]) || []

  // Calculate percentage change across the range
  const firstVal = chartData[0]?.exposure || 9.2
  const lastVal = chartData[chartData.length - 1]?.exposure || 12.5
  const pctChange = (((lastVal - firstVal) / firstVal) * 100).toFixed(1)
  const isUp = lastVal >= firstVal

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.15)" className="flex flex-col">
      {/* Header with Title, Description & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Exposure Trend
            </h3>
            <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <TrendingUp className="h-3 w-3" />
              {isUp ? `+${pctChange}%` : `${pctChange}%`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total financial exposure over time across all trading entities.
          </p>
        </div>

        {/* Range Selector: 7D | 30D | 90D */}
        <div className="flex items-center">
          <Tabs value={activeRange} onValueChange={setActiveRange}>
            <TabsList className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="7D" className="text-xs px-2.5 py-1">
                7D
              </TabsTrigger>
              <TabsTrigger value="30D" className="text-xs px-2.5 py-1">
                30D
              </TabsTrigger>
              <TabsTrigger value="90D" className="text-xs px-2.5 py-1">
                90D
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Sleek Blue Area Gradient */}
              <linearGradient id="exposureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#2563eb" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#64748b"
              vertical={false}
              opacity={0.15}
            />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#64748b", opacity: 0.2 }}
              dy={8}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}Cr`}
              domain={["dataMin - 1", "dataMax + 1"]}
            />

            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{
                stroke: "#3b82f6",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />

            <Area
              type="monotone"
              dataKey="exposure"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#exposureGradient)"
              activeDot={{
                r: 5,
                fill: "#60a5fa",
                stroke: "#1e3a8a",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer / Data integrity footnote */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500 dark:text-slate-500">
        <span>Mark-to-Market Valuation</span>
        <span className="font-mono text-slate-700 dark:text-slate-400">Current: ₹12.5 Cr</span>
      </div>
    </BentoCard>
  )
}

export default ExposureTrend
