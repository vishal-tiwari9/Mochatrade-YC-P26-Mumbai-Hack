import React from 'react';
import { ChevronRight, ShieldAlert, AlertTriangle, CheckCircle, Smartphone, CreditCard, Radio, Phone, ArrowUpRight } from 'lucide-react';
import { FraudCluster, RiskLevel } from '../types/index.js';

interface ClusterTableProps {
  clusters: FraudCluster[];
  onSelectCluster: (clusterId: string) => void;
}

export const ClusterTable: React.FC<ClusterTableProps> = ({ clusters, onSelectCluster }) => {
  if (clusters.length === 0) {
    return (
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-xl p-12 text-center">
        <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-300">No Coordinated Fraud Clusters Found</h3>
        <p className="text-xs text-slate-500 mt-1">Try relaxing your filter criteria or search query.</p>
      </div>
    );
  }

  const getRiskBadge = (level: RiskLevel, score: number) => {
    switch (level) {
      case 'CRITICAL':
        return (
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-red-500/20 text-red-300 border border-red-500/40">
              {score} / 100 CRITICAL
            </span>
          </div>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">
            {score} / 100 HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {score} / 100 MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {score} / 100 LOW
          </span>
        );
    }
  };

  const formatExposure = (amt: number) => {
    if (amt >= 100000) {
      return `₹${(amt / 100000).toFixed(2)} L`;
    }
    return `₹${amt.toLocaleString('en-IN')}`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Cluster ID</th>
              <th className="py-3.5 px-4 font-semibold">Risk Score & Level</th>
              <th className="py-3.5 px-3 font-semibold text-center" title="Accounts">Accs</th>
              <th className="py-3.5 px-3 font-semibold text-center" title="UPI IDs">UPIs</th>
              <th className="py-3.5 px-3 font-semibold text-center" title="Devices">Devs</th>
              <th className="py-3.5 px-3 font-semibold text-center" title="Phones">Phones</th>
              <th className="py-3.5 px-3 font-semibold text-center" title="Transactions">Txns</th>
              <th className="py-3.5 px-4 font-semibold text-right">Exposure</th>
              <th className="py-3.5 px-3 font-semibold text-center">Growth</th>
              <th className="py-3.5 px-4 font-semibold">Last Activity</th>
              <th className="py-3.5 px-3 font-semibold text-center">Status</th>
              <th className="py-3.5 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {clusters.map((cluster) => {
              const isTarget = cluster.clusterId === 'FNX-CL-2841';
              return (
                <tr
                  key={cluster.clusterId}
                  onClick={() => onSelectCluster(cluster.clusterId)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isTarget 
                      ? 'bg-red-950/15 hover:bg-red-950/30' 
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  {/* Cluster ID */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white tracking-wide">
                        {cluster.clusterId}
                      </span>
                      {isTarget && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-sans font-medium">
                          PRIMARY DEMO
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getRiskBadge(cluster.riskLevel, cluster.riskScore)}
                  </td>

                  {/* Entity Composition Breakdown */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-cyan-300 font-bold">
                    {cluster.entityBreakdown.accounts}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-teal-300">
                    {cluster.entityBreakdown.upis}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-300">
                    {cluster.entityBreakdown.devices}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-purple-300">
                    {cluster.entityBreakdown.phones}
                  </td>
                  <td className="py-3.5 px-3 text-center whitespace-nowrap text-amber-300">
                    {cluster.transactionCount}
                  </td>

                  {/* Exposure */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-emerald-400">
                    {formatExposure(cluster.exposure)}
                  </td>

                  {/* Growth */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center text-rose-400 font-medium text-[11px]">
                      +{cluster.growthRate}%
                    </span>
                  </td>

                  {/* Last Activity */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px] font-sans">
                    {formatDate(cluster.lastActivity)}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                      cluster.status === 'ACTIVE' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {cluster.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCluster(cluster.clusterId);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-sans font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
