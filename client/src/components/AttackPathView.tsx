import React from 'react';
import { MoneyFlowPath, PathNode } from '../types';
import { ArrowRight, ShieldAlert, AlertTriangle, CheckCircle, Info, Building2, Smartphone } from 'lucide-react';

interface AttackPathViewProps {
  path: MoneyFlowPath | null;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId: string | null;
}

export const AttackPathView: React.FC<AttackPathViewProps> = ({
  path,
  onSelectNode,
  selectedNodeId
}) => {
  if (!path || path.nodes.length === 0) return null;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'source':
        return 'bg-blue-950/80 border-blue-500/60 text-blue-300';
      case 'mule':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
      case 'intermediate':
        return 'bg-purple-950/80 border-purple-500/60 text-purple-300';
      case 'consolidation':
        return 'bg-pink-950/80 border-pink-500/60 text-pink-300';
      case 'destination':
        return 'bg-red-950/80 border-red-500/60 text-red-300';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-5 shadow-2xl mb-4">
      {/* Header & Advisory Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Attack Path Forensic Role Sequence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Classified topological progression from originating compromise through intermediary layerers to destination.
          </p>
        </div>

        {/* Legal / Policy Compliance Tag */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Investigative designations require regulatory verification prior to legal action.</span>
        </div>
      </div>

      {/* Horizontal / Wrapped Attack Progression Pipeline */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 overflow-x-auto pb-2">
        {path.nodes.map((node: PathNode, idx: number) => {
          const isSelected = selectedNodeId === node.id;
          const isLast = idx === path.nodes.length - 1;
          const txLeadingToNode = idx > 0 && path.transactions[idx - 1] ? path.transactions[idx - 1] : null;

          return (
            <React.Fragment key={node.id}>
              {/* Connector between nodes with animated transfer flow */}
              {idx > 0 && txLeadingToNode && (
                <div className="flex lg:flex-col items-center justify-center gap-1 my-1 lg:my-0 lg:px-2 shrink-0">
                  <div className="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>₹{txLeadingToNode.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="hidden lg:flex items-center text-cyan-400 font-bold tracking-widest animate-pulse py-0.5">
                    <span className="text-slate-600 text-xs font-mono">────</span>
                    <ArrowRight className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    +{txLeadingToNode.riskScore || 0}% Risk
                  </div>
                </div>
              )}

              {/* Node Card */}
              <div
                onClick={() => onSelectNode(node.id)}
                className={`flex-1 min-w-[200px] p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-dark-850 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-dark-950 hover:bg-dark-850 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Role Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getRoleBadgeStyle(node.role)}`}>
                    {node.roleLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    #{idx + 1}
                  </span>
                </div>

                {/* Account ID & Holder */}
                <div className="text-sm font-mono font-extrabold text-white truncate" title={node.id}>
                  {node.id}
                </div>
                <div className="text-xs text-slate-300 truncate mt-0.5">
                  {node.data?.accountHolder || node.label}
                </div>

                {/* Bank & Details */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1 truncate">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{node.data?.bankName || 'Partner Bank'}</span>
                  </div>
                  <span className={`font-mono font-bold ${node.riskScore > 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                    Risk: {node.riskScore}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
