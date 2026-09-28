import React from "react"
import { motion } from "framer-motion"
import { AlertCircle, SlidersHorizontal, ArrowDownRight, TrendingUp, Calendar, Zap } from "lucide-react"

export function ScenarioDemoSection() {
  return (
    <section className="relative py-24 sm:py-32 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 border-t border-slate-900">
      <div className="max-w-3xl mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Interactive Simulation Preview
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6">
          Ask What Happens Before It Happens
        </h2>
        <p className="text-lg text-slate-400 font-normal leading-relaxed">
          Stress-test complex assumptions with natural parameters before committing corporate liquidity.
        </p>
      </div>

      {/* Conceptual Interactive Scenario Card */}
      <div className="relative rounded-3xl bg-[#0B1220] border border-[#1E293B] p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Top Scenario Query Prompt */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 mb-8 sm:mb-10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
              Example What-If Query
            </span>
            <p className="text-base sm:text-lg font-semibold text-white">
              “What happens if USD/INR rises by 5% and supplier payments are delayed by 15 days?”
            </p>
          </div>
        </div>

        {/* Inputs Stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Base Exposure */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-4">
              <span>BASE EXPOSURE</span>
              <span className="text-blue-400 font-semibold">Active Ledger</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              ₹12.5 Cr
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Unhedged net import payables across 4 quarters
            </div>
          </div>

          {/* Card 2: Market Stress Factor */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-4">
              <span>FX SHIFT</span>
              <span className="text-amber-400 font-semibold">+5.0%</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-tight flex items-center gap-2">
              <TrendingUp className="w-8 h-8" />
              USD/INR
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Depreciation shock against baseline exchange corridor
            </div>
          </div>

          {/* Card 3: Payment Lag */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-4">
              <span>SETTLEMENT DELAY</span>
              <span className="text-indigo-400 font-semibold">+15 Days</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-indigo-300 font-mono tracking-tight flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              +15 D
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Extended counterparty payable cycle into higher volatility
            </div>
          </div>
        </div>

        {/* Calculated Simulation Output Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-red-950/30 via-slate-900 to-amber-950/20 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider mb-2 font-semibold">
              <ArrowDownRight className="w-4 h-4" />
              Simulated Downside Impact
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
              -₹1.42 Cr
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Estimated unhedged P&L variance under combined market and settlement stress
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2 text-sm font-bold tracking-wider uppercase font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              RISK LEVEL: HIGH
            </div>
          </div>
        </div>

        {/* Disclaimer / Conceptual Notice */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-mono">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Conceptual illustrative preview. Actual risk calculations are derived from your live balance-sheet inputs via the HedgeMind risk engine.
          </span>
        </div>
      </div>
    </section>
  )
}

export default ScenarioDemoSection
