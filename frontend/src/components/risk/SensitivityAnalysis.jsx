import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { Gauge, TrendingDown, Info } from "lucide-react"
import { sensitivityAnalysisData } from "@/data/risk-analysis-demo"

function CustomSensitivityTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isAdverse = data.rawImpact > 0
    const isFavorable = data.rawImpact < 0

    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono">
        <div className="flex items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">Market Shift:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {data.movementLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5">
          <span className="text-slate-500 dark:text-slate-400">Potential Impact:</span>
          <span
            className={`font-black ${
              isAdverse
                ? "text-red-500"
                : isFavorable
                ? "text-emerald-500"
                : "text-slate-400"
            }`}
          >
            {data.impact}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Implied Risk Score:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {data.downsideRisk} / 100
          </span>
        </div>
        <p className="mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-sans">
          {data.description}
        </p>
      </div>
    )
  }
  return null
}

export function SensitivityAnalysis({ data = sensitivityAnalysisData }) {
  return (
    <BentoCard
      glowColor="rgba(59, 130, 246, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Gauge className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Sensitivity Analysis
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Measure how financial risk changes under different market movements.
            </p>
          </div>

          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Δ ±10% GRID
          </span>
        </div>

        {/* Sensitivity Shift Chart */}
        <div className="h-48 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#64748b"
                vertical={false}
                opacity={0.15}
              />
              <XAxis
                dataKey="movement"
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: "#64748b", opacity: 0.2 }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v === 0 ? "₹0" : `${v > 0 ? "+" : ""}₹${v}Cr`)}
              />
              <Tooltip content={<CustomSensitivityTooltip />} />
              <ReferenceLine y={0} stroke="#64748b" strokeWidth={1} />
              <Bar dataKey="impactInCr" radius={[4, 4, 0, 0]} maxBarSize={38}>
                {data.map((entry, index) => {
                  let fillColor = "#94a3b8"
                  if (entry.type === "adverse") {
                    fillColor = entry.rawImpact >= 10000000 ? "#ef4444" : "#f97316"
                  } else if (entry.type === "favorable") {
                    fillColor = "#10b981"
                  }
                  return <Cell key={`cell-${index}`} fill={fillColor} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Structured Sensitivity Table */}
        <div className="mt-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80 overflow-hidden text-xs">
          <div className="grid grid-cols-5 bg-slate-100/80 dark:bg-slate-800/60 px-2.5 py-1.5 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider text-center">
            {data.map((item) => (
              <span key={item.movement}>{item.movement}</span>
            ))}
          </div>
          <div className="grid grid-cols-5 px-2.5 py-2 font-mono font-bold text-center divide-x divide-slate-100 dark:divide-slate-800/60 bg-white/60 dark:bg-slate-900/40">
            {data.map((item) => {
              const isAdverse = item.type === "adverse"
              const isFavorable = item.type === "favorable"
              return (
                <div key={item.movement} className="px-1">
                  <span
                    className={`block text-[11px] ${
                      isAdverse
                        ? "text-red-600 dark:text-red-400"
                        : isFavorable
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {item.impact}
                  </span>
                  <span className="block text-[9px] font-normal text-slate-400 mt-0.5">
                    Score: {item.downsideRisk}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3 text-blue-500" />
          Delta: ₹16.4 L per 1% spot shift
        </span>
        <span className="font-mono text-red-500 text-[10px] font-semibold">
          Asymmetric Downside
        </span>
      </div>
    </BentoCard>
  )
}

export default SensitivityAnalysis
