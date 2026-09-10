import { Transaction, Account, UPIEntity, Beneficiary, FraudIncident } from '../models/types';

export interface IDataAdapter {
  readonly adapterName: string;
  readonly isLiveFeed: boolean;
  
  initialize(): Promise<void>;
  
  getTransactions(filter?: {
    accountId?: string;
    upiId?: string;
    transactionId?: string;
    limit?: number;
  }): Promise<Transaction[]>;
  
  getTransactionById(transactionId: string): Promise<Transaction | null>;
  
  getAccounts(): Promise<Account[]>;
  getAccountById(accountId: string): Promise<Account | null>;
  
  getUpiEntities(): Promise<UPIEntity[]>;
  getUpiEntityById(upiId: string): Promise<UPIEntity | null>;
  
  getBeneficiaries(): Promise<Beneficiary[]>;
  getBeneficiaryById(beneficiaryId: string): Promise<Beneficiary | null>;
  
  getFraudIncidents(): Promise<FraudIncident[]>;
  getFraudIncidentById(incidentId: string): Promise<FraudIncident | null>;
  
  ingestTransaction(transaction: Transaction): Promise<void>;
  
  getStatus(): {
    adapterName: string;
    status: 'CONNECTED' | 'READY' | 'STANDBY';
    totalTransactions: number;
    totalAccounts: number;
    totalUpiEntities: number;
    lastUpdated: string;
  };
}
