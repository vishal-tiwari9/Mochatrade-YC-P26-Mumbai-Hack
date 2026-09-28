import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Wallet, ShieldAlert, Calendar } from "lucide-react"

export function ExposureSummary({ exposures = [], riskScore = 0, riskLevel = "LOW" }) {
  if (!exposures || exposures.length === 0) return null

  const totalExposure = exposures.reduce((acc, exp) => acc + (exp.inr_exposure || 0), 0)
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(totalExposure)

  const maxDays = Math.max(...exposures.map(e => e.days_to_payment || 0))

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.1)">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Exposure Summary
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overview of the current risk analysis profile.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Total Exposure</p>
              <p className="text-sm font-bold font-mono">{formattedTotal}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Max Horizon</p>
              <p className="text-sm font-bold font-mono">{maxDays} Days</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Risk Score</p>
              <p className="text-sm font-bold font-mono">
                {riskScore} <span className="text-[10px] font-sans font-normal text-slate-400">({riskLevel})</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </BentoCard>
  )
}
