import React, { useState, useMemo } from 'react';
import '../App.css';
import { fraudCase, secondaryFraudCase } from '../data/mockFraudCase';
import InvestigationHeader from '../components/InvestigationHeader';
import FraudNetworkGraph from '../components/FraudNetworkGraph';
import RiskScorePanel from '../components/RiskScorePanel';
import NodeDetailDrawer from '../components/NodeDetailDrawer';

export default function Workspace() {
  const [selectedCaseId, setSelectedCaseId] = useState(fraudCase.caseId);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeRiskFactorId, setActiveRiskFactorId] = useState(null);

  const availableCases = useMemo(() => [fraudCase, secondaryFraudCase], []);

  // Active case object (In production: replaced with async hook `useFraudCase(selectedCaseId)`)
  const currentCase = useMemo(() => {
    return availableCases.find(c => c.caseId === selectedCaseId) || fraudCase;
  }, [selectedCaseId, availableCases]);

  // Active selected node object
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return currentCase.nodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, currentCase]);

  // Handle case switching (resets node selection and highlights)
  const handleSwitchCase = (newCaseId) => {
    setSelectedCaseId(newCaseId);
    setSelectedNodeId(null);
    setActiveRiskFactorId(null);
  };

  // Node selection handler
  const handleSelectNode = (nodeId) => {
    setSelectedNodeId(prev => prev === nodeId ? null : nodeId);
  };

  return (
    <div className="fraudnexus-app">
      {/* 1. Global Investigation Header */}
      <InvestigationHeader
        currentCase={currentCase}
        onSwitchCase={handleSwitchCase}
        availableCases={availableCases}
      />

      {/* 2. Main Workspace Layout */}
      <main className="investigation-workspace">
        {/* Left / Center Area: Animated Fraud Network Graph */}
        <section className="network-graph-section">
          <div className="graph-panel-card">
            <FraudNetworkGraph
              fraudCase={currentCase}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
              activeRiskFactorId={activeRiskFactorId}
            />

            {/* Floating / Embedded Node Details Drawer when an entity is clicked */}
            {selectedNode && (
              <NodeDetailDrawer
                node={selectedNode}
                fraudCase={currentCase}
                onClose={() => setSelectedNodeId(null)}
                onSelectRiskFactor={(rfId) => setActiveRiskFactorId(rfId)}
              />
            )}
          </div>
        </section>

        {/* Right Area: Explainable Risk Score Panel */}
        <section className="risk-score-section">
          <RiskScorePanel
            fraudCase={currentCase}
            selectedNodeId={selectedNodeId}
            activeRiskFactorId={activeRiskFactorId}
            setActiveRiskFactorId={setActiveRiskFactorId}
            onSelectNode={handleSelectNode}
          />
        </section>
      </main>
    </div>
  );
}
