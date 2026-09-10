import React from 'react';
import { HelpCircle, AlertTriangle, Smartphone, Phone, Landmark, Gauge, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ExplainableIndicator } from '../types/index.js';

interface ExplainableIndicatorsProps {
  indicators: ExplainableIndicator[];
  totalScore: number;
}

export const ExplainableIndicators: React.FC<ExplainableIndicatorsProps> = ({ indicators, totalScore }) => {
  const getIndicatorIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('device')) return Smartphone;
    if (lower.includes('phone')) return Phone;
    if (lower.includes('fraud')) return AlertTriangle;
    if (lower.includes('beneficiary')) return Landmark;
    if (lower.includes('velocity')) return Gauge;
    if (lower.includes('growth')) return TrendingUp;
    if (lower.includes('money') || lower.includes('routing')) return RefreshCw;
    return AlertTriangle;
  };

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Why is this a Fraud Cluster?</span>
            <span className="text-[11px] font-normal text-slate-400 font-mono">
              (Explainable Weighted Scoring Model)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective risk attribution across infrastructure, behavioral velocity, and cyber intelligence reports.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 font-mono">Risk Contribution:</span>
          <span className="text-sm font-bold font-mono text-cyan-400">
            {indicators.reduce((sum, ind) => sum + ind.contribution, 0).toFixed(1)} / 100 pts
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {indicators.map((ind, idx) => {
          const Icon = getIndicatorIcon(ind.indicator);
          const percentOfWeight = Math.min(100, Math.round((ind.contribution / ind.weight) * 100));

          return (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{ind.indicator}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">{ind.value}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-right">
                  {/* Contribution Badge */}
                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-cyan-300">
                      +{ind.contribution} pts
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      weight: {ind.weight}%
                    </span>
                  </div>

                  {/* Confidence Meter */}
                  <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-center min-w-[65px]">
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">Confidence</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {(ind.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Contribution Bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${percentOfWeight}%` }}
                ></div>
              </div>

              {/* Rationale Description */}
              <p className="text-[11px] text-slate-400 italic">
                "{ind.description}"
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Deterministic signals calibrated with zero hard-coded assumptions
        </span>
        <span className="font-mono text-cyan-400">Total Score: {totalScore}/100</span>
      </div>
    </div>
  );
};
