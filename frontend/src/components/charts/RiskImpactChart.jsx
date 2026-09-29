import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, Activity } from "lucide-react"

function CustomImpactTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isNegative = data.impact < 0
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg dark:shadow-xl backdrop-blur-md">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Shift: <strong className="font-mono text-blue-600 dark:text-blue-400">{label}</strong>
        </div>
        <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5">
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Estimated Impact
          </div>
          <div
            className={`text-base font-bold font-mono ${
              isNegative ? "text-emerald-500" : data.impact === 0 ? "text-slate-400" : "text-red-500"
            }`}
          >
            {data.impact > 0 ? `+₹${data.impact.toFixed(2)} Cr` : data.impact < 0 ? `-₹${Math.abs(data.impact).toFixed(2)} Cr` : "₹0.00 Cr"}
          </div>
        </div>
        <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          Condition: <span className="font-medium text-slate-700 dark:text-slate-300">{data.label}</span>
        </div>
      </div>
    )
  }
  return null
}

export function RiskImpactChart({ impactData = [] }) {
  const data = impactData.length ? impactData : []

  return (
    <BentoCard glowColor="rgba(245, 158, 11, 0.12)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Potential Impact
            </h3>
            <Badge variant="warning" className="text-[10px] px-1.5 py-0 font-mono">
              Illustrative Scenario
            </Badge>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <TrendingDown className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Illustrative exposure sensitivity under market shocks.
        </p>
      </div>

      {/* Sensitivity Area Chart */}
      <div className="h-56 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#64748b"
              vertical={false}
              opacity={0.15}
            />

            <XAxis
              dataKey="movement"
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

            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" opacity={0.5} />

            <Tooltip content={<CustomImpactTooltip />} />

            <Area
              type="monotone"
              dataKey="impact"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#impactGradient)"
              activeDot={{
                r: 5,
                fill: "#ef4444",
                stroke: "#991b1b",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-amber-500" />
          <span>Stress curve: ±10% FX volatility</span>
        </span>
        <span className="font-mono text-red-500">Max VaR: ₹2.14 Cr</span>
      </div>
    </BentoCard>
  )
}

export default RiskImpactChart
