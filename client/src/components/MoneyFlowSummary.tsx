import React from 'react';
import { MoneyFlowPath } from '../types';
import { IndianRupee, ArrowRight, Clock, Network, AlertTriangle, Layers, Hash } from 'lucide-react';

interface MoneyFlowSummaryProps {
  path: MoneyFlowPath | null;
}

export const MoneyFlowSummary: React.FC<MoneyFlowSummaryProps> = ({ path }) => {
  if (!path) return null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-400 border-red-500/50 shadow-red-900/30';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-400 border-orange-500/50 shadow-orange-900/30';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50 shadow-amber-900/30';
      default:
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-emerald-900/30';
    }
  };

  const intermediariesCount = Math.max(0, path.nodes.length - 2);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
      {/* 1. Total Amount */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <IndianRupee className="w-3.5 h-3.5 text-cyan-400" />
          <span>Total Amount</span>
        </span>
        <div className="mt-1.5">
          <div className="text-base font-mono font-extrabold text-cyan-300">
            ₹{path.totalAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-500">Traced volume</span>
        </div>
      </div>

      {/* 2. Transactions Count */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Hash className="w-3.5 h-3.5 text-blue-400" />
          <span>Transactions</span>
        </span>
        <div className="mt-1.5">
          <div className="text-base font-mono font-extrabold text-slate-100">
            {path.transactionCount}
          </div>
          <span className="text-[10px] text-slate-500">Transfers executed</span>
        </div>
      </div>

      {/* 3. Hop Count */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Hop Count</span>
        </span>
        <div className="mt-1.5">
          <div className="text-base font-mono font-extrabold text-indigo-300">
            {path.hopCount} {path.hopCount === 1 ? 'Hop' : 'Hops'}
          </div>
          <span className="text-[10px] text-slate-500">Traversal depth</span>
        </div>
      </div>

      {/* 4. Propagation Time */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Time Taken</span>
        </span>
        <div className="mt-1.5">
          <div className="text-base font-mono font-extrabold text-amber-300">
            {path.durationMinutes} min
          </div>
          <span className="text-[10px] text-slate-500">Propagation span</span>
        </div>
      </div>

      {/* 5. Intermediaries */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Network className="w-3.5 h-3.5 text-purple-400" />
          <span>Intermediaries</span>
        </span>
        <div className="mt-1.5">
          <div className="text-base font-mono font-extrabold text-purple-300">
            {intermediariesCount} Nodes
          </div>
          <span className="text-[10px] text-slate-500">Mules / Layerers</span>
        </div>
      </div>

      {/* 6. Source Account */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Source Origin
        </span>
        <div className="mt-1.5">
          <div className="text-xs font-mono font-bold text-slate-200 truncate" title={path.sourceEntity}>
            {path.sourceEntity}
          </div>
          <span className="text-[10px] text-slate-500 truncate block">
            {path.sourceLabel.split('(')[0]}
          </span>
        </div>
      </div>

      {/* 7. Final Destination */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          Final Destination
        </span>
        <div className="mt-1.5">
          <div className="text-xs font-mono font-bold text-rose-300 truncate" title={path.destinationEntity}>
            {path.destinationEntity}
          </div>
          <span className="text-[10px] text-slate-500 truncate block">
            {path.destinationLabel.split('(')[0]}
          </span>
        </div>
      </div>

      {/* 8. Risk Assessment */}
      <div className="bg-dark-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Risk Level</span>
        </span>
        <div className="mt-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-mono font-extrabold text-white">
              {path.riskScore}/100
            </span>
          </div>
          <span className={`inline-block px-1.5 py-0.5 mt-0.5 rounded text-[9px] font-extrabold tracking-wider border shadow-sm ${getRiskBadge(path.riskLevel)}`}>
            {path.riskLevel}
          </span>
        </div>
      </div>
    </div>
  );
};
