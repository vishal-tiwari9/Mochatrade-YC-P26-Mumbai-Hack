import React, { useState } from 'react';
import { Search, ArrowRight, ArrowLeft, ArrowLeftRight, Layers, Sparkles } from 'lucide-react';
import { QuickScenario } from '../types';

interface MoneyFlowSearchProps {
  onSearch: (query: string, direction: 'outgoing' | 'incoming' | 'both', hops: number) => void;
  isLoading: boolean;
  activeQuery: string;
  activeDirection: 'outgoing' | 'incoming' | 'both';
  activeHops: number;
  quickScenarios: QuickScenario[];
}

export const MoneyFlowSearch: React.FC<MoneyFlowSearchProps> = ({
  onSearch,
  isLoading,
  activeQuery,
  activeDirection,
  activeHops,
  quickScenarios
}) => {
  const [query, setQuery] = useState(activeQuery);
  const [direction, setDirection] = useState<'outgoing' | 'incoming' | 'both'>(activeDirection);
  const [hops, setHops] = useState<number>(activeHops);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), direction, hops);
    }
  };

  const handleSelectScenario = (scenario: QuickScenario) => {
    setQuery(scenario.target);
    setDirection(scenario.direction);
    setHops(scenario.hops);
    onSearch(scenario.target, scenario.direction, scenario.hops);
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-4 shadow-xl mb-4">
      {/* Top Bar: Search Input & Direction Tabs */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          {/* Query Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Transaction ID (e.g. TXN-FNX-9001), Account ID (ACC001), UPI ID, or Incident ID..."
              className="w-full bg-dark-950 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono transition-all"
              id="money-flow-query-input"
            />
          </div>

          {/* Direction Buttons */}
          <div className="flex items-center rounded-lg bg-dark-950 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setDirection('outgoing')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                direction === 'outgoing'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="dir-outgoing-btn"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>OUTGOING</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection('incoming')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                direction === 'incoming'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="dir-incoming-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>INCOMING</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection('both')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                direction === 'both'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="dir-both-btn"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>BOTH</span>
            </button>
          </div>

          {/* Max Hops Selector */}
          <div className="flex items-center space-x-2 bg-dark-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-mono">HOPS:</span>
            <select
              value={hops}
              onChange={(e) => setHops(Number(e.target.value))}
              className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
              id="max-hops-select"
            >
              <option value={1} className="bg-dark-900">1 Hop</option>
              <option value={2} className="bg-dark-900">2 Hops</option>
              <option value={3} className="bg-dark-900">3 Hops</option>
              <option value={4} className="bg-dark-900">4 Hops</option>
              <option value={5} className="bg-dark-900">5 Hops</option>
              <option value={10} className="bg-dark-900">10 Hops</option>
            </select>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            id="trace-submit-btn"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Tracing Graph...' : 'Trace Money Flow'}</span>
          </button>
        </div>
      </form>

      {/* Preset Investigation Scenarios */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Quick Scenarios:</span>
        </span>
        {quickScenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => handleSelectScenario(sc)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-all flex items-center gap-1.5 ${
              activeQuery === sc.target
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-semibold'
                : 'bg-dark-950 hover:bg-dark-800 border-slate-800 text-slate-300'
            }`}
          >
            <span className="font-mono text-cyan-400 font-bold">{sc.target}</span>
            <span className="text-slate-400 font-normal">({sc.badge})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
