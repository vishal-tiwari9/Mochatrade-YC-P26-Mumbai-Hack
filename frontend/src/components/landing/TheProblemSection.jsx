import React from "react"
import { motion } from "framer-motion"
import { RefreshCw, Boxes, Percent, Clock, AlertTriangle } from "lucide-react"

export function TheProblemSection() {
  const cards = [
    {
      title: "FX Volatility",
      description: "Currency movements can increase the cost of imports and reduce export margins.",
      icon: RefreshCw,
      tag: "Foreign Exchange",
      accent: "from-blue-500/20 to-blue-600/5",
      borderGlow: "group-hover:border-blue-500/40",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Commodity Risk",
      description: "Changing commodity prices can directly affect procurement and operating costs.",
      icon: Boxes,
      tag: "Procurement & Raw Materials",
      accent: "from-amber-500/20 to-amber-600/5",
      borderGlow: "group-hover:border-amber-500/40",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Interest Rate Risk",
      description: "Rate movements can increase financing costs and change future cash-flow expectations.",
      icon: Percent,
      tag: "Debt & Treasury Yields",
      accent: "from-indigo-500/20 to-indigo-600/5",
      borderGlow: "group-hover:border-indigo-500/40",
      badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Payment Timing",
      description: "Delayed or accelerated payments can change financial exposure and liquidity needs.",
      icon: Clock,
      tag: "Settlement & Liquidity",
      accent: "from-cyan-500/20 to-cyan-600/5",
      borderGlow: "group-hover:border-cyan-500/40",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ]

  return (
    <section className="relative py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
      {/* Section Header */}
      <div className="max-w-3xl mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <AlertTriangle className="w-3.5 h-3.5" />
          The Multi-Dimensional Challenge
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-tight">
          Financial Risk Is Harder Than It Looks
        </h2>
        <p className="text-lg text-slate-400 font-normal leading-relaxed">
          Companies rarely face just one financial risk. Currency movements, commodity prices, interest rates, and payment timing can change the real cost of doing business.
        </p>
      </div>

      {/* Bento Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {cards.map((card, idx) => {
          const IconComponent = card.icon
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group relative p-8 sm:p-10 rounded-2xl bg-[#0B1220] border border-[#1E293B] ${card.borderGlow} transition-all duration-300 hover:shadow-2xl hover:shadow-blue-950/40 overflow-hidden flex flex-col justify-between`}
            >
              {/* Subtle background ambient gradient */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${card.accent} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-white shadow-inner">
                    <IconComponent className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${card.badgeColor}`}>
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-base">
                  {card.description}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>RISK VECTOR 0{idx + 1}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default TheProblemSection
