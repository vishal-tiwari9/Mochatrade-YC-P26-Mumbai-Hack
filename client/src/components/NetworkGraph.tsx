import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  Search, 
  X, 
  Info, 
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ClusterNetworkGraph, EntityType, GraphNode, GraphEdge } from '../types/index.js';
import { findShortestPath } from '../services/api.js';

interface NetworkGraphProps {
  graphData: ClusterNetworkGraph;
  clusterId: string;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ graphData, clusterId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode['data'] | null>(null);
  const [layoutName, setLayoutName] = useState<'cose' | 'circle' | 'concentric' | 'breadthfirst'>('cose');
  const [highlightSuspicious, setHighlightSuspicious] = useState<boolean>(true);
  
  // Node Type Filters
  const [visibleTypes, setVisibleTypes] = useState<Record<EntityType, boolean>>({
    ACCOUNT: true,
    UPI: true,
    DEVICE: true,
    PHONE: true,
    FRAUD_INCIDENT: true,
    BENEFICIARY: true,
    MERCHANT: true,
    TRANSACTION: true,
    IP: true,
    LOCATION: true
  });

  // Shortest Path state
  const [pathStart, setPathStart] = useState<string>('');
  const [pathEnd, setPathEnd] = useState<string>('');
  const [pathInfo, setPathInfo] = useState<string[] | null>(null);

  // Initialize and update Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Build elements with visibility filtering
    const elements: (cytoscape.NodeDefinition | cytoscape.EdgeDefinition)[] = [];

    // Filter nodes
    const activeNodeIds = new Set<string>();
    for (const node of graphData.nodes) {
      if (visibleTypes[node.data.type]) {
        activeNodeIds.add(node.data.id);
        elements.push({
          group: 'nodes',
          data: {
            id: node.data.id,
            label: node.data.label,
            type: node.data.type,
            riskLevel: node.data.riskLevel,
            riskScore: node.data.riskScore,
            details: node.data.details,
            lastActivity: node.data.lastActivity
          }
        });
      }
    }

    // Filter edges connecting active nodes
    for (const edge of graphData.edges) {
      if (activeNodeIds.has(edge.data.source) && activeNodeIds.has(edge.data.target)) {
        elements.push({
          group: 'edges',
          data: {
            id: edge.data.id,
            source: edge.data.source,
            target: edge.data.target,
            label: edge.data.label,
            relationshipType: edge.data.relationshipType,
            confidence: edge.data.confidence,
            isSuspicious: edge.data.isSuspicious,
            metadata: edge.data.metadata
          }
        });
      }
    }

    // Colors per entity type
    const colorMap: Record<EntityType, string> = {
      ACCOUNT: '#38bdf8',       // Light Blue
      UPI: '#2dd4bf',           // Teal
      DEVICE: '#94a3b8',        // Slate
      PHONE: '#a855f7',         // Violet / Purple
      FRAUD_INCIDENT: '#ef4444',// Red / Crimson
      BENEFICIARY: '#f59e0b',   // Amber / Gold
      MERCHANT: '#10b981',      // Emerald Green
      TRANSACTION: '#ec4899',   // Pink
      IP: '#64748b',            // Gray
      LOCATION: '#06b6d4'       // Cyan
    };

