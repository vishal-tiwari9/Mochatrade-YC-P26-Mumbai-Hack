import React from "react"
import {
  Wallet,
  ShieldAlert,
  ChartNoAxesCombined,
  GitBranch,
  Bell,
  FileText,
  Clock,
  ArrowLeft,
  Sparkles,
} from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNavigation } from "@/context/NavigationContext"

const moduleMeta = {
  exposure: {
    title: "Exposure",
    subtitle: "Comprehensive FX, commodity, and interest-rate gross & net exposure mapping.",
    icon: Wallet,
    layer: "SEE LAYER",
    layerColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  "risk-analysis": {
    title: "Risk Analysis",
    subtitle: "Value at Risk (VaR), stress testing, volatility correlation matrices, and cashflow sensitivity.",
    icon: ShieldAlert,
    layer: "SEE LAYER",
    layerColor: "text-red-500 bg-red-500/10 border-red-500/20",
  },
  scenarios: {
    title: "Scenarios",
    subtitle: "Interactive 'what-if' simulation engine for currency devaluations and rate hikes.",
    icon: ChartNoAxesCombined,
    layer: "SIMULATE LAYER",
    layerColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
  "hedge-advisor": {
    title: "Hedge Advisor",
    subtitle: "AI-driven hedging recommendations, forwards vs options comparison, and cost-benefit trade-offs.",
    icon: GitBranch,
    layer: "DECIDE LAYER",
    layerColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  alerts: {
    title: "Alerts",
    subtitle: "Automated threshold monitoring, margin call warnings, and critical supplier payment alerts.",
    icon: Bell,
    layer: "MONITORING",
    layerColor: "text-red-500 bg-red-500/10 border-red-500/20",
  },
  reports: {
    title: "Reports",
    subtitle: "Executive board treasury summaries, compliance audit trails, and risk accounting exports.",
    icon: FileText,
    layer: "REPORTING",
    layerColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
}

export function PlaceholderPage({ moduleId }) {
  const { navigate } = useNavigation()
  const info = moduleMeta[moduleId] || {
    title: moduleId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: "Financial risk management module.",
    icon: Clock,
    layer: "HEDGEMIND",
    layerColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  }

  const Icon = info.icon

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 max-w-2xl mx-auto">
      <BentoCard className="w-full text-center p-8 sm:p-10 flex flex-col items-center">
        {/* Module Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5 mb-6">
          <Icon className="h-8 w-8" />
        </div>

        {/* Layer Tag */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-mono font-semibold border ${info.layerColor}`}
          >
            <Sparkles className="h-3 w-3" />
            {info.layer}
          </span>
        </div>

        {/* Coming Soon Badge */}
        <div className="my-2">
          <Badge
            variant="outline"
            className="px-3 py-1 text-sm font-semibold tracking-wider uppercase border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono"
          >
            Module in Development
          </Badge>
        </div>

        {/* Informative placeholder text */}
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed mt-2 mb-8">
          This module is currently being configured as part of the HedgeMind enterprise suite. Core simulation models and reports will be available here soon.
        </p>

        {/* Navigation back */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("dashboard")}
            className="gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Button>
        </div>
      </BentoCard>
    </div>
  )
}

export default PlaceholderPage
