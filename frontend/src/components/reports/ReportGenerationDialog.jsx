import React, { useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const sectionOptions = [
  { id: "executive_summary", label: "Executive Summary" },
  { id: "exposure_overview", label: "Exposure Overview" },
  { id: "risk_metrics", label: "Risk Metrics" },
  { id: "risk_drivers", label: "Key Risk Drivers" },
  { id: "scenario_summary", label: "Scenario Summary" },
]

export function ReportGenerationDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  initialType = "executive",
}) {
  const [reportType, setReportType] = useState(initialType)
  const [period, setPeriod] = useState("30d")
  const [currency, setCurrency] = useState("all")
  const [riskLevel, setRiskLevel] = useState("all")
  const [format, setFormat] = useState("pdf")
  const [sections, setSections] = useState(
    sectionOptions.map((s) => s.id)
  )

  // Reset form when initial type changes
  React.useEffect(() => {
    setReportType(initialType)
  }, [initialType])

  const handleSectionToggle = (sectionId) => {
    setSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((s) => s !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleGenerate = () => {
    onGenerate({
      reportType,
      period,
      currency,
      riskLevel,
      sections,
      format,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            Configure the report parameters before generating.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="report-type" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Report Type
            </Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id="report-type" aria-label="Report Type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Risk Summary</SelectItem>
                <SelectItem value="exposure">Exposure Report</SelectItem>
                <SelectItem value="risk-analysis">Risk Analysis Report</SelectItem>
                <SelectItem value="scenario">Scenario Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reporting Period */}
          <div className="space-y-2">
            <Label htmlFor="report-period" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Reporting Period
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="report-period" aria-label="Reporting Period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last 1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="report-currency" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="report-currency" aria-label="Currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Risk Level */}
            <div className="space-y-2">
              <Label htmlFor="report-risk-level" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Risk Level
              </Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger id="report-risk-level" aria-label="Risk Level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risks</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Include Sections */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Include Sections
            </Label>
            <div className="space-y-2.5">
              {sectionOptions.map((section) => (
                <div key={section.id} className="flex items-center gap-2.5">
                  <Checkbox
                    id={`section-${section.id}`}
                    checked={sections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <label
                    htmlFor={`section-${section.id}`}
                    className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                  >
                    {section.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Output Format
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={format === "pdf" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat("pdf")}
                className={`h-8 text-xs font-semibold ${
                  format === "pdf"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                PDF
              </Button>
              <Button
                type="button"
                variant={format === "csv" ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat("csv")}
                className={`h-8 text-xs font-semibold ${
                  format === "csv"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                CSV
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating || sections.length === 0}
            className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
