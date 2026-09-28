import React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

const statusConfig = {
  Ready: {
    variant: "safe",
    icon: CheckCircle2,
    label: "Ready",
  },
  Generating: {
    variant: "default",
    icon: Loader2,
    label: "Generating",
    animate: true,
  },
  Failed: {
    variant: "destructive",
    icon: XCircle,
    label: "Failed",
  },
}

export function ReportStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.Ready
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon
        className={`h-3 w-3 ${config.animate ? "animate-spin" : ""}`}
      />
      {config.label}
    </Badge>
  )
}
