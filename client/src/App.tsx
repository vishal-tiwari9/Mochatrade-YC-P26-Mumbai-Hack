import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { TopKpiBar } from './components/TopKpiBar.js';
import { FiltersBar } from './components/FiltersBar.js';
import { ClusterTable } from './components/ClusterTable.js';
import { ClusterDetailView } from './components/ClusterDetailView.js';
import { DataSourceModal } from './components/DataSourceModal.js';
import { AuditLogDrawer } from './components/AuditLogDrawer.js';
import { 
  FraudCluster, 
  TopKpis, 
  DataSourceStatus, 
  AuditLogEntry 
} from './types/index.js';
import { 
  fetchClusters, 
  fetchDataSourceStatus, 
  fetchAuditLogs, 
  reloadDataset, 
  logAuditAction 
} from './services/api.js';
import { Shield, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [clusters, setClusters] = useState<FraudCluster[]>([]);
  const [kpis, setKpis] = useState<TopKpis | null>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [minScore, setMinScore] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');

  // Modals & Drawers
  const [isDataSourceModalOpen, setIsDataSourceModalOpen] = useState<boolean>(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState<boolean>(false);
  const [dataSourceStatus, setDataSourceStatus] = useState<DataSourceStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isReloading, setIsReloading] = useState<boolean>(false);

  // Check URL params for deep linking (e.g. /fraud-clusters/:clusterId)
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/fraud-clusters\/([^\/]+)/);
    if (match && match[1]) {
      setSelectedClusterId(match[1]);
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clusterData, dsStatus] = await Promise.all([
        fetchClusters({
          riskLevel: selectedRiskLevel,
          minScore,
          status: selectedStatus,
          search: searchQuery
        }),
        fetchDataSourceStatus()
      ]);

      setClusters(clusterData.clusters);
      setKpis(clusterData.kpis);
      setDataSourceStatus(dsStatus);
    } catch (error) {
      console.error('Failed to fetch fraud cluster data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRiskLevel, minScore, selectedStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await reloadDataset();
      await loadData();
      logAuditAction('RELOAD_DATASET', undefined, { status: 'SUCCESS' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsReloading(false);
    }
  };

  const handleOpenAuditLogs = async () => {
    try {
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
      setIsAuditLogsOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    window.history.pushState({}, '', `/fraud-clusters/${clusterId}`);
    logAuditAction('OPEN_CLUSTER', clusterId);
  };

  const handleBackToList = () => {
    setSelectedClusterId(null);
    window.history.pushState({}, '', '/');
    loadData();
  };

  const handleResetFilters = () => {
    setSelectedRiskLevel('ALL');
    setMinScore(0);
    setSelectedStatus('ALL');
    setSelectedChannel('ALL');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navigation */}
      <Navbar
        dataSourceStatus={dataSourceStatus}
        onOpenDataSourceModal={() => setIsDataSourceModalOpen(true)}
        onOpenAuditLogs={handleOpenAuditLogs}
        onReloadData={handleReload}
        isReloading={isReloading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {selectedClusterId ? (
          /* Detailed Cluster Investigation View */
          <ClusterDetailView
            clusterId={selectedClusterId}
            onBack={handleBackToList}
          />
        ) : (
          /* Clusters Dashboard & List View */
          <div className="space-y-6">
            
            {/* Top KPIs Bar */}
            <TopKpiBar kpis={kpis} />

            {/* Filters Bar */}
            <FiltersBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRiskLevel={selectedRiskLevel}
              onRiskLevelChange={setSelectedRiskLevel}
              minScore={minScore}
              onMinScoreChange={setMinScore}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedChannel={selectedChannel}
              onChannelChange={setSelectedChannel}
              onResetFilters={handleResetFilters}
            />

            {/* Clusters Table Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <span>Detected Syndicate Clusters</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 font-normal">
                    {clusters.length} Found
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Entities clustered across shared device fingerprints, phone hashes, common beneficiaries, and circular money movements.
                </p>
              </div>

              {isLoading && (
                <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluating Graph...</span>
                </div>
              )}
            </div>

            {/* Clusters Table */}
            <ClusterTable
              clusters={clusters}
              onSelectCluster={handleSelectCluster}
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#060910] py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FraudNexus &bull; Feature 4: Coordinated Fraud Cluster Detection</span>
          <span className="text-slate-600">
            Security Guarantee: Synthetic/Anonymized Demo Data &bull; Zero Raw PII &bull; Production Adapter Ready
          </span>
        </div>
      </footer>

      {/* Data Source Architecture Modal */}
      <DataSourceModal
        isOpen={isDataSourceModalOpen}
        onClose={() => setIsDataSourceModalOpen(false)}
        status={dataSourceStatus}
      />

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={auditLogs}
        onRefresh={handleOpenAuditLogs}
      />

    </div>
  );
};
