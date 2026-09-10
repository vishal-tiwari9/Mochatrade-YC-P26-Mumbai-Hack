import React, { useEffect, useState } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import { X, Clock, ShieldCheck } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getAuditLogs()
        .then(data => setLogs(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Forensic Investigation Audit Trail</h2>
              <span className="text-[10px] text-slate-400 font-mono">Immutable Action Ledger</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 max-h-96 overflow-y-auto space-y-2 font-mono text-xs">
          {loading ? (
            <div className="py-10 text-center text-slate-400">Loading audit events...</div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-slate-500">No audit events logged yet.</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-3 bg-dark-950 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cyan-400 font-bold">{log.action}</span>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-slate-300 text-[11px]">Target: {log.target}</div>
                <div className="text-slate-500 text-[10px] truncate">
                  Details: {JSON.stringify(log.details)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-dark-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-semibold text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
