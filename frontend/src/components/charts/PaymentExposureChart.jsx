import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts"
import { BentoCard } from "@/components/aceternity/BentoCard"
import { Calendar, Wallet, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function CustomPaymentTimelineTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg dark:shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Calendar className="h-3 w-3 text-slate-400" />
          <span>Due: {label}</span>
        </div>
        <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-1.5">
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Payment Obligation
          </div>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-white">
            ₹{data.amount.toFixed(2)} Cr
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3 text-[10px] font-mono text-slate-600 dark:text-slate-400">
          <span>Supplier: {data.supplier}</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{data.currency}</span>
        </div>
      </div>
    )
  }
  return null
}

export function PaymentExposureChart({ paymentData = [] }) {
  const data = paymentData.length ? paymentData : []

  return (
    <BentoCard glowColor="rgba(59, 130, 246, 0.1)" className="flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Upcoming Payment Exposure
            </h3>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
              5 Payments
            </Badge>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Estimated cash outflow exposure across payment due dates.
        </p>
      </div>

      {/* Bar Chart */}
      <div className="h-56 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#64748b"
              vertical={false}
              opacity={0.15}
            />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#64748b", opacity: 0.2 }}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}Cr`}
            />

            <Tooltip content={<CustomPaymentTimelineTooltip />} />

            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`pay-${index}`}
                  fill={entry.currency === "USD" ? "#3b82f6" : entry.currency === "EUR" ? "#10b981" : "#f59e0b"}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 pt-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-blue-500" />
          <span>Window: Sep 12 - Sep 28</span>
        </span>
        <span className="font-mono text-slate-700 dark:text-slate-400">Total: ₹9.54 Cr</span>
      </div>
    </BentoCard>
  )
}

export default PaymentExposureChart
