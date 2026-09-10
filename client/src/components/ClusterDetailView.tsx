import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  Play, 
  FileCode, 
  RefreshCw, 
  Smartphone, 
  Phone, 
  Landmark, 
  CreditCard, 
  AlertOctagon, 
  CheckCircle,
  ExternalLink,
  Users,
  Activity,
  Calendar,
  Layers,
  IndianRupee
} from 'lucide-react';
import { 
  FraudCluster, 
  ClusterNetworkGraph, 
  ClusterGrowthPoint, 
  IntegrationContract, 
  NormalizedTransaction,
  RiskLevel 
} from '../types/index.js';
import { 
  fetchClusterDetail, 
  fetchClusterNetwork, 
  fetchClusterGrowth, 
  fetchClusterTransactions, 
  fetchIntegrationContract 
} from '../services/api.js';
import { NetworkGraph } from './NetworkGraph.js';
import { ExplainableIndicators } from './ExplainableIndicators.js';
import { ClusterGrowthChart } from './ClusterGrowthChart.js';
import { NetworkDiscoveryAnimation } from './NetworkDiscoveryAnimation.js';
import { LiveSimulationModal } from './LiveSimulationModal.js';
import { IntegrationContractModal } from './IntegrationContractModal.js';

interface ClusterDetailViewProps {
  clusterId: string;
  onBack: () => void;
}

