import React from 'react';
import { Filter, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { RiskLevel } from '../types/index.js';

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedRiskLevel: string;
  onRiskLevelChange: (val: string) => void;
  minScore: number;
  onMinScoreChange: (val: number) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedChannel: string;
  onChannelChange: (val: string) => void;
  onResetFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedRiskLevel,
  onRiskLevelChange,
  minScore,
  onMinScoreChange,
  selectedStatus,
  onStatusChange,
  selectedChannel,
  onChannelChange,
  onResetFilters
}) => {
  const riskLevels = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const statuses = ['ALL', 'ACTIVE', 'INVESTIGATING', 'MONITORING', 'RESOLVED'];
  const channels = ['ALL', 'UPI', 'IMPS', 'NEFT', 'CARD'];

  const hasActiveFilters = 
    selectedRiskLevel !== 'ALL' || 
    minScore > 0 || 
    selectedStatus !== 'ALL' || 
    selectedChannel !== 'ALL' || 
    searchQuery.trim().length > 0;

  return (
    <div className="bg-[#0f172a]/70 border border-slate-800/80 rounded-xl p-4 mb-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Cluster ID (e.g. FNX-CL-2841) or Entity..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900/80 border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Risk Level Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            Risk:
          </span>
          {riskLevels.map((lvl) => {
            const isSelected = selectedRiskLevel === lvl;
            let activeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
            if (lvl === 'CRITICAL') activeClass = 'bg-red-500/20 text-red-300 border-red-500/50';
            if (lvl === 'HIGH') activeClass = 'bg-orange-500/20 text-orange-300 border-orange-500/50';
            if (lvl === 'MEDIUM') activeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
            if (lvl === 'LOW') activeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';

            return (
              <button
                key={lvl}
                onClick={() => onRiskLevelChange(lvl)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                  isSelected
                    ? activeClass
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Score Slider */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Min Score Slider */}
          <div className="flex items-center space-x-2 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Min Score:</span>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => onMinScoreChange(Number(e.target.value))}
              className="w-20 accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-300 w-6 text-right">
              {minScore}
            </span>
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs bg-slate-900/80 border border-slate-700/80 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Status: All</option>
            {statuses.filter(s => s !== 'ALL').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Channel Dropdown */}
          <select
            value={selectedChannel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="text-xs bg-slate-900/80 border border-slate-700/80 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">Channel: All</option>
            {channels.filter(c => c !== 'ALL').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
