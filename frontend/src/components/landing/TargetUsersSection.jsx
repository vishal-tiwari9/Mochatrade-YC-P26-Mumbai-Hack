import React from "react"
import { motion } from "framer-motion"
import { Briefcase, Landmark, Globe, Rocket } from "lucide-react"

export function TargetUsersSection() {
  const personas = [
    {
      title: "CFO / Finance Leaders",
      desc: "Get a clearer view of potential financial impact and protect operating margins.",
      icon: Briefcase,
      badge: "Executive Leadership",
    },
    {
      title: "Treasury Teams",
      desc: "Understand exposures and evaluate scenario simulations significantly faster.",
      icon: Landmark,
      badge: "Treasury Operations",
    },
    {
      title: "Importers & Exporters",
      desc: "Monitor currency-driven exposure against fluctuating foreign procurement contracts.",
      icon: Globe,
      badge: "Global Trade",
    },
    {
      title: "Growing Businesses",
      desc: "Bring structured financial-risk intelligence into everyday planning decisions.",
      icon: Rocket,
      badge: "Enterprise Scale",
    },
  ]

  return (
    <section className="relative py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 border-t border-slate-900">
      <div className="max-w-3xl mb-16 sm:mb-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-mono mb-3 block">
          Audience & Fit
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          Built for Teams Managing Financial Risk
        </h2>
        <p className="text-lg text-slate-400 font-normal leading-relaxed">
          Tailored for enterprise decision-makers who need clear risk insights without the friction of legacy financial terminals.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {personas.map((persona, idx) => {
          const Icon = persona.icon
          return (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#0B1220] border border-[#1E293B] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono font-semibold uppercase text-slate-500 tracking-wider mb-2 block">
                  {persona.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  {persona.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {persona.desc}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default TargetUsersSection
