import React from 'react';
import { Database, CheckCircle2, ShieldCheck, X, Layers, AlertCircle, ArrowRight } from 'lucide-react';
import { DataSourceStatus } from '../types/index.js';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: DataSourceStatus | null;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  onClose,
  status
}) => {
  if (!isOpen || !status) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-mono">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-bold text-white tracking-wider">
              Data Adapter Architecture & Interchangeability (Section 2 & 21)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Data Ready Statement */}
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 mb-4 font-sans leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 text-cyan-300 font-mono text-xs uppercase mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Zero Frontend & Engine Modification Guarantee
          </div>
          All feeds (Bank ISO 20022 APIs, UPI Switch streams, CSV audits, webhooks, or local demo JSON) are 
          converted into the exact same <strong>Normalized Transaction Schema</strong> by their respective adapters. 
          Switching from demo data to real authorized enterprise feeds only requires toggling <code className="bg-slate-950 px-1 py-0.5 rounded text-cyan-300">DATA_SOURCE=bank</code> in the environment.
        </div>

        {/* 7 Layer Diagram Box */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] mb-4 text-slate-300">
          <div className="text-[10px] uppercase text-slate-500 font-bold mb-2">7-Layer Pipeline Flow:</div>
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Data Source</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">Data Adapter Layer</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Normalized Schema</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Entity Resolution</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Fraud Graph</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">Cluster Engine</span>
            <span className="text-slate-600">→</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">UI</span>
          </div>
        </div>

        {/* Adapters List */}
        <div className="space-y-2 mb-4 max-h-56 overflow-y-auto pr-1">
          {status.availableAdapters.map((ad) => (
            <div
              key={ad.id}
              className={`p-3 rounded-xl border transition ${
                ad.active
                  ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'bg-slate-950/60 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">{ad.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {ad.type}
                  </span>
                </div>
                <div>
                  {ad.active ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      ACTIVE RUNTIME
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      READY FOR CONFIG
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">{ad.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <span>Active Adapter: <strong className="text-cyan-300">{status.activeAdapter}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
