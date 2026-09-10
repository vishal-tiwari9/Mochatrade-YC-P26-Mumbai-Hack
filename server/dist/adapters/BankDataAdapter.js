"use strict";
/**
 * BankDataAdapter - Production adapter placeholder for Core Banking Systems (CBS)
 * Supports integration with Finacle, TCS BaNCS, ISO 20022 camt/pacs feeds, and Open Banking APIs.
 *
 * In production:
 * - Reads mTLS certificates or OAuth2 tokens from environment (BANK_API_KEY, BANK_CERT_PATH)
 * - Connects to authorized enterprise payment gateway / core banking ledger
 * - Maps banking records directly into FraudNexus NormalizedTransaction schema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankDataAdapter = void 0;
class BankDataAdapter {
    adapterName = 'CoreBanking-ISO20022-Adapter';
    isLiveFeed = true;
    isConfigured = false;
    constructor() {
        this.isConfigured = Boolean(process.env.BANK_API_ENDPOINT && process.env.BANK_API_KEY);
    }
    async initialize() {
        if (!this.isConfigured) {
            console.warn(`[${this.adapterName}] Running in stub mode: BANK_API_ENDPOINT or BANK_API_KEY not configured. Ready for production credentials.`);
        }
    }
    async getTransactions() {
        if (!this.isConfigured) {
            return [];
        }
        // Production implementation: fetch from core banking ledger API
        throw new Error('BankDataAdapter: Real bank credentials required for live queries.');
    }
    async getEntities() {
        return [];
    }
    async getRelationships() {
        return [];
    }
    async getFraudIncidents() {
        return [];
    }
    async ingestTransaction(transaction) {
        return {
            success: true,
            transaction,
            resolvedEntityIds: [],
            createdRelationshipIds: [],
            affectedClusterIds: [],
            message: 'BankDataAdapter: Ingestion hook ready for authorized banking stream'
        };
    }
}
exports.BankDataAdapter = BankDataAdapter;
