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
import { CalendarDays, Clock } from "lucide-react"

export function UpcomingPayments({ payments = [] }) {
  const items = payments.length
    ? payments
    : [
        {
          id: "pmt-1",
          supplier: "ABC Components",
          currency: "USD",
          amount: "$450K",
          inrEquivalent: "₹3.74 Cr",
          dueDate: "12 Sep",
          status: "Pending Review",
          hedgeStatus: "Unhedged",
        },
        {
          id: "pmt-2",
          supplier: "Global Metals",
          currency: "EUR",
          amount: "€180K",
          inrEquivalent: "₹1.62 Cr",
          dueDate: "15 Sep",
          status: "Forward Locked",
          hedgeStatus: "Partially Hedged",
        },
        {
          id: "pmt-3",
          supplier: "Tech Supplies",
          currency: "USD",
          amount: "$220K",
          inrEquivalent: "₹1.83 Cr",
          dueDate: "18 Sep",
          status: "Approved",
          hedgeStatus: "Option Protected",
        },
      ]

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.08)" className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Upcoming Payments
            </h3>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-600 dark:text-blue-400 border border-blue-500/20">
              NEXT 14 DAYS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-border supplier obligations scheduled for settlement.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Settlement Window: Sep 2026</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800/80 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">
                Supplier
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">
                Currency
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">
                Amount
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">
                INR Value (Est.)
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5">
                Due Date
              </TableHead>
              <TableHead className="text-slate-500 dark:text-slate-400 text-xs font-semibold py-2.5 text-right">
                Hedge Coverage
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((payment) => (
              <TableRow
                key={payment.id || payment.supplier}
                className="border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Supplier */}
                <TableCell className="py-3 font-semibold text-slate-900 dark:text-white text-xs">
                  {payment.supplier}
                </TableCell>

                {/* Currency */}
                <TableCell className="py-3">
                  <span className="inline-flex items-center justify-center rounded bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 border border-slate-300 dark:border-slate-700/60">
                    {payment.currency}
                  </span>
                </TableCell>

                {/* Amount */}
                <TableCell className="py-3 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {payment.amount}
                </TableCell>

                {/* INR Value */}
                <TableCell className="py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {payment.inrEquivalent}
                </TableCell>

                {/* Due Date */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{payment.dueDate}</span>
                  </div>
                </TableCell>

                {/* Hedge Status */}
                <TableCell className="py-3 text-right">
                  <Badge
                    variant={
                      payment.hedgeStatus === "Unhedged"
                        ? "destructive"
                        : payment.hedgeStatus === "Partially Hedged"
                        ? "warning"
                        : "safe"
                    }
                    className="text-[10px] px-2 py-0.5 font-mono"
                  >
                    {payment.hedgeStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>Payment Gateway: Corporate FX Direct</span>
        <span className="text-slate-600 dark:text-slate-400 font-mono">
          Total Scheduled: ₹7.19 Cr
        </span>
      </div>
    </BentoCard>
  )
}

export default UpcomingPayments
