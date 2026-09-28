import React from "react"
import { Download, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getReportPreviewContent, downloadReport } from "@/services/reportService"

export function ReportPreview({ open, onOpenChange, report }) {
  if (!report) return null

  const content = getReportPreviewContent(report.type)

  const handleDownload = () => {
    downloadReport(report)
  }

  const levelBadgeVariant = (level) => {
    switch (level) {
      case "HIGH":
      case "CRITICAL":
        return "destructive"
      case "MEDIUM":
      case "ELEVATED":
        return "warning"
      case "LOW":
      case "NORMAL":
        return "safe"
      default:
        return "secondary"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {content.title}
          </DialogTitle>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Report ID: {report.id}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Period: {report.period}</span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span>Generated: {new Date(report.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ── Executive: Portfolio Overview ────────────────────── */}
          {content.sections?.portfolioOverview && (
            <PreviewSection title="Portfolio Overview">
              <MetricGrid>
                <MetricItem label="Total Exposure" value={content.sections.portfolioOverview.totalExposure} />
                <MetricItem label="Risk Score" value={content.sections.portfolioOverview.riskScore} />
                <MetricItem label="VaR (95%)" value={content.sections.portfolioOverview.var95} />
                <MetricItem label="Expected Shortfall" value={content.sections.portfolioOverview.expectedShortfall} />
                <MetricItem label="Portfolio Volatility" value={content.sections.portfolioOverview.portfolioVolatility} />
                <MetricItem label="Risk Level">
                  <Badge variant={levelBadgeVariant(content.sections.portfolioOverview.riskLevel)}>
                    {content.sections.portfolioOverview.riskLevel}
                  </Badge>
                </MetricItem>
              </MetricGrid>
            </PreviewSection>
          )}

          {/* ── Exposure: Summary ────────────────────────────────── */}
          {content.sections?.summary && (
            <PreviewSection title="Exposure Summary">
              <MetricGrid>
                <MetricItem label="Total Exposure" value={content.sections.summary.totalExposure} />
                <MetricItem label="Currency Pairs" value={content.sections.summary.currencyPairs} />
                <MetricItem label="Counterparties" value={content.sections.summary.counterparties} />
                <MetricItem label="Avg. Maturity" value={content.sections.summary.averageMaturity} />
                <MetricItem label="Hedged %" value={content.sections.summary.hedgedPercentage} />
                <MetricItem label="Unhedged" value={content.sections.summary.unhedgedExposure} />
              </MetricGrid>
            </PreviewSection>
          )}

          {/* ── Risk Analysis: Overview ──────────────────────────── */}
          {content.sections?.overview && (
            <PreviewSection title="Risk Overview">
              <MetricGrid>
                <MetricItem label="Overall Risk Score" value={content.sections.overview.overallRiskScore} />
                <MetricItem label="VaR (95%, 1D)" value={content.sections.overview.var95_1D} />
                <MetricItem label="VaR (99%, 1D)" value={content.sections.overview.var99_1D} />
                <MetricItem label="Expected Shortfall" value={content.sections.overview.expectedShortfall} />
                <MetricItem label="Volatility" value={content.sections.overview.portfolioVolatility} />
                <MetricItem label="VaR Utilization" value={content.sections.overview.varUtilization} />
              </MetricGrid>
            </PreviewSection>
          )}

          {/* ── Key Risk Drivers ─────────────────────────────────── */}
          {content.sections?.keyRiskDrivers && (
            <PreviewSection title="Key Risk Drivers">
              <div className="space-y-2">
                {content.sections.keyRiskDrivers.map((driver, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 px-3 py-2"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {driver.driver}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant={levelBadgeVariant(driver.level)} className="text-[10px]">
                        {driver.level}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {driver.contribution}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {/* ── Currency Breakdown ───────────────────────────────── */}
          {content.sections?.currencyBreakdown && (
            <PreviewSection title="Currency Breakdown">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/80">
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Currency</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Exposure</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Share</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Risk</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Hedged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.sections.currencyBreakdown.map((row, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-2 px-2 font-semibold text-slate-900 dark:text-white">{row.currency}</td>
                        <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{row.exposure}</td>
                        <td className="py-2 px-2 text-slate-500 dark:text-slate-400">{row.share}</td>
                        <td className="py-2 px-2">
                          <Badge variant={levelBadgeVariant(row.risk.toUpperCase())} className="text-[10px]">
                            {row.risk}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-slate-500 dark:text-slate-400">{row.hedged}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PreviewSection>
          )}

          {/* ── Risk Decomposition ───────────────────────────────── */}
          {content.sections?.riskDecomposition && (
            <PreviewSection title="Risk Decomposition">
              <div className="space-y-2">
                {content.sections.riskDecomposition.map((factor, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 dark:text-slate-400 w-28 shrink-0">{factor.factor}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${factor.share.replace("%", "")}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 w-10 text-right">{factor.share}</span>
                      <Badge variant={levelBadgeVariant(factor.level)} className="text-[10px]">
                        {factor.level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {/* ── Stress Test Summary ──────────────────────────────── */}
          {content.sections?.stressTestSummary && (
            <PreviewSection title="Stress Test Summary">
              <div className="space-y-2">
                {content.sections.stressTestSummary.map((test, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 px-3 py-2"
                  >
                    <div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{test.scenario}</span>
                      <span className="text-[11px] text-slate-400 ml-2">Score: {test.stressedScore}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-red-500">{test.impact}</span>
                      <Badge variant={levelBadgeVariant(test.level)} className="text-[10px]">
                        {test.level}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {/* ── Top Exposures ────────────────────────────────────── */}
          {content.sections?.topExposures && (
            <PreviewSection title="Top Exposures">
              <div className="space-y-2">
                {content.sections.topExposures.map((exp, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 px-3 py-2"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{exp.counterparty}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{exp.currency} {exp.amount}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{exp.inrEquiv}</span>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {/* ── Top Counterparties ───────────────────────────────── */}
          {content.sections?.topCounterparties && (
            <PreviewSection title="Top Counterparties">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800/80">
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Name</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Amount</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Maturity</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.sections.topCounterparties.map((cp, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-2 px-2 font-semibold text-slate-900 dark:text-white">{cp.name}</td>
                        <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{cp.currency} {cp.amount}</td>
                        <td className="py-2 px-2 text-slate-500 dark:text-slate-400">{cp.maturity}</td>
                        <td className="py-2 px-2 text-slate-500 dark:text-slate-400">{cp.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PreviewSection>
          )}

          {/* ── Scenario Analysis (full scenarios) ──────────────── */}
          {content.sections?.scenarios && (
            <PreviewSection title="Scenario Analysis">
              <div className="space-y-3">
                {content.sections.scenarios.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</span>
                      <Badge variant={levelBadgeVariant(s.riskLevel)} className="text-[10px]">
                        {s.riskLevel}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">Base</span>
                        <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">{s.baseScore}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Stressed</span>
                        <p className="font-mono font-semibold text-red-500">{s.stressedScore}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Impact</span>
                        <p className="font-mono font-semibold text-red-500">{s.impact}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                      {s.conclusion}
                    </p>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {/* ── Risk Thresholds ──────────────────────────────────── */}
          {content.sections?.thresholds && (
            <PreviewSection title="Risk Thresholds">
              <div className="space-y-2">
                {content.sections.thresholds.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 px-3 py-2"
                  >
                    <div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{t.metric}</span>
                      <span className="text-[11px] text-slate-400 ml-2">{t.current} / {t.limit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">{t.utilization}</span>
                      <Badge
                        variant={
                          t.status === "Near Limit" ? "destructive" :
                          t.status === "Elevated" ? "warning" : "safe"
                        }
                        className="text-[10px]"
                      >
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </PreviewSection>
          )}

          {/* ── Key Observations ─────────────────────────────────── */}
          {content.sections?.keyObservations && (
            <PreviewSection title="Key Observations">
              <ul className="space-y-1.5">
                {content.sections.keyObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                    {obs}
                  </li>
                ))}
              </ul>
            </PreviewSection>
          )}

          {/* ── Overall Assessment ───────────────────────────────── */}
          {content.sections?.overallAssessment && (
            <PreviewSection title="Overall Assessment">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {content.sections.overallAssessment}
              </p>
            </PreviewSection>
          )}

          {/* ── Concentration Analysis ───────────────────────────── */}
          {content.sections?.concentrationAnalysis && (
            <PreviewSection title="Concentration Analysis">
              <MetricGrid cols={2}>
                <MetricItem label="Herfindahl Index" value={content.sections.concentrationAnalysis.herfindahlIndex} />
                <MetricItem label="Dominant Currency" value={content.sections.concentrationAnalysis.dominantCurrency} />
                <MetricItem label="Policy Limit" value={content.sections.concentrationAnalysis.policyLimit} />
                <MetricItem label="Status" value={content.sections.concentrationAnalysis.status} />
              </MetricGrid>
            </PreviewSection>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-3 text-[11px] text-slate-500 dark:text-slate-400">
            <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
            <p>
              <strong>Illustrative Demo Data:</strong> All figures shown are simulated models intended for prototype evaluation.
            </p>
          </div>
        </div>

        {/* Download footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="gap-1.5 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Helper sub-components ─────────────────────────────────────────────── */

function PreviewSection({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 pb-1.5 border-b border-slate-200 dark:border-slate-800/60">
        {title}
      </h3>
      {children}
    </div>
  )
}

function MetricGrid({ children, cols = 3 }) {
  return (
    <div className={`grid grid-cols-2 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
      {children}
    </div>
  )
}

function MetricItem({ label, value, children }) {
  return (
    <div className="rounded-lg border border-slate-200/60 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
        {label}
      </p>
      {children || (
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      )}
    </div>
  )
}
