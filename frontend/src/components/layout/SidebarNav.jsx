import React from "react"
import {
  LayoutDashboard,
  Wallet,
  ShieldAlert,
  SlidersHorizontal,
  GitBranch,
  ChartNoAxesCombined,
  Bell,
  FileText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigation } from "@/context/NavigationContext"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export const navItems = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    id: "exposure",
    title: "Exposure",
    icon: Wallet,
    badge: null,
  },
  {
    id: "risk-analysis",
    title: "Risk Analysis",
    icon: ShieldAlert,
    badge: null,
  },
]

export const bottomNavItems = [
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
  },
]

export function SidebarNav({ isCollapsed = false, onItemClick }) {
  const { activePage, navigate } = useNavigation()

  const handleItemClick = (id) => {
    navigate(id)
    if (onItemClick) {
      onItemClick(id)
    }
  }

  const renderItem = (item) => {
    const Icon = item.icon
    const isActive = activePage === item.id

    const buttonElement = (
      <button
        type="button"
        onClick={() => handleItemClick(item.id)}
        className={cn(
          "group flex w-full items-center rounded-lg transition-all duration-150 cursor-pointer select-none",
          isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2.5 text-sm font-medium",
          isActive
            ? "bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
        )}
        aria-label={item.title}
      >
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              isActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
            )}
          />
          {!isCollapsed && <span className="truncate">{item.title}</span>}
        </div>

        {!isCollapsed && item.badge && (
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
              isActive
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-300"
                : item.badge === "Live"
                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                : item.badge === "7"
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            )}
          >
            {item.badge}
          </span>
        )}
      </button>
    )

    if (isCollapsed) {
      return (
        <TooltipProvider key={item.id} delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonElement}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium text-xs">
              {item.title}
              {item.badge && <span className="ml-1.5 opacity-75">({item.badge})</span>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return <div key={item.id}>{buttonElement}</div>
  }

  return (
    <div className="flex flex-1 flex-col justify-between space-y-4">
      {/* Primary Navigation */}
      <nav className={cn("space-y-1.5", isCollapsed ? "px-2" : "px-3")}>
        {!isCollapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Core Platform
          </p>
        )}
        {navItems.map(renderItem)}
      </nav>

      {/* Bottom Nav / Settings */}
      <div className={cn("pt-4 border-t border-slate-200 dark:border-slate-800/80", isCollapsed ? "px-2" : "px-3")}>
        {!isCollapsed && (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            System
          </p>
        )}
        {bottomNavItems.map(renderItem)}
      </div>
    </div>
  )
}

export default SidebarNav
