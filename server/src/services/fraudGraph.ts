import { 
  NormalizedEntity, 
  NormalizedRelationship, 
  RelationshipType, 
  EntityType, 
  GraphNode, 
  GraphEdge, 
  ClusterNetworkGraph 
} from '../models/types.js';

export class FraudGraphService {
  private nodes: Map<string, NormalizedEntity> = new Map();
  private edges: Map<string, NormalizedRelationship> = new Map();
  private adjacency: Map<string, Set<string>> = new Map(); // Canonical ID -> Set of Edge IDs

  addNode(entity: NormalizedEntity): void {
    this.nodes.set(entity.id, entity);
    if (!this.adjacency.has(entity.id)) {
      this.adjacency.set(entity.id, new Set());
    }
  }

  addEdge(
    sourceId: string, 
    targetId: string, 
    relationshipType: RelationshipType, 
    timestamp: string, 
    confidence: number = 0.95, 
    metadata: Record<string, any> = {}
  ): NormalizedRelationship {
    const edgeId = `${sourceId}->[${relationshipType}]->${targetId}`;
    
    const existing = this.edges.get(edgeId);
    if (existing) {
      // Update confidence or timestamp if newer
      existing.confidence = Math.max(existing.confidence, confidence);
      if (new Date(timestamp) > new Date(existing.timestamp)) {
        existing.timestamp = timestamp;
      }
      return existing;
    }

    const rel: NormalizedRelationship = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      relationshipType,
      confidence,
      timestamp,
      metadata
    };

    this.edges.set(edgeId, rel);

    // Update adjacency
    if (!this.adjacency.has(sourceId)) this.adjacency.set(sourceId, new Set());
    if (!this.adjacency.has(targetId)) this.adjacency.set(targetId, new Set());
    this.adjacency.get(sourceId)!.add(edgeId);
    this.adjacency.get(targetId)!.add(edgeId);

    return rel;
  }

  getNode(nodeId: string): NormalizedEntity | undefined {
    return this.nodes.get(nodeId);
  }

  getAllNodes(): NormalizedEntity[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): NormalizedRelationship[] {
    return Array.from(this.edges.values());
  }

  getAdjacentEdges(nodeId: string): NormalizedRelationship[] {
    const edgeIds = this.adjacency.get(nodeId);
    if (!edgeIds) return [];
    return Array.from(edgeIds).map(id => this.edges.get(id)!).filter(Boolean);
  }

  getNeighbors(nodeId: string): string[] {
    const edges = this.getAdjacentEdges(nodeId);
    const neighbors = new Set<string>();
    for (const e of edges) {
      if (e.source === nodeId) neighbors.add(e.target);
      if (e.target === nodeId) neighbors.add(e.source);
    }
    return Array.from(neighbors);
  }

  /**
   * Formats nodes and edges for Cytoscape.js visualization
   */
  exportCytoscapeSubgraph(nodeIds: Set<string>, clusterId?: string): ClusterNetworkGraph {
    const cyNodes: GraphNode[] = [];
    const cyEdges: GraphEdge[] = [];
    const visitedEdgeIds = new Set<string>();

    for (const nodeId of nodeIds) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;

      cyNodes.push({
        data: {
          id: node.id,
          label: node.originalId || node.id,
          type: node.type,
          riskLevel: node.riskLevel,
          riskScore: node.riskScore,
          lastActivity: node.lastSeen,
          clusterId,
          details: node.metadata
        }
      });

      const adjacentEdges = this.getAdjacentEdges(nodeId);
      for (const edge of adjacentEdges) {
        if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
          if (!visitedEdgeIds.has(edge.id)) {
            visitedEdgeIds.add(edge.id);

            const isSuspicious = 
              edge.relationshipType === 'SHARED_DEVICE' || 
              edge.relationshipType === 'SHARED_PHONE' || 
              edge.relationshipType === 'COMMON_BENEFICIARY' ||
              edge.relationshipType === 'REPORTED_IN';

            cyEdges.push({
              data: {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                label: edge.relationshipType.replace(/_/g, ' '),
                relationshipType: edge.relationshipType,
                confidence: edge.confidence,
                timestamp: edge.timestamp,
                isSuspicious,
                metadata: edge.metadata
              }
            });
          }
        }
      }
    }

    return { nodes: cyNodes, edges: cyEdges };
  }

  /**
   * Breadth-First Search for shortest path between two entities
   */
  findShortestPath(startId: string, endId: string): { path: string[]; edges: string[] } | null {
    if (!this.nodes.has(startId) || !this.nodes.has(endId)) return null;
    if (startId === endId) return { path: [startId], edges: [] };

    const queue: string[] = [startId];
    const visited = new Set<string>([startId]);
    const prevNode = new Map<string, string>();
    const prevEdge = new Map<string, string>();

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === endId) break;

      const edges = this.getAdjacentEdges(curr);
      for (const e of edges) {
        const neighbor = e.source === curr ? e.target : e.source;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          prevNode.set(neighbor, curr);
          prevEdge.set(neighbor, e.id);
          queue.push(neighbor);
        }
      }
    }

    if (!prevNode.has(endId)) return null;

    const path: string[] = [];
    const edgePath: string[] = [];
    let step: string | undefined = endId;

    while (step) {
      path.unshift(step);
      const edge = prevEdge.get(step);
      if (edge) edgePath.unshift(edge);
      step = prevNode.get(step);
    }

    return { path, edges: edgePath };
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
    this.adjacency.clear();
  }
}
