import React from 'react';
import { Transaction } from '../types';
import { Clock, ArrowDown, CheckCircle, ShieldAlert } from 'lucide-react';

interface PathTimelineProps {
  transactions: Transaction[];
  totalDurationMinutes: number;
}

export const PathTimeline: React.FC<PathTimelineProps> = ({
  transactions,
  totalDurationMinutes
}) => {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Temporal Hop Interval Analysis
          </h2>
        </div>
        <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
          Total: {totalDurationMinutes} min
        </span>
      </div>

      <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800 before:z-0">
        {transactions.map((tx, idx) => {
          const dateObj = new Date(tx.timestamp);
          const timeStr = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const dateStr = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

          let diffText = '0 min (Initiation)';
          let isRapid = false;

          if (idx > 0) {
            const prevTime = new Date(transactions[idx - 1].timestamp).getTime();
            const currTime = dateObj.getTime();
            const mins = Math.max(0, Math.round((currTime - prevTime) / 60000));
            diffText = `+${mins} min interval`;
            isRapid = mins <= 5;
          }

          return (
            <div key={tx.transactionId} className="relative z-10 flex items-start space-x-3 pl-1">
              {/* Dot Icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                idx === 0 
                  ? 'bg-blue-900 border-blue-400 text-blue-200' 
                  : idx === transactions.length - 1 
                  ? 'bg-red-900 border-red-400 text-red-200'
                  : 'bg-dark-800 border-slate-600 text-slate-300'
              }`}>
                {idx + 1}
              </div>

              {/* Event Content Card */}
              <div className="flex-1 bg-dark-950 border border-slate-800/80 rounded-lg p-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-300">{timeStr}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({dateStr})</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    isRapid 
                      ? 'bg-red-950/60 border-red-500/40 text-red-400' 
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}>
                    {diffText}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <div className="font-mono text-slate-300">
                    <span className="text-cyan-400">{tx.senderAccountId}</span>
                    <span className="text-slate-500 mx-1">→</span>
                    <span className="text-rose-400">{tx.receiverAccountId}</span>
                  </div>
                  <span className="font-mono font-extrabold text-emerald-400">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-[10px] text-slate-400 bg-dark-950/60 p-2 rounded border border-slate-800 flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Hops with intervals under 5 minutes suggest automated execution scripts or coordinated mule transfers.</span>
      </div>
    </div>
  );
};
