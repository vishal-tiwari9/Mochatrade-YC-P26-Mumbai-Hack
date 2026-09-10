import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { MoneyFlowPath, TraceQueryResult, QuickScenario } from './types';
import { Navbar } from './components/Navbar';
import { MoneyFlowSearch } from './components/MoneyFlowSearch';
import { MoneyFlowSummary } from './components/MoneyFlowSummary';
import { MoneyFlowGraph } from './components/MoneyFlowGraph';
import { MoneyFlowAnimation } from './components/MoneyFlowAnimation';
import { AttackPathView } from './components/AttackPathView';
import { FundRetentionAnalysis } from './components/FundRetentionAnalysis';
import { PathTimeline } from './components/PathTimeline';
import { PatternCards } from './components/PatternCards';
import { PathRiskScore } from './components/PathRiskScore';
import { TransactionTable } from './components/TransactionTable';
import { EntityDetails } from './components/EntityDetails';
import { ContractModal } from './components/ContractModal';
import { AuditLogModal } from './components/AuditLogModal';
import { Network, ShieldAlert, Sparkles, Activity, Layers, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  // State
  const [activeQuery, setActiveQuery] = useState<string>('TXN-FNX-9001');
  const [activeDirection, setActiveDirection] = useState<'outgoing' | 'incoming' | 'both'>('outgoing');
  const [activeHops, setActiveHops] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'moneyFlow' | 'attackPath'>('moneyFlow');

  const [traceResult, setTraceResult] = useState<TraceQueryResult | null>(null);
  const [activePath, setActivePath] = useState<MoneyFlowPath | null>(null);
  const [quickScenarios, setQuickScenarios] = useState<QuickScenario[]>([]);
  const [dataSourceStatus, setDataSourceStatus] = useState<any>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [contractModalOpen, setContractModalOpen] = useState<boolean>(false);
  const [contractData, setContractData] = useState<any>(null);
  const [auditLogsModalOpen, setAuditLogsModalOpen] = useState<boolean>(false);

  // Initial Load
  useEffect(() => {
    // Load quick scenarios & data source status
    api.getQuickScenarios().then(setQuickScenarios).catch(console.error);
    api.getDataSourceStatus().then(setDataSourceStatus).catch(console.error);

    // Initial Trace of primary case
    executeTrace('TXN-FNX-9001', 'outgoing', 5);
  }, []);

  const executeTrace = async (query: string, direction: 'outgoing' | 'incoming' | 'both', hops: number) => {
    setLoading(true);
    setActiveQuery(query);
    setActiveDirection(direction);
    setActiveHops(hops);
    try {
      const res = await api.traceMoneyFlow(query, direction, hops);
      setTraceResult(res);
      setActivePath(res.activePath);
      setSelectedNodeId(null);
      setSelectedTxId(null);
    } catch (err: any) {
      console.error('Trace execution failed', err);
      showToast(`Trace error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const target = activePath ? activePath.destinationEntity : 'ACC121';
      const result = await api.simulateIncomingTransaction(target);
      showToast(result.message);

      // Refresh trace immediately to reflect live simulated node & edge
      await executeTrace(activeQuery, activeDirection, activeHops);
    } catch (err: any) {
      showToast(`Simulation failed: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleOpenContract = async () => {
    if (!activePath) return;
    try {
      const contract = await api.getContract(activePath.pathId);
      setContractData(contract);
      setContractModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStepHighlight = (nodeId: string | null, txId: string | null) => {
    setSelectedNodeId(nodeId);
    setSelectedTxId(txId);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        dataSourceStatus={dataSourceStatus}
        onSimulate={handleSimulate}
        isSimulating={simulating}
        onOpenAuditLogs={() => setAuditLogsModalOpen(true)}
        onOpenContract={handleOpenContract}
      />

      {/* Main Investigation Workspace */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* Search & Trace Controls */}
        <MoneyFlowSearch
          onSearch={executeTrace}
          isLoading={loading}
          activeQuery={activeQuery}
          activeDirection={activeDirection}
          activeHops={activeHops}
          quickScenarios={quickScenarios}
        />

        {/* Executive Forensic Summary Cards */}
        <MoneyFlowSummary path={activePath} />

        {/* View Mode Switcher */}
        <div className="flex items-center justify-between bg-dark-900 p-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setViewMode('moneyFlow')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'moneyFlow'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-800'
              }`}
              id="tab-money-flow"
            >
              <Network className="w-4 h-4" />
              <span>Money Flow Network Graph</span>
            </button>

            <button
              onClick={() => setViewMode('attackPath')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'attackPath'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-dark-800'
              }`}
              id="tab-attack-path"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Attack Path Forensic Pipeline</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 font-mono pr-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Active Graph Status: Operational</span>
          </div>
        </div>

        {/* Path Replay Animation Player */}
        <MoneyFlowAnimation
          path={activePath}
          onStepHighlight={handleStepHighlight}
        />

        {/* View Mode 2: Attack Path Role View */}
        {viewMode === 'attackPath' && (
          <AttackPathView
            path={activePath}
            onSelectNode={setSelectedNodeId}
            selectedNodeId={selectedNodeId}
          />
        )}

        {/* Interactive Graph & Forensic Intelligence Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Main Cytoscape Canvas (2 Columns on XL) */}
          <div className="xl:col-span-2">
            <MoneyFlowGraph
              path={activePath}
              onSelectNode={setSelectedNodeId}
              onSelectEdge={setSelectedTxId}
              selectedNodeId={selectedNodeId}
              selectedTxId={selectedTxId}
            />
          </div>

          {/* Side Intelligence Panel (1 Column) */}
          <div className="space-y-4">
            {activePath && (
              <PathRiskScore
                score={activePath.riskScore}
                level={activePath.riskLevel}
                breakdown={activePath.riskBreakdown}
              />
            )}
            {activePath && (
              <PathTimeline
                transactions={activePath.transactions}
                totalDurationMinutes={activePath.durationMinutes}
              />
            )}
          </div>
        </div>

        {/* Anomalous Patterns (Fan-Out, Fan-In, Circular Flow) */}
        {activePath && (
          <PatternCards
            fanOuts={activePath.fanOutPatterns}
            fanIns={activePath.fanInPatterns}
            circularFlows={activePath.circularFlows}
            onSelectNode={setSelectedNodeId}
          />
        )}

        {/* Fund Retention & Transformation Waterfall */}
        {activePath && (
          <FundRetentionAnalysis stages={activePath.retentionAnalysis} />
        )}

        {/* Interactive Transaction Table */}
        {activePath && (
          <TransactionTable
            transactions={activePath.transactions}
            onSelectTx={setSelectedTxId}
            selectedTxId={selectedTxId}
          />
        )}
      </main>

      {/* Slide-out Entity Details Drawer */}
      <EntityDetails
        entityId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        onTraceFromThis={(accId) => executeTrace(accId, 'outgoing', 5)}
      />

      {/* Integration Contract Modal */}
      <ContractModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        contract={contractData}
      />

      {/* Forensic Audit Log Modal */}
      <AuditLogModal
        isOpen={auditLogsModalOpen}
        onClose={() => setAuditLogsModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-dark-900 border border-cyan-500/60 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom duration-300 font-mono text-xs">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
