import React from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  FileSpreadsheet,
  Activity,
  Sliders,
  ShieldAlert,
  LineChart,
  Bell,
  FileText,
} from "lucide-react"

export function ProductEcosystemSection() {
  const modules = [
    {
      title: "Dashboard",
      description: "Executive portfolio overview, total exposure KPIs, and VaR summary indicators.",
      icon: LayoutDashboard,
      badge: "Command Center",
    },
    {
      title: "Exposure",
      description: "Batch CSV/XLSX ingestion, currency pair breakdown, and maturity distributions.",
      icon: FileSpreadsheet,
      badge: "Ingestion Engine",
    },
    {
      title: "Risk Analysis",
      description: "VaR distributions, historical volatility simulations, and risk corridor heatmaps.",
      icon: Activity,
      badge: "Quantitative Engine",
    },
    {
      title: "Scenarios",
      description: "Multi-factor stress testing across FX spikes, commodity swings, and invoice delays.",
      icon: Sliders,
      badge: "Simulation Lab",
    },
    {
      title: "Hedge Advisor",
      description: "AI-assisted hedge ratio recommendations, instrument selection, and cost comparisons.",
      icon: ShieldAlert,
      badge: "Decision Support",
    },
    {
      title: "Charts & Analytics",
      description: "Interactive visual analytics, time-series projections, and correlation matrices.",
      icon: LineChart,
      badge: "Visual Intelligence",
    },
    {
      title: "Alerts & Telemetry",
      description: "Threshold monitors, breach warnings, and proactive rate volatility notifications.",
      icon: Bell,
      badge: "Risk Monitoring",
    },
    {
      title: "Reports",
      description: "Audit-ready board summaries, exportable audit sheets, and regulatory snapshots.",
      icon: FileText,
      badge: "Reporting Suite",
    },
  ]

  return (
    <section className="relative py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
      <div className="max-w-3xl mb-16 sm:mb-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 font-mono mb-3 block">
          Unified Platform Architecture
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          One Financial Risk Command Center
        </h2>
        <p className="text-lg text-slate-400 font-normal leading-relaxed">
          Move from fragmented exposure data to a connected view of financial risk across eight specialized treasury capabilities.
        </p>
      </div>

      {/* 8-Card Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((mod, idx) => {
          const Icon = mod.icon
          return (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="p-6 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-blue-500/40 hover:bg-slate-900/60 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {mod.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>MODULE 0{idx + 1}</span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Active in Workstation
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default ProductEcosystemSection
