import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import { MoneyFlowPath } from '../types';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Eye, EyeOff, ShieldAlert, Activity, Share2, Layers } from 'lucide-react';

if (!cytoscape.prototype.hasRegisteredDagre) {
  cytoscape.use(dagre);
  cytoscape.prototype.hasRegisteredDagre = true;
}

interface MoneyFlowGraphProps {
  path: MoneyFlowPath | null;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge?: (transactionId: string) => void;
  selectedNodeId: string | null;
  selectedTxId: string | null;
}

interface FlowParticle {
  edgeId: string;
  sourceId: string;
  targetId: string;
  progress: number;
  speed: number;
  amount: number;
  color: string;
}

export const MoneyFlowGraph: React.FC<MoneyFlowGraphProps> = ({
  path,
  onSelectNode,
  onSelectEdge,
  selectedNodeId,
  selectedTxId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cyRef = useRef<Core | null>(null);

  const [showAuxEntities, setShowAuxEntities] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<'dagre' | 'cose'>('dagre');

  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<FlowParticle[]>([]);

  const formatINR = (amt: number) => `₹${amt.toLocaleString('en-IN')}`;

  // Helper: Generates sleek SOC Card SVG matching image specification
  const generateCardSvg = (opts: {
    typeLabel: string; // 'ACCOUNT' | 'UPI' | 'DEVICE' | 'PHONE' | 'TRANSACTION'
    riskLabel: string; // 'CRIT' | 'HIGH' | 'MED' | 'LOW'
    title: string;
    subtitle: string;
    borderColor: string;
    glowColor: string;
    isSelected: boolean;
  }) => {
    const { typeLabel, riskLabel, title, subtitle, borderColor, glowColor, isSelected } = opts;
    const strokeWidth = isSelected ? 3.5 : 2;
    const filterId = `glow-${Math.random().toString(36).substring(2, 7)}`;

    const riskBadgeBg = riskLabel === 'CRIT' ? '#450A0A' : riskLabel === 'HIGH' ? '#431407' : '#14291F';
    const riskBadgeText = riskLabel === 'CRIT' ? '#F87171' : riskLabel === 'HIGH' ? '#FB923C' : '#4ADE80';
    const riskBadgeBorder = riskLabel === 'CRIT' ? '#EF4444' : riskLabel === 'HIGH' ? '#F97316' : '#22C55E';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="210" height="84" viewBox="0 0 210 84">
      <defs>
        <filter id="${filterId}" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="${isSelected ? '7' : '4'}" flood-color="${glowColor}" flood-opacity="0.8"/>
        </filter>
      </defs>
      <!-- Main Card Body -->
      <rect x="5" y="5" width="200" height="74" rx="9" fill="#0A0F1D" stroke="${borderColor}" stroke-width="${strokeWidth}" filter="url(#${filterId})"/>
      
      <!-- Top Pills Header -->
      <rect x="13" y="12" width="62" height="14" rx="3.5" fill="#172238" stroke="#334155" stroke-width="0.8"/>
      <text x="44" y="22.5" fill="#94A3B8" font-size="8.5" font-family="Consolas, monospace" font-weight="bold" text-anchor="middle">${typeLabel}</text>
      
      <rect x="156" y="12" width="40" height="14" rx="3.5" fill="${riskBadgeBg}" stroke="${riskBadgeBorder}" stroke-width="0.8"/>
      <text x="176" y="22.5" fill="${riskBadgeText}" font-size="8.5" font-family="Consolas, monospace" font-weight="bold" text-anchor="middle">${riskLabel}</text>

      <!-- Entity Title -->
      <text x="15" y="47" fill="#F8FAFC" font-size="12" font-family="Inter, system-ui, sans-serif" font-weight="700">${title}</text>
      
      <!-- Subtitle / ID -->
      <text x="15" y="65" fill="#38BDF8" font-size="10.5" font-family="Consolas, monospace" font-weight="600">${subtitle}</text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  useEffect(() => {
    if (!containerRef.current || !path) return;

    const elements: any[] = [];
    const newParticles: FlowParticle[] = [];

    // Map of added node IDs to prevent duplicates
    const addedNodes = new Set<string>();

    // 1. Add Primary Transaction Card as Root Source
    const rootTx = path.transactions[0];
    if (rootTx) {
      const rootTxNodeId = `TXN-${rootTx.transactionId}`;
      elements.push({
        group: 'nodes',
        data: {
          id: rootTxNodeId,
          type: 'TRANSACTION',
          svg: generateCardSvg({
            typeLabel: 'TRANSACTION',
            riskLabel: 'CRIT',
            title: 'Flagged Transfer',
            subtitle: `${rootTx.transactionId} • ${formatINR(rootTx.amount)}`,
            borderColor: '#EF4444',
            glowColor: '#EF4444',
            isSelected: false
          })
        }
      });
      addedNodes.add(rootTxNodeId);

      // Edge from Flagged Transfer to Source Account
      elements.push({
        group: 'edges',
        data: {
          id: `edge-root-${rootTx.transactionId}`,
          source: rootTxNodeId,
          target: rootTx.senderAccountId,
          label: showLabels ? 'Originates From' : '',
          color: '#EF4444',
          channel: rootTx.channel,
          isDashed: true
        }
      });

      newParticles.push({
        edgeId: `edge-root-${rootTx.transactionId}`,
        sourceId: rootTxNodeId,
        targetId: rootTx.senderAccountId,
        progress: 0.1,
        speed: 0.008,
        amount: rootTx.amount,
        color: '#EF4444'
      });
    }

    // 2. Add Flow Nodes (Accounts & Beneficiaries)
    path.nodes.forEach((node, idx) => {
      let typeLabel = 'ACCOUNT';
      let riskLabel = node.riskScore >= 85 ? 'CRIT' : node.riskScore >= 60 ? 'HIGH' : 'MED';
      let borderColor = '#EAB308'; // Glowing Golden Yellow (from image)
      let glowColor = '#EAB308';
      let title = node.roleLabel.split('/')[0].trim();

      if (node.role === 'source') {
        title = 'Source Account';
        borderColor = '#EAB308'; // Golden yellow glow
        glowColor = '#EAB308';
      } else if (node.role === 'mule') {
        title = `Mule Account #${idx}`;
        borderColor = '#EAB308';
        glowColor = '#EAB308';
      } else if (node.role === 'intermediate') {
        title = `Intermediary #${idx}`;
        borderColor = '#8B5CF6'; // Violet glow
        glowColor = '#8B5CF6';
      } else if (node.role === 'consolidation') {
        title = 'Consolidation Vault';
        borderColor = '#EAB308';
        glowColor = '#EAB308';
      } else if (node.role === 'destination') {
        typeLabel = 'BENEFICIARY';
        title = 'Final Beneficiary';
        borderColor = '#EF4444'; // Red glow
        glowColor = '#EF4444';
      }

      const holder = node.data?.accountHolder?.split('(')[0]?.trim() || node.id;
      const bank = node.data?.bankName ? ` (${node.data.bankName.split(' ')[0]})` : '';
      const subtitle = `${node.id}${bank}`;

      elements.push({
        group: 'nodes',
        data: {
          id: node.id,
          type: typeLabel,
          svg: generateCardSvg({
            typeLabel,
            riskLabel,
            title,
            subtitle,
            borderColor,
            glowColor,
            isSelected: node.id === selectedNodeId
          })
        }
      });
      addedNodes.add(node.id);

      // 3. Add Auxiliary Entities for Image 1 Authenticity (UPI Handle, Hardware Device, Registered Mobile)
      if (showAuxEntities && idx === 0) {
        // Linked UPI VPA Handle node
        const upiId = node.data?.upiIds?.[0] || 'quickdravin@okhdfc';
        const upiNodeId = `UPI-${node.id}`;
        elements.push({
          group: 'nodes',
          data: {
            id: upiNodeId,
            type: 'UPI',
            svg: generateCardSvg({
              typeLabel: 'UPI',
              riskLabel: 'MED',
              title: 'UPI VPA Handle',
              subtitle: upiId,
              borderColor: '#F59E0B',
              glowColor: '#F59E0B',
              isSelected: false
            })
          }
        });
        addedNodes.add(upiNodeId);
        elements.push({
          group: 'edges',
          data: {
            id: `edge-upi-${node.id}`,
            source: node.id,
            target: upiNodeId,
            label: showLabels ? 'Linked VPA Handle' : '',
            color: '#38BDF8',
            isDashed: true
          }
        });

        // Registered Mobile Phone node
        const phoneNodeId = `PHONE-${node.id}`;
        elements.push({
          group: 'nodes',
          data: {
            id: phoneNodeId,
            type: 'PHONE',
            svg: generateCardSvg({
              typeLabel: 'PHONE',
              riskLabel: 'MED',
              title: 'Registered Mobile',
              subtitle: '+91 98781-43210 (Salt)',
              borderColor: '#F59E0B',
              glowColor: '#F59E0B',
              isSelected: false
            })
          }
        });
        addedNodes.add(phoneNodeId);
        elements.push({
          group: 'edges',
          data: {
            id: `edge-phone-${node.id}`,
            source: node.id,
            target: phoneNodeId,
            label: showLabels ? 'Registered MSISDN' : '',
            color: '#38BDF8',
            isDashed: true
          }
        });
      }

      // Shared Device node connected between intermediate mules
      if (showAuxEntities && idx === 1 && path.nodes.length >= 3) {
        const deviceId = node.data?.deviceIds?.[0] || 'DEV-84321 (Pixel 7)';
        const devNodeId = `DEV-${node.id}`;
        elements.push({
          group: 'nodes',
          data: {
            id: devNodeId,
            type: 'DEVICE',
            svg: generateCardSvg({
              typeLabel: 'DEVICE',
              riskLabel: 'CRIT',
              title: 'Hardware Device',
              subtitle: deviceId,
              borderColor: '#EF4444',
              glowColor: '#EF4444',
              isSelected: false
            })
          }
        });
        addedNodes.add(devNodeId);

        elements.push({
          group: 'edges',
          data: {
            id: `edge-dev-session-${node.id}`,
            source: node.id,
            target: devNodeId,
            label: showLabels ? 'Active Session Device' : '',
            color: '#EAB308',
            isDashed: false
          }
        });

        // Link Device to next mule account (Shared Hardware UUID)
        const nextNode = path.nodes[idx + 1];
        if (nextNode) {
          elements.push({
            group: 'edges',
            data: {
              id: `edge-dev-shared-${nextNode.id}`,
              source: devNodeId,
              target: nextNode.id,
              label: showLabels ? 'Shared Hardware UUID' : '',
              color: '#EF4444',
              isDashed: true
            }
          });
        }
      }
    });

    // 4. Add Primary Money Flow Edges
    path.edges.forEach((edge, idx) => {
      if (addedNodes.has(edge.source) && addedNodes.has(edge.target)) {
        const isSelected = selectedTxId === edge.transactionId;
        const edgeColor = isSelected ? '#10B981' : edge.isSuspicious ? '#EAB308' : '#38BDF8';
        const edgeLabel = idx === path.edges.length - 1 
          ? `Beneficiary Payout Routing ──> (${formatINR(edge.amount)})`
          : `${formatINR(edge.amount)} (${edge.channel})`;

        elements.push({
          group: 'edges',
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            transactionId: edge.transactionId,
            amount: edge.amount,
            label: showLabels ? edgeLabel : '',
            channel: edge.channel,
            color: edgeColor,
            isSuspicious: edge.isSuspicious,
            isDashed: false
          }
        });

        // 2 traveling flow particles per money edge
        newParticles.push({
          edgeId: edge.id,
          sourceId: edge.source,
          targetId: edge.target,
          progress: (idx * 0.4) % 1,
          speed: 0.0075,
          amount: edge.amount,
          color: edgeColor
        });
        newParticles.push({
          edgeId: edge.id,
          sourceId: edge.source,
          targetId: edge.target,
          progress: ((idx * 0.4) + 0.5) % 1,
          speed: 0.0075,
          amount: edge.amount,
          color: edgeColor
        });
      }
    });

    particlesRef.current = newParticles;

    // Initialize Cytoscape Instance with Card Node Shapes
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'round-rectangle',
            'width': 210,
            'height': 84,
            'background-image': 'data(svg)',
            'background-fit': 'contain',
            'background-opacity': 0,
            'border-width': 0,
            'label': '' // All content drawn in crisp vector SVG card
          }
        },
        {
          selector: 'node:selected',
          style: {
            'underlay-color': '#F59E0B',
            'underlay-padding': '10px',
            'underlay-opacity': 0.5
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'curve-style': 'bezier',
            'line-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': 'data(color)',
            'arrow-scale': 1.6,
            'line-style': 'dashed',
            'line-dash-pattern': [8, 4],
            'label': 'data(label)',
            'font-family': 'Consolas, monospace',
            'font-size': '10px',
            'font-weight': 'bold',
            'color': '#38BDF8',
            // Clean dark floating badge exactly like Image 1
            'text-background-color': '#070C18',
            'text-background-opacity': 0.95,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'text-border-color': '#1E293B',
            'text-border-width': 1,
            'text-rotation': 'none',
            'z-index': 30
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'width': 5,
            'line-color': '#10B981',
            'target-arrow-color': '#10B981',
            'underlay-color': '#10B981',
            'underlay-padding': '8px',
            'underlay-opacity': 0.6
          }
        }
      ],
      layout: {
        name: layoutMode,
        // @ts-ignore
        rankDir: 'LR',
        align: 'DL',
        nodeSep: 95,
        rankSep: 180,
        padding: 60,
        animate: true,
        animationDuration: 400
      }
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      const rawId = evt.target.id();
      const cleanId = rawId.replace(/^TXN-|^UPI-|^DEV-|^PHONE-/, '');
      onSelectNode(cleanId);
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const txId = evt.target.data('transactionId');
      if (txId && onSelectEdge) {
        onSelectEdge(txId);
      }
    });

    cyRef.current = cy;

    // --- HTML5 Canvas Animation Loop for Traveling Light Packets ---
    let dashOffset = 0;
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    const renderLoop = () => {
      // 1. Advance edge dash offset for continuous flowing motion
      dashOffset = (dashOffset - 1.4) % 24;
      if (cyRef.current) {
        cyRef.current.edges().style('line-dash-offset', dashOffset);
      }

      // 2. Render particle energy orbs along edges
      if (canvas && ctx && cyRef.current) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && (canvas.width !== rect.width || canvas.height !== rect.height)) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(p => {
          const srcNode = cyRef.current!.getElementById(p.sourceId);
          const tgtNode = cyRef.current!.getElementById(p.targetId);

          if (srcNode.length && tgtNode.length) {
            const p1 = srcNode.renderedPosition();
            const p2 = tgtNode.renderedPosition();

            p.progress += p.speed;
            if (p.progress >= 1) p.progress = 0;

            const x = p1.x + (p2.x - p1.x) * p.progress;
            const y = p1.y + (p2.y - p1.y) * p.progress;
            const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

            const isSelectedEdge = cyRef.current!.getElementById(p.edgeId).selected();
            const particleRadius = isSelectedEdge ? 6 : 4;
            const glowColor = isSelectedEdge ? '#10B981' : p.color;

            // Draw glowing halo
            ctx.save();
            ctx.shadowBlur = isSelectedEdge ? 16 : 8;
            ctx.shadowColor = glowColor;

            // Core orb
            ctx.beginPath();
            ctx.arc(x, y, particleRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Directional moving chevron
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(particleRadius + 4, 0);
            ctx.lineTo(-particleRadius, -particleRadius);
            ctx.lineTo(-particleRadius, particleRadius);
            ctx.closePath();
            ctx.fillStyle = glowColor;
            ctx.fill();

            ctx.restore();
          }
        });
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      cy.destroy();
    };
  }, [path, layoutMode, showLabels, showAuxEntities]);

  // Synchronize selection
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.nodes().unselect();
    cy.edges().unselect();

    if (selectedNodeId) {
      const node = cy.getElementById(selectedNodeId);
      if (node.length) node.select();
    }

    if (selectedTxId) {
      const edge = cy.edges(`[transactionId = "${selectedTxId}"]`);
      if (edge.length) edge.select();
    }
  }, [selectedNodeId, selectedTxId]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 50);
  const handleReset = () => {
    cyRef.current?.reset();
    cyRef.current?.fit(undefined, 50);
  };

  const activeTx = path?.transactions.find(t => t.transactionId === selectedTxId) || path?.transactions[0];

  return (
    <div className="relative w-full bg-dark-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* ── Top SOC Header Stream (Matching Image 1) ── */}
      <div className="bg-[#0A0F1D] border-b border-slate-800/80 px-4 py-3 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/60 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-wide">FraudNexus</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-600/40">
              SOC v4.2
            </span>
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE STREAM</span>
            </div>
            <span className="text-slate-500 text-[11px] hidden sm:inline font-mono">
              Graph Neural Network & Explainable Fraud Discovery Engine
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">ACTIVE CASE:</span>
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-bold border border-amber-500/40">
              {path?.relatedClusterId || 'FN-2291'} Mule Account Ring
            </span>
          </div>
        </div>

        {/* Telemetry Row from Image 1 */}
        {activeTx && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase">FLAGGED TRANSACTION</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="font-bold text-slate-300">{activeTx.transactionId}</span>
                <span className="text-emerald-400 font-extrabold">{formatINR(activeTx.amount)}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 block uppercase">CHANNEL / TIMESTAMP</span>
              <div className="text-slate-300 mt-0.5 truncate">
                {activeTx.channel} Instant Transfer • {new Date(activeTx.timestamp).toLocaleTimeString('en-IN')} IST
              </div>
            </div>

            <div className="hidden sm:block">
              <span className="text-[10px] text-slate-500 block uppercase">MERCHANT / IP GEO</span>
              <div className="text-slate-300 mt-0.5 truncate">
                QuickGold Exchange Pvt Ltd (Mumbai, MH) (Proxy / VPN)
              </div>
            </div>

            <div className="flex sm:justify-end items-center">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase sm:text-right">SEVERITY</span>
                <div className="mt-0.5 flex sm:justify-end">
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-red-950 text-red-400 border border-red-500/50 shadow-sm shadow-red-900/40 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-red-400" />
                    <span>CRITICAL ({path?.riskScore || 99}/100)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Canvas Viewport ── */}
      <div className="relative w-full h-[580px] bg-[#070B14]">
        {/* Cytoscape Canvas */}
        <div ref={containerRef} className="cytoscape-container" />

        {/* Dynamic Canvas Particles Overlay */}
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-10 w-full h-full"
        />

        {/* Floating Canvas Controls */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#0D1527]/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-dark-800 rounded transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-dark-800 rounded transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-dark-800 rounded transition-all"
            title="Fit View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-dark-800 rounded transition-all"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1.5 rounded transition-all ${
              showLabels ? 'text-cyan-400 bg-cyan-950/60' : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
            title={showLabels ? 'Hide Edge Badges' : 'Show Edge Badges'}
          >
            {showLabels ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          {/* Toggle Hardware / UPI auxiliary entities */}
          <button
            onClick={() => setShowAuxEntities(!showAuxEntities)}
            className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition-all flex items-center gap-1 ${
              showAuxEntities ? 'text-amber-300 bg-amber-950/60 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Device & Phone Entities"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Entities</span>
          </button>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <button
            onClick={() => setLayoutMode(layoutMode === 'dagre' ? 'cose' : 'dagre')}
            className="px-2 py-1 text-[11px] font-mono font-semibold bg-dark-800 hover:bg-dark-700 text-slate-300 rounded"
          >
            {layoutMode === 'dagre' ? 'DAG Flow' : 'Cose / Spring'}
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-3 bg-[#0D1527]/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-slate-800 text-[11px] shadow-lg font-mono">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>CARD GRAPH:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#0A0F1D] border border-[#EAB308]" />
            <span className="text-slate-300">Account Card</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#0A0F1D] border border-[#EF4444]" />
            <span className="text-slate-300">Device / Tx Card</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-[#0A0F1D] border border-[#F59E0B]" />
            <span className="text-slate-300">UPI / Phone Card</span>
          </div>
        </div>
      </div>
    </div>
  );
};
