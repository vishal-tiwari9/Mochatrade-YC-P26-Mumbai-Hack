import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { ShieldCheck, Layers } from "lucide-react"

function CustomHedgeTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg dark:shadow-xl backdrop-blur-md">
        <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
          Currency: <span className="font-mono text-blue-600 dark:text-blue-400">{label}</span>
        </div>
        <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5 space-y-1 text-[11px] font-mono">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Hedged:
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {data.hedged}% (₹{data.hedgedVal} Cr)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Unhedged:
            </span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {data.unhedged}% (₹{data.unhedgedVal} Cr)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800/60 pt-1 text-slate-700 dark:text-slate-300">
            <span>Gross Position:</span>
            <span className="font-bold">₹{data.total} Cr</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function HedgedExposureChart({ hedgedData = [] }) {
  const data = hedgedData.length ? hedgedData : []

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.12)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Hedged vs Unhedged Exposure
              </h3>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                68% Global Average
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current estimated coverage ratio across active foreign currency liabilities.
            </p>
          </div>

          <div className="text-right">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Coverage Target: <strong className="font-mono text-emerald-500">70%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-64 w-full pt-2">
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
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />

            <Tooltip content={<CustomHedgeTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
            />

            <Bar
              dataKey="hedged"
              name="Hedged Exposure (%)"
              stackId="coverage"
              fill="#3b82f6"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="unhedged"
              name="Unhedged Exposure (%)"
              stackId="coverage"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500">
        <span>Hedging instruments: Forwards, Vanilla Options, Collars</span>
        <span className="font-mono text-slate-700 dark:text-slate-400">Total Hedged: ₹8.5 Cr</span>
      </div>
    </BentoCard>
  )
}

export default HedgedExposureChart
