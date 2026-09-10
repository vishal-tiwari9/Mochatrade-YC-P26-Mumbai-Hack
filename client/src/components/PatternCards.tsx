import React from 'react';
import { FanOutPattern, FanInPattern, CircularFlowPattern } from '../types';
import { GitFork, Merge, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PatternCardsProps {
  fanOuts: FanOutPattern[];
  fanIns: FanInPattern[];
  circularFlows: CircularFlowPattern[];
  onSelectNode: (nodeId: string) => void;
}

export const PatternCards: React.FC<PatternCardsProps> = ({
  fanOuts,
  fanIns,
  circularFlows,
  onSelectNode
}) => {
  const hasPatterns = fanOuts.length > 0 || fanIns.length > 0 || circularFlows.length > 0;
  if (!hasPatterns) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {/* 1. Fan-Out (Split Pattern) */}
      {fanOuts.length > 0 && (
        <div className="bg-dark-900 border border-amber-500/30 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center space-x-2 text-amber-400 mb-2">
            <GitFork className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Potential Fan-Out Pattern
            </h3>
          </div>
          {fanOuts.map((fo, i) => (
            <div key={i} className="text-xs text-slate-300 space-y-1.5 font-mono">
              <p className="font-sans text-[11px] text-slate-400">{fo.description}</p>
              <div className="bg-dark-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Destinations:</span>
                <span className="text-amber-300 font-bold">{fo.destinationsCount} Accounts</span>
              </div>
              <div className="bg-dark-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Total Outgoing:</span>
                <span className="text-emerald-400 font-bold">₹{fo.totalOutgoing.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 pt-1">
                {fo.destinations.map(d => (
                  <button
                    key={d}
                    onClick={() => onSelectNode(d)}
                    className="text-[10px] bg-dark-800 hover:bg-dark-700 px-1.5 py-0.5 rounded text-cyan-300 font-mono"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Fan-In (Consolidation Pattern) */}
      {fanIns.length > 0 && (
        <div className="bg-dark-900 border border-blue-500/30 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center space-x-2 text-blue-400 mb-2">
            <Merge className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Potential Fund Consolidation
            </h3>
          </div>
          {fanIns.map((fi, i) => (
            <div key={i} className="text-xs text-slate-300 space-y-1.5 font-mono">
              <p className="font-sans text-[11px] text-slate-400">{fi.description}</p>
              <div className="bg-dark-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Feeder Sources:</span>
                <span className="text-blue-300 font-bold">{fi.sourcesCount} Accounts</span>
              </div>
              <div className="bg-dark-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Total Consolidated:</span>
                <span className="text-emerald-400 font-bold">₹{fi.totalIncoming.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1 pt-1">
                {fi.sources.map(s => (
                  <button
                    key={s}
                    onClick={() => onSelectNode(s)}
                    className="text-[10px] bg-dark-800 hover:bg-dark-700 px-1.5 py-0.5 rounded text-blue-300 font-mono"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Circular Flow Pattern */}
      {circularFlows.length > 0 && (
        <div className="bg-dark-900 border border-rose-500/30 rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <div className="flex items-center space-x-2 text-rose-400 mb-2">
            <RefreshCw className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Potential Circular Money Flow
            </h3>
          </div>
          {circularFlows.slice(0, 1).map((cf, i) => (
            <div key={i} className="text-xs text-slate-300 space-y-1.5 font-mono">
              <p className="font-sans text-[11px] text-slate-400">{cf.description}</p>
              <div className="bg-dark-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Cycle Length:</span>
                <span className="text-rose-300 font-bold">{cf.cycleLength} Hops (Loop)</span>
              </div>
              <div className="bg-dark-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Total Round-Tripped:</span>
                <span className="text-emerald-400 font-bold">₹{cf.totalCycleAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-dark-950 p-2 rounded border border-slate-800 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Time Span:</span>
                <span className="text-slate-300 font-bold">{cf.timeSpanMinutes} Minutes</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
