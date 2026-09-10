import React, { useState } from 'react';
import { FraudNexusIntegrationContract } from '../types';
import { X, Copy, Check, FileJson, Share2, Sparkles } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: FraudNexusIntegrationContract | null;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  contract
}) => {
  const [copied, setCopied] = useState(false);
  const [handoffSuccess, setHandoffSuccess] = useState<string | null>(null);

  if (!isOpen || !contract) return null;

  const jsonString = JSON.stringify(contract, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateHandoff = (targetModule: string) => {
    setHandoffSuccess(`Dispatched integration payload to ${targetModule} with Path ID ${contract.pathId}`);
    setTimeout(() => setHandoffSuccess(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-dark-950">
          <div className="flex items-center space-x-2.5">
            <FileJson className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white">FraudNexus Module Integration Contract</h2>
              <span className="text-[10px] text-slate-400 font-mono">Section 28 API Specification</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-300">
            This standardized JSON contract is emitted by Feature 6 for consumption by other FraudNexus modules (Feature 3: Case Management, Feature 4: Cluster Detection, Feature 5: Emerging Threats).
          </p>

          {/* JSON Block */}
          <div className="relative">
            <pre className="bg-dark-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-72">
              {jsonString}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-dark-800 hover:bg-dark-700 border border-slate-700 text-xs text-slate-200 flex items-center space-x-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          {/* Cross-module Dispatch simulation */}
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Simulate Cross-Module Handoff:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSimulateHandoff('Feature 4: Coordinated Fraud Clusters')}
                className="p-2 rounded-lg bg-dark-950 hover:bg-dark-800 border border-slate-800 text-[11px] text-purple-300 font-medium transition-all text-center"
              >
                Handoff to Feature 4 (Cluster)
              </button>
              <button
                onClick={() => handleSimulateHandoff('Feature 3: Investigation Dossier')}
                className="p-2 rounded-lg bg-dark-950 hover:bg-dark-800 border border-slate-800 text-[11px] text-blue-300 font-medium transition-all text-center"
              >
                Handoff to Feature 3 (Case)
              </button>
              <button
                onClick={() => handleSimulateHandoff('Feature 5: Emerging Threat Radar')}
                className="p-2 rounded-lg bg-dark-950 hover:bg-dark-800 border border-slate-800 text-[11px] text-amber-300 font-medium transition-all text-center"
              >
                Handoff to Feature 5 (Threat)
              </button>
            </div>
          </div>

          {handoffSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{handoffSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer */}
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
