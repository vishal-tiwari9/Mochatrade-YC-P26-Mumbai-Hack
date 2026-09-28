import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Coins } from "lucide-react"

function CustomCurrencyTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg dark:shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <span className="font-bold text-xs font-mono text-blue-600 dark:text-blue-400">
            {data.currency}/INR
          </span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
              data.risk === "High"
                ? "bg-red-500/15 text-red-500"
                : data.risk === "Medium"
                ? "bg-amber-500/15 text-amber-500"
                : "bg-emerald-500/15 text-emerald-500"
            }`}
          >
            {data.risk} Risk
          </span>
        </div>
        <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5">
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Net Exposure
          </div>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
            ₹{data.exposure.toFixed(1)} Cr
          </div>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          Period Shift:{" "}
          <strong
            className={data.change >= 0 ? "text-red-500" : "text-emerald-500"}
          >
            {data.change >= 0 ? `+${data.change}%` : `${data.change}%`}
          </strong>
        </div>
      </div>
    )
  }
  return null
}

export function CurrencyExposureChart({
  currencyData = [],
  selectedCurrency = "all",
}) {
  const data = currencyData.length ? currencyData : []

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.12)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Currency Exposure
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Coins className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Estimated net positions across 8 key trading currencies.
        </p>
      </div>

      {/* Bar Chart Canvas */}
      <div className="h-56 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#64748b"
              vertical={false}
              opacity={0.15}
            />

            <XAxis
              dataKey="currency"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#64748b", opacity: 0.2 }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}Cr`}
            />

            <Tooltip content={<CustomCurrencyTooltip />} />

            <Bar dataKey="exposure" radius={[4, 4, 0, 0]}>
              {data.map((entry) => {
                const isSelected =
                  selectedCurrency === "all" || selectedCurrency === entry.currency
                const isHighlighted = selectedCurrency === entry.currency

                // Color based on risk level
                const barColor =
                  entry.risk === "High"
                    ? "#ef4444"
                    : entry.risk === "Medium"
                    ? "#f59e0b"
                    : "#3b82f6"

                return (
                  <Cell
                    key={entry.currency}
                    fill={barColor}
                    opacity={isSelected ? 1 : 0.25}
                    stroke={isHighlighted ? "#ffffff" : undefined}
                    strokeWidth={isHighlighted ? 1.5 : 0}
                    className="transition-all duration-300 cursor-pointer"
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500">
        <span>Highest: USD (₹8.2 Cr)</span>
        <span className="font-mono text-slate-700 dark:text-slate-400">8 Currencies</span>
      </div>
    </BentoCard>
  )
}

export default CurrencyExposureChart
