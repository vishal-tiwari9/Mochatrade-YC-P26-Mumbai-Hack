import React from 'react';
import { Terminal, X, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { AuditLogEntry } from '../types/index.js';

interface AuditLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
  onRefresh: () => void;
}

export const AuditLogDrawer: React.FC<AuditLogDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onRefresh
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#090d16] border-l border-slate-800 shadow-2xl p-6 flex flex-col font-mono animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs uppercase font-bold text-white tracking-wider">
            Investigator Audit Trail
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            title="Refresh logs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtext */}
      <p className="text-[11px] text-slate-400 my-3 font-sans">
        Immutable, compliance-grade logging of all investigation interactions, queries, simulations, and evidence exports.
      </p>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {logs.length === 0 ? (
          <div className="text-center text-slate-600 text-xs py-8">No audit events recorded yet.</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-cyan-300">{log.action}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-1">
                <span>Actor: {log.actor}</span>
                {log.clusterId && (
                  <span className="text-cyan-400 font-bold">Target: {log.clusterId}</span>
                )}
              </div>
              {log.details && Object.keys(log.details).length > 0 && (
                <div className="p-1.5 bg-slate-950 rounded border border-slate-900 text-[10px] text-slate-400 overflow-x-auto">
                  <pre className="font-mono">{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 text-center">
        Security & Privacy: Identifiers hashed. Zero PII exposure.
      </div>

    </div>
  );
};