export const ClusterDetailView: React.FC<ClusterDetailViewProps> = ({ clusterId, onBack }) => {
  const [cluster, setCluster] = useState<FraudCluster | null>(null);
  const [networkGraph, setNetworkGraph] = useState<ClusterNetworkGraph | null>(null);
  const [growthData, setGrowthData] = useState<ClusterGrowthPoint[]>([]);
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [contract, setContract] = useState<IntegrationContract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAnimationOpen, setIsAnimationOpen] = useState<boolean>(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [isContractOpen, setIsContractOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'ANALYSIS' | 'TRANSACTIONS'>('GRAPH');

  const loadClusterData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [clusterRes, graphRes, growthRes, txnRes, contractRes] = await Promise.all([
        fetchClusterDetail(clusterId),
        fetchClusterNetwork(clusterId),
        fetchClusterGrowth(clusterId),
        fetchClusterTransactions(clusterId),
        fetchIntegrationContract(clusterId)
      ]);

      setCluster(clusterRes);
      setNetworkGraph(graphRes);
      setGrowthData(growthRes);
      setTransactions(txnRes);
      setContract(contractRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load cluster details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClusterData();
  }, [clusterId]);

  if (isLoading) {
    return (
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-16 text-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
        <p className="text-sm font-mono text-slate-300">Resolving Heterogeneous Fraud Graph for {clusterId}...</p>
      </div>
    );
  }

  if (error || !cluster) {
    return (
      <div className="bg-[#0f172a]/60 border border-red-500/30 rounded-2xl p-12 text-center">
        <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">Investigation Data Unavailable</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">{error || 'Cluster could not be found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-mono"
        >
          Return to Cluster List
        </button>
      </div>
    );
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL': return 'text-red-400 border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.25)]';
      case 'HIGH': return 'text-orange-400 border-orange-500/50 bg-orange-500/10';
      case 'MEDIUM': return 'text-amber-400 border-amber-500/50 bg-amber-500/10';
      case 'LOW': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Top Navigation & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0f172a]/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
        
        {/* Left: Back button & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to All Clusters"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase text-slate-400">INVESTIGATION DOSSIER:</span>
              <h2 className="text-lg font-bold text-white font-mono tracking-tight">{cluster.clusterId}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${getRiskColor(cluster.riskLevel)}`}>
                {cluster.riskScore} / 100 {cluster.riskLevel}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {cluster.status}
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-0.5">
              Classification: <strong className="text-slate-200">Potential Coordinated Fraud Network</strong> &bull; Requires Immediate Forensic Review
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Simulate Live Transaction */}
          <button
            onClick={() => setIsSimulationOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate Incoming Transaction</span>
          </button>

          {/* Discovery Animation */}
          <button
            onClick={() => setIsAnimationOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>Discovery Animation</span>
          </button>

          {/* Export Integration Contract */}
          <button
            onClick={() => setIsContractOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Contract JSON</span>
          </button>

          {/* Reload button */}
          <button
            onClick={loadClusterData}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            title="Refresh Cluster State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Network Composition Dynamic Metric Cards (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono">
          <div className="flex items-center justify-center space-x-1.5 text-cyan-400 text-xs mb-1">
            <Landmark className="w-3.5 h-3.5" />
            <span>Accounts</span>
          </div>
          <span className="text-2xl font-bold text-white">{cluster.entityBreakdown.accounts}</span>
          <span className="text-[10px] text-slate-500 block">Bank Accounts</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono">
          <div className="flex items-center justify-center space-x-1.5 text-teal-400 text-xs mb-1">
            <CreditCard className="w-3.5 h-3.5" />
            <span>UPI IDs</span>
          </div>
          <span className="text-2xl font-bold text-white">{cluster.entityBreakdown.upis}</span>
          <span className="text-[10px] text-slate-500 block">Virtual Payment Addr</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono">
          <div className="flex items-center justify-center space-x-1.5 text-slate-400 text-xs mb-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Devices</span>
          </div>
          <span className="text-2xl font-bold text-white">{cluster.entityBreakdown.devices}</span>
          <span className="text-[10px] text-slate-500 block">Shared Fingerprints</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono">
          <div className="flex items-center justify-center space-x-1.5 text-purple-400 text-xs mb-1">
            <Phone className="w-3.5 h-3.5" />
            <span>Phones</span>
          </div>
          <span className="text-2xl font-bold text-white">{cluster.entityBreakdown.phones}</span>
          <span className="text-[10px] text-slate-500 block">Hashed Mobile Identifiers</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono">
          <div className="flex items-center justify-center space-x-1.5 text-amber-400 text-xs mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Transactions</span>
          </div>
          <span className="text-2xl font-bold text-white">{cluster.transactionCount}</span>
          <span className="text-[10px] text-slate-500 block">Inter-connected Txns</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center font-mono">
          <div className="flex items-center justify-center space-x-1.5 text-rose-400 text-xs mb-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Incidents</span>
          </div>
          <span className="text-2xl font-bold text-rose-400">{cluster.entityBreakdown.incidents}</span>
          <span className="text-[10px] text-slate-500 block">Reported FIRs / Mule Flags</span>
        </div>

      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('GRAPH')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono rounded-lg transition ${
            activeTab === 'GRAPH'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Interactive Network Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('ANALYSIS')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono rounded-lg transition ${
            activeTab === 'ANALYSIS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Explainable Indicators & Growth</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono rounded-lg transition ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Syndicate Ledger ({transactions.length})</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'GRAPH' && networkGraph && (
        <div className="space-y-4">
          <NetworkGraph graphData={networkGraph} clusterId={cluster.clusterId} />

          {/* Quick stats ribbon below graph */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Suspicious Financial Exposure</span>
              <span className="text-base font-bold text-emerald-400">
                ₹{cluster.exposure.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5">Aggregated across all cluster accounts</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Observation Window</span>
              <span className="text-slate-200 text-xs font-bold block">
                {new Date(cluster.firstDetected).toLocaleDateString()} &rarr; {new Date(cluster.lastActivity).toLocaleDateString()}
              </span>
              <span className="text-rose-400 text-[11px] block mt-0.5">Network Growth: +{cluster.growthRate}%</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 block text-[10px] uppercase">Autonomous Action Recommendation</span>
              <span className="text-red-400 font-bold text-xs block">FREEZE MULE EGRESS ACCOUNTS</span>
              <span className="text-slate-400 text-[11px] block mt-0.5">Notify Cyber Cell & Inter-bank Switch</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ANALYSIS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ExplainableIndicators indicators={cluster.indicators} totalScore={cluster.riskScore} />
          <ClusterGrowthChart growthData={growthData} clusterId={cluster.clusterId} />
        </div>
      )}

      {activeTab === 'TRANSACTIONS' && (
        <div className="bg-[#0f172a]/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-200 uppercase">
              Cluster Transaction Stream ({transactions.length} Records)
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Total Sum: ₹{cluster.exposure.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Txn ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Sender &rarr; Receiver</th>
                  <th className="py-2.5 px-3">Device / Phone</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.slice(0, 100).map((t) => (
                  <tr key={t.transactionId} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-cyan-300 font-bold">{t.transactionId}</td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">{new Date(t.timestamp).toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <span className="text-slate-200">{t.senderAccountId}</span>
                      <span className="text-slate-500 mx-1">&rarr;</span>
                      <span className="text-slate-200">{t.receiverAccountId}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">{t.deviceId || t.phoneHash || 'N/A'}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {t.channel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discovery Animation Modal */}
      <NetworkDiscoveryAnimation
        isOpen={isAnimationOpen}
        onClose={() => setIsAnimationOpen(false)}
        clusterId={cluster.clusterId}
      />

      {/* Live Simulation Modal */}
      <LiveSimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        clusterId={cluster.clusterId}
        onSuccess={() => {
          loadClusterData();
        }}
      />

      {/* Integration Contract Modal */}
      <IntegrationContractModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        contract={contract}
      />

    </div>
  );
};
