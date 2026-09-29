import React from "react"
import { motion } from "framer-motion"
import { Upload, Compass, PlayCircle, BarChart3, ShieldCheck } from "lucide-react"

export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Upload Exposure",
      desc: "Import exposure batches directly from standard CSV/XLSX enterprise records.",
      icon: Upload,
    },
    {
      num: "02",
      title: "Understand Risk",
      desc: "Analyze net exposures, maturity buckets, currency concentrations, and volatility drivers.",
      icon: Compass,
    },
    {
      num: "03",
      title: "Simulate Scenarios",
      desc: "Test multidirectional shifts across foreign exchange, commodities, and settlement lags.",
      icon: PlayCircle,
    },
    {
      num: "04",
      title: "Evaluate Impact",
      desc: "Quantify simulated value-at-risk, potential cash-flow variance, and downside exposure.",
      icon: BarChart3,
    },
    {
      num: "05",
      title: "Make Better Decisions",
      desc: "Review AI-guided hedging proposals and treasury recommendations before committing capital.",
      icon: ShieldCheck,
    },
  ]

  return (
    <section className="relative py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 border-t border-slate-900">
      <div className="max-w-3xl mb-16 sm:mb-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 font-mono mb-3 block">
          End-to-End Treasury Pipeline
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          From Exposure to Decision
        </h2>
        <p className="text-lg text-slate-400 font-normal leading-relaxed">
          A structured 5-stage progression that transforms raw transaction files into clear, actionable corporate treasury intelligence.
        </p>
      </div>

      {/* 5-Step Horizontal/Vertical Connected Timeline */}
      <div className="relative">
        {/* Subtle Connecting Line on Desktop */}
        <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-blue-600/30 via-indigo-500/30 to-blue-600/30 -translate-y-12 z-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group p-6 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-extrabold font-mono text-blue-400">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
                  PHASE {idx + 1}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WorkflowSection
