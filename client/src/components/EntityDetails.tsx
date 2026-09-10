import React, { useEffect, useState } from 'react';
import { Account } from '../types';
import { api } from '../services/api';
import { X, Building2, Smartphone, Hash, ShieldAlert, ArrowRight, ArrowDownLeft, ArrowUpRight, Network, FileText, Search } from 'lucide-react';

interface EntityDetailsProps {
  entityId: string | null;
  onClose: () => void;
  onTraceFromThis: (accountId: string) => void;
}

export const EntityDetails: React.FC<EntityDetailsProps> = ({
  entityId,
  onClose,
  onTraceFromThis
}) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!entityId) {
      setAccount(null);
      return;
    }

    setLoading(true);
    api.getAccount(entityId)
      .then(data => setAccount(data))
      .catch(err => {
        console.error('Failed to load entity details', err);
        setAccount(null);
      })
      .finally(() => setLoading(false));
  }, [entityId]);

  if (!entityId) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-dark-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-950/80">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs">
            ID
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono">{entityId}</h2>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Forensic Entity Dossier</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading entity forensic intelligence...</span>
          </div>
        ) : account ? (
          <>
            {/* Risk & KYC Overview */}
            <div className="bg-dark-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Entity Risk Index</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-extrabold border ${
                  account.riskScore > 80 
                    ? 'bg-red-950 text-red-400 border-red-500/50' 
                    : account.riskScore > 60 
                    ? 'bg-amber-950 text-amber-400 border-amber-500/50' 
                    : 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                }`}>
                  {account.riskScore}/100
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Account Holder:</span>
                <span className="font-bold text-white text-right">{account.accountHolder}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Banking Partner:</span>
                <span className="text-slate-200">{account.bankName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Account Type:</span>
                <span className="font-mono text-cyan-300">{account.accountType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">KYC Status:</span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                  account.kycStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {account.kycStatus}
                </span>
              </div>
            </div>

            {/* Financial Activity Telemetry */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-1 text-emerald-400 text-[10px] font-mono mb-1">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>TOTAL RECEIVED</span>
                </div>
                <div className="font-mono font-bold text-sm text-white">
                  ₹{(account.totalReceived || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {account.incomingTransactionsCount || 0} incoming transfers
                </div>
              </div>

              <div className="bg-dark-950 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-1 text-cyan-400 text-[10px] font-mono mb-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>TOTAL SENT</span>
                </div>
                <div className="font-mono font-bold text-sm text-white">
                  ₹{(account.totalSent || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {account.outgoingTransactionsCount || 0} outgoing transfers
                </div>
              </div>
            </div>

            {/* Forensic Identifiers */}
            <div className="bg-dark-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Network & Device Footprint
              </h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Associated UPI IDs:</span>
                  <div className="text-cyan-300 font-semibold truncate">
                    {account.upiIds?.join(', ') || 'None registered'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Device Fingerprint IDs:</span>
                  <div className="text-slate-300 truncate">
                    {account.deviceIds?.join(', ') || 'No hardware hash'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Phone Salt Hash:</span>
                  <div className="text-slate-300">{account.phoneHash}</div>
                </div>
                {account.relatedClusterId && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">Related Cluster Association:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
                      {account.relatedClusterId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Connected Counterparties */}
            {account.connectedAccounts && account.connectedAccounts.length > 0 && (
              <div className="bg-dark-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Connected Counterparties
                  </h3>
                  <span className="font-mono text-cyan-400 text-[10px]">
                    {account.connectedAccounts.length} entities
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {account.connectedAccounts.slice(0, 10).map((conn) => (
                    <span
                      key={conn}
                      className="px-2 py-0.5 rounded bg-dark-800 border border-slate-700 text-slate-300 font-mono text-[10px]"
                    >
                      {conn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-slate-400">
            Entity intelligence not found in current transaction graph index.
          </div>
        )}
      </div>

      {/* Footer Pivot Action */}
      <div className="p-4 border-t border-slate-800 bg-dark-950/90">
        <button
          onClick={() => onTraceFromThis(entityId)}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Trace Money Flow From This Entity</span>
        </button>
      </div>
    </div>
  );
};
