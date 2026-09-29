import React from "react"
import { cn } from "@/lib/utils"

export function Spotlight({ className, fill = "#3b82f6" }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute -top-40 left-1/4 -z-10 h-[380px] w-[550px] opacity-10 dark:opacity-20 blur-[120px] transition-all duration-1000",
        className
      )}
      style={{
        background: `radial-gradient(circle, ${fill} 0%, rgba(59, 130, 246, 0.05) 50%, transparent 80%)`,
      }}
    />
  )
}

export default Spotlight
