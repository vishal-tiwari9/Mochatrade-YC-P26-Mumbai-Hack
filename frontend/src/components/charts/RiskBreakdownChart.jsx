import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { ShieldAlert } from "lucide-react"

function CustomRiskBreakdownTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-2.5 shadow-lg dark:shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {data.category}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
            {data.percentage}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            ({data.value})
          </span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          Risk Rating: <strong className="text-slate-700 dark:text-slate-300">{data.level}</strong>
        </div>
      </div>
    )
  }
  return null
}

export function RiskBreakdownChart({
  breakdownData,
  riskType = "all",
}) {
  const categories = breakdownData?.categories || [
    { category: "FX Risk", percentage: 62, value: "₹7.75 Cr", color: "#3b82f6", level: "High" },
    { category: "Commodity Risk", percentage: 23, value: "₹2.88 Cr", color: "#f59e0b", level: "Medium" },
    { category: "Interest Rate Risk", percentage: 10, value: "₹1.25 Cr", color: "#10b981", level: "Low" },
    { category: "Payment Timing Risk", percentage: 5, value: "₹0.62 Cr", color: "#8b5cf6", level: "Low" },
  ]

  const overallScore = breakdownData?.overallRiskScore || 72

  // Map riskType filter to category name
  const riskTypeMap = {
    fx: "FX Risk",
    commodity: "Commodity Risk",
    interest_rate: "Interest Rate Risk",
    payment_timing: "Payment Timing Risk",
  }
  const focusedCategory = riskTypeMap[riskType]

  return (
    <BentoCard glowColor="rgba(239, 68, 68, 0.12)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Risk Breakdown
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Distribution of current financial risk factors.
        </p>
      </div>

      {/* Donut Chart with Center Score */}
      <div className="my-2 flex flex-col sm:flex-row items-center justify-around gap-4">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomRiskBreakdownTooltip />} />
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={68}
                paddingAngle={4}
                dataKey="percentage"
                stroke="none"
              >
                {categories.map((entry, index) => {
                  const isDimmed = focusedCategory && focusedCategory !== entry.category
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={isDimmed ? 0.35 : 1}
                      className="transition-all duration-300 outline-none cursor-pointer"
                    />
                  )
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white leading-none">
              {overallScore}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
              Overall Risk
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex flex-col justify-center space-y-2 w-full max-w-[190px]">
          {categories.map((item) => {
            const isSelected = focusedCategory === item.category
            return (
              <div
                key={item.category}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10 dark:bg-blue-500/15"
                    : "border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white pl-2">
                  {item.percentage}%
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500 flex justify-between">
        <span>Weighted VaR Distribution</span>
        <span className="text-red-500 font-mono">High FX Weight</span>
      </div>
    </BentoCard>
  )
}

export default RiskBreakdownChart
