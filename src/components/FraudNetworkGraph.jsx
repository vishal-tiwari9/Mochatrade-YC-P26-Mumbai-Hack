import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  CreditCard, 
  Smartphone, 
  Laptop, 
  AtSign, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  Radio, 
  Eye, 
  Info,
  Sparkles
} from 'lucide-react';

// Icon mapper for entity node types
const getNodeIcon = (type) => {
  switch (type) {
    case 'TRANSACTION':
      return CreditCard;
    case 'ACCOUNT':
      return Building2;
    case 'UPI':
      return AtSign;
    case 'PHONE':
      return Smartphone;
    case 'DEVICE':
      return Laptop;
    default:
      return ShieldAlert;
  }
};

// Node styling by risk level
const getRiskColors = (level) => {
  switch (level) {
    case 'CRITICAL':
      return {
        stroke: '#ef4444',
        fill: 'rgba(239, 68, 68, 0.16)',
        glow: 'rgba(239, 68, 68, 0.45)',
        badgeBg: '#450a0a',
        badgeText: '#fca5a5'
      };
    case 'HIGH':
      return {
        stroke: '#f97316',
        fill: 'rgba(249, 115, 22, 0.16)',
        glow: 'rgba(249, 115, 22, 0.45)',
        badgeBg: '#431407',
        badgeText: '#fdba74'
      };
    case 'MEDIUM':
      return {
        stroke: '#f59e0b',
        fill: 'rgba(245, 158, 11, 0.16)',
        glow: 'rgba(245, 158, 11, 0.4)',
        badgeBg: '#451a03',
        badgeText: '#fde68a'
      };
    case 'LOW':
    default:
      return {
        stroke: '#06b6d4',
        fill: 'rgba(6, 182, 212, 0.14)',
        glow: 'rgba(6, 182, 212, 0.4)',
        badgeBg: '#083344',
        badgeText: '#67e8f9'
      };
  }
};

