import React from "react"
import { cn } from "@/lib/utils"

export function BentoCard({
  children,
  className,
  glowColor = "rgba(59, 130, 246, 0.08)",
  ...props
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/60 p-5 text-slate-900 dark:text-slate-100 shadow-sm dark:shadow-lg backdrop-blur-md transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/90 hover:shadow-md dark:hover:shadow-xl dark:hover:shadow-blue-950/20",
        className
      )}
      {...props}
    >
      {/* Subtle top inner gradient accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 dark:via-slate-700/40 to-transparent transition-opacity group-hover:via-blue-500/40"
      />
      {/* Subtle ambient corner glow on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at top right, ${glowColor}, transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}

export default BentoCard
