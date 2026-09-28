import React from "react"
import { Moon, Sun, Palette, CheckCircle2, Shield, Monitor } from "lucide-react"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/context/ThemeContext"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Appearance Section */}
      <BentoCard className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your preferred color theme for HedgeMind treasury workstation.
            </p>
          </div>
        </div>

        {/* Theme Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Theme Mode
            </label>
            <span className="text-xs text-slate-400 font-mono">
              Active: <strong className="text-blue-500 capitalize">{theme}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DARK THEME CARD */}
            <div
              onClick={() => setTheme("dark")}
              className={`group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 shadow-md ring-1 ring-blue-500/40"
                  : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      theme === "dark"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Dark Theme
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        DEFAULT
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Standard treasury desk mode
                    </span>
                  </div>
                </div>

                {/* Selection Indicator */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                    theme === "dark"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-transparent"
                  }`}
                >
                  {theme === "dark" && <CheckCircle2 className="h-4 w-4 fill-blue-500 text-white" />}
                </div>
              </div>

              {/* Dark Mode Mini Mockup Preview */}
              <div className="mt-4 rounded-lg border border-slate-800 bg-[#060911] p-2.5 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span className="h-1.5 w-12 rounded bg-slate-700"></span>
                  </div>
                  <span className="h-1.5 w-6 rounded bg-slate-700"></span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="rounded bg-[#0c1322] border border-slate-800 p-1.5">
                    <div className="h-1 w-8 rounded bg-slate-600 mb-1"></div>
                    <div className="h-2 w-10 rounded bg-blue-400 font-mono"></div>
                  </div>
                  <div className="rounded bg-[#0c1322] border border-slate-800 p-1.5">
                    <div className="h-1 w-8 rounded bg-slate-600 mb-1"></div>
                    <div className="h-2 w-10 rounded bg-red-400 font-mono"></div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Obsidian and deep slate surfaces engineered for low-glare financial trading desk environments.
              </p>
            </div>

            {/* LIGHT THEME CARD */}
            <div
              onClick={() => setTheme("light")}
              className={`group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                theme === "light"
                  ? "border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 shadow-md ring-1 ring-blue-500/40"
                  : "border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                      theme === "light"
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Light Theme
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Daylight office & boardroom mode
                    </span>
                  </div>
                </div>

                {/* Selection Indicator */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                    theme === "light"
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-slate-300 dark:border-slate-600 bg-transparent"
                  }`}
                >
                  {theme === "light" && <CheckCircle2 className="h-4 w-4 fill-blue-500 text-white" />}
                </div>
              </div>

              {/* Light Mode Mini Mockup Preview */}
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-2.5 space-y-1.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                    <span className="h-1.5 w-12 rounded bg-slate-300"></span>
                  </div>
                  <span className="h-1.5 w-6 rounded bg-slate-300"></span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className="rounded bg-white border border-slate-200 p-1.5 shadow-xs">
                    <div className="h-1 w-8 rounded bg-slate-400 mb-1"></div>
                    <div className="h-2 w-10 rounded bg-blue-600 font-mono"></div>
                  </div>
                  <div className="rounded bg-white border border-slate-200 p-1.5 shadow-xs">
                    <div className="h-1 w-8 rounded bg-slate-400 mb-1"></div>
                    <div className="h-2 w-10 rounded bg-red-600 font-mono"></div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                Crisp daylight surfaces with high-contrast borders designed for well-lit workspaces and presentations.
              </p>
            </div>
          </div>
        </div>

        {/* Persistence Confirmation */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Theme choice persists in browser storage across sessions.</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">localStorage: hedgemind_theme</span>
        </div>
      </BentoCard>
    </div>
  )
}

export default SettingsPage
