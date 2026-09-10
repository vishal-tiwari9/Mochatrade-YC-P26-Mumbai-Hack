"use strict";
/**
 * PaymentDataAdapter - Production adapter placeholder for Payment Switches and Aggregators
 * Supports integration with NPCI UPI Switch, IMPS settlement logs, Stripe, Razorpay, and Card Networks.
 *
 * In production:
 * - Listens to Kafka/RabbitMQ payment event streams
 * - Normalizes channel-specific payloads (UPI VPA, Device Fingerprint, RRN, MCC) into NormalizedTransaction
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentDataAdapter = void 0;
class PaymentDataAdapter {
    adapterName = 'PaymentGateway-Switch-Adapter';
    isLiveFeed = true;
    isConfigured = false;
    constructor() {
        this.isConfigured = Boolean(process.env.PAYMENT_GATEWAY_URL && process.env.PAYMENT_GATEWAY_SECRET);
    }
    async initialize() {
        if (!this.isConfigured) {
            console.warn(`[${this.adapterName}] Running in stub mode: PAYMENT_GATEWAY_URL not configured.`);
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
            message: 'PaymentDataAdapter: Event stream hook ready for payment switch integration'
        };
    }
}
exports.PaymentDataAdapter = PaymentDataAdapter;
