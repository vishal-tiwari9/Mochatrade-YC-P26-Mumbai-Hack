import React from 'react';
import { GitBranch, ShieldAlert, Zap, FileJson, Clock, Database } from 'lucide-react';

interface NavbarProps {
  dataSourceStatus: {
    adapterName: string;
    status: string;
    totalTransactions: number;
    currentEnvSource: string;
  } | null;
  onSimulate: () => void;
  isSimulating: boolean;
  onOpenAuditLogs: () => void;
  onOpenContract: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataSourceStatus,
  onSimulate,
  isSimulating,
  onOpenAuditLogs,
  onOpenContract
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-dark-900/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Module Identification */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 text-lg">
                FRAUDNEXUS
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                FEATURE 6
              </span>
            </div>
            <h1 className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span>Money Flow & Attack Path Investigation</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono text-[11px]">Production Module</span>
            </h1>
          </div>
        </div>

        {/* Action Controls & Data Source Badge */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Data Source Ready Status */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400">SOURCE:</span>
              <span className="text-cyan-300 font-bold uppercase">{dataSourceStatus?.currentEnvSource || 'DEMO'}</span>
            </div>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 pulse-beacon" title="Live/Ready Data Stream" />
          </div>

          {/* Audit Logs Button */}
          <button
            onClick={onOpenAuditLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all shadow-sm"
            title="Inspect Forensic Audit Logs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Audit Trail</span>
          </button>

          {/* Contract Export Button */}
          <button
            onClick={onOpenContract}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-200 hover:text-white text-xs font-medium transition-all shadow-sm"
            title="FraudNexus Section 28 Contract Object"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            <span>Contract Spec</span>
          </button>

          {/* Simulation Trigger Button */}
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            id="simulate-tx-btn"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Incoming Txn'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
