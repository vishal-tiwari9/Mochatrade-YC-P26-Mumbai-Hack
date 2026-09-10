import React from 'react';
import { Shield, Database, Activity, RefreshCw, Terminal, Eye } from 'lucide-react';
import { DataSourceStatus } from '../types/index.js';

interface NavbarProps {
  dataSourceStatus: DataSourceStatus | null;
  onOpenDataSourceModal: () => void;
  onOpenAuditLogs: () => void;
  onReloadData: () => void;
  isReloading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  dataSourceStatus,
  onOpenDataSourceModal,
  onOpenAuditLogs,
  onReloadData,
  isReloading
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-950/60 bg-[#070b14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Module Badge */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Shield className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Fraud<span className="text-cyan-400">Nexus</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-medium">
                FEATURE 4
              </span>
            </div>
            <p className="text-xs text-slate-400">Coordinated Fraud Cluster Detection Module</p>
          </div>
        </div>

        {/* Center: System Architecture Indicator */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>REAL-DATA READY ARCHITECTURE:</span>
          <span className="text-cyan-300 font-semibold">7-LAYER ISOLATION</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Data Adapter Status Badge */}
          <button
            onClick={onOpenDataSourceModal}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200 bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-400"
            title="Click to view Data Adapter architecture & switchable sources"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">DATA_SOURCE:</span>
            <span className="font-bold text-white uppercase">{dataSourceStatus?.dataSourceEnv || 'DEMO'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </button>

          {/* Reload Data Button */}
          <button
            onClick={onReloadData}
            disabled={isReloading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition disabled:opacity-50"
            title="Reload dataset & re-evaluate clusters"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Reload</span>
          </button>

          {/* Audit Logs */}
          <button
            onClick={onOpenAuditLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="View Investigator Audit Logs"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>
        </div>

      </div>
    </header>
  );
};
