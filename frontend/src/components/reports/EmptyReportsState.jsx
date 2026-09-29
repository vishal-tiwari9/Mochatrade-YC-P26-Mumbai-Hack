import React from "react"
import { FileText, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BentoCard } from "@/components/aceternity/BentoCard"

export function EmptyReportsState({ onGenerate }) {
  return (
    <BentoCard className="flex flex-col items-center justify-center text-center py-16 px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5 mb-6">
        <FileText className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-2">
        No reports generated yet
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-6">
        Create your first financial risk report from your current HedgeMind portfolio data.
        Reports provide formal documentation of your risk analysis and exposure position.
      </p>

      <Button
        size="sm"
        onClick={onGenerate}
        className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
      >
        <FilePlus className="h-3.5 w-3.5" />
        Generate Report
      </Button>
    </BentoCard>
  )
}
