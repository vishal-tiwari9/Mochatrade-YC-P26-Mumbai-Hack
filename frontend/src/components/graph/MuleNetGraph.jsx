import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { RotateCcw, Search, AlertCircle, Eye, ShieldAlert } from 'lucide-react';

const colorFor = { account: '#4C8DFF', device: '#F2A93C', subnet: '#8B5CF6' };
const radiusFor = { account: 15, device: 11, subnet: 11 };

export function MuleNetGraph({ onInvestigateAccount }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const tooltipRef = useRef(null);

  const {
    currentDataset,
    riskThreshold,
    setRiskThreshold,
    searchAccountQuery,
    setSearchAccountQuery,
    selectedNode,
    setSelectedNode,
    focusedNodeId,
    setFocusedNodeId,
    openDossier
  } = useDataset();

  const [tooltipData, setTooltipData] = useState(null);

  // References for simulation state
  const simNodesRef = useRef([]);
  const simEdgesRef = useRef([]);
  const dragNodeRef = useRef(null);
  const hoverNodeRef = useRef(null);
  const sizeRef = useRef({ W: 600, H: 450 });

  // Initialize and re-layout when dataset changes
  const initSimulation = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const W = wrap.clientWidth || 600;
    const H = wrap.clientHeight || 450;
    sizeRef.current = { W, H };

    const nodes = currentDataset.nodes || [];
    const edges = currentDataset.edges || [];

    const simNodes = nodes.map((n, i) => {
      // Deterministic spread around center with cluster affinity
      const angle = (i / Math.max(1, nodes.length)) * Math.PI * 2;
      const dist = (n.cluster === 'c1' ? 90 : n.cluster === 'c2' ? 140 : 180) + (i % 3) * 20;
      return {
        ...n,
        x: W / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 20,
        y: H / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0
      };
    });

    const idMap = {};
    simNodes.forEach((n, i) => { idMap[n.id] = i; });

    const simEdges = [];
    edges.forEach(e => {
      if (idMap[e.from] !== undefined && idMap[e.to] !== undefined) {
        simEdges.push({ ...e, a: idMap[e.from], b: idMap[e.to] });
      }
    });

    simNodesRef.current = simNodes;
    simEdgesRef.current = simEdges;
  };

  useEffect(() => {
    initSimulation();
  }, [currentDataset]);

  // Focus node when search query matches or focusedNodeId changes
  useEffect(() => {
    if (!searchAccountQuery) return;
    const query = searchAccountQuery.trim().toUpperCase();
    const found = simNodesRef.current.find(n => n.id.toUpperCase().includes(query));
    if (found) {
      setSelectedNode(found);
      setFocusedNodeId(found.id);
    }
  }, [searchAccountQuery, setSelectedNode, setFocusedNodeId]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const t0 = performance.now();

    function resize() {
      if (!wrap || !canvas) return;
      const W = wrap.clientWidth;
      const H = wrap.clientHeight;
      sizeRef.current = { W, H };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    function tick() {
      const { W, H } = sizeRef.current;
      const simNodes = simNodesRef.current;
      const simEdges = simEdgesRef.current;
      const dragNode = dragNodeRef.current;

      if (!W || !H || simNodes.length === 0) return;
      const centerX = W / 2, centerY = H / 2 + 4;

      // Node repulsion + centering
      for (let i = 0; i < simNodes.length; i++) {
        const n = simNodes[i];
        if (n === dragNode) continue;
        let fx = 0, fy = 0;
        for (let j = 0; j < simNodes.length; j++) {
          if (i === j) continue;
          const o = simNodes[j];
          const dx = n.x - o.x, dy = n.y - o.y;
          const d2 = dx * dx + dy * dy || 0.01;
          const d = Math.sqrt(d2);
          const rep = (n.cluster === o.cluster) ? 1400 : 2200;
          const f = rep / d2;
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }
        fx += (centerX - n.x) * 0.0035;
        fy += (centerY - n.y) * 0.0035;
        n.vx = (n.vx + fx) * 0.76;
        n.vy = (n.vy + fy) * 0.76;
      }

      // Edge spring tension
      simEdges.forEach(e => {
        const a = simNodes[e.a], b = simNodes[e.b];
        if (!a || !b) return;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const rest = e.type === 'tx' ? 95 : 70;
        const k = 0.02;
        const f = (d - rest) * k;
        const ux = dx / d, uy = dy / d;
        if (a !== dragNode) { a.vx += ux * f; a.vy += uy * f; }
        if (b !== dragNode) { b.vx -= ux * f; b.vy -= uy * f; }
      });

      // Boundary clamp
      simNodes.forEach(n => {
        if (n === dragNode) return;
        n.x += n.vx;
        n.y += n.vy;
        const r = (radiusFor[n.type] || 12) + 12;
        n.x = Math.max(r, Math.min(W - r, n.x));
        n.y = Math.max(r, Math.min(H - r, n.y));
      });
    }

    function draw() {
      const { W, H } = sizeRef.current;
      const simNodes = simNodesRef.current;
      const simEdges = simEdgesRef.current;
      const hoverNode = hoverNodeRef.current;

      if (!W || !H || !ctx) return;
      ctx.clearRect(0, 0, W, H);
      const elapsed = (performance.now() - t0) / 1000;

      // Draw Edges
      simEdges.forEach(e => {
        const a = simNodes[e.a], b = simNodes[e.b];
        if (!a || !b) return;
        const critical = a.cluster === 'c1' && b.cluster === 'c1' && e.type === 'tx';
        const elevated = (a.cluster === 'c2' && b.cluster === 'c2');

        // Check if either node fails threshold
        const isDimmed = (a.riskScore !== undefined && a.riskScore < riskThreshold) ||
                         (b.riskScore !== undefined && b.riskScore < riskThreshold);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);

        if (e.type === 'tx') {
          ctx.strokeStyle = isDimmed
            ? 'rgba(80, 90, 110, 0.12)'
            : critical
            ? 'rgba(229,72,77,0.65)'
            : elevated
            ? 'rgba(242,169,60,0.55)'
            : 'rgba(140,150,170,0.28)';
          ctx.lineWidth = critical ? 2.4 : 1.4;
        } else {
          ctx.strokeStyle = isDimmed ? 'rgba(80, 90, 110, 0.08)' : 'rgba(140,150,170,0.18)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Velocity pulse dots along critical edges
        if (critical && !isDimmed) {
          const speed = 0.9;
          const seed = e.tag ? (e.tag.charCodeAt(2) || 40) / 40 : 0.3;
          const p = (elapsed * speed + seed) % 1;
          const px = a.x + (b.x - a.x) * p;
          const py = a.y + (b.y - a.y) * p;
          ctx.beginPath();
          ctx.arc(px, py, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = '#FF8A8D';
          ctx.shadowColor = '#E5484D';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Nodes
      simNodes.forEach(n => {
        const r = radiusFor[n.type] || 12;
        const isSelected = selectedNode && selectedNode.id === n.id;
        const isFocused = focusedNodeId === n.id;
        const isHovered = hoverNode === n;
        const passesThreshold = (n.riskScore === undefined || n.riskScore >= riskThreshold);

        // Outer pulse ring if flagged or high risk
        if (n.flagged && passesThreshold) {
          const pulse = 1 + 0.12 * Math.sin(elapsed * 3.2 + n.x);
          ctx.beginPath();
          ctx.arc(n.x, n.y, (r + 6) * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(229,72,77,0.55)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }

        // Selection / Focus radar highlight
        if ((isSelected || isFocused) && passesThreshold) {
          const focusPulse = 1 + 0.25 * Math.sin(elapsed * 5);
          ctx.beginPath();
          ctx.arc(n.x, n.y, (r + 10) * focusPulse, 0, Math.PI * 2);
          ctx.strokeStyle = '#4C8DFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Base circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHovered ? r + 2 : r, 0, Math.PI * 2);
        ctx.fillStyle = colorFor[n.type] || '#4C8DFF';

        // Opacity based on threshold and cluster
        if (!passesThreshold) {
          ctx.globalAlpha = 0.2;
        } else if (n.cluster === 'n') {
          ctx.globalAlpha = 0.55;
        } else {
          ctx.globalAlpha = 1;
        }

        ctx.fill();
        ctx.globalAlpha = 1;

        // Hover or selected white border
        if (isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, isHovered ? r + 3 : r + 1, 0, Math.PI * 2);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // Label text
        ctx.fillStyle = passesThreshold ? '#0B0F1A' : '#556077';
        ctx.font = '600 9px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (n.type === 'account') {
          ctx.fillText(n.label.slice(-4), n.x, n.y + 0.5);
        } else if (n.type === 'device') {
          ctx.fillText('DEV', n.x, n.y + 0.5);
        } else if (n.type === 'subnet') {
          ctx.fillText('IP', n.x, n.y + 0.5);
        }
      });
    }

    function loop() {
      tick();
      draw();
      animId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [riskThreshold, selectedNode, focusedNodeId]);

  // Pointer Interaction Handlers
  const nodeAt = (x, y) => {
    const simNodes = simNodesRef.current;
    for (let i = simNodes.length - 1; i >= 0; i--) {
      const n = simNodes[i];
      const r = (radiusFor[n.type] || 12) + 4;
      if ((x - n.x) ** 2 + (y - n.y) ** 2 <= r * r) return n;
    }
    return null;
  };

  const handleMouseDown = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const n = nodeAt(x, y);
    if (n) {
      dragNodeRef.current = n;
      setSelectedNode(n);
      setFocusedNodeId(n.id);
    }
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
  };

  const handleMouseMove = e => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const { W } = sizeRef.current;

    if (dragNodeRef.current) {
      dragNodeRef.current.x = x;
      dragNodeRef.current.y = y;
      dragNodeRef.current.vx = 0;
      dragNodeRef.current.vy = 0;
    }

    const n = nodeAt(x, y);
    hoverNodeRef.current = n;

    if (n) {
      setTooltipData({
        id: n.label,
        sub: n.sub,
        type: n.type,
        risk: n.riskScore || (n.flagged ? 94 : 12),
        x: Math.min(x + 14, W - 190),
        y: Math.max(y - 10, 6)
      });
      canvas.style.cursor = 'pointer';
    } else {
      setTooltipData(null);
      canvas.style.cursor = dragNodeRef.current ? 'grabbing' : 'grab';
    }
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
    hoverNodeRef.current = null;
    dragNodeRef.current = null;
  };

  // Investigate selected node
  const handleInvestigateNow = () => {
    const target = selectedNode || simNodesRef.current.find(n => n.flagged);
    if (!target) return;
    // Find matching case or create quick dossier
    const matchedCase = currentDataset.cases?.find(c => c.cluster === target.cluster) || currentDataset.cases?.[0];
    if (matchedCase) {
      openDossier(matchedCase);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Graph Controls Bar */}
      <div className="graph-controls-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Risk Threshold Slider */}
          <div className="graph-control-item">
            <span style={{ color: 'var(--text-faint)' }}>Risk Filter:</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={riskThreshold}
              onChange={e => setRiskThreshold(Number(e.target.value))}
              className="range-slider"
              title="Filter nodes below risk threshold"
            />
            <span style={{ color: riskThreshold > 60 ? 'var(--red)' : 'var(--text)', fontWeight: 700, minWidth: '40px' }}>
              &gt; {riskThreshold}
            </span>
          </div>

          {/* Search Account */}
          <div className="graph-search-box">
            <Search size={12} style={{ color: 'var(--text-faint)' }} />
            <input
              type="text"
              placeholder="Search account / node..."
              value={searchAccountQuery}
              onChange={e => setSearchAccountQuery(e.target.value)}
            />
            {searchAccountQuery && (
              <button
                onClick={() => setSearchAccountQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '11px' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Reset Graph Button */}
          <button
            className="btn btn-ghost btn-xs"
            onClick={initSimulation}
            title="Reset graph force layout"
          >
            <RotateCcw size={12} />
            Reset Layout
          </button>

          {/* Investigate Now Button */}
          <button
            className="btn btn-danger btn-xs"
            onClick={handleInvestigateNow}
            title="Open dossier for selected or primary flagged account"
          >
            <ShieldAlert size={12} />
            Investigate Now {selectedNode ? `(${selectedNode.label.slice(-4)})` : ''}
          </button>
        </div>
      </div>

      {/* Canvas Wrap */}
      <div id="graphWrap" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          id="graphCanvas"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Dynamic Tooltip */}
        {tooltipData && (
          <div
            className="node-tooltip show"
            style={{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }}
          >
            <div className="tt-id">{tooltipData.id}</div>
            <div className="tt-sub">{tooltipData.sub}</div>
            <div style={{ marginTop: '6px', fontSize: '10px', color: tooltipData.risk > 70 ? 'var(--red)' : 'var(--teal)', fontFamily: 'var(--font-mono)' }}>
              Risk Score: {tooltipData.risk}/100
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="legend">
          <div className="legend-row">
            <span className="legend-swatch" style={{ background: '#4C8DFF' }}></span>
            Bank account
          </div>
          <div className="legend-row">
            <span className="legend-swatch" style={{ background: '#F2A93C' }}></span>
            Device fingerprint
          </div>
          <div className="legend-row">
            <span className="legend-swatch" style={{ background: '#8B5CF6' }}></span>
            IP subnet
          </div>
          <div className="legend-row">
            <span className="legend-swatch" style={{ background: '#E5484D', borderRadius: '50%' }}></span>
            Flagged / high risk
          </div>
        </div>

        {/* Graph Hint */}
        <div className="graph-hint">
          drag to reposition&nbsp;&nbsp;·&nbsp;&nbsp;hover a node for detail<br />
          edge thickness ≈ transaction velocity
        </div>
      </div>
    </div>
  );
}
