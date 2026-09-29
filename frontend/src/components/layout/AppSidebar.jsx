import React from "react"
import { SidebarNav } from "./SidebarNav"
import { Building2, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AppSidebar({
  className = "",
  isCollapsed = false,
  onToggleCollapse,
  onItemClick,
}) {
  return (
    <aside
      className={`flex h-full w-full flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ${className}`}
    >
      {/* Top Header & Branding */}
      <div>
        <div
          className={`flex items-center border-b border-slate-200 dark:border-slate-800/80 ${
            isCollapsed
              ? "flex-col gap-2 py-4 px-2"
              : "justify-between px-5 py-4"
          }`}
        >
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-900/30 text-white font-bold text-lg">
              H
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                    HedgeMind
                  </span>
                  <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                    COPILOT
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight truncate">
                  Corporate Financial Risk
                </span>
              </div>
            )}
          </div>

          {/* Hamburger / Toggle Collapse Button */}
          {onToggleCollapse && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  >
                    {isCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Engine Status Pill */}
        {!isCollapsed ? (
          <div className="mx-4 my-3 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                AI Risk Engine
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/20 dark:border-emerald-800/40">
              ACTIVE
            </span>
          </div>
        ) : (
          <div className="flex justify-center my-3">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  AI Risk Engine: ACTIVE
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Navigation List */}
        <div className="mt-2">
          <SidebarNav isCollapsed={isCollapsed} onItemClick={onItemClick} />
        </div>
      </div>

      {/* Bottom Account / Session Context */}
      <div className={`border-t border-slate-200 dark:border-slate-800/80 ${isCollapsed ? "p-2" : "p-4"}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-semibold text-slate-900 dark:text-slate-200">
                Corporate Treasury Desk
              </span>
              <span className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                Enterprise Multi-Currency
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Corporate Treasury Desk
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </aside>
  )
}

export default AppSidebar
