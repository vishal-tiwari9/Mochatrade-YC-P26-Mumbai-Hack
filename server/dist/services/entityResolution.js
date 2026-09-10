"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityResolutionService = exports.DeterministicResolutionStrategy = void 0;
/**
 * Deterministic Entity Resolution Strategy
 * Maps canonical entities predictably based on exact domain-safe keys.
 */
class DeterministicResolutionStrategy {
    resolveEntityId(type, rawIdentifier) {
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
    isMatch(idA, idB) {
        return idA === idB;
    }
}
exports.DeterministicResolutionStrategy = DeterministicResolutionStrategy;
class EntityResolutionService {
    strategy;
    entityRegistry = new Map();
    constructor(strategy) {
        this.strategy = strategy || new DeterministicResolutionStrategy();
    }
    getStrategy() {
        return this.strategy;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    resolveCanonicalId(type, rawId) {
        return this.strategy.resolveEntityId(type, rawId);
    }
    getOrCreateEntity(type, rawId, timestamp, riskScore = 20, metadata = {}) {
        const canonicalId = this.resolveCanonicalId(type, rawId);
        if (this.entityRegistry.has(canonicalId)) {
            const existing = this.entityRegistry.get(canonicalId);
            // Update last seen
            if (new Date(timestamp) > new Date(existing.lastSeen)) {
                existing.lastSeen = timestamp;
            }
            if (new Date(timestamp) < new Date(existing.firstSeen)) {
                existing.firstSeen = timestamp;
            }
            return existing;
        }
        const level = riskScore >= 85 ? 'CRITICAL' :
            riskScore >= 70 ? 'HIGH' :
                riskScore >= 40 ? 'MEDIUM' : 'LOW';
        const newEntity = {
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
    getAllEntities() {
        return Array.from(this.entityRegistry.values());
    }
    getEntity(canonicalId) {
        return this.entityRegistry.get(canonicalId);
    }
    clear() {
        this.entityRegistry.clear();
    }
}
exports.EntityResolutionService = EntityResolutionService;
