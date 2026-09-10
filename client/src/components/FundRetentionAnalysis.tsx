import React from 'react';
import { RetentionStage } from '../types';
import { PieChart, ArrowDownRight, IndianRupee, Percent, CheckCircle } from 'lucide-react';

interface FundRetentionAnalysisProps {
  stages: RetentionStage[];
}

export const FundRetentionAnalysis: React.FC<FundRetentionAnalysisProps> = ({ stages }) => {
  if (!stages || stages.length === 0) return null;

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Fund Retention & Amount Transformation
          </h2>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Waterfall Velocity</span>
      </div>

      <p className="text-[11px] text-slate-400 mb-3">
        Quantifies fund decay, transaction fees, and potential mule commission retention along each intermediary hop.
      </p>

      {/* Retention Waterfall Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
              <th className="py-2 px-2.5">Entity / Role</th>
              <th className="py-2 px-2.5 text-right">Received</th>
              <th className="py-2 px-2.5 text-right">Sent Forward</th>
              <th className="py-2 px-2.5 text-right">Retained</th>
              <th className="py-2 px-2.5 text-right">% Retained</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {stages.map((stage) => {
              const passedPercent = stage.received > 0 
                ? Math.round((stage.sent / stage.received) * 100)
                : 0;

              return (
                <tr key={stage.nodeId} className="hover:bg-dark-850/60 transition-colors">
                  <td className="py-2.5 px-2.5 font-sans">
                    <div className="font-bold text-slate-200">{stage.nodeId}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{stage.roleLabel}</div>
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-emerald-400 font-semibold">
                    {stage.received > 0 ? `₹${stage.received.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-2.5 px-2.5 text-right text-cyan-400 font-semibold">
                    {stage.sent > 0 ? `₹${stage.sent.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-semibold">
                    {stage.retained > 0 ? (
                      <span className="text-amber-400">₹{stage.retained.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-slate-500">₹0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5 text-right">
                    {stage.retentionRatePercent > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                        {stage.retentionRatePercent}%
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">0%</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[10px] text-slate-500 italic">
        * Note: Retained balances do not automatically prove fraudulent intent; they reflect residual exposure requiring forensic accounting reconciliation.
      </div>
    </div>
  );
};
