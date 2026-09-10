import { IDataAdapter } from './IDataAdapter';
import { Transaction, Account, UPIEntity, Beneficiary, FraudIncident } from '../models/types';

/**
 * BankDataAdapter: Production adapter for Core Banking / ISO 20022 messaging feeds.
 */
export class BankDataAdapter implements IDataAdapter {
  readonly adapterName = 'BankDataAdapter (ISO 20022 / Core Banking API Interface)';
  readonly isLiveFeed = true;

  async initialize(): Promise<void> {
    // Connect to core banking message queue or mutual TLS REST gateway
  }

  async getTransactions(): Promise<Transaction[]> {
    return [];
  }
  async getTransactionById(): Promise<Transaction | null> {
    return null;
  }
  async getAccounts(): Promise<Account[]> {
    return [];
  }
  async getAccountById(): Promise<Account | null> {
    return null;
  }
  async getUpiEntities(): Promise<UPIEntity[]> {
    return [];
  }
  async getUpiEntityById(): Promise<UPIEntity | null> {
    return null;
  }
  async getBeneficiaries(): Promise<Beneficiary[]> {
    return [];
  }
  async getBeneficiaryById(): Promise<Beneficiary | null> {
    return null;
  }
  async getFraudIncidents(): Promise<FraudIncident[]> {
    return [];
  }
  async getFraudIncidentById(): Promise<FraudIncident | null> {
    return null;
  }
  async ingestTransaction(): Promise<void> {}

  getStatus() {
    return {
      adapterName: this.adapterName,
      status: 'STANDBY' as const,
      totalTransactions: 0,
      totalAccounts: 0,
      totalUpiEntities: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * PaymentDataAdapter: Production adapter for NPCI UPI Switch / Payment Aggregator webhooks.
 */
export class PaymentDataAdapter implements IDataAdapter {
  readonly adapterName = 'PaymentDataAdapter (NPCI / Payment Switch Stream)';
  readonly isLiveFeed = true;

  async initialize(): Promise<void> {}
  async getTransactions(): Promise<Transaction[]> { return []; }
  async getTransactionById(): Promise<Transaction | null> { return null; }
  async getAccounts(): Promise<Account[]> { return []; }
  async getAccountById(): Promise<Account | null> { return null; }
  async getUpiEntities(): Promise<UPIEntity[]> { return []; }
  async getUpiEntityById(): Promise<UPIEntity | null> { return null; }
  async getBeneficiaries(): Promise<Beneficiary[]> { return []; }
  async getBeneficiaryById(): Promise<Beneficiary | null> { return null; }
  async getFraudIncidents(): Promise<FraudIncident[]> { return []; }
  async getFraudIncidentById(): Promise<FraudIncident | null> { return null; }
  async ingestTransaction(): Promise<void> {}

  getStatus() {
    return {
      adapterName: this.adapterName,
      status: 'STANDBY' as const,
      totalTransactions: 0,
      totalAccounts: 0,
      totalUpiEntities: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * CSVDataAdapter: Ingests transactions from bulk forensic bank statement CSVs.
 */
export class CSVDataAdapter implements IDataAdapter {
  readonly adapterName = 'CSVDataAdapter (Forensic Statement Parser)';
  readonly isLiveFeed = false;

  async initialize(): Promise<void> {}
  async getTransactions(): Promise<Transaction[]> { return []; }
  async getTransactionById(): Promise<Transaction | null> { return null; }
  async getAccounts(): Promise<Account[]> { return []; }
  async getAccountById(): Promise<Account | null> { return null; }
  async getUpiEntities(): Promise<UPIEntity[]> { return []; }
  async getUpiEntityById(): Promise<UPIEntity | null> { return null; }
  async getBeneficiaries(): Promise<Beneficiary[]> { return []; }
  async getBeneficiaryById(): Promise<Beneficiary | null> { return null; }
  async getFraudIncidents(): Promise<FraudIncident[]> { return []; }
  async getFraudIncidentById(): Promise<FraudIncident | null> { return null; }
  async ingestTransaction(): Promise<void> {}

  getStatus() {
    return {
      adapterName: this.adapterName,
      status: 'STANDBY' as const,
      totalTransactions: 0,
      totalAccounts: 0,
      totalUpiEntities: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

/**
 * WebhookDataAdapter: Real-time event receiver for dynamic push feeds.
 */
export class WebhookDataAdapter implements IDataAdapter {
  readonly adapterName = 'WebhookDataAdapter (Real-Time Ingestion Pipe)';
  readonly isLiveFeed = true;

  private memoryBuffer: Transaction[] = [];

  async initialize(): Promise<void> {}
  async getTransactions(): Promise<Transaction[]> { return this.memoryBuffer; }
  async getTransactionById(id: string): Promise<Transaction | null> {
    return this.memoryBuffer.find(t => t.transactionId === id) || null;
  }
  async getAccounts(): Promise<Account[]> { return []; }
  async getAccountById(): Promise<Account | null> { return null; }
  async getUpiEntities(): Promise<UPIEntity[]> { return []; }
  async getUpiEntityById(): Promise<UPIEntity | null> { return null; }
  async getBeneficiaries(): Promise<Beneficiary[]> { return []; }
  async getBeneficiaryById(): Promise<Beneficiary | null> { return null; }
  async getFraudIncidents(): Promise<FraudIncident[]> { return []; }
  async getFraudIncidentById(): Promise<FraudIncident | null> { return null; }
  
  async ingestTransaction(transaction: Transaction): Promise<void> {
    this.memoryBuffer.push(transaction);
  }

  getStatus() {
    return {
      adapterName: this.adapterName,
      status: 'READY' as const,
      totalTransactions: this.memoryBuffer.length,
      totalAccounts: 0,
      totalUpiEntities: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}
