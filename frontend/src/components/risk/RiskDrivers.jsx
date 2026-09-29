import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import {
  Compass,
  Activity,
  DollarSign,
  Layers,
  Clock,
  ArrowUpRight,
} from "lucide-react"
import { topRiskDrivers } from "@/data/risk-analysis-demo"

const iconMap = {
  DollarSign: DollarSign,
  Activity: Activity,
  Layers: Layers,
  Clock: Clock,
}

export function RiskDrivers({ drivers = topRiskDrivers }) {
  return (
    <BentoCard
      glowColor="rgba(245, 158, 11, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Compass className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Top Risk Drivers
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Primary vulnerabilities impacting portfolio stability.
            </p>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
            4 ACTIVE
          </span>
        </div>

        {/* Drivers List */}
        <div className="mt-3.5 space-y-3">
          {drivers.map((driver) => {
            const IconComponent = iconMap[driver.icon] || Activity

            return (
              <div
                key={driver.rank}
                className="group rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/30 p-3 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    {/* Rank pill */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-200/80 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                      {driver.rank}
                    </span>

                    {/* Icon & Title */}
                    <div className="flex items-center gap-1.5">
                      <IconComponent
                        className="h-3.5 w-3.5"
                        style={{ color: driver.color }}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {driver.name}
                      </span>
                    </div>
                  </div>

                  {/* Badges & Contribution */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={driver.badgeVariant}
                      className="text-[9px] font-bold px-1.5 py-0 uppercase tracking-wider"
                    >
                      {driver.riskLevel}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      {driver.contribution}
                    </span>
                  </div>
                </div>

                {/* Explanation */}
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">
                  {driver.explanation}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Quantified via marginal risk contribution</span>
        <span className="font-mono text-slate-500">Ranked by impact</span>
      </div>
    </BentoCard>
  )
}

export default RiskDrivers
