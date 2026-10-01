import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Layers, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Check, 
  Sliders,
  ExternalLink,
  Target
} from 'lucide-react';

export default function RiskScorePanel({
  fraudCase,
  selectedNodeId,
  activeRiskFactorId,
  setActiveRiskFactorId,
  onSelectNode
}) {
  const riskScore = fraudCase?.riskScore ?? 0;
  const severity = fraudCase?.severity || 'HIGH';
  const riskFactors = fraudCase?.riskFactors || [];
  const riskScoreBands = fraudCase?.riskScoreBands || [
    { label: "LOW", min: 0, max: 39, color: "#10b981" },
    { label: "MEDIUM", min: 40, max: 69, color: "#f59e0b" },
    { label: "HIGH", min: 70, max: 89, color: "#f97316" },
    { label: "CRITICAL", min: 90, max: 100, color: "#ef4444" }
  ];

  const [expandedFactorId, setExpandedFactorId] = useState(null);
  const [showBandsModal, setShowBandsModal] = useState(false);

  // Compute matching band based on score
  const currentBand = useMemo(() => {
    return riskScoreBands.find(b => riskScore >= b.min && riskScore <= b.max) || riskScoreBands[riskScoreBands.length - 1];
  }, [riskScore, riskScoreBands]);

  // Total points validation
  const totalFactorPoints = useMemo(() => {
    return riskFactors.reduce((sum, rf) => sum + (rf.points || 0), 0);
  }, [riskFactors]);

  // Check if selected node is linked to risk factors
  const selectedNodeLinkedFactorIds = useMemo(() => {
    if (!selectedNodeId) return new Set();
    const node = fraudCase?.nodes?.find(n => n.id === selectedNodeId);
    if (!node) return new Set();
    return new Set(node.riskFactorIds || []);
  }, [selectedNodeId, fraudCase]);

  // Circular gauge calculations (SVG dashoffset)
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc for speedometer gauge look
  const arcLength = circumference * 0.75;
  const progressOffset = arcLength - (riskScore / 100) * arcLength;

  return (
    <aside className="risk-score-panel">
      {/* Panel Header */}
      <div className="risk-panel-header">
        <div className="header-title-group">
          <div className="header-icon-wrap">
            <ShieldAlert size={18} className="text-red" />
          </div>
          <div>
            <h2 className="panel-title">Explainable Risk Score</h2>
            <p className="panel-subtitle">NexusAI Heuristic & Graph Neural Breakdown</p>
          </div>
        </div>

        <button 
          className="info-icon-btn"
          onClick={() => setShowBandsModal(prev => !prev)}
          title="View Risk Score Bands"
        >
          <HelpCircle size={15} />
        </button>
      </div>

      {/* Configurable Bands Info Banner (Toggleable) */}
      {showBandsModal && (
        <div className="bands-legend-card">
          <div className="bands-legend-header">
            <Sliders size={13} />
            <span>Configurable Risk Bands</span>
          </div>
          <div className="bands-grid">
            {riskScoreBands.map((band) => (
              <div 
                key={band.label} 
                className={`band-item ${currentBand.label === band.label ? 'active-band' : ''}`}
                style={{ borderColor: currentBand.label === band.label ? band.color : 'transparent' }}
              >
                <div className="band-color-dot" style={{ backgroundColor: band.color }} />
                <span className="band-name">{band.label}</span>
                <span className="band-range">{band.min}–{band.max}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gauge Meter Section */}
      <div className="gauge-section">
        <div className="gauge-wrapper">
          <svg className="gauge-svg" width="160" height="140" viewBox="0 0 160 140">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
              <filter id="gaugeGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Arc Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#1f2937"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(135 80 80)"
            />

            {/* Active Value Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              transform="rotate(135 80 80)"
              filter="url(#gaugeGlow)"
              className="gauge-active-bar"
            />
          </svg>

          {/* Center Score Numbers */}
          <div className="gauge-center-content">
            <div className="score-number-display">
              <span className="score-value">{riskScore}</span>
              <span className="score-max">/100</span>
            </div>
            <div 
              className="severity-tag"
              style={{ 
                color: currentBand.color,
                backgroundColor: currentBand.bg || 'rgba(239, 68, 68, 0.15)',
                borderColor: currentBand.border || currentBand.color
              }}
            >
              <Flame size={12} className="icon-burn" />
              <span>{currentBand.label}</span>
            </div>
          </div>
        </div>

        {/* Score Summary Metrics */}
        <div className="gauge-meta-stats">
          <div className="meta-stat-item">
            <span className="stat-label">Contributing Factors</span>
            <span className="stat-value">{riskFactors.length} Rules Triggered</span>
          </div>
          <div className="meta-stat-item">
            <span className="stat-label">Factor Points Sum</span>
            <span className="stat-value text-amber">{totalFactorPoints} / 100 pts</span>
          </div>
        </div>
      </div>

      {/* Contributing Reasons Section */}
      <div className="reasons-section">
        <div className="reasons-header">
          <div className="reasons-title-row">
            <Layers size={14} />
            <h3 className="reasons-title">Contributing Risk Breakdown</h3>
          </div>
          <span className="explain-hint">Hover row to highlight nodes in graph</span>
        </div>

        {/* Contributing Reason Rows */}
        <div className="reasons-list">
          {riskFactors.map((factor, index) => {
            const isHovered = activeRiskFactorId === factor.id;
            const isTriggeredBySelectedNode = selectedNodeLinkedFactorIds.has(factor.id);
            const isExpanded = expandedFactorId === factor.id;
            const percentage = Math.round((factor.points / 100) * 100);

            return (
              <div
                key={factor.id}
                id={`risk-factor-${factor.id}`}
                className={`reason-card ${isHovered ? 'hover-active' : ''} ${isTriggeredBySelectedNode ? 'node-triggered' : ''}`}
                onMouseEnter={() => setActiveRiskFactorId(factor.id)}
                onMouseLeave={() => setActiveRiskFactorId(null)}
                onClick={() => setExpandedFactorId(prev => prev === factor.id ? null : factor.id)}
              >
                {/* Highlight Tag when selected node triggers this */}
                {isTriggeredBySelectedNode && (
                  <div className="linked-trigger-pill">
                    <Sparkles size={11} />
                    <span>Linked to Selected Node</span>
                  </div>
                )}

                <div className="reason-main-row">
                  <div className="reason-left">
                    <div className="reason-bullet-index">
                      <span>{index + 1}</span>
                    </div>
                    <div className="reason-title-block">
                      <span className="reason-label">{factor.label}</span>
                      <span className="reason-desc-preview">{factor.description}</span>
                    </div>
                  </div>

                  <div className="reason-right">
                    <div className="points-badge">
                      <span className="points-plus">+</span>
                      <span className="points-num">{factor.points}</span>
                    </div>
                    <button className="expand-chevron" onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFactorId(prev => prev === factor.id ? null : factor.id);
                    }}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                </div>

                {/* Point weight progress bar */}
                <div className="reason-point-track">
                  <div 
                    className="reason-point-bar"
                    style={{ 
                      width: `${(factor.points / 35) * 100}%`,
                      backgroundColor: factor.points >= 25 ? '#ef4444' : factor.points >= 15 ? '#f97316' : '#f59e0b'
                    }}
                  />
                </div>

                {/* Expanded Forensic Evidence Details */}
                {isExpanded && (
                  <div className="reason-details-drawer">
                    <div className="evidence-box">
                      <strong className="evidence-header">Forensic Telemetry:</strong>
                      <p className="evidence-text">{factor.evidence || factor.description}</p>
                    </div>

                    {/* Linked Entity Tags */}
                    {factor.nodeIds && factor.nodeIds.length > 0 && (
                      <div className="linked-nodes-row">
                        <span className="linked-label">Associated Graph Entities:</span>
                        <div className="linked-tags-list">
                          {factor.nodeIds.map((nodeId) => {
                            const nodeObj = fraudCase?.nodes?.find(n => n.id === nodeId);
                            return (
                              <button
                                key={nodeId}
                                className={`entity-tag-btn ${selectedNodeId === nodeId ? 'active-tag' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectNode(nodeId);
                                }}
                              >
                                <Target size={10} />
                                <span>{nodeObj?.label || nodeId}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explainability Footer Summary */}
      <div className="risk-panel-footer">
        <div className="footer-explain-banner">
          <Sparkles size={14} className="text-cyan" />
          <span>
            <strong>Deterministic Attribution:</strong> All contributing weights map 1:1 with revealed telemetry nodes.
          </span>
        </div>
      </div>
    </aside>
  );
}
