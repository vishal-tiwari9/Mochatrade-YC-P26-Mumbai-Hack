import React from "react"
import { motion } from "framer-motion"
import { Database, FileSpreadsheet, Calendar, UserCheck, Layers, ArrowDown, AlertOctagon, EyeOff, Hourglass } from "lucide-react"

export function TraditionalWorkflowSection() {
  const fragmentedInputs = [
    { title: "Market Data", icon: Database, desc: "Siloed terminal feeds & rates" },
    { title: "Exposure Spreadsheets", icon: FileSpreadsheet, desc: "Dispersed local workbooks" },
    { title: "Payment Schedules", icon: Calendar, desc: "Unsynced AP/AR invoice dates" },
    { title: "Manual Analysis", icon: UserCheck, desc: "Ad-hoc risk calculations" },
    { title: "Separate Financial Tools", icon: Layers, desc: "Disconnected treasury platforms" },
  ]

  const frictionOutcomes = [
    {
      title: "Slow Decisions",
      desc: "Days spent collecting and consolidating files before risks can even be evaluated.",
      icon: Hourglass,
      accent: "border-amber-500/30 text-amber-400 bg-amber-500/5",
    },
    {
      title: "Limited Visibility",
      desc: "Blind spots around net currency exposure, delayed payments, and compound risks.",
      icon: EyeOff,
      accent: "border-rose-500/30 text-rose-400 bg-rose-500/5",
    },
    {
      title: "Reactive Risk Management",
      desc: "Actions taken after market shifts occur rather than proactively simulating outcomes.",
      icon: AlertOctagon,
      accent: "border-red-500/30 text-red-400 bg-red-500/5",
    },
  ]

  return (
    <section className="relative py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 border-t border-slate-900">
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block font-mono">
          The Operational Bottleneck
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          The Problem With Traditional Risk Management
        </h2>
        <p className="text-lg text-slate-400 font-normal leading-relaxed">
          For many organizations, corporate risk workflows rely on disconnected information across departments, making it difficult to maintain a real-time, unified treasury picture.
        </p>
      </div>

      {/* Visual Flow Container */}
      <div className="relative rounded-3xl bg-[#0B1220]/60 border border-[#1E293B] p-8 sm:p-12 backdrop-blur-sm overflow-hidden">
        {/* Step 1: Fragmented Inputs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Fragmented Information Sources
            </span>
            <span className="text-xs text-slate-500">Manual Synthesis Required</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {fragmentedInputs.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Animated Connecting Arrow Down */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="h-8 w-px bg-gradient-to-b from-blue-500 to-amber-500/80" />
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow-md">
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-amber-500/80 to-rose-500/80" />
        </div>

        {/* Step 2: Consequent Friction Outcomes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400/90 font-mono">
              The Cost of Fragmentation
            </span>
            <span className="text-xs text-slate-500">Sub-optimal Treasury Agility</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {frictionOutcomes.map((outcome) => {
              const Icon = outcome.icon
              return (
                <div
                  key={outcome.title}
                  className={`p-6 rounded-2xl border ${outcome.accent} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className="w-5 h-5" />
                      <h4 className="text-lg font-bold text-white">{outcome.title}</h4>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{outcome.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TraditionalWorkflowSection
