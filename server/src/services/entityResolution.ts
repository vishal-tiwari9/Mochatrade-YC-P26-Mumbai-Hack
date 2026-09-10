import { 
  NormalizedTransaction, 
  NormalizedEntity, 
  EntityType, 
  RiskLevel 
} from '../models/types.js';

export interface IEntityResolutionStrategy {
  resolveEntityId(type: EntityType, rawIdentifier: string): string;
  isMatch(idA: string, idB: string, context?: Record<string, any>): boolean;
}

/**
 * Deterministic Entity Resolution Strategy
 * Maps canonical entities predictably based on exact domain-safe keys.
 */
export class DeterministicResolutionStrategy implements IEntityResolutionStrategy {
  resolveEntityId(type: EntityType, rawIdentifier: string): string {
    const sanitized = rawIdentifier.trim();
    switch (type) {
      case 'ACCOUNT':
        return `ACCOUNT:${sanitized.toUpperCase()}`;
      case 'UPI':
        return `UPI:${sanitized.toLowerCase()}`;
      case 'DEVICE':
        return `DEVICE:${sanitized.toUpperCase()}`;
      case 'PHONE':
        return `PHONE:${sanitized.toUpperCase()}`;
      case 'MERCHANT':
        return `MERCHANT:${sanitized.toUpperCase()}`;
      case 'BENEFICIARY':
        return `BENEFICIARY:${sanitized.toUpperCase()}`;
      case 'IP':
        return `IP:${sanitized.toUpperCase()}`;
      case 'LOCATION':
        return `LOCATION:${sanitized.replace(/\s+/g, '_').toUpperCase()}`;
      case 'TRANSACTION':
        return `TRANSACTION:${sanitized.toUpperCase()}`;
      case 'FRAUD_INCIDENT':
        return `FRAUD_INCIDENT:${sanitized.toUpperCase()}`;
      default:
        return `ENTITY:${sanitized}`;
    }
  }

  isMatch(idA: string, idB: string): boolean {
    return idA === idB;
  }
}

export class EntityResolutionService {
  private strategy: IEntityResolutionStrategy;
  private entityRegistry: Map<string, NormalizedEntity> = new Map();

  constructor(strategy?: IEntityResolutionStrategy) {
    this.strategy = strategy || new DeterministicResolutionStrategy();
  }

  getStrategy(): IEntityResolutionStrategy {
    return this.strategy;
  }

  setStrategy(strategy: IEntityResolutionStrategy): void {
    this.strategy = strategy;
  }

  resolveCanonicalId(type: EntityType, rawId: string): string {
    return this.strategy.resolveEntityId(type, rawId);
  }

  getOrCreateEntity(
    type: EntityType, 
    rawId: string, 
    timestamp: string, 
    riskScore: number = 20, 
    metadata: Record<string, any> = {}
  ): NormalizedEntity {
    const canonicalId = this.resolveCanonicalId(type, rawId);
    
    if (this.entityRegistry.has(canonicalId)) {
      const existing = this.entityRegistry.get(canonicalId)!;
      // Update last seen
      if (new Date(timestamp) > new Date(existing.lastSeen)) {
        existing.lastSeen = timestamp;
      }
      if (new Date(timestamp) < new Date(existing.firstSeen)) {
        existing.firstSeen = timestamp;
      }
      return existing;
    }

    const level: RiskLevel = 
      riskScore >= 85 ? 'CRITICAL' : 
      riskScore >= 70 ? 'HIGH' : 
      riskScore >= 40 ? 'MEDIUM' : 'LOW';

    const newEntity: NormalizedEntity = {
      id: canonicalId,
      type,
      originalId: rawId,
      firstSeen: timestamp,
      lastSeen: timestamp,
      riskScore,
      riskLevel: level,
      metadata
    };

    this.entityRegistry.set(canonicalId, newEntity);
    return newEntity;
  }

  getAllEntities(): NormalizedEntity[] {
    return Array.from(this.entityRegistry.values());
  }

  getEntity(canonicalId: string): NormalizedEntity | undefined {
    return this.entityRegistry.get(canonicalId);
  }

  clear(): void {
    this.entityRegistry.clear();
  }
}