export default function FraudNetworkGraph({
  fraudCase,
  selectedNodeId,
  onSelectNode,
  activeRiskFactorId
}) {
  const nodes = fraudCase?.nodes || [];
  const edges = fraudCase?.edges || [];

  // Determine max step in the investigation
  const maxStep = useMemo(() => {
    const maxNodeStep = Math.max(...nodes.map(n => n.step ?? 0), 0);
    const maxEdgeStep = Math.max(...edges.map(e => e.step ?? 0), 0);
    return Math.max(maxNodeStep, maxEdgeStep);
  }, [nodes, edges]);

  // Discovery animation state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 1x = 900ms, 1.5x = 600ms, 2x = 450ms
  
  // Canvas Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const timerRef = useRef(null);
  const svgRef = useRef(null);

  // Total visible nodes at current step
  const visibleNodes = useMemo(() => {
    return nodes.filter(n => (n.step ?? 0) <= currentStep);
  }, [nodes, currentStep]);

  // Total visible edges at current step
  const visibleEdges = useMemo(() => {
    return edges.filter(e => (e.step ?? 0) <= currentStep);
  }, [edges, currentStep]);

  const isComplete = currentStep >= maxStep;

  // Step advancement timer with clean teardown
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (isPlaying && currentStep < maxStep) {
      const stepDuration = Math.round(950 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= maxStep) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);
    } else if (currentStep >= maxStep) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, currentStep, maxStep, speed]);

  // Reset when case changes
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, [fraudCase?.caseId]);

  // Replay investigation control
  const handleReplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStep(0);
    setIsPlaying(true);
  }, []);

  const handleTogglePlay = () => {
    if (isComplete) {
      handleReplay();
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStep < maxStep) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.15, 2.2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.15, 0.6));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e) => {
    // Only drag when clicking SVG background
    if (e.target.tagName === 'svg' || e.target.classList.contains('canvas-bg')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Node position map for edge rendering
  const nodeMap = useMemo(() => {
    const map = new Map();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Risk factor to nodes mapping
  const riskFactorNodeSet = useMemo(() => {
    if (!activeRiskFactorId) return new Set();
    const rf = fraudCase?.riskFactors?.find(r => r.id === activeRiskFactorId);
    return new Set(rf?.nodeIds || []);
  }, [activeRiskFactorId, fraudCase]);

  // Selected node object
  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  return (
    <div className="graph-container">
      {/* Top Controls & Status Bar */}
      <div className="graph-header-bar">
        <div className="graph-status-section">
          <div className={`status-pill ${isComplete ? 'complete' : 'discovering'}`}>
            <span className="status-indicator-dot"></span>
            <span className="status-text">
              {isComplete ? (
                <>
                  <CheckCircle2 size={14} className="icon-complete" />
                  Investigation Network Mapped ({visibleNodes.length}/{nodes.length} Entities)
                </>
              ) : (
                <>
                  <Radio size={14} className="icon-pulse" />
                  Discovering network… {visibleNodes.length}/{nodes.length} entities
                </>
              )}
            </span>
          </div>

          <div className="discovery-progress-track">
            <div 
              className="discovery-progress-fill" 
              style={{ width: `${(visibleNodes.length / nodes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Playback & View Controls */}
        <div className="graph-controls-section">
          <div className="playback-group">
            <button
              id="btn-play-pause"
              className="control-btn"
              onClick={handleTogglePlay}
              title={isPlaying ? "Pause Discovery" : isComplete ? "Replay Discovery" : "Play Discovery"}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              <span>{isPlaying ? "Pause" : isComplete ? "Replay" : "Play"}</span>
            </button>

            <button
              id="btn-step-forward"
              className="control-btn"
              onClick={handleStepForward}
              disabled={isComplete}
              title="Step Forward (Reveal next entity)"
            >
              <FastForward size={14} />
              <span>Step</span>
            </button>

            <button
              id="btn-replay-investigation"
              className="control-btn replay-btn"
              onClick={handleReplay}
              title="Reset & Replay reveal sequence"
            >
              <RotateCcw size={14} />
              <span>Replay</span>
            </button>

            <div className="speed-selector" title="Discovery Animation Speed">
              {[1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  className={`speed-pill ${speed === s ? 'active' : ''}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="view-controls-group">
            <button className="control-icon-btn" onClick={handleZoomIn} title="Zoom In">
              <ZoomIn size={15} />
            </button>
            <button className="control-icon-btn" onClick={handleZoomOut} title="Zoom Out">
              <ZoomOut size={15} />
            </button>
            <button className="control-icon-btn" onClick={handleResetView} title="Reset Canvas View">
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div 
        className="graph-canvas-wrapper"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if (e.target.tagName === 'svg' || e.target.classList.contains('canvas-bg')) {
            onSelectNode(null);
          }
        }}
      >
        {/* Subtle Canvas Grid Background */}
        <div className="canvas-grid-overlay" />

        <svg
          ref={svgRef}
          className="graph-svg"
          viewBox="0 0 1080 560"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: '50% 50%',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          <defs>
            {/* Edge Gradients */}
            <linearGradient id="edgeGradientCritical" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="edgeGradientCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="edgeGradientHighlighted" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#facc15" stopOpacity="1" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="1" />
            </linearGradient>

            {/* Glowing filter effects */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="heavyGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" result="blur1" />
              <feGaussianBlur stdDeviation="18" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Arrow markers */}
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#06b6d4" />
            </marker>

            <marker
              id="arrow-red"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
            </marker>

            <marker
              id="arrow-highlight"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#facc15" />
            </marker>
          </defs>

          {/* Invisible SVG Backdrop for drag & deselect */}
          <rect
            className="canvas-bg"
            x="-500"
            y="-500"
            width="2200"
            height="1600"
            fill="transparent"
          />

          {/* 1. EDGES LAYER */}
          <g className="edges-layer">
            {visibleEdges.map((edge) => {
              const fromNode = nodeMap.get(edge.from);
              const toNode = nodeMap.get(edge.to);
              if (!fromNode || !toNode) return null;

              // Only render if both endpoints are revealed
              const isFromVisible = (fromNode.step ?? 0) <= currentStep;
              const isToVisible = (toNode.step ?? 0) <= currentStep;
              if (!isFromVisible || !isToVisible) return null;

              // Check if edge is highlighted by active risk factor or selected node
              const isEdgeHighlightedByRisk = activeRiskFactorId && edge.riskFactorIds?.includes(activeRiskFactorId);
              const isEdgeConnectedToSelected = selectedNodeId && (edge.from === selectedNodeId || edge.to === selectedNodeId);
              const isHighlighted = isEdgeHighlightedByRisk || isEdgeConnectedToSelected;

              // Compute smooth bezier curve between nodes
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const cx1 = fromNode.x + dx * 0.45;
              const cy1 = fromNode.y + (dy > 0 ? 10 : -10);
              const cx2 = fromNode.x + dx * 0.55;
              const cy2 = toNode.y + (dy > 0 ? -10 : 10);

              const pathData = `M ${fromNode.x} ${fromNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toNode.x} ${toNode.y}`;
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g 
                  key={edge.id} 
                  className={`graph-edge-group ${isHighlighted ? 'edge-highlighted' : ''}`}
                >
                  {/* Outer Glow Path for highlighted state */}
                  {isHighlighted && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isEdgeHighlightedByRisk ? "#facc15" : "#06b6d4"}
                      strokeWidth="6"
                      strokeOpacity="0.6"
                      filter="url(#glow)"
                    />
                  )}

                  {/* Main Animated Stroke */}
                  <path
                    d={pathData}
                    className="edge-path"
                    fill="none"
                    stroke={
                      isHighlighted 
                        ? (isEdgeHighlightedByRisk ? "#facc15" : "#38bdf8") 
                        : (edge.riskFactorIds?.includes('RF-1') ? 'url(#edgeGradientCritical)' : 'url(#edgeGradientCyan)')
                    }
                    strokeWidth={isHighlighted ? "3" : "2"}
                    strokeDasharray="6 6"
                    markerEnd={isHighlighted ? "url(#arrow-highlight)" : "url(#arrow-cyan)"}
                  />

                  {/* Traveling Pulse Particle */}
                  <circle r={isHighlighted ? "4" : "3"} fill={isHighlighted ? "#fef08a" : "#67e8f9"}>
                    <animateMotion
                      path={pathData}
                      dur={`${Math.max(1.8 / speed, 0.8)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>

                  {/* Edge Relationship Label Pill */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-64"
                      y="-11"
                      width="128"
                      height="22"
                      rx="11"
                      className={`edge-label-pill ${isHighlighted ? 'pill-active' : ''}`}
                    />
                    <text
                      textAnchor="middle"
                      y="3.5"
                      className="edge-label-text"
                    >
                      {edge.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 2. NODES LAYER */}
          <g className="nodes-layer">
            {visibleNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isAssociatedWithRisk = riskFactorNodeSet.has(node.id);
              const isNewlyDiscovered = node.step === currentStep;

              const colors = getRiskColors(node.riskLevel);
              const IconComponent = getNodeIcon(node.type);

              const cardWidth = 140;
              const cardHeight = 72;
              const halfW = cardWidth / 2;
              const halfH = cardHeight / 2;

              return (
                <g
                  key={node.id}
                  id={`node-${node.id}`}
                  className={`graph-node-group ${isSelected ? 'node-selected' : ''} ${isAssociatedWithRisk ? 'node-risk-highlight' : ''}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(isSelected ? null : node.id);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Discovery Radar Pulse Ring on entry */}
                  {isNewlyDiscovered && (
                    <circle
                      r="46"
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth="2"
                      className="discovery-radar-ping"
                    />
                  )}

                  {/* Highlight Glow Halos */}
                  {(isSelected || isAssociatedWithRisk) && (
                    <rect
                      x={-halfW - 6}
                      y={-halfH - 6}
                      width={cardWidth + 12}
                      height={cardHeight + 12}
                      rx="16"
                      fill="none"
                      stroke={isAssociatedWithRisk ? "#facc15" : colors.stroke}
                      strokeWidth="3"
                      filter="url(#heavyGlow)"
                      className="halo-pulse"
                    />
                  )}

                  {/* Main Node Card Background */}
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={cardWidth}
                    height={cardHeight}
                    rx="12"
                    className="node-card-bg"
                    fill="#111827"
                    stroke={
                      isSelected 
                        ? '#38bdf8' 
                        : isAssociatedWithRisk 
                          ? '#facc15' 
                          : isHovered 
                            ? colors.stroke 
                            : colors.glow
                    }
                    strokeWidth={isSelected || isAssociatedWithRisk ? "2.5" : "1.5"}
                  />

                  {/* Top Header Strip showing Node Type */}
                  <rect
                    x={-halfW}
                    y={-halfH}
                    width={cardWidth}
                    height="24"
                    rx="12"
                    fill={colors.fill}
                    className="node-header-strip"
                  />

                  {/* Icon Circle */}
                  <g transform={`translate(${-halfW + 16}, ${-halfH + 12})`}>
                    <circle r="9" fill="#1f2937" stroke={colors.stroke} strokeWidth="1.2" />
                    {/* SVG inline foreignObject or icon */}
                    <foreignObject x="-7" y="-7" width="14" height="14">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.stroke }}>
                        <IconComponent size={11} strokeWidth={2.4} />
                      </div>
                    </foreignObject>
                  </g>

                  {/* Entity Type Label */}
                  <text
                    x={-halfW + 30}
                    y={-halfH + 16}
                    className="node-type-label"
                    fill={colors.stroke}
                  >
                    {node.type}
                  </text>

                  {/* Risk Badge on Header */}
                  <g transform={`translate(${halfW - 32}, ${-halfH + 6})`}>
                    <rect
                      width="26"
                      height="12"
                      rx="3"
                      fill={colors.badgeBg}
                      stroke={colors.stroke}
                      strokeWidth="0.7"
                    />
                    <text
                      x="13"
                      y="9"
                      textAnchor="middle"
                      className="node-risk-badge-text"
                      fill={colors.badgeText}
                    >
                      {node.riskLevel === 'CRITICAL' ? 'CRIT' : node.riskLevel === 'HIGH' ? 'HIGH' : 'MED'}
                    </text>
                  </g>

                  {/* Primary Node Label */}
                  <text
                    x={0}
                    y={-halfH + 42}
                    textAnchor="middle"
                    className="node-primary-title"
                  >
                    {node.label}
                  </text>

                  {/* Secondary Subtitle / Monospace ID */}
                  <text
                    x={0}
                    y={-halfH + 58}
                    textAnchor="middle"
                    className="node-subtitle-mono"
                  >
                    {node.subtitle}
                  </text>

                  {/* Active Indicator Beacon */}
                  {isSelected && (
                    <g transform={`translate(${halfW - 6}, ${-halfH + 6})`}>
                      <circle r="4" fill="#38bdf8" />
                      <circle r="4" fill="#38bdf8" className="beacon-pulse" />
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Quick Hint when no node selected */}
        {!selectedNode && (
          <div className="canvas-floating-hint">
            <Info size={13} />
            <span>Click any entity node to inspect forensic attributes & linked risk factors</span>
          </div>
        )}

        {/* Selected Entity Mini Bar */}
        {selectedNode && (
          <div className="canvas-selected-dock">
            <div className="selected-dock-info">
              <div className="dock-pill">
                <Sparkles size={13} className="text-cyan" />
                <span>Active Selection:</span>
                <strong>{selectedNode.label} ({selectedNode.subtitle})</strong>
              </div>
              <span className="dock-sub">
                Linked to {selectedNode.riskFactorIds?.length || 0} risk score factor{selectedNode.riskFactorIds?.length === 1 ? '' : 's'}
              </span>
            </div>
            <button 
              className="dock-deselect-btn" 
              onClick={() => onSelectNode(null)}
            >
              Deselect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
