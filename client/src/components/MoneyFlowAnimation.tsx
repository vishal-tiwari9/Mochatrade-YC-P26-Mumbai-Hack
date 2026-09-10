import React, { useState, useEffect, useRef } from 'react';
import { MoneyFlowPath } from '../types';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2, ArrowRight, IndianRupee } from 'lucide-react';

interface MoneyFlowAnimationProps {
  path: MoneyFlowPath | null;
  onStepHighlight: (nodeId: string | null, txId: string | null) => void;
}

export const MoneyFlowAnimation: React.FC<MoneyFlowAnimationProps> = ({
  path,
  onStepHighlight
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 0.5x

  const totalSteps = path ? path.transactions.length + 1 : 0;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Reset on path change
    setCurrentStep(0);
    setIsPlaying(false);
  }, [path]);

  useEffect(() => {
    if (!isPlaying || !path) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.round(1200 / speed);

    timerRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps - 1) {
          setIsPlaying(false);
          return totalSteps - 1;
        }
        const next = prev + 1;
        // Trigger highlight callback
        if (path && next > 0 && next <= path.transactions.length) {
          const tx = path.transactions[next - 1];
          onStepHighlight(tx.receiverAccountId, tx.transactionId);
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalSteps, speed, path]);

  if (!path || path.transactions.length === 0) return null;

  const handlePlayPause = () => {
    if (currentStep >= totalSteps - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplay = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    if (path && path.nodes.length > 0) {
      onStepHighlight(path.nodes[0].id, null);
    }
  };

  const handleSkip = () => {
    setCurrentStep(totalSteps - 1);
    setIsPlaying(false);
    if (path && path.transactions.length > 0) {
      const lastTx = path.transactions[path.transactions.length - 1];
      onStepHighlight(lastTx.receiverAccountId, lastTx.transactionId);
    }
  };

  // Get current active transaction amount
  const activeTx = currentStep > 0 && currentStep <= path.transactions.length
    ? path.transactions[currentStep - 1]
    : null;

  const isCompleted = currentStep === totalSteps - 1;

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-4 shadow-xl mb-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Path Replay Simulation
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            (Step {currentStep + 1} of {totalSteps})
          </span>
        </div>

        {/* Player Controls */}
        <div className="flex items-center space-x-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-dark-950 px-2 py-1 rounded border border-slate-800 text-[11px] font-mono">
            <span className="text-slate-400 mr-1.5">Speed:</span>
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  speed === s ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={handlePlayPause}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Flow'}</span>
          </button>

          <button
            onClick={handleReplay}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all"
            title="Replay from start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition-all"
            title="Skip to final destination"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-dark-950 rounded-full h-1.5 mb-3 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Sequence Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {/* Step 0: Origin */}
        <div
          className={`p-2.5 rounded-lg border text-xs transition-all ${
            currentStep === 0
              ? 'bg-blue-950/60 border-blue-500 text-white shadow-md shadow-blue-900/30 ring-1 ring-blue-500'
              : currentStep > 0
              ? 'bg-dark-950 border-slate-800 text-slate-300'
              : 'bg-dark-950/50 border-slate-800/60 text-slate-500 opacity-60'
          }`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-blue-400 mb-1">
            <span>STEP 1: ORIGIN</span>
            {currentStep > 0 && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          </div>
          <div className="font-bold font-mono truncate">{path.nodes[0]?.id || path.sourceEntity}</div>
          <div className="text-[10px] text-slate-400 truncate">Source Compromised</div>
        </div>

        {/* Dynamic Intermediate & Destination Steps */}
        {path.transactions.map((tx, idx) => {
          const stepNum = idx + 1;
          const isActive = currentStep === stepNum;
          const isPassed = currentStep > stepNum;
          const isLast = idx === path.transactions.length - 1;

          return (
            <div
              key={tx.transactionId}
              className={`p-2.5 rounded-lg border text-xs transition-all ${
                isActive
                  ? isLast
                    ? 'bg-red-950/60 border-red-500 text-white shadow-md shadow-red-900/30 ring-1 ring-red-500'
                    : 'bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-900/30 ring-1 ring-cyan-500'
                  : isPassed
                  ? 'bg-dark-950 border-slate-800 text-slate-300'
                  : 'bg-dark-950/50 border-slate-800/60 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className={isLast ? 'text-red-400' : 'text-cyan-400'}>
                  {isLast ? `STEP ${stepNum + 1}: FINAL` : `STEP ${stepNum + 1}: HOP ${idx + 1}`}
                </span>
                {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
              <div className="font-bold font-mono truncate">{tx.receiverAccountId}</div>
              <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 mt-0.5">
                <span>₹{tx.amount.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-slate-500">({tx.channel})</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="mt-3 py-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>PATH ANALYSIS COMPLETE: Funds propagated across {path.hopCount} hops into final beneficiary in {path.durationMinutes} minutes.</span>
          </div>
          <button
            onClick={handleReplay}
            className="text-[11px] font-bold underline hover:text-white"
          >
            Replay
          </button>
        </div>
      )}
    </div>
  );
};
