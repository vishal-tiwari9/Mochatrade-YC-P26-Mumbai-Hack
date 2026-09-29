import React, { useState, useMemo } from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import {
  ShieldAlert,
  TrendingDown,
  Info,
  Sliders,
  Maximize2,
  Gauge,
} from "lucide-react"
import {
  generateLossDistribution,
  varMatrixData,
} from "@/data/risk-analysis-demo"

function CustomDistributionTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isLoss = data.pnl < 0
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md font-mono text-xs">
        <div className="flex items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">P&L Outcome:</span>
          <span className={`font-bold ${isLoss ? "text-red-500" : "text-emerald-500"}`}>
            {data.pnl < 0 ? `-₹${Math.abs(data.pnl).toFixed(2)} Cr` : `+₹${data.pnl.toFixed(2)} Cr`}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1.5 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">Probability Density:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {data.density.toFixed(1)}
          </span>
        </div>
        {data.tailDensity > 0 && (
          <div className="mt-1.5 rounded bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[10px] text-red-600 dark:text-red-400 font-sans font-medium">
            Exceeds VaR Threshold (Tail Loss Region)
          </div>
        )}
      </div>
    )
  }
  return null
}

export function VaRAnalysis() {
  const [confidence, setConfidence] = useState("95")
  const [horizon, setHorizon] = useState("1D")

  const key = `${confidence}_${horizon}`
  const currentModel = varMatrixData[key] || varMatrixData["95_1D"]

  const { points, varThreshold, esThreshold } = useMemo(() => {
    return generateLossDistribution(confidence, horizon)
  }, [confidence, horizon])

  const horizonLabels = {
    "1D": "1 Day",
    "5D": "5 Days",
    "10D": "10 Days",
  }

  return (
    <BentoCard
      glowColor="rgba(239, 68, 68, 0.12)"
      className="flex flex-col justify-between"
    >
      {/* 1. Header & Description */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Value at Risk (VaR)
              </h2>
              <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                PRIMARY RISK
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Estimated potential loss under normal market conditions at specified confidence and horizon.
            </p>
          </div>

          {/* Controls: Confidence & Time Horizon */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Confidence Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-1.5 uppercase tracking-wider">
                Conf:
              </span>
              {["90", "95", "99"].map((conf) => (
                <button
                  key={conf}
                  type="button"
                  onClick={() => setConfidence(conf)}
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                    confidence === conf
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  aria-label={`${conf}% Confidence`}
                >
                  {conf}%
                </button>
              ))}
            </div>

            {/* Horizon Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-1.5 uppercase tracking-wider">
                Horizon:
              </span>
              {["1D", "5D", "10D"].map((hor) => (
                <button
                  key={hor}
                  type="button"
                  onClick={() => setHorizon(hor)}
                  className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
                    horizon === hor
                      ? "bg-slate-900 dark:bg-slate-700 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  aria-label={horizonLabels[hor]}
                >
                  {hor}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Key Metrics Display */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Value at Risk (VaR)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-red-600 dark:text-red-400 mt-0.5 block">
              {currentModel.varValue}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 block">
              {currentModel.varPercent} of Net Position
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Expected Shortfall (ES)
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
              {currentModel.esValue}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 block">
              Average loss beyond VaR
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Tail Probability
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5 block">
              {currentModel.tailProbability}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 block">
              Chance of breaching VaR
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Distribution Z-Score
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
              {currentModel.zScore}σ
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 block">
              Normal inverse CDF factor
            </span>
          </div>
        </div>

        {/* Legend / Key threshold indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2 text-[11px]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500/60" />
              Normal Distribution
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Potential Loss Region (&lt;0)
            </span>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              Tail Loss Area (&gt;VaR)
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold text-xs">
            <span className="text-red-600 dark:text-red-400">
              VaR: {currentModel.varValue}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              ES: {currentModel.esValue}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Loss Distribution Visual */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Normal distribution base gradient */}
              <linearGradient id="normalDistGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.02} />
              </linearGradient>
              {/* Potential loss gradient */}
              <linearGradient id="lossDistGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#b45309" stopOpacity={0.05} />
              </linearGradient>
              {/* VaR tail loss gradient */}
              <linearGradient id="tailDistGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#991b1b" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#64748b"
              vertical={false}
              opacity={0.15}
            />

            <XAxis
              dataKey="pnl"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: "#64748b", opacity: 0.2 }}
              tickFormatter={(v) => (v < 0 ? `-₹${Math.abs(v)}Cr` : v > 0 ? `+₹${v}Cr` : "₹0")}
              dy={6}
            />

            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomDistributionTooltip />} />

            {/* Base Distribution Area */}
            <Area
              type="monotone"
              dataKey="normalDensity"
              name="Probability Curve"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#normalDistGrad)"
            />

            {/* Downside Loss Area (< 0) */}
            <Area
              type="monotone"
              dataKey="lossDensity"
              name="Downside Range"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="url(#lossDistGrad)"
            />

            {/* Extreme Tail Area (Beyond VaR) */}
            <Area
              type="monotone"
              dataKey="tailDensity"
              name="VaR Tail Region"
              stroke="#ef4444"
              strokeWidth={2.5}
              fill="url(#tailDistGrad)"
            />

            {/* Zero P&L reference */}
            <ReferenceLine
              x={0}
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              label={{
                value: "P&L = 0",
                position: "insideTopLeft",
                fill: "#64748b",
                fontSize: 10,
                fontWeight: 600,
              }}
            />

            {/* VaR Threshold Reference Line */}
            <ReferenceLine
              x={varThreshold}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: `VaR: ${currentModel.varValue}`,
                position: "insideTopRight",
                fill: "#ef4444",
                fontSize: 11,
                fontWeight: 700,
              }}
            />

            {/* Expected Shortfall Reference Line */}
            <ReferenceLine
              x={esThreshold}
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              label={{
                value: `ES: ${currentModel.esValue}`,
                position: "insideTopLeft",
                fill: "#f43f5e",
                fontSize: 11,
                fontWeight: 700,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 4. Footer Note */}
      <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-2.5 text-[11px] text-slate-500 dark:text-slate-400 gap-1.5">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
          <span>
            Model: Delta-Normal Parametric VaR (t = {horizonLabels[horizon]}, α = {confidence}%)
          </span>
        </div>
        <span className="font-mono text-slate-600 dark:text-slate-400">
          Tail Expectation (CVaR): {currentModel.esValue}
        </span>
      </div>
    </BentoCard>
  )
}

export default VaRAnalysis
