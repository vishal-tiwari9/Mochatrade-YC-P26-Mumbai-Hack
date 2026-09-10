import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CreditCard, 
  Smartphone, 
  Phone, 
  Users, 
  Landmark, 
  AlertOctagon, 
  CheckCircle, 
  FastForward, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NetworkDiscoveryAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  clusterId: string;
}

const STEPS = [
  { step: 1, title: 'Suspicious Transaction Ingested', icon: CreditCard, color: 'text-cyan-400', detail: 'High-frequency micro-transfer intercepted on UPI channel' },
  { step: 2, title: 'Sender & Receiver Accounts Resolved', icon: Landmark, color: 'text-blue-400', detail: 'ACC_2841_01 and ACC_2841_02 mapped' },
  { step: 3, title: 'UPI Virtual Payment Address Bound', icon: CreditCard, color: 'text-teal-400', detail: 'syndicate_01@upi verified against switch routing' },
  { step: 4, title: 'Shared Phone Identifier Extracted', icon: Phone, color: 'text-purple-400', detail: 'Phone hash HASH_PH_9841A matches multiple holder KYC files' },
  { step: 5, title: 'Hardware Device Fingerprint Linked', icon: Smartphone, color: 'text-slate-300', detail: 'DEV_2841_ALPHA used across multiple simultaneous bank sessions' },
  { step: 6, title: 'Transitive Account Network Traversed', icon: Users, color: 'text-indigo-400', detail: '17 accounts discovered sharing identical device pool' },
  { step: 7, title: 'Common Beneficiary Funnel Flagged', icon: Landmark, color: 'text-amber-400', detail: 'BENE_MULE_HQ_01 receiving concentrated outgoing liquidity' },
  { step: 8, title: 'Additional Infrastructure Clustered', icon: Users, color: 'text-cyan-300', detail: '11 UPI IDs + 5 Devices + 4 Phones tightly interconnected' },
  { step: 9, title: 'Cyber Crime FIRs & Mule Reports Correlated', icon: AlertOctagon, color: 'text-rose-400', detail: 'INC-2026-0891, INC-2026-0914 confirmed in LEA database' },
  { step: 10, title: 'COORDINATED FRAUD CLUSTER DETECTED', icon: Sparkles, color: 'text-red-400', detail: 'High-Risk Syndicate FNX-CL-2841 identified (Score: 94/100)' }
];

export const NetworkDiscoveryAnimation: React.FC<NetworkDiscoveryAnimationProps> = ({
  isOpen,
  onClose,
  clusterId
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsCompleted(false);
      return;
    }

    // Step duration 300ms each -> total 3.0 seconds
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsCompleted(true);
          // Confetti celebratory alert trigger for critical syndicate discovery
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch {}
          return prev;
        }
      });
    }, 320);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = STEPS[currentStepIndex];
  const Icon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 to-[#070b14] border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] font-mono">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
              Autonomous Discovery Sequence
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Skip Animation</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-6 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-red-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Dynamic Center Node & Step Detail */}
        <div className="text-center py-6">
          <div className="inline-flex p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.3)] mb-4 animate-bounce">
            <Icon className={`w-10 h-10 ${currentStep.color}`} />
          </div>

          <div className="text-[11px] text-slate-500 uppercase tracking-widest mb-1">
            Step {currentStep.step} of {STEPS.length}
          </div>

          <h3 className={`text-base font-bold ${currentStepIndex === STEPS.length - 1 ? 'text-red-400 text-lg tracking-wider' : 'text-white'}`}>
            {currentStep.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            {currentStep.detail}
          </p>
        </div>

        {/* Discovery Pathway Micro-Steps */}
        <div className="grid grid-cols-5 gap-1.5 pt-4 border-t border-slate-800/80 my-2">
          {STEPS.map((s, idx) => (
            <div
              key={s.step}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx <= currentStepIndex 
                  ? idx === STEPS.length - 1 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-cyan-400' 
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Cluster Target: <span className="text-cyan-300 font-bold">{clusterId}</span>
          </span>

          {isCompleted && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.5)] transition"
            >
              Open Cluster Investigation
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
