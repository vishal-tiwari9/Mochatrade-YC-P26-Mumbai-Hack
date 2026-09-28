import React, { useState } from "react"
import {
  Wallet,
  UploadCloud,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { ExposureSummary } from "@/components/exposure/ExposureSummary"
import { ExposureUpload } from "@/components/exposure/ExposureUpload"
import { ExposureTable } from "@/components/exposure/ExposureTable"
import { ValidationIssues } from "@/components/exposure/ValidationIssues"
import { AnalysisStatus } from "@/components/exposure/AnalysisStatus"
import {
  uploadExposureFile,
  analyzeExposures,
  extractExposureFromText
} from "@/services/exposureService"
import { calculateVolatility } from "@/services/riskService"
import { useApp } from "@/context/AppContext"
import { toast } from "sonner"

export function ExposurePage() {
  const { liveExposures, setLiveExposures, setLiveRiskScore, setLiveRiskLevel, setLiveVolatility } = useApp()
  
  // Check if we have existing analyzed data in the global context
  const hasExistingData = liveExposures && liveExposures.length > 0
  const hasAnalyzedData = hasExistingData && liveExposures.some(e => e.risk_score !== undefined)

  const [uploadedFile, setUploadedFile] = useState(hasExistingData ? { filename: "Previously Uploaded", fileSize: "-", fileType: "text/csv" } : null)
  const [exposures, setExposures] = useState(liveExposures || [])
  const [rejectedRows, setRejectedRows] = useState([])
  const [rowsProcessed, setRowsProcessed] = useState(hasExistingData ? liveExposures.length : 0)
  const [acceptedRows, setAcceptedRows] = useState(hasExistingData ? liveExposures.length : 0)
  const [processingStatus, setProcessingStatus] = useState(hasExistingData ? "Validated" : "Ready")
  const [columnMapping, setColumnMapping] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(hasAnalyzedData)
  const [error, setError] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handle file selection (Drag & Drop or Browse)
  const handleFileSelected = async (file) => {
    setIsProcessing(true)
    setError(null)
    setIsAnalyzed(false)
    setProcessingStatus("Processing")

    try {
      const result = await uploadExposureFile(file)
      setUploadedFile({
        filename: result.filename,
        fileSize: result.fileSize,
        fileType: result.fileType,
      })
      setRowsProcessed(result.rows_processed || 0)
      setAcceptedRows(result.accepted_rows || 0)
      setRejectedRows(result.rejected_rows || [])
      setExposures(result.exposures || [])
      setColumnMapping(result.column_mapping || null)

      if (result.rejected_rows && result.rejected_rows.length > 0) {
        setProcessingStatus("Validation Issues")
        toast.warning("File processed with validation issues")
      } else {
        setProcessingStatus("Validated")
        toast.success("Exposure data loaded successfully")
      }
    } catch (err) {
      setError(err.message || "Failed to parse exposure file.")
      setProcessingStatus("Error")
      toast.error("Failed to load exposure data")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Magic Text Extract
  const handleExtractText = async (text) => {
    setIsProcessing(true)
    setError(null)
    setProcessingStatus("Processing")

    try {
      const extracted = await extractExposureFromText(text)
      
      // Structure it to look like a parsed row
      const newExposure = {
        id: `row-ai-${Date.now()}`,
        row: exposures.length + 1,
        counterparty: extracted.counterparty || "Unknown AI",
        currency: extracted.currency || "USD",
        amount: extracted.amount || 0,
        days_to_payment: extracted.days_to_payment || 30,
        exposure_type: extracted.exposure_type || "payable",
        base_rate: extracted.base_rate,
        status: "Valid",
      }

      setExposures([...exposures, newExposure])
      setAcceptedRows(prev => prev + 1)
      setRowsProcessed(prev => prev + 1)
      setProcessingStatus("Validated")
      toast.success("AI extraction completed")
    } catch (err) {
      setError(err.message || "Failed to extract exposure from text.")
      setProcessingStatus("Error")
      toast.error("Failed to extract text via AI")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle batch analysis submission
  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError(null)

    // Artificial delay for UX to show risk engine processing steps
    await new Promise(resolve => setTimeout(resolve, 4500))

    try {
      const result = await analyzeExposures(exposures)
      if (result && result.exposures) {
        // Merge analyzed financial values into exposures list
        const updatedExposures = exposures.map((exp) => {
          const analyzedMatch = result.exposures.find(
            (a) => a.counterparty === exp.counterparty && a.currency === exp.currency
          )
          if (analyzedMatch) {
            return {
              ...exp,
              inr_exposure: analyzedMatch.current_inr_exposure,
              risk_score: analyzedMatch.risk_score,
              risk_level: analyzedMatch.risk_level,
            }
          }
          return exp
        })

        setExposures(updatedExposures)
        setLiveExposures(updatedExposures)
        setIsAnalyzed(true)

        // Calculate aggregate risk score for dashboard
        const totalScore = updatedExposures.reduce((acc, exp) => acc + (exp.risk_score || 0), 0)
        const avgScore = Math.round(totalScore / updatedExposures.length)
        setLiveRiskScore(avgScore)
        setLiveRiskLevel(avgScore >= 80 ? "HIGH" : avgScore >= 60 ? "MEDIUM" : "LOW")

        // Fetch real historical volatility for the primary exposure to populate Stress Testing
        const primary = updatedExposures.find(e => e.status === "Valid") || updatedExposures[0]
        if (primary) {
          try {
            const volData = await calculateVolatility(primary.currency, "INR", 30, primary.amount)
            setLiveVolatility({ ...volData, currency: primary.currency, amount: primary.amount })
          } catch(e) {
            console.error("Volatility fetch failed", e)
          }
        }
        
        toast.success("Risk engine analysis completed")
      }
    } catch (err) {
      setError(err.message || "Financial analysis execution failed.")
      toast.error("Financial analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Reset entire state
  const handleReset = () => {
    setUploadedFile(null)
    setExposures([])
    setRejectedRows([])
    setRowsProcessed(0)
    setAcceptedRows(0)
    setProcessingStatus("Ready")
    setColumnMapping(null)
    setIsAnalyzed(false)
    setError(null)
  }

  // Header Refresh button handler
  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  const hasData = exposures.length > 0
  
  // Extract primary exposure properties for live UI display
  const primaryExposure = exposures.find(e => e.status === "Valid") || exposures[0] || {}
  const liveBaseRate = primaryExposure.base_rate
  const liveCurrency = primaryExposure.currency || "USD"

  return (
    <div className="space-y-6 pb-12">
      {/* Page Actions Bar */}
      <div className="flex items-center justify-end gap-2 pb-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const fileInput = document.getElementById("exposure-file-input")
            if (fileInput) fileInput.click()
          }}
          className="h-8 gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
        >
          <UploadCloud className="h-3.5 w-3.5 text-blue-500" />
          <span>Upload File</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
          aria-label="Refresh Exposure Data"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-blue-600 dark:text-blue-400 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {/* 2. Processing Summary (4 Bento KPI Cards) */}
      <ExposureSummary
        rowsProcessed={rowsProcessed}
        acceptedRows={acceptedRows}
        rejectedRowsCount={rejectedRows.length}
        status={processingStatus}
      />

      {/* 3. Main Workflow Section */}
      <div className="space-y-5">
        {/* Upload Component */}
        <ExposureUpload
          onFileSelected={handleFileSelected}
          onExtractText={handleExtractText}
          uploadedFile={uploadedFile}
          isProcessing={isProcessing}
          error={error}
          columnMapping={columnMapping}
          onReset={handleReset}
        />

        {/* If no data yet, show helpful empty state prompt */}
        {!hasData && (
          <BentoCard className="p-8 text-center flex flex-col items-center justify-center border-dashed">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-3">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No exposure data yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
              Upload a CSV or XLSX file above to begin analyzing your financial exposure.
            </p>
          </BentoCard>
        )}

        {/* When data exists: Show Exposure Data Table */}
        {hasData && (
          <ExposureTable
            exposures={exposures}
            isAnalyzed={isAnalyzed}
          />
        )}

        {/* Validation Issues Card (conditional: shown only when rejected rows exist) */}
        {rejectedRows.length > 0 && (
          <ValidationIssues rejectedRows={rejectedRows} />
        )}

        {/* Analyze Exposures CTA & Transition Status Banner */}
        {hasData && (
          <AnalysisStatus
            validCount={acceptedRows}
            isAnalyzing={isAnalyzing}
            isAnalyzed={isAnalyzed}
            analyzedCount={acceptedRows}
            onAnalyze={handleAnalyze}
            onResetAnalysis={() => setIsAnalyzed(false)}
            liveRate={liveBaseRate}
            liveCurrency={liveCurrency}
            exposures={exposures}
          />
        )}
      </div>

      {/* 4. Financial Disclaimer Footnote */}
      <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 text-xs text-slate-500 dark:text-slate-400">
        <Info className="h-4 w-4 text-blue-500 shrink-0" />
        <p className="leading-relaxed">
          <strong>Batch Ingestion Protocol:</strong> All exposure amounts and settlement calendars are processed in accordance with corporate risk governance standards. Financial valuations are computed by the HedgeMind risk engine.
        </p>
      </div>
    </div>
  )
}

export default ExposurePage
