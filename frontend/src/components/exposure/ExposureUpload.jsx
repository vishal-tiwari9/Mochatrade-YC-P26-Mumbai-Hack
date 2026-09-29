import React, { useRef, useState } from "react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Button } from "@/components/ui/button"
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  FileDown,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Wand2,
  FileText,
} from "lucide-react"
import { sampleCsvTemplate } from "@/data/exposure-demo"

export function ExposureUpload({
  onFileSelected,
  onLoadDemo,
  uploadedFile,
  isProcessing = false,
  error = null,
  columnMapping = null,
  onReset,
  onExtractText,
}) {
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadMode, setUploadMode] = useState("file") // "file" or "text"
  const [magicText, setMagicText] = useState("")

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0])
    }
  }

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvTemplate], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "hedgemind_exposure_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <BentoCard
      glowColor="rgba(37, 99, 235, 0.12)"
      className="flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {uploadMode === "file" ? <UploadCloud className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {uploadMode === "file" ? "Upload Exposure Data" : "AI Magic Extract"}
              </h2>
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                STEP 1: INGEST
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {uploadMode === "file" 
                ? "Import your exposure positions from a CSV or Excel spreadsheet for batch validation." 
                : "Paste raw text from emails or invoices, and our AI will automatically extract the exposure."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              className="h-8 gap-1.5 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              title="Download standard CSV schema template"
            >
              <FileDown className="h-3.5 w-3.5 text-slate-400" />
              <span>Sample CSV</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onLoadDemo}
              disabled={isProcessing}
              className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Load Demo Batch</span>
            </Button>
          </div>
        </div>

        {/* Column Mapping Notice Banner */}
        {columnMapping && columnMapping.detected && (
          <div className="mt-3 rounded-lg border border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/30 p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />
              <span>
                <strong>Column mapping detected:</strong>{" "}
                <code className="bg-blue-500/10 px-1 py-0.5 rounded font-mono text-[11px]">
                  {columnMapping.original}
                </code>{" "}
                automatically mapped to{" "}
                <code className="bg-blue-500/10 px-1 py-0.5 rounded font-mono text-[11px]">
                  {columnMapping.mapped}
                </code>
              </span>
            </div>
            <span className="text-[10px] font-mono text-blue-500 uppercase font-semibold">
              Auto-Normalized
            </span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-50/80 dark:bg-red-950/40 p-3 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Validation Error</span>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="text-red-500 hover:text-red-700 p-1"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Mode Toggle & Drop Zone */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setUploadMode("file")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                uploadMode === "file" 
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              File Upload
            </button>
            <button
              onClick={() => setUploadMode("text")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${
                uploadMode === "text" 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Wand2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
              Magic Text Extract
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileInputChange}
            className="hidden"
            id="exposure-file-input"
          />

          {!uploadedFile ? (
            uploadMode === "file" ? (
              /* Empty State / Drag & Drop Area */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]"
                  : "border-slate-300 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-3 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-6 w-6" />
              </div>

              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Drag and drop your file here
              </div>
              <span className="text-xs text-slate-400 my-1">or</span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold mt-1 pointer-events-none"
              >
                Browse Files
              </Button>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="rounded bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5">
                  CSV
                </span>
                <span className="rounded bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5">
                  XLSX
                </span>
                <span>· Max 25 MB</span>
              </div>
            </div>
            ) : (
              /* Text Input Area */
              <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 p-6">
                <textarea
                  className="w-full h-32 p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 placeholder:text-slate-400"
                  placeholder='e.g., "We need to pay our London supplier GBP 45,000 in 30 days."'
                  value={magicText}
                  onChange={(e) => setMagicText(e.target.value)}
                  disabled={isProcessing}
                />
                <Button
                  type="button"
                  onClick={() => onExtractText(magicText)}
                  disabled={isProcessing || !magicText.trim()}
                  className="w-full h-10 gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  <span>Extract Exposure</span>
                </Button>
              </div>
            )
          ) : (
            /* Selected File Card */
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {uploadedFile.filename || uploadedFile.name}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Imported
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    <span>{uploadedFile.fileSize || "14.2 KB"}</span>
                    <span>•</span>
                    <span>{uploadedFile.fileType || "text/csv"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Replace File
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onReset}
                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Text Upload UI */}
          {!uploadedFile && uploadMode === "text" && (
            <div className="space-y-3">
              <textarea
                value={magicText}
                onChange={(e) => setMagicText(e.target.value)}
                placeholder="e.g., We have an upcoming payment of 50,000 EUR to SAP next week..."
                className="w-full min-h-[120px] p-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => onExtractText && onExtractText(magicText)}
                  disabled={isProcessing || !magicText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  size="sm"
                >
                  <Wand2 className="h-4 w-4" />
                  Extract Exposure
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <span>
          Expected schema: <code className="font-mono text-slate-700 dark:text-slate-300">counterparty, currency, amount, days_to_payment</code>
        </span>
        <span className="font-mono text-slate-400">
          Backend validation engine active
        </span>
      </div>
    </BentoCard>
  )
}

export default ExposureUpload
