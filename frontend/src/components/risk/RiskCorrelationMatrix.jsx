import React, { useState } from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Network, Info } from "lucide-react"
import {
  riskCorrelationFactors,
  riskCorrelationMatrix,
} from "@/data/risk-analysis-demo"

export function RiskCorrelationMatrix() {
  const [hoveredCell, setHoveredCell] = useState(null)

  const getCellColor = (val, isDiagonal) => {
    if (isDiagonal) {
      return "bg-slate-200/70 dark:bg-slate-800/90 text-slate-900 dark:text-white font-black border border-slate-300 dark:border-slate-700"
    }
    if (val >= 0.4) {
      return "bg-blue-600/30 dark:bg-blue-600/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/30"
    }
    if (val >= 0.2) {
      return "bg-blue-500/15 dark:bg-blue-500/20 text-slate-800 dark:text-blue-200 font-medium border border-blue-500/15"
    }
    return "bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-normal border border-slate-200/50 dark:border-slate-800"
  }

  const getIntensityLabel = (val, isDiagonal) => {
    if (isDiagonal) return "Self Correlation"
    if (val >= 0.4) return "Strong Cross-Asset Correlation"
    if (val >= 0.2) return "Moderate Correlation"
    return "Weak Correlation"
  }

  return (
    <BentoCard
      glowColor="rgba(59, 130, 246, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Network className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Risk Correlation
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Relationship between major financial risk factors.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2.5 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Strong (≥0.40)
            </span>
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Moderate (0.20-0.39)
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Weak (&lt;0.20)
            </span>
          </div>
        </div>

        {/* Matrix Grid (Horizontally scrollable inside card if tight on mobile) */}
        <div className="mt-4 overflow-x-auto pb-1">
          <table className="w-full text-xs font-mono border-collapse min-w-[320px]">
            <thead>
              <tr>
                <th className="p-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider w-24">
                  Factor
                </th>
                {riskCorrelationFactors.map((header) => (
                  <th
                    key={header}
                    className="p-2 text-center text-[11px] font-bold text-slate-700 dark:text-slate-300 w-20"
                  >
                    {header === "Interest Rate" ? "Rates" : header === "Payment Timing" ? "Timing" : header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskCorrelationMatrix.map((row) => (
                <tr key={row.factor} className="border-t border-slate-100 dark:border-slate-800/60">
                  {/* Row Label */}
                  <td className="p-2 font-bold text-slate-800 dark:text-slate-200 text-left whitespace-nowrap">
                    {row.factor === "Interest Rate" ? "Rates" : row.factor === "Payment Timing" ? "Timing" : row.factor}
                  </td>

                  {/* Matrix Cells */}
                  {riskCorrelationFactors.map((colFactor) => {
                    const val = row.values[colFactor]
                    const isDiagonal = row.factor === colFactor
                    const cellKey = `${row.factor}_${colFactor}`
                    const isHovered = hoveredCell === cellKey

                    return (
                      <td key={colFactor} className="p-1 text-center">
                        <div
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`relative rounded-md py-2 px-1 text-center text-xs transition-all cursor-pointer ${getCellColor(
                            val,
                            isDiagonal
                          )} ${isHovered ? "ring-2 ring-blue-500 scale-105 z-10" : ""}`}
                          title={`${row.factor} vs ${colFactor}: ${val.toFixed(2)} (${getIntensityLabel(val, isDiagonal)})`}
                        >
                          {val.toFixed(2)}
                          {isDiagonal && (
                            <span className="block text-[8px] font-sans text-slate-400 dark:text-slate-400 font-medium">
                              DIAG
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hover inspector or insight */}
        <div className="mt-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-2 text-[11px]">
          {hoveredCell ? (
            <div className="flex items-center justify-between font-mono text-slate-800 dark:text-slate-200">
              <span>Selected Pair: <strong>{hoveredCell.replace("_", " ↔ ")}</strong></span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                ρ = {riskCorrelationMatrix.find(r => r.factor === hoveredCell.split("_")[0])?.values[hoveredCell.split("_")[1]]?.toFixed(2)}
              </span>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info className="h-3 w-3 text-blue-500 shrink-0" />
              <span>Highest cross-asset coupling: <strong>FX ↔ Commodity (0.42)</strong> amplifies downside vulnerability.</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Pearson covariance matrix (90D window)</span>
        <span className="font-mono text-slate-500">Symmetric</span>
      </div>
    </BentoCard>
  )
}

export default RiskCorrelationMatrix
