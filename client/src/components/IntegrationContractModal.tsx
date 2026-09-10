import React, { useState } from 'react';
import { Copy, Check, X, FileCode, ExternalLink } from 'lucide-react';
import { IntegrationContract } from '../types/index.js';

interface IntegrationContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: IntegrationContract | null;
}

export const IntegrationContractModal: React.FC<IntegrationContractModalProps> = ({
  isOpen,
  onClose,
  contract
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !contract) return null;

  const jsonString = JSON.stringify(contract, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-mono">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-bold text-white tracking-wider">
              Integration Contract (Section 20)
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-3 font-sans">
          Standardized output schema for seamless consumption by upstream FraudNexus modules 
          (Evidence Pack, Legal Case Builder, Cross-Bank Intelligence Switch).
        </p>

        {/* JSON Code Viewer */}
        <div className="relative rounded-lg bg-slate-950 border border-slate-800 p-3 text-xs text-cyan-300 max-h-72 overflow-y-auto mb-4">
          <button
            onClick={handleCopy}
            className="absolute top-2.5 right-2.5 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center space-x-1 text-[11px]"
            title="Copy JSON Payload"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <pre className="font-mono">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-500">
          <span>Endpoint: /api/fraud-clusters/{contract.clusterId}/contract</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
