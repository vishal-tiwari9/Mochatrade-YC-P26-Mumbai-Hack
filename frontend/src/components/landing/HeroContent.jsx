import React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useNavigation } from "@/context/NavigationContext"

/**
 * HeroContent - Clean, authoritative fintech hero messaging
 * Exact specifications:
 * - Top-left branding pill removed completely as requested
 * - Headline: HedgeMind
 * - Supporting: AI Copilot for Corporate Financial Risk
 * - Description: See exposure. Simulate risk. Make smarter financial decisions.
 * - Single Primary CTA: [ View Dashboard → ]
 */
export function HeroContent() {
  const { navigate } = useNavigation()

  const handleViewDashboard = (e) => {
    e.preventDefault()
    navigate("dashboard")
  }

  // Animation variants for subtle, cinematic staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col justify-center items-start max-w-xl z-10"
    >
      {/* Main Headline */}
      <motion.h1
        variants={itemVariants}
        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 leading-[1.05]"
      >
        HedgeMind
      </motion.h1>

      {/* Supporting Headline */}
      <motion.h2
        variants={itemVariants}
        className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-blue-200/90 mb-6 leading-snug"
      >
        AI Copilot for Corporate Financial Risk
      </motion.h2>

      {/* Short Description */}
      <motion.p
        variants={itemVariants}
        className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed mb-10 max-w-md"
      >
        See exposure. Simulate risk. Make smarter financial decisions.
      </motion.p>

      {/* Primary CTA - The ONLY button in the hero */}
      <motion.div variants={itemVariants}>
        <button
          id="view-dashboard-btn"
          onClick={handleViewDashboard}
          aria-label="View Dashboard"
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-base text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 border border-blue-400/20 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#050816] cursor-pointer"
        >
          <span>View Dashboard</span>
          <ArrowRight
            className="w-5 h-5 transition-transform duration-200 ease-out group-hover:translate-x-1"
            aria-hidden="true"
          />
        </button>
      </motion.div>
    </motion.div>
  )
}

export default HeroContent
