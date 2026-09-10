import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from 'recharts';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Layers,
  Smartphone,
  CreditCard,
  Hash,
  Eye,
  Calendar,
  Zap,
} from 'lucide-react';
import { emergingNetworks, GROWTH_THRESHOLD_PCT } from '../data/mockData';

// Severity badge styles
const severityStyles = {
  CRITICAL: 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-400/30',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-400/30',
  MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-400/30',
  LOW: 'bg-green-50 text-green-700 border-green-200 ring-1 ring-green-400/30',
  INFO: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-400/30',
};

const severityDot = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-green-500',
  INFO: 'bg-sky-500',
};

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-lg shadow-xl text-xs border border-slate-700 backdrop-blur-sm min-w-40">
        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1.5 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {label}
          </span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
            Total: {total}
          </span>
        </div>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-white">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function EmergingFraudPanel({ onSelectNetwork }) {
  const [selectedNetworkId, setSelectedNetworkId] = useState(emergingNetworks[0].networkId);
  const [sortBy, setSortBy] = useState('growth'); // 'growth' | 'size' | 'activity'
  const [filterRisk, setFilterRisk] = useState('ALL');

  // Currently selected network object
  const activeNetwork = useMemo(
    () => emergingNetworks.find((n) => n.networkId === selectedNetworkId) || emergingNetworks[0],
    [selectedNetworkId]
  );

  // Rapid growth count for banner
  const rapidGrowthCount = useMemo(
    () => emergingNetworks.filter((n) => n.growthRatePct >= GROWTH_THRESHOLD_PCT).length,
    []
  );

  // Sorted and filtered networks
  const filteredNetworks = useMemo(() => {
    let list = [...emergingNetworks];
    if (filterRisk !== 'ALL') {
      list = list.filter((n) => n.riskLevel === filterRisk);
    }
    list.sort((a, b) => {
      if (sortBy === 'growth') return b.growthRatePct - a.growthRatePct;
      if (sortBy === 'size') {
        const sizeA = a.history[a.history.length - 1].accounts;
        const sizeB = b.history[b.history.length - 1].accounts;
        return sizeB - sizeA;
      }
      if (sortBy === 'activity') return new Date(b.lastActivity) - new Date(a.lastActivity);
      return 0;
    });
    return list;
  }, [sortBy, filterRisk]);

  // Find spike point for annotation (max single step jump in accounts)
  const spikePoint = useMemo(() => {
    if (!activeNetwork || activeNetwork.history.length < 2) return null;
    let maxJump = 0;
    let spikeEntry = null;
    for (let i = 1; i < activeNetwork.history.length; i++) {
      const jump = activeNetwork.history[i].accounts - activeNetwork.history[i - 1].accounts;
      if (jump > maxJump) {
        maxJump = jump;
        spikeEntry = activeNetwork.history[i];
      }
    }
    return spikeEntry;
  }, [activeNetwork]);

  return (
    <div className="space-y-6">
      {/* ── 1. Threshold-Based Alert Banner ───────────────────────────── */}
      {rapidGrowthCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-red-50 to-orange-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-xs border-y border-r border-red-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg text-red-600 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-red-900">
                    ⚠️ Early Warning: {rapidGrowthCount} fraud network{rapidGrowthCount > 1 ? 's' : ''} expanding rapidly
                  </h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-red-200 text-red-800 px-2 py-0.5 rounded-full">
                    Threshold &gt;{GROWTH_THRESHOLD_PCT}%
                  </span>
                </div>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  Sudden account acquisition velocity detected. Immediate ring-fencing and review recommended to prevent multi-hop fund dissipation.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-center shrink-0">
              <span className="text-xs font-semibold text-red-700 bg-white/80 px-2.5 py-1 rounded-md border border-red-200 shadow-2xs">
                Real-time Stream
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Top Stats Overview Bar ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Monitored Networks</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{emergingNetworks.length}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">High Velocity (&gt;30%)</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{rapidGrowthCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Active Entities (Selected)</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {activeNetwork.history[activeNetwork.history.length - 1].accounts +
                activeNetwork.history[activeNetwork.history.length - 1].upiIds +
                activeNetwork.history[activeNetwork.history.length - 1].devices}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Max Growth Rate</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              +{Math.max(...emergingNetworks.map((n) => n.growthRatePct))}%
            </p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Main Two-Column Layout: Chart + Watchlist ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Growth Timeline Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            {/* Chart Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Growth Timeline — {activeNetwork.networkId}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        severityStyles[activeNetwork.riskLevel]
                      }`}
                    >
                      {activeNetwork.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{activeNetwork.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{activeNetwork.growthRatePct}% (7d)
                </span>
              </div>
            </div>

            {/* Spike Annotation Callout */}
            {spikePoint && (
              <div className="mt-3 text-xs bg-amber-50 text-amber-900 px-3 py-2 rounded-lg border border-amber-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <strong>Growth Spike Detected:</strong> Sharp acceleration on {spikePoint.date} (
                  +{spikePoint.accounts} linked accounts)
                </span>
                <span className="text-[11px] font-mono text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                  Anomaly Marker
                </span>
              </div>
            )}

            {/* Recharts Area + Line chart */}
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={activeNetwork.history}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAccounts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorUpi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px', color: '#475569' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accounts"
                    name="Linked Accounts"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorAccounts)"
                  />
                  <Area
                    type="monotone"
                    dataKey="upiIds"
                    name="UPI IDs"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUpi)"
                  />
                  <Area
                    type="monotone"
                    dataKey="devices"
                    name="Devices"
                    stroke="#0ea5e9"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorDevices)"
                  />
                  {spikePoint && (
                    <ReferenceDot
                      x={spikePoint.date}
                      y={spikePoint.accounts}
                      r={6}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart footer details */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live monitoring active: hourly graph sync
            </span>
            <span className="font-mono">
              Latest Snapshot: {activeNetwork.history[activeNetwork.history.length - 1].date}
            </span>
          </div>
        </div>

        {/* Right Column: Watchlist / Early Warning Cards (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          {/* Section Header & Filter/Sort Controls */}
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
                  <ShieldAlert className="w-4 h-4" />
                </span>
                <h2 className="text-sm font-bold text-slate-900">Expanding Watchlist</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                {filteredNetworks.length} Active
              </span>
            </div>

            {/* Filter & Sort Bar */}
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-xs"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-xs font-medium"
                >
                  <option value="growth">Growth Rate</option>
                  <option value="size">Network Size</option>
                  <option value="activity">Last Active</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards List */}
          <div className="mt-3 space-y-3 overflow-y-auto max-h-[460px] pr-1">
            {filteredNetworks.map((net) => {
              const latest = net.history[net.history.length - 1];
              const isSelected = net.networkId === selectedNetworkId;
              const isRapid = net.growthRatePct >= GROWTH_THRESHOLD_PCT;

              return (
                <div
                  key={net.networkId}
                  onClick={() => setSelectedNetworkId(net.networkId)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  {/* Top line of card */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${severityDot[net.riskLevel]}`} />
                      <span className="font-mono font-bold text-xs text-slate-900">{net.networkId}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${
                          severityStyles[net.riskLevel]
                        }`}
                      >
                        {net.riskLevel}
                      </span>
                    </div>

                    {/* Growth Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isRapid
                          ? 'bg-red-100 text-red-700'
                          : net.growthRatePct > 0
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {net.growthRatePct > 0 ? (
                        <TrendingUp className="w-3 h-3 text-red-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-slate-500" />
                      )}
                      +{net.growthRatePct}%
                    </span>
                  </div>

                  {/* Label / Name */}
                  <p className="text-xs font-semibold text-slate-800 mt-1.5">{net.label}</p>

                  {/* Current Size Breakdown */}
                  <div className="mt-2 grid grid-cols-3 gap-1 bg-slate-50/80 p-2 rounded-lg border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Accounts</span>
                      <span className="font-mono font-bold text-slate-800">{latest.accounts}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">UPI IDs</span>
                      <span className="font-mono font-bold text-slate-800">{latest.upiIds}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Devices</span>
                      <span className="font-mono font-bold text-slate-800">{latest.devices}</span>
                    </div>
                  </div>

                  {/* Warning message */}
                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{net.warning}</p>

                  {/* Card Action Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Active {new Date(net.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNetworkId(net.networkId);
                        if (onSelectNetwork) onSelectNetwork(net);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <Eye className="w-3 h-3" />
                      View Network Graph
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmergingFraudPanel;