    const shapeMap: Record<EntityType, cytoscape.Css.NodeShape> = {
      ACCOUNT: 'ellipse',
      UPI: 'diamond',
      DEVICE: 'hexagon',
      PHONE: 'round-rectangle',
      FRAUD_INCIDENT: 'star',
      BENEFICIARY: 'rectangle',
      MERCHANT: 'hexagon',
      TRANSACTION: 'triangle',
      IP: 'round-tag',
      LOCATION: 'round-hexagon'
    };

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'color': '#f1f5f9',
            'font-size': 10,
            'font-family': 'JetBrains Mono, monospace',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            'text-background-opacity': 0.8,
            'text-background-color': '#090d16',
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            'background-color': (ele: any) => colorMap[ele.data('type') as EntityType] || '#38bdf8',
            'shape': (ele: any) => shapeMap[ele.data('type') as EntityType] || 'ellipse',
            'width': (ele: any) => ele.data('type') === 'FRAUD_INCIDENT' ? 36 : 28,
            'height': (ele: any) => ele.data('type') === 'FRAUD_INCIDENT' ? 36 : 28,
            'border-width': 2,
            'border-color': '#ffffff',
            'border-opacity': 0.3,
            'transition-property': 'background-color, border-color, width, height',
            'transition-duration': 0.2
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-width': 4,
            'border-color': '#38bdf8',
            'border-opacity': 1,
            'underlay-color': '#38bdf8',
            'underlay-padding': 6,
            'underlay-opacity': 0.5
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#334155',
            'target-arrow-color': '#334155',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': 0.65,
            'font-size': 8,
            'font-family': 'JetBrains Mono, monospace',
            'text-rotation': 'autorotate',
            'text-margin-y': -8,
            'color': '#94a3b8'
          }
        },
        {
          selector: 'edge[?isSuspicious]',
          style: {
            'width': highlightSuspicious ? 3 : 1.5,
            'line-color': highlightSuspicious ? '#ef4444' : '#334155',
            'target-arrow-color': highlightSuspicious ? '#ef4444' : '#334155',
            'line-style': 'dashed',
            'opacity': highlightSuspicious ? 0.95 : 0.6
          }
        },
        {
          selector: '.highlighted-path-node',
          style: {
            'border-width': 5,
            'border-color': '#06b6d4',
            'border-opacity': 1,
            'underlay-color': '#06b6d4',
            'underlay-padding': 8,
            'underlay-opacity': 0.6
          }
        },
        {
          selector: '.highlighted-path-edge',
          style: {
            'width': 4,
            'line-color': '#06b6d4',
            'target-arrow-color': '#06b6d4',
            'opacity': 1
          }
        }
      ],
      layout: {
        name: layoutName,
        animate: false,
        padding: 40
      }
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      setSelectedNode(node.data());
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, visibleTypes, layoutName, highlightSuspicious]);

  // Handle Shortest Path Highlighting
  const handleFindPath = async () => {
    if (!pathStart || !pathEnd || !cyRef.current) return;
    try {
      const result = await findShortestPath(clusterId, pathStart, pathEnd);
      if (result && result.path.length > 0) {
        setPathInfo(result.path);
        const cy = cyRef.current;
        cy.elements().removeClass('highlighted-path-node highlighted-path-edge');

        for (const nodeId of result.path) {
          cy.$id(nodeId).addClass('highlighted-path-node');
        }
        for (const edgeId of result.edges) {
          cy.$id(edgeId).addClass('highlighted-path-edge');
        }
      } else {
        setPathInfo([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearPath = () => {
    setPathInfo(null);
    setPathStart('');
    setPathEnd('');
    if (cyRef.current) {
      cyRef.current.elements().removeClass('highlighted-path-node highlighted-path-edge');
    }
  };

  const toggleType = (type: EntityType) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="relative bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border-b border-slate-800">
        
        {/* Left: Entity Type Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 text-[11px] mr-1">Filter Nodes:</span>
          {(['ACCOUNT', 'UPI', 'DEVICE', 'PHONE', 'FRAUD_INCIDENT', 'BENEFICIARY'] as EntityType[]).map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                visibleTypes[t]
                  ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Right Controls: Layout & Suspicious Glow & View */}
        <div className="flex items-center space-x-2">
          
          {/* Suspicious Glow Toggle */}
          <button
            onClick={() => setHighlightSuspicious(!highlightSuspicious)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-medium border transition ${
              highlightSuspicious
                ? 'bg-red-500/20 border-red-500/40 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Highlight shared device / phone / mule edges"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[11px]">Suspicious Links</span>
          </button>

          {/* Layout Picker */}
          <select
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value as any)}
            className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded px-2 py-1 focus:outline-none"
          >
            <option value="cose">Force (COSE)</option>
            <option value="circle">Circle</option>
            <option value="concentric">Concentric</option>
            <option value="breadthfirst">Breadthfirst</option>
          </select>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded border border-slate-700">
            <button
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-l"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => cyRef.current?.fit(undefined, 30)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-r"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Shortest Path Bar */}
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/80 text-xs font-mono">
        <span className="text-slate-400 text-[11px] flex items-center gap-1">
          <Search className="w-3 h-3 text-cyan-400" />
          Shortest Link:
        </span>
        <select
          value={pathStart}
          onChange={(e) => setPathStart(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-300 text-[11px]"
        >
          <option value="">Select Origin Node...</option>
          {graphData.nodes.map(n => (
            <option key={n.data.id} value={n.data.id}>{n.data.label} ({n.data.type})</option>
          ))}
        </select>
        <ArrowRight className="w-3 h-3 text-slate-500" />
        <select
          value={pathEnd}
          onChange={(e) => setPathEnd(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-300 text-[11px]"
        >
          <option value="">Select Target Node...</option>
          {graphData.nodes.map(n => (
            <option key={n.data.id} value={n.data.id}>{n.data.label} ({n.data.type})</option>
          ))}
        </select>
        <button
          onClick={handleFindPath}
          disabled={!pathStart || !pathEnd}
          className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[11px] transition disabled:opacity-40"
        >
          Trace Path
        </button>
        {pathInfo && (
          <button
            onClick={handleClearPath}
            className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[11px]"
          >
            Clear
          </button>
        )}
        {pathInfo !== null && (
          <span className="text-[11px] text-cyan-400 ml-2">
            {pathInfo.length > 0 ? `Path found: ${pathInfo.length} hops` : 'No direct path found'}
          </span>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full h-[520px]">
        <div ref={containerRef} className="w-full h-full bg-cyber-grid" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-md text-[10px] font-mono pointer-events-none space-y-1">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] mb-1">Entity Legend</div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span><span className="text-slate-400">Account (Circle)</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-[#2dd4bf] rotate-45 transform"></span><span className="text-slate-400">UPI ID (Diamond)</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-[#94a3b8]"></span><span className="text-slate-400">Device (Hexagon)</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded bg-[#a855f7]"></span><span className="text-slate-400">Phone (Rounded)</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-[#ef4444]"></span><span className="text-slate-400">Incident (Star)</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 bg-[#f59e0b]"></span><span className="text-slate-400">Beneficiary (Square)</span></div>
        </div>

        {/* Entity Inspector Drawer (when node is clicked) */}
        {selectedNode && (
          <div className="absolute top-3 right-3 w-80 bg-slate-900/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono text-xs z-20 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white uppercase tracking-wider">Entity Inspector</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Canonical Entity ID</span>
                <span className="text-xs font-bold text-cyan-300 break-all">{selectedNode.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Type</span>
                  <span className="text-xs font-semibold text-slate-200">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Risk Tier</span>
                  <span className={`text-xs font-bold ${
                    selectedNode.riskLevel === 'CRITICAL' ? 'text-red-400' :
                    selectedNode.riskLevel === 'HIGH' ? 'text-orange-400' :
                    selectedNode.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {selectedNode.riskScore}/100 ({selectedNode.riskLevel})
                  </span>
                </div>
              </div>

              {selectedNode.lastActivity && (
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Last Observed Activity</span>
                  <span className="text-[11px] text-slate-300">
                    {new Date(selectedNode.lastActivity).toLocaleString()}
                  </span>
                </div>
              )}

              {selectedNode.details && Object.keys(selectedNode.details).length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase mb-1">Metadata Attributes</span>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800/80 text-[10px] text-slate-400 max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono">
                      {JSON.stringify(selectedNode.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setPathStart(selectedNode.id);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
                >
                  Set as Path Origin
                </button>
                <button
                  onClick={() => {
                    setPathEnd(selectedNode.id);
                  }}
                  className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
                >
                  Set as Path Target
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
