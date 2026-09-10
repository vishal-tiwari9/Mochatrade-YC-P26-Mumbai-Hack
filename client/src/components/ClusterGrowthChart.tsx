import React, { useState } from 'react';
import { TrendingUp, Users, Calendar, ArrowUpRight, Activity } from 'lucide-react';
import { ClusterGrowthPoint } from '../types/index.js';

interface ClusterGrowthChartProps {
  growthData: ClusterGrowthPoint[];
  clusterId: string;
}

export const ClusterGrowthChart: React.FC<ClusterGrowthChartProps> = ({ growthData, clusterId }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!growthData || growthData.length === 0) {
    return (
      <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-6 text-center text-slate-500 font-mono text-xs">
        No time-series growth telemetry available for {clusterId}.
      </div>
    );
  }

  // Calculate scales for SVG
  const maxEntities = Math.max(...growthData.map(d => d.entityCount), 5);
  const maxTxns = Math.max(...growthData.map(d => d.transactionCount), 10);
  const maxExposure = Math.max(...growthData.map(d => d.cumulativeExposure), 1000);

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 30, bottom: 35, left: 40 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // X coordinate calculation
  const getX = (index: number) => {
    if (growthData.length === 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (growthData.length - 1)) * innerWidth;
  };

  // Y coordinate calculation for Entities
  const getYEntity = (val: number) => {
    return height - padding.bottom - (val / maxEntities) * innerHeight;
  };

  // Y coordinate calculation for Transactions
  const getYTxn = (val: number) => {
    return height - padding.bottom - (val / maxTxns) * innerHeight;
  };

  // Build SVG Path for Entities
  const entityPoints = growthData.map((d, i) => `${getX(i)},${getYEntity(d.entityCount)}`).join(' ');
  const entityArea = `${getX(0)},${height - padding.bottom} ${entityPoints} ${getX(growthData.length - 1)},${height - padding.bottom}`;

  // Build SVG Path for Transactions
  const txnPoints = growthData.map((d, i) => `${getX(i)},${getYTxn(d.transactionCount)}`).join(' ');

  const activePoint = hoveredIdx !== null ? growthData[hoveredIdx] : growthData[growthData.length - 1];

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Syndicate Growth Timeline</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              DYNAMIC TIMESTAMP ENGINE
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time entity and transaction accumulation derived from ledger timestamps.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-300 text-[11px]">Entities</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-300 text-[11px]">Transactions</span>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Cards on Hover */}
      <div className="grid grid-cols-4 gap-2 mb-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Observed Date</span>
          <span className="font-bold text-slate-200">{activePoint.dateLabel}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Cluster Entities</span>
          <span className="font-bold text-cyan-400">{activePoint.entityCount} connected</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Transactions</span>
          <span className="font-bold text-amber-400">{activePoint.transactionCount} cumulative</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Exposure</span>
          <span className="font-bold text-emerald-400">₹{(activePoint.cumulativeExposure / 100000).toFixed(2)} L</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 select-none">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * innerHeight;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Entity Gradient Area */}
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={entityArea} fill="url(#cyanGradient)" />

          {/* Entity Line */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            points={entityPoints}
          />

          {/* Transaction Line */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 2"
            points={txnPoints}
          />

          {/* Data Points and Hover Target */}
          {growthData.map((d, i) => {
            const x = getX(i);
            const yEntity = getYEntity(d.entityCount);
            const isHovered = hoveredIdx === i;

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                {/* Vertical hover line */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - padding.bottom}
                    stroke="#06b6d4"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Entity circle */}
                <circle
                  cx={x}
                  cy={yEntity}
                  r={isHovered ? 5 : 3.5}
                  fill="#38bdf8"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* X-axis date labels */}
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  fill={isHovered ? '#38bdf8' : '#64748b'}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {d.dateLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

    </div>
  );
};
