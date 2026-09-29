import React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { ArrowUpRight, ArrowDownRight, Coins } from "lucide-react"

export function CurrencyExposure({ currencies = [] }) {
  // Demo fallback
  const items = currencies.length
    ? currencies
    : [
        {
          id: "curr-usd",
          currency: "USD",
          exposure: "₹8.2 Cr",
          risk: "High",
          riskBadgeVariant: "destructive",
          change: "+8.2%",
          direction: "up",
        },
        {
          id: "curr-eur",
          currency: "EUR",
          exposure: "₹3.1 Cr",
          risk: "Medium",
          riskBadgeVariant: "warning",
          change: "+2.1%",
          direction: "up",
        },
        {
          id: "curr-gbp",
          currency: "GBP",
          exposure: "₹1.2 Cr",
          risk: "Low",
          riskBadgeVariant: "safe",
          change: "-1.4%",
          direction: "down",
        },
      ]

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.1)" className="flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Currency Exposure
            </h3>
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              3 ACTIVE
            </span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
            <Coins className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Net open foreign currency positions versus INR.
        </p>

        {/* Currency Table */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">Currency</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">Exposure</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">Risk</TableHead>
                <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5 text-right">Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => {
                const isPositive = c.direction === "up"
                return (
                  <TableRow
                    key={c.id || c.currency}
                    className="border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Currency */}
                    <TableCell className="font-semibold text-slate-900 dark:text-white py-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-200 dark:bg-slate-800 text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold border border-slate-300 dark:border-slate-700/60">
                          {c.currency}
                        </span>
                        <span className="font-medium text-xs text-slate-800 dark:text-slate-200">
                          {c.pair || `${c.currency}/INR`}
                        </span>
                      </div>
                    </TableCell>

                    {/* Exposure */}
                    <TableCell className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200 py-3">
                      {c.exposure}
                    </TableCell>

                    {/* Risk Badge */}
                    <TableCell className="py-3">
                      <Badge
                        variant={c.riskBadgeVariant || (c.risk === "High" ? "destructive" : c.risk === "Medium" ? "warning" : "safe")}
                        className="text-[10px] px-2 py-0.5 font-mono uppercase"
                      >
                        {c.risk}
                      </Badge>
                    </TableCell>

                    {/* Change */}
                    <TableCell className="text-right font-mono text-xs font-semibold py-3">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPositive ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {c.change}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500 flex justify-between">
        <span>Base Currency: INR (₹)</span>
        <span className="text-slate-600 dark:text-slate-400">Next Rebalance: 15 Sep</span>
      </div>
    </BentoCard>
  )
}

export default CurrencyExposure
