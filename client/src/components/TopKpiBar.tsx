import React from 'react';
import { ShieldAlert, Users, Network, TrendingUp, AlertOctagon, IndianRupee } from 'lucide-react';
import { TopKpis } from '../types/index.js';

interface TopKpiBarProps {
  kpis: TopKpis | null;
}

export const TopKpiBar: React.FC<TopKpiBarProps> = ({ kpis }) => {
  if (!kpis) return null;

  const formatExposure = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const cards = [
    {
      id: 'active-clusters',
      title: 'Active Clusters',
      value: kpis.activeClusters,
      subtext: 'Under live surveillance',
      icon: Network,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bgGlow: 'bg-cyan-500/5'
    },
    {
      id: 'critical-clusters',
      title: 'Critical Clusters',
      value: kpis.criticalClusters,
      subtext: 'Score ≥ 85 (Immediate Action)',
      icon: AlertOctagon,
      color: 'text-red-400',
      border: 'border-red-500/30',
      bgGlow: 'bg-red-500/10',
      badge: 'HIGH RISK'
    },
    {
      id: 'newly-detected',
      title: 'Newly Detected',
      value: `+${kpis.newlyDetected}`,
      subtext: 'Within past 24 hours',
      icon: TrendingUp,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bgGlow: 'bg-amber-500/5'
    },
    {
      id: 'connected-entities',
      title: 'Connected Entities',
      value: kpis.connectedEntities,
      subtext: 'Accounts, Devices, UPIs, Phones',
      icon: Users,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      bgGlow: 'bg-blue-500/5'
    },
    {
      id: 'suspicious-transactions',
      title: 'Suspicious Transactions',
      value: kpis.suspiciousTransactions,
      subtext: 'Linked across syndicates',
      icon: ShieldAlert,
      color: 'text-purple-400',
      border: 'border-purple-500/20',
      bgGlow: 'bg-purple-500/5'
    },
    {
      id: 'suspicious-exposure',
      title: 'Suspicious Exposure',
      value: formatExposure(kpis.suspiciousExposure),
      subtext: `₹${kpis.suspiciousExposure.toLocaleString('en-IN')} cumulative`,
      icon: IndianRupee,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`relative overflow-hidden rounded-xl border ${card.border} ${card.bgGlow} p-4 backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:translate-y-[-1px]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{card.title}</span>
              <div className={`p-1.5 rounded-lg bg-slate-900/60 ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${card.color}`}>
                {card.value}
              </span>
              {card.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                  {card.badge}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-1 truncate">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};
