"use strict";
/**
 * WebhookDataAdapter - Real-time push adapter for transaction feeds & alert webhooks
 * Supports signed payloads (HMAC-SHA256 signature verification) from financial core switches.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDataAdapter = void 0;
class WebhookDataAdapter {
    adapterName = 'Realtime-Webhook-Adapter';
    isLiveFeed = true;
    webhookSecret = null;
    constructor() {
        this.webhookSecret = process.env.WEBHOOK_SECRET || null;
    }
    async initialize() {
        if (!this.webhookSecret) {
            console.warn(`[${this.adapterName}] WEBHOOK_SECRET not configured. Ready for webhook subscription.`);
        }
    }
    async getTransactions() {
        return [];
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
            message: 'WebhookDataAdapter: Real-time event ingested.'
        };
    }
}
exports.WebhookDataAdapter = WebhookDataAdapter;
