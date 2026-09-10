"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDataAdapter = exports.CSVDataAdapter = exports.PaymentDataAdapter = exports.BankDataAdapter = void 0;
/**
 * BankDataAdapter: Production adapter for Core Banking / ISO 20022 messaging feeds.
 */
class BankDataAdapter {
    adapterName = 'BankDataAdapter (ISO 20022 / Core Banking API Interface)';
    isLiveFeed = true;
    async initialize() {
        // Connect to core banking message queue or mutual TLS REST gateway
    }
    async getTransactions() {
        return [];
    }
    async getTransactionById() {
        return null;
    }
    async getAccounts() {
        return [];
    }
    async getAccountById() {
        return null;
    }
    async getUpiEntities() {
        return [];
    }
    async getUpiEntityById() {
        return null;
    }
    async getBeneficiaries() {
        return [];
    }
    async getBeneficiaryById() {
        return null;
    }
    async getFraudIncidents() {
        return [];
    }
    async getFraudIncidentById() {
        return null;
    }
    async ingestTransaction() { }
    getStatus() {
        return {
            adapterName: this.adapterName,
            status: 'STANDBY',
            totalTransactions: 0,
            totalAccounts: 0,
            totalUpiEntities: 0,
            lastUpdated: new Date().toISOString()
        };
    }
}
exports.BankDataAdapter = BankDataAdapter;
/**
 * PaymentDataAdapter: Production adapter for NPCI UPI Switch / Payment Aggregator webhooks.
 */
class PaymentDataAdapter {
    adapterName = 'PaymentDataAdapter (NPCI / Payment Switch Stream)';
    isLiveFeed = true;
    async initialize() { }
    async getTransactions() { return []; }
    async getTransactionById() { return null; }
    async getAccounts() { return []; }
    async getAccountById() { return null; }
    async getUpiEntities() { return []; }
    async getUpiEntityById() { return null; }
    async getBeneficiaries() { return []; }
    async getBeneficiaryById() { return null; }
    async getFraudIncidents() { return []; }
    async getFraudIncidentById() { return null; }
    async ingestTransaction() { }
    getStatus() {
        return {
            adapterName: this.adapterName,
            status: 'STANDBY',
            totalTransactions: 0,
            totalAccounts: 0,
            totalUpiEntities: 0,
            lastUpdated: new Date().toISOString()
        };
    }
}
exports.PaymentDataAdapter = PaymentDataAdapter;
/**
 * CSVDataAdapter: Ingests transactions from bulk forensic bank statement CSVs.
 */
class CSVDataAdapter {
    adapterName = 'CSVDataAdapter (Forensic Statement Parser)';
    isLiveFeed = false;
    async initialize() { }
    async getTransactions() { return []; }
    async getTransactionById() { return null; }
    async getAccounts() { return []; }
    async getAccountById() { return null; }
    async getUpiEntities() { return []; }
    async getUpiEntityById() { return null; }
    async getBeneficiaries() { return []; }
    async getBeneficiaryById() { return null; }
    async getFraudIncidents() { return []; }
    async getFraudIncidentById() { return null; }
    async ingestTransaction() { }
    getStatus() {
        return {
            adapterName: this.adapterName,
            status: 'STANDBY',
            totalTransactions: 0,
            totalAccounts: 0,
            totalUpiEntities: 0,
            lastUpdated: new Date().toISOString()
        };
    }
}
exports.CSVDataAdapter = CSVDataAdapter;
/**
 * WebhookDataAdapter: Real-time event receiver for dynamic push feeds.
 */
class WebhookDataAdapter {
    adapterName = 'WebhookDataAdapter (Real-Time Ingestion Pipe)';
    isLiveFeed = true;
    memoryBuffer = [];
    async initialize() { }
    async getTransactions() { return this.memoryBuffer; }
    async getTransactionById(id) {
        return this.memoryBuffer.find(t => t.transactionId === id) || null;
    }
    async getAccounts() { return []; }
    async getAccountById() { return null; }
    async getUpiEntities() { return []; }
    async getUpiEntityById() { return null; }
    async getBeneficiaries() { return []; }
    async getBeneficiaryById() { return null; }
    async getFraudIncidents() { return []; }
    async getFraudIncidentById() { return null; }
    async ingestTransaction(transaction) {
        this.memoryBuffer.push(transaction);
    }
    getStatus() {
        return {
            adapterName: this.adapterName,
            status: 'READY',
            totalTransactions: this.memoryBuffer.length,
            totalAccounts: 0,
            totalUpiEntities: 0,
            lastUpdated: new Date().toISOString()
        };
    }
}
exports.WebhookDataAdapter = WebhookDataAdapter;
