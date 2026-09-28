import React from "react"
import {
  ShieldCheck,
  Wallet,
  Activity,
  FlaskConical,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BentoCard } from "@/components/aceternity/BentoCard"

const iconMap = {
  ShieldCheck,
  Wallet,
  Activity,
  FlaskConical,
}

export function ReportTypeCard({ definition, onGenerate }) {
  const Icon = iconMap[definition.icon] || FileText

  return (
    <BentoCard className="flex flex-col justify-between h-full">
      <div>
        {/* Icon + Tag */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Icon className="h-5 w-5" />
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold border ${definition.tagColor}`}
          >
            {definition.tag}
          </span>
        </div>

        {/* Title + Description */}
        <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white mb-1.5">
          {definition.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          {definition.description}
        </p>
      </div>

      {/* Generate button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onGenerate(definition.id)}
        className="w-full h-8 gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 dark:hover:border-blue-800 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        aria-label={`Generate ${definition.title}`}
      >
        <FileText className="h-3.5 w-3.5" />
        Generate Report
      </Button>
    </BentoCard>
  )
}
