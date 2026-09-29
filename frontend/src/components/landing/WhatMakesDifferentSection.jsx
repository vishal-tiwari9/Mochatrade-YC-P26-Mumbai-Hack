import React from "react"
import { motion } from "framer-motion"
import { Layers, HelpCircle, GitFork, Lightbulb, PieChart, Building, ArrowRight } from "lucide-react"

export function WhatMakesDifferentSection() {
  return (
    <section className="relative py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
      <div className="max-w-3xl mb-16 sm:mb-20">
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 font-mono mb-3 block">
          Key Differentiators
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          What Makes HedgeMind Different
        </h2>
        <p className="text-lg text-slate-400 font-normal leading-relaxed">
          Unlike generic market tickers or static spreadsheets, HedgeMind anchors intelligence directly to your corporate cash flows and contracts.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: Exposure-Aware Intelligence (Spans 2 cols on lg) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 p-8 sm:p-10 rounded-3xl bg-[#0B1220] border border-[#1E293B] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-blue-400 font-semibold mb-2 block uppercase">
              Foundational Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Exposure-Aware Intelligence
            </h3>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
              HedgeMind starts with the company's actual exposure rather than showing market data in isolation. Market rates are only meaningful in the context of what your business actually owes and owns.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Contextual Base</div>
              <div className="text-sm font-bold text-white mt-1">Real Portfolios</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Market Sync</div>
              <div className="text-sm font-bold text-blue-400 mt-1">Live Telemetry</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Output</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">Net Exposure</div>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: What-If Simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="p-8 rounded-3xl bg-[#0B1220] border border-[#1E293B] hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
              <HelpCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-indigo-400 font-semibold mb-2 block uppercase">
              Scenario Modeling
            </span>
            <h3 className="text-xl font-bold text-white mb-3">
              What-If Simulation
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Ask natural questions such as: <em className="text-slate-200">"What happens if USD/INR rises by 5%?"</em>
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Base Exposure</span>
              <span className="text-slate-200">₹12.5 Cr</span>
            </div>
            <div className="flex items-center justify-center text-indigo-400">↓</div>
            <div className="flex items-center justify-between text-amber-400">
              <span>Market Change</span>
              <span>USD/INR +5%</span>
            </div>
            <div className="flex items-center justify-center text-indigo-400">↓</div>
            <div className="flex items-center justify-between text-rose-400">
              <span>Potential Impact</span>
              <span>-₹62.5 Lakhs</span>
            </div>
          </div>
        </motion.div>

        {/* CARD 3: Multi-Risk View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-8 rounded-3xl bg-[#0B1220] border border-[#1E293B] hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <GitFork className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold mb-2 block uppercase">
              Holistic Overview
            </span>
            <h3 className="text-xl font-bold text-white mb-3">
              Multi-Risk View
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Bring together disparate risk vectors into one synchronized corporate view:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <span className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              FX Volatility
            </span>
            <span className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              Commodity Swings
            </span>
            <span className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              Interest Rates
            </span>
            <span className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              Payment Timing
            </span>
          </div>
        </motion.div>

        {/* CARD 4: Decision Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="p-8 rounded-3xl bg-[#0B1220] border border-[#1E293B] hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
              <Lightbulb className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-blue-400 font-semibold mb-2 block uppercase">
              Action Orientation
            </span>
            <h3 className="text-xl font-bold text-white mb-3">
              Decision Support
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Seamlessly bridge the analytical gap across three distinct levels:
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <strong className="text-slate-200">1. Observation:</strong> What is happening?
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-300">
              <strong className="text-blue-400">2. Projection:</strong> What could happen?
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300">
              <strong className="text-emerald-400">3. Prescription:</strong> What should we evaluate?
            </div>
          </div>
        </motion.div>

        {/* CARD 5: Explainable Risk (Spans 2 cols on md, 1 on lg or full) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="p-8 rounded-3xl bg-[#0B1220] border border-[#1E293B] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <PieChart className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold mb-2 block uppercase">
              Transparency
            </span>
            <h3 className="text-xl font-bold text-white mb-3">
              Explainable Risk
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Show why risk is elevated instead of presenting only a black-box composite score.
            </p>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>Market Volatility</span>
              <span className="text-amber-400">Elevated</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>FX Sensitivity</span>
              <span className="text-red-400">Critical</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800 text-slate-400">
              <span>Concentration</span>
              <span className="text-blue-400">44% USD</span>
            </div>
            <div className="flex justify-between py-1 text-slate-400">
              <span>Payment Timing Lag</span>
              <span className="text-emerald-400">Within Threshold</span>
            </div>
          </div>
        </motion.div>

        {/* CARD 6: Built for Corporate Finance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="lg:col-span-3 p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0B1220] via-slate-950 to-[#0B1220] border border-[#1E293B] hover:border-blue-500/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase font-semibold mb-2">
              <Building className="w-4 h-4" />
              Institutional Alignment
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Built for Corporate Finance
            </h3>
            <p className="text-slate-400 text-base max-w-xl">
              Engineered specifically for real operating balance sheets, not speculative day-trading.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {["Treasury Teams", "CFOs & Controllers", "Finance Executives", "Importers", "Exporters", "Growing Enterprises"].map((role) => (
              <span
                key={role}
                className="px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300"
              >
                {role}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default WhatMakesDifferentSection
