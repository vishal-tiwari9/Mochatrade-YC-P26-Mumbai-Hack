import React from "react"
import { motion } from "framer-motion"
import { Eye, Sliders, CheckCircle2, Sparkles, ArrowRight } from "lucide-react"

export function IntroduceHedgeMindSection() {
  const pillars = [
    {
      action: "SEE",
      title: "Understand your current financial exposure.",
      subtitle: "Exposure Visibility",
      icon: Eye,
      description:
        "Aggregate balance sheet positions, foreign currency payables/receivables, and settlement calendars into a unified exposure telemetry view.",
      color: "from-blue-600/20 to-blue-800/5",
      accentBorder: "group-hover:border-blue-500/50",
      accentText: "text-blue-400",
      tag: "STEP 01 · VISIBILITY",
    },
    {
      action: "SIMULATE",
      title: "Explore what happens when market conditions change.",
      subtitle: "Scenario Modeling",
      icon: Sliders,
      description:
        "Stress-test cash flows against simultaneous currency swings, commodity price shocks, interest rate shifts, and counterparty payment delays.",
      color: "from-indigo-600/20 to-indigo-800/5",
      accentBorder: "group-hover:border-indigo-500/50",
      accentText: "text-indigo-400",
      tag: "STEP 02 · SIMULATION",
    },
    {
      action: "DECIDE",
      title: "Evaluate possible risk-management actions with AI-assisted insights.",
      subtitle: "Decision Support",
      icon: CheckCircle2,
      description:
        "Transform raw variance numbers into clear, explainable hedging strategies, risk corridor benchmarks, and executive-ready trade plans.",
      color: "from-cyan-600/20 to-cyan-800/5",
      accentBorder: "group-hover:border-cyan-500/50",
      accentText: "text-cyan-400",
      tag: "STEP 03 · ACTION",
    },
  ]

  return (
    <section className="relative py-28 sm:py-36 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
      {/* Background Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          The Unified Risk Solution
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
          Meet HedgeMind
        </h2>
        <p className="text-xl sm:text-2xl font-semibold text-blue-300 mb-6">
          An AI-powered financial intelligence layer for corporate risk.
        </p>
        <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
          HedgeMind brings exposure visibility, scenario simulation, and risk-aware decision support into one connected workflow.
        </p>
      </div>

      {/* The 3 Large Pillar Cards: SEE, SIMULATE, DECIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {pillars.map((pillar, idx) => {
          const Icon = pillar.icon
          return (
            <motion.div
              key={pillar.action}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className={`group relative p-8 sm:p-10 rounded-3xl bg-[#0B1220] border border-[#1E293B] ${pillar.accentBorder} transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/50 flex flex-col justify-between`}
            >
              {/* Top Action Pill & Icon */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono font-semibold tracking-wider text-slate-500">
                    {pillar.tag}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-inner">
                    <Icon className={`w-6 h-6 ${pillar.accentText}`} />
                  </div>
                </div>

                <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-mono">
                  {pillar.action}
                </div>

                <h3 className="text-lg font-bold text-slate-200 mb-3 leading-snug">
                  {pillar.title}
                </h3>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="pt-8 mt-8 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {pillar.subtitle}
                </span>
                <span className={`text-xs font-semibold ${pillar.accentText}`}>
                  Active Engine
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default IntroduceHedgeMindSection
