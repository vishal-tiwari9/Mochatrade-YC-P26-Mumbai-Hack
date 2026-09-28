import React from "react"
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { TrendingUp, Calendar, Info } from "lucide-react"

function CustomExposureTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const totalItem = payload.find((p) => p.dataKey === "total") || payload[0]
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg dark:shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" />
          <span>{label}</span>
        </div>
        <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Total Exposure
          </div>
          <div className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
            ₹{totalItem?.value?.toFixed(1)} Cr
          </div>
        </div>
        <div className="mt-2 space-y-1 border-t border-slate-200 dark:border-slate-800/60 pt-1.5 text-[11px] font-mono">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                ₹{entry.value?.toFixed(1)} Cr
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function ExposureTrendChart({
  trendData,
  timeRange = "30d",
  currency = "all",
}) {
  const series = (trendData && trendData[timeRange]) || trendData["30d"] || []

  // Check which currencies should be highlighted or visible
  const showUSD = currency === "all" || currency === "USD"
  const showEUR = currency === "all" || currency === "EUR"
  const showGBP = currency === "all" || currency === "GBP"
  const isCurrencyFocused = currency !== "all"

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.15)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Exposure Trend
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 text-xs font-mono font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <TrendingUp className="h-3 w-3" />
                +8.4% vs previous period
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Total financial exposure over time across active trading entities.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
              ₹12.5 Cr
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Gross Portfolio Valuation
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="totalExposureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
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

            <Tooltip content={<CustomExposureTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }}
            />

            {/* Total Exposure Area */}
            <Area
              type="monotone"
              dataKey="total"
              name="Total Exposure"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#totalExposureGrad)"
              opacity={isCurrencyFocused ? 0.4 : 1}
            />

            {/* USD Series */}
            {showUSD && (
              <Line
                type="monotone"
                dataKey="usd"
                name="USD"
                stroke="#10b981"
                strokeWidth={currency === "USD" ? 3 : 1.5}
                dot={false}
                strokeDasharray={currency === "USD" ? undefined : "3 3"}
              />
            )}

            {/* EUR Series */}
            {showEUR && (
              <Line
                type="monotone"
                dataKey="eur"
                name="EUR"
                stroke="#f59e0b"
                strokeWidth={currency === "EUR" ? 3 : 1.5}
                dot={false}
                strokeDasharray={currency === "EUR" ? undefined : "3 3"}
              />
            )}

            {/* GBP Series */}
            {showGBP && (
              <Line
                type="monotone"
                dataKey="gbp"
                name="GBP"
                stroke="#8b5cf6"
                strokeWidth={currency === "GBP" ? 3 : 1.5}
                dot={false}
                strokeDasharray={currency === "GBP" ? undefined : "3 3"}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3" />
          <span>Historical mark-to-market trajectory</span>
        </span>
        <span className="font-mono text-slate-700 dark:text-slate-400">
          Range: {timeRange.toUpperCase()}
        </span>
      </div>
    </BentoCard>
  )
}

export default ExposureTrendChart
