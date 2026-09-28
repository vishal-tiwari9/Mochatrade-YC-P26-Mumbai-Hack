import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { PieChart as PieIcon } from "lucide-react"

function CustomPieTooltip({ active, payload }) {
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
            ({data.amount})
          </span>
        </div>
      </div>
    )
  }
  return null
}

export function RiskBreakdown({ riskData = [] }) {
  // Default values if not supplied
  const data = riskData.length
    ? riskData
    : [
        { category: "FX Risk", percentage: 62, amount: "₹7.75 Cr", color: "#3b82f6" },
        { category: "Commodity Risk", percentage: 23, amount: "₹2.88 Cr", color: "#f59e0b" },
        { category: "Interest Rate Risk", percentage: 15, amount: "₹1.87 Cr", color: "#8b5cf6" },
      ]

  return (
    <BentoCard glowColor="rgba(139, 92, 246, 0.12)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Risk Breakdown
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
            <PieIcon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Exposure distribution across key market risk factors.
        </p>
      </div>

      {/* Donut Chart & Metrics */}
      <div className="my-2 flex flex-col sm:flex-row items-center justify-around gap-4">
        {/* Donut Chart with Center Text */}
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomPieTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={4}
                dataKey="percentage"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-300 hover:opacity-80 outline-none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centered label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
              Dominant
            </span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              FX 62%
            </span>
          </div>
        </div>

        {/* Legend / Category breakdown list */}
        <div className="flex flex-col justify-center space-y-2.5 w-full max-w-[200px]">
          {data.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/40 px-2.5 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/40"
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
              <div className="text-right pl-2">
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500 flex justify-between">
        <span>Portfolio VaR weighting</span>
        <span className="text-blue-600 dark:text-blue-400 font-mono">100% Accounted</span>
      </div>
    </BentoCard>
  )
}

export default RiskBreakdown
