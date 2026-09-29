import React, { useState } from "react"
import { Menu, PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./AppSidebar"
import { useNavigation } from "@/context/NavigationContext"

export const pageTitles = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Financial risk overview",
  },
  exposure: {
    title: "Exposure",
    subtitle: "Foreign exchange & market exposure mapping",
  },
  "risk-analysis": {
    title: "Risk Analysis",
    subtitle: "Value at Risk & stress analytics",
  },
  scenarios: {
    title: "Scenarios",
    subtitle: "Simulate market movements and financial impact",
  },
  "hedge-advisor": {
    title: "Hedge Advisor",
    subtitle: "AI-assisted risk mitigation strategies",
  },
  charts: {
    title: "Charts",
    subtitle: "Financial risk visualizations and exposure insights",
  },
  alerts: {
    title: "Alerts",
    subtitle: "Monitor critical risk events and threshold breaches",
  },
  reports: {
    title: "Reports",
    subtitle: "Financial risk reports and portfolio summaries",
  },
  settings: {
    title: "Settings",
    subtitle: "Configure your HedgeMind workspace",
  },
}

export function DashboardHeader({
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { activePage } = useNavigation()

  const currentMeta = pageTitles[activePage] || {
    title: activePage.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: "Corporate financial risk platform",
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#060911]/95 px-4 sm:px-6 backdrop-blur-xl transition-colors duration-200">
      {/* Left: Mobile Drawer Trigger, Desktop Collapse Toggle & Page Title + One-line Description */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile menu trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-8 w-8 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900"
              aria-label="Open Mobile Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
            <AppSidebar onItemClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Desktop Hamburger / Collapse Toggle */}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden md:flex h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Global Page Title & One-Line Description */}
        <div className="min-w-0 flex flex-col justify-center">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug truncate">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-tight truncate">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
