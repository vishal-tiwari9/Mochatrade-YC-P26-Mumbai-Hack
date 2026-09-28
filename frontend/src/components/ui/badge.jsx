import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border border-blue-500/30 bg-blue-500/10 text-blue-400",
        secondary:
          "border border-slate-700 bg-slate-800/80 text-slate-300",
        destructive:
          "border border-red-500/30 bg-red-500/15 text-red-400 font-semibold",
        warning:
          "border border-amber-500/30 bg-amber-500/15 text-amber-300 font-semibold",
        safe:
          "border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 font-semibold",
        info:
          "border border-sky-500/30 bg-sky-500/15 text-sky-300",
        outline:
          "border border-slate-700 text-slate-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
