import React, { useState, useEffect, useMemo } from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ScanSearch,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react"
import { useNavigation } from "@/context/NavigationContext"

export function AnalysisStatus({
  validCount = 0,
  isAnalyzing = false,
  isAnalyzed = false,
  analyzedCount = 0,
  onAnalyze,
  onResetAnalysis,
  liveRate = null,
  liveCurrency = "USD",
  exposures = []
}) {
  const { navigate } = useNavigation()

  // Compute unique currencies and their latest rates from exposures
  const uniqueCurrencies = useMemo(() => {
    const map = new Map()
    exposures.forEach(e => {
      if (e.currency && e.base_rate && e.status === "Valid") {
        map.set(e.currency, e.base_rate)
      }
    })
    return Array.from(map.entries()).map(([currency, rate]) => ({ currency, rate }))
  }, [exposures])

  const [selectedCurrency, setSelectedCurrency] = useState("")

  // Set default selection when currencies load
  useEffect(() => {
    if (uniqueCurrencies.length > 0 && !selectedCurrency) {
      setSelectedCurrency(uniqueCurrencies[0].currency)
    }
  }, [uniqueCurrencies, selectedCurrency])

  const displayRate = selectedCurrency 
    ? uniqueCurrencies.find(c => c.currency === selectedCurrency)?.rate 
    : liveRate
  const displayCurrency = selectedCurrency || liveCurrency

  const loadingSteps = [
    "Establishing secure connection to HedgeMind engine...",
    "Ingesting financial exposure parameters...",
    "Executing mark-to-market calculations...",
    "Running deterministic volatility stress scenarios...",
    "Generating multi-currency risk models...",
    "Extracting Copilot AI Insights...",
    "Finalizing quantitative analysis...",
  ];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isAnalyzing) {
      setStepIndex(0);
      const interval = setInterval(() => {
        setStepIndex(prev => {
          if (prev < loadingSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  return (
    <BentoCard
      glowColor={isAnalyzed ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)"}
      className={`flex flex-col justify-between transition-all duration-300 ${
        isAnalyzed ? "border-emerald-500/30 dark:border-emerald-500/30" : ""
      }`}
    >
      {!isAnalyzed ? (
        /* Pre-Analysis CTA State */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <ScanSearch className="h-4 w-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Analyze Exposures
                </h3>
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  RISK ENGINE PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Transmit valid imported exposures to the backend risk engine for mark-to-market calculations and VaR attribution.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
              <span>Benchmark Rate:</span>
              {uniqueCurrencies.length > 1 ? (
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="h-8 w-32 bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCurrencies.map((c) => (
                      <SelectItem key={c.currency} value={c.currency} className="font-mono text-xs font-bold">
                        {c.currency}/INR ₹{c.rate.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                  {displayCurrency}/INR ₹{displayRate ? displayRate.toFixed(2) : "88.50"}
                </span>
              )}
            </div>
          </div>

          <div className="my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  {validCount > 0
                    ? `${validCount} Valid Exposures Ready`
                    : "Awaiting Valid Records"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Financial calculations (INR conversion, risk scoring) executed server-side.
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="default"
              size="lg"
              onClick={onAnalyze}
              disabled={validCount === 0 || isAnalyzing}
              className={`h-11 px-6 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed transition-all duration-300 w-full sm:w-[320px] ${isAnalyzing ? "opacity-90" : ""}`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2 overflow-hidden w-full justify-center">
                  <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                  <span className="truncate">{loadingSteps[stepIndex]}</span>
                </div>
              ) : (
                <>
                  <ScanSearch className="h-4 w-4" />
                  <span>Analyze Exposures</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Post-Analysis Success State (Section 17) */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Exposure analysis completed
                  </h3>
                  <Badge
                    variant="safe"
                    className="text-[10px] font-mono px-2 py-0 uppercase tracking-wider"
                  >
                    SUCCESS
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  <strong>{analyzedCount} exposures</strong> analyzed successfully by the Risk Engine. Results populated in the data table.
                </p>
              </div>
            </div>

            {onResetAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetAnalysis}
                className="h-8 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 self-start sm:self-auto"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Re-Analyze
              </Button>
            )}
          </div>

          {/* Workflow Transition Next Steps */}
          <div className="my-5 p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider font-mono block">
                Workflow Transition: REVIEWED → QUANTIFY &amp; SIMULATE
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-xl leading-relaxed">
                Continue to the <strong>Risk Analysis</strong> workstation to evaluate Value at Risk (VaR), stress scenarios, and factor correlations, or view overall portfolio aggregate impact on the <strong>Dashboard</strong>.
              </p>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("dashboard")}
                className="h-9 gap-2 text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-blue-500" />
                <span>View Dashboard</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("risk-analysis")}
                className="h-9 gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>View Risk Analysis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Deterministic batch transaction pipeline</span>
        <span className="font-mono text-slate-400">
          Strict separation of concern
        </span>
      </div>
    </BentoCard>
  )
}

export default AnalysisStatus
