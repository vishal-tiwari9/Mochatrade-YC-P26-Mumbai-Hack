import React from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Terminal, ArrowUpRight, ShieldCheck, Globe, Zap, Percent } from "lucide-react"

export function ExposureSnapshot({ snapshotData = [] }) {
  const items = snapshotData.length
    ? snapshotData
    : [
        { title: "Total Exposure", value: "₹12.5 Cr", share: "100%", ticker: "TOT_EXP" },
        { title: "FX Exposure", value: "₹8.2 Cr", share: "65.6%", ticker: "FX_NET" },
        { title: "Commodity Exposure", value: "₹2.9 Cr", share: "23.2%", ticker: "COMM_EXP" },
        { title: "Interest Rate", value: "₹1.4 Cr", share: "11.2%", ticker: "IR_FLOAT" },
      ]

  const icons = [Globe, Zap, Percent, ShieldCheck]

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.08)" className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Terminal className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Exposure Snapshot
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Consolidated enterprise financial risk terminal feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>FEED: MTM_LIVE_Q3</span>
        </div>
      </div>

      {/* 4-Item Terminal Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
        {items.map((item, idx) => {
          const Icon = icons[idx % icons.length]
          return (
            <div
              key={item.title}
              className="rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/40 p-3 transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-900/60"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate">{item.title}</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{item.ticker}</span>
              </div>
              <div className="mt-1.5 text-xl font-bold font-mono text-slate-900 dark:text-white">
                {item.value}
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] border-t border-slate-200 dark:border-slate-800/40 pt-1">
                <span className="text-slate-400">Portfolio Share</span>
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {item.share}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Terminal Footer */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800/60 pt-2 font-mono">
        <span>BASE_CURRENCY: INR</span>
        <span>BENCHMARK: RBI_REF / SOFR</span>
        <span>STATUS: AUDIT_VERIFIED</span>
      </div>
    </BentoCard>
  )
}

export default ExposureSnapshot
