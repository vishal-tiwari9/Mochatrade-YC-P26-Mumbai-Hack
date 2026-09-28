import React, { useState, useEffect } from "react"
import { AppSidebar } from "./AppSidebar"
import { DashboardHeader } from "./DashboardHeader"
import { Spotlight } from "@/components/aceternity/Spotlight"

export function MainLayout({
  children,
  selectedPeriod,
  onPeriodChange,
  onRefresh,
  isRefreshing,
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hedgemind_sidebar_collapsed")
      return stored === "true"
    }
    return false
  })

  useEffect(() => {
    try {
      localStorage.setItem("hedgemind_sidebar_collapsed", isCollapsed ? "true" : "false")
    } catch (e) {
      console.warn("Unable to save sidebar state to localStorage", e)
    }
  }, [isCollapsed])

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 dark:bg-[#060911] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
      {/* Subtle enterprise background spotlight */}
      <Spotlight fill="#3b82f6" />

      {/* Desktop Fixed Left Sidebar */}
      <div
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:w-20" : "md:w-64 lg:w-72"
        }`}
      >
        <AppSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main Content Area - Fluidly expands when sidebar collapses */}
      <div
        className={`flex flex-1 flex-col w-full min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:pl-20" : "md:pl-64 lg:pl-72"
        }`}
      >
        <DashboardHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default MainLayout
