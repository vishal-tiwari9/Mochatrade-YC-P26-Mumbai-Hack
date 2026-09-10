import React from 'react';
import { RiskFactor, RiskLevel } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface PathRiskScoreProps {
  score: number;
  level: RiskLevel;
  breakdown: RiskFactor[];
}

export const PathRiskScore: React.FC<PathRiskScoreProps> = ({ score, level, breakdown }) => {
  const getRiskColor = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'CRITICAL': return 'text-red-400 border-red-500 bg-red-950/40';
      case 'HIGH': return 'text-orange-400 border-orange-500 bg-orange-950/40';
      case 'MEDIUM': return 'text-amber-400 border-amber-500 bg-amber-950/40';
      default: return 'text-emerald-400 border-emerald-500 bg-emerald-950/40';
    }
  };

  const getMeterColor = (s: number) => {
    if (s >= 85) return 'from-amber-500 via-rose-500 to-red-600';
    if (s >= 60) return 'from-blue-500 via-amber-500 to-orange-500';
    if (s >= 35) return 'from-cyan-500 via-emerald-500 to-amber-500';
    return 'from-cyan-500 to-emerald-500';
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Path Dynamic Risk Scoring Engine
          </h2>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getRiskColor(level)}`}>
          {level}
        </span>
      </div>

      {/* Main Score Radial / Meter Gauge */}
      <div className="flex items-center justify-between bg-dark-950 p-4 rounded-xl border border-slate-800/80 mb-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block">Aggregate Exposure</span>
          <div className="flex items-baseline space-x-1.5 mt-0.5">
            <span className="text-3xl font-black font-mono text-white">{score}</span>
            <span className="text-sm font-mono text-slate-500">/100</span>
          </div>
        </div>

        <div className="w-48">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>Threat Index</span>
            <span className="font-bold text-slate-200">{score}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${getMeterColor(score)} transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
          Dynamic Factor Breakdown:
        </div>
        {breakdown.map((item, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-dark-950/80 border border-slate-800/70 flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex-1">
              <div className="font-bold text-slate-200">{item.factor}</div>
              <p className="text-[11px] text-slate-400 mt-0.5">{item.rationale}</p>
            </div>
            <span className="font-mono font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/30 shrink-0">
              +{item.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
