import React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useNavigation } from "@/context/NavigationContext"

export function FinalCTASection() {
  const { navigate } = useNavigation()

  const handleViewDashboard = (e) => {
    e.preventDefault()
    navigate("dashboard")
  }

  return (
    <section className="relative py-28 sm:py-36 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 border-t border-slate-900 overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
        >
          See Your Financial Risk Differently
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg sm:text-xl text-slate-400 font-normal leading-relaxed mb-10 max-w-xl mx-auto"
        >
          Turn exposure data into clearer risk intelligence and better-informed decisions.
        </motion.p>

        {/* Primary CTA - The ONLY button in this section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <button
            id="final-view-dashboard-btn"
            onClick={handleViewDashboard}
            aria-label="View Dashboard"
            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl font-semibold text-base text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 border border-blue-400/20 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#050816] cursor-pointer"
          >
            <span>View Dashboard</span>
            <ArrowRight
              className="w-5 h-5 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </motion.div>
      </div>

      {/* Minimal Footer Disclaimer */}
      <div className="mt-24 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
        HedgeMind · AI Copilot for Corporate Financial Risk · All calculations for illustration and decision support
      </div>
    </section>
  )
}

export default FinalCTASection
