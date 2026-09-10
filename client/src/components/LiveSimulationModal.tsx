import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, ArrowRight, Smartphone, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { ingestTransaction } from '../services/api.js';

interface LiveSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusterId: string;
  onSuccess: (updatedCluster: any) => void;
}

export const LiveSimulationModal: React.FC<LiveSimulationModalProps> = ({
  isOpen,
  onClose,
  clusterId,
  onSuccess
}) => {
  const [senderAccount, setSenderAccount] = useState<string>('ACC_MULE_NEW_99');
  const [receiverAccount, setReceiverAccount] = useState<string>('ACC_2841_01');
  const [amount, setAmount] = useState<number>(18500);
  const [deviceId, setDeviceId] = useState<string>('DEV_2841_ALPHA');
  const [phoneHash, setPhoneHash] = useState<string>('HASH_PH_9841A');
  const [channel, setChannel] = useState<'UPI' | 'IMPS' | 'NEFT'>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineSteps, setPipelineSteps] = useState<string[]>([]);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulate = async () => {
    setIsProcessing(true);
    setPipelineSteps([]);
    setResultMessage(null);

    const steps = [
      '1. Receiving raw incoming transaction payload...',
      '2. Normalizing transaction to standardized schema...',
      '3. Resolving canonical entities (ACCOUNT:ACC_MULE_NEW_99, DEVICE:DEV_2841_ALPHA)...',
      '4. Injecting financial and infrastructure edges into Heterogeneous Fraud Graph...',
      '5. Recalculating affected cluster community metrics and weighted risk score...',
      '6. Synchronizing network graph and time-series growth telemetry...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 220));
      setPipelineSteps(prev => [...prev, steps[i]]);
    }

    try {
      const response = await ingestTransaction({
        transactionId: `TXN_LIVE_${Date.now()}`,
        timestamp: new Date().toISOString(),
        senderAccountId: senderAccount,
        receiverAccountId: receiverAccount,
        senderUpiId: `${senderAccount.toLowerCase()}@upi`,
        receiverUpiId: 'syndicate_01@upi',
        deviceId,
        phoneHash,
        amount,
        channel,
        beneficiaryId: 'BENE_MULE_HQ_01'
      });

      if (response.success) {
        setResultMessage(`Transaction processed! Cluster ${clusterId} updated dynamically.`);
        onSuccess(response.data.updatedCluster);
      }
    } catch (err: any) {
      setResultMessage(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-mono">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase font-bold text-white tracking-wider">
              Simulate Incoming Transaction
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 font-sans">
          Inject a synthetic transaction in real-time to demonstrate how the FraudNexus engine recalculates 
          affected clusters, risk scores, and graph topology without restarting or hard-coding.
        </p>

        {/* Input Parameters */}
        <div className="space-y-3 mb-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">New Sender Account</label>
              <input
                type="text"
                value={senderAccount}
                onChange={e => setSenderAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Target Cluster Account</label>
              <input
                type="text"
                value={receiverAccount}
                onChange={e => setReceiverAccount(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Amount (INR)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Payment Channel</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
              >
                <option value="UPI">UPI</option>
                <option value="IMPS">IMPS</option>
                <option value="NEFT">NEFT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Shared Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase mb-1">Shared Phone Hash</label>
              <input
                type="text"
                value={phoneHash}
                onChange={e => setPhoneHash(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Pipeline Execution Log Display */}
        {pipelineSteps.length > 0 && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 mb-4 max-h-36 overflow-y-auto text-[11px] space-y-1">
            {pipelineSteps.map((s, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-cyan-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        {resultMessage && (
          <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs mb-4">
            {resultMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-slate-800 text-slate-400 hover:text-white text-xs"
          >
            Close
          </button>
          <button
            onClick={handleSimulate}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isProcessing ? 'Processing Pipeline...' : 'Execute Ingestion'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
