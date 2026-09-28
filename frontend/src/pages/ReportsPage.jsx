import React, { useState, useEffect, useCallback } from "react"
import { FilePlus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReportTypeCard } from "@/components/reports/ReportTypeCard"
import { ReportFilters } from "@/components/reports/ReportFilters"
import { ReportGenerationDialog } from "@/components/reports/ReportGenerationDialog"
import { RecentReportsTable } from "@/components/reports/RecentReportsTable"
import { ReportPreview } from "@/components/reports/ReportPreview"
import { EmptyReportsState } from "@/components/reports/EmptyReportsState"
import {
  getReports,
  generateReport,
  downloadReport,
} from "@/services/reportService"
import { reportTypeDefinitions } from "@/data/reports-demo"

export function ReportsPage() {
  // Report list state
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Generation dialog state
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [initialReportType, setInitialReportType] = useState("executive")

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewReport, setPreviewReport] = useState(null)

  // Filter state
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Load reports
  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getReports()
      setReports(data)
    } catch {
      // Error loading reports
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // Generate report handler
  const handleGenerate = async (config) => {
    setIsGenerating(true)
    try {
      const newReport = await generateReport(config)
      setReports((prev) => [newReport, ...prev])
      setGenerateDialogOpen(false)
    } catch {
      // Generation failed — user sees the dialog still open
    } finally {
      setIsGenerating(false)
    }
  }

  // Open generation dialog from a report type card
  const handleCardGenerate = (typeId) => {
    setInitialReportType(typeId)
    setGenerateDialogOpen(true)
  }

  // Open generation dialog from top-level button or empty state
  const handleTopGenerate = () => {
    setInitialReportType("executive")
    setGenerateDialogOpen(true)
  }

  // Preview handler
  const handlePreview = (report) => {
    setPreviewReport(report)
    setPreviewOpen(true)
  }

  // Download handler
  const handleDownload = (report) => {
    downloadReport(report)
  }

  // Apply filters
  const filteredReports = reports.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false

    // Period filter — match by approximate age
    if (periodFilter !== "all") {
      const daysSinceGenerated = Math.floor(
        (Date.now() - new Date(r.generatedAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      const periodDays = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }
      if (daysSinceGenerated > (periodDays[periodFilter] || 365)) return false
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const match =
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      if (!match) return false
    }

    return true
  })

  const hasReports = reports.length > 0

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Page Action Area ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Report Center
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Generate, preview, and download formal risk reports
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleTopGenerate}
          className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FilePlus className="h-3.5 w-3.5" />
          Generate Report
        </Button>
      </div>

      {/* ─── Report Type Bento Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportTypeDefinitions.map((def) => (
          <ReportTypeCard
            key={def.id}
            definition={def}
            onGenerate={handleCardGenerate}
          />
        ))}
      </div>

      {/* ─── Filters ──────────────────────────────────────────────── */}
      {hasReports && (
        <ReportFilters
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          periodFilter={periodFilter}
          setPeriodFilter={setPeriodFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* ─── Recent Reports Table / Empty State ───────────────────── */}
      {hasReports ? (
        <RecentReportsTable
          reports={filteredReports}
          onPreview={handlePreview}
          onDownload={handleDownload}
        />
      ) : (
        !isLoading && (
          <EmptyReportsState onGenerate={handleTopGenerate} />
        )
      )}

      {/* ─── Financial Disclaimer ─────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-3 text-xs text-slate-500 dark:text-slate-400">
        <Info className="h-4 w-4 text-blue-500 shrink-0" />
        <p>
          <strong>Illustrative Demo Data:</strong> All report content, exposure figures, and risk projections are simulated models intended for prototype evaluation.
        </p>
      </div>

      {/* ─── Generation Dialog ────────────────────────────────────── */}
      <ReportGenerationDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        initialType={initialReportType}
      />

      {/* ─── Preview Dialog ───────────────────────────────────────── */}
      <ReportPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        report={previewReport}
      />
    </div>
  )
}

export default ReportsPage
