import { AttackRole, PathNode } from '../models/types';

export class AttackPathClassifier {
  /**
   * Classifies nodes along an attack path according to investigative topology and behavioral role.
   */
  public static classifyPathNodes(
    nodes: PathNode[],
    hasIncidentLink: boolean,
    isConsolidationDestination: boolean
  ): PathNode[] {
    const total = nodes.length;

    return nodes.map((node, index) => {
      let role: AttackRole = 'intermediate';
      let roleLabel = 'High-Risk Intermediary';

      if (index === 0) {
        role = 'source';
        roleLabel = hasIncidentLink 
          ? 'Victim Account (Compromised)' 
          : 'Source / Originating Entity';
      } else if (index === total - 1) {
        role = 'destination';
        roleLabel = isConsolidationDestination 
          ? 'Consolidation Vault / Potential Fraud Destination' 
          : 'Potential Fraud Destination';
      } else if (index === 1 && total >= 3) {
        // First hop from victim is typically the primary mule account
        role = 'mule';
        roleLabel = 'Potential Mule Account';
      } else if (index === total - 2 && total >= 4) {
        // Second to last is often a consolidation accumulator
        role = 'consolidation';
        roleLabel = 'Potential Consolidation Account';
      } else {
        // Intermediary layering hops
        role = 'intermediate';
        roleLabel = node.riskScore > 80 
          ? 'High-Risk Intermediary' 
          : 'Potential Intermediary Node';
      }

      return {
        ...node,
        role,
        roleLabel
      };
    });
  }

  public static getRoleColor(role: AttackRole): string {
    switch (role) {
      case 'source':
        return '#3B82F6'; // Blue / Cyan
      case 'mule':
        return '#F59E0B'; // Amber
      case 'intermediate':
        return '#8B5CF6'; // Purple / Violet
      case 'consolidation':
        return '#EC4899'; // Pink / Rose
      case 'destination':
        return '#EF4444'; // Red / Crimson
      case 'known_fraud':
        return '#DC2626'; // Deep Red
      default:
        return '#64748B'; // Slate
    }
  }
}
