import { IDataAdapter } from './IDataAdapter';
import { Transaction, Account, UPIEntity, Beneficiary, FraudIncident } from '../models/types';

export class DemoDataAdapter implements IDataAdapter {
  readonly adapterName = 'DemoDataAdapter (Synthetic Zero-Cost Indian Banking Dataset)';
  readonly isLiveFeed = false;

  private transactions: Map<string, Transaction> = new Map();
  private accounts: Map<string, Account> = new Map();
  private upiEntities: Map<string, UPIEntity> = new Map();
  private beneficiaries: Map<string, Beneficiary> = new Map();
  private fraudIncidents: Map<string, FraudIncident> = new Map();
  private lastUpdated: string = new Date().toISOString();

  async initialize(): Promise<void> {
    this.generateDataset();
  }

  private generateDataset(): void {
    const banks = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Bank of Baroda'];
    const upiHandles = ['okhdfcbank', 'okaxis', 'paytm', 'ybl', 'oksbi', 'icici'];

    // 1. Setup Beneficiaries (15)
    for (let i = 1; i <= 15; i++) {
      const benId = `BEN${String(i).padStart(3, '0')}`;
      const risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = i === 9 ? 'CRITICAL' : i % 4 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW';
      this.beneficiaries.set(benId, {
        beneficiaryId: benId,
        name: i === 9 ? 'Apex Digital Liquidity Pte' : `Beneficiary Entity ${i}`,
        accountNumberMasked: `XXXX-XXXX-${1000 + i}`,
        ifscCode: `HDFC000${100 + i}`,
        bankName: banks[i % banks.length],
        riskLevel: risk,
        relatedClusterId: i === 9 ? 'FNX-CL-2841' : undefined
      });
    }

    // 2. Setup Fraud Incidents
    this.fraudIncidents.set('INC-2026-881', {
      incidentId: 'INC-2026-881',
      category: 'Unauthorized High-Value Digital Transfer',
      description: 'SIM swap and remote access Trojan attack targeting high net-worth retail banking account.',
      reportedAt: '2026-09-09T18:30:00Z',
      lossAmountINR: 284000,
      associatedAccounts: ['ACC001', 'ACC047', 'ACC093', 'ACC121'],
      associatedUpiIds: ['user001@okhdfcbank', 'mule047@okaxis', 'layer093@paytm'],
      status: 'OPEN'
    });

    this.fraudIncidents.set('INC-2026-442', {
      incidentId: 'INC-2026-442',
      category: 'Layered Mule Fan-Out Syndicate',
      description: 'Automated script dispersing compromised funds across multiple tier-2 mule accounts.',
      reportedAt: '2026-09-08T11:15:00Z',
      lossAmountINR: 90000,
      associatedAccounts: ['ACC-MULE-401', 'ACC-SUB-402', 'ACC-SUB-403', 'ACC-SUB-404'],
      associatedUpiIds: ['mule401@ybl', 'sub402@paytm'],
      status: 'INVESTIGATING'
    });

    this.fraudIncidents.set('INC-2026-109', {
      incidentId: 'INC-2026-109',
      category: 'Circular Layering Scheme',
      description: 'Circular laundering round-tripping funds to obscure original source before cash withdrawal.',
      reportedAt: '2026-09-07T14:20:00Z',
      lossAmountINR: 75000,
      associatedAccounts: ['ACC-RING-101', 'ACC-RING-102', 'ACC-RING-103'],
      associatedUpiIds: ['ring101@okaxis', 'ring102@oksbi'],
      status: 'OPEN'
    });

    // 3. Create 120+ Accounts, 60+ UPI IDs, 25+ Devices, 25+ Phones
    for (let i = 1; i <= 120; i++) {
      const accId = `ACC${String(i).padStart(3, '0')}`;
      let riskScore = 15 + Math.floor(Math.sin(i) * 15 + 15);
      let accountHolder = `Account Holder ${i}`;
      let kycStatus: 'VERIFIED' | 'PARTIAL' | 'FLAGGED' = 'VERIFIED';
      let relatedCluster: string | undefined = undefined;

      // Special designated primary accounts
      if (accId === 'ACC001') {
        accountHolder = 'Ramesh Sharma (Victim)';
        riskScore = 12; // Victim is legitimate user
        kycStatus = 'VERIFIED';
      } else if (accId === 'ACC047') {
        accountHolder = 'P. Kumar (Potential Mule)';
        riskScore = 84;
        kycStatus = 'PARTIAL';
        relatedCluster = 'FNX-CL-2841';
      } else if (accId === 'ACC093') {
        accountHolder = 'QuickPay Fast Transfers (High-Risk Intermediary)';
        riskScore = 89;
        kycStatus = 'FLAGGED';
        relatedCluster = 'FNX-CL-2841';
      } else if (accId === 'ACC121') {
        accountHolder = 'Omicron Logistics (Consolidation Account)';
        riskScore = 94;
        kycStatus = 'FLAGGED';
        relatedCluster = 'FNX-CL-2841';
      } else if (i >= 40 && i <= 55) {
        riskScore = 65 + (i % 30);
        kycStatus = i % 2 === 0 ? 'PARTIAL' : 'FLAGGED';
      }

      const phoneHash = `PH-HASH-${(i % 25) + 1000}`;
      const deviceId = `DEV-${String((i % 22) + 1).padStart(3, '0')}`;
      const upiHandle = upiHandles[i % upiHandles.length];
      const upiId = accId === 'ACC001' ? 'ramesh.sharma@okhdfcbank'
        : accId === 'ACC047' ? 'mule047@okaxis'
        : accId === 'ACC093' ? 'layer093@paytm'
        : accId === 'ACC121' ? 'dest121@ybl'
        : `user${String(i).padStart(3, '0')}@${upiHandle}`;

      const account: Account = {
        accountId: accId,
        accountHolder,
        bankName: banks[i % banks.length],
        accountType: i % 10 === 0 ? 'NODAL' : i % 5 === 0 ? 'CURRENT' : 'SAVINGS',
        riskScore,
        kycStatus,
        phoneHash,
        deviceIds: [deviceId, `DEV-SEC-${(i % 8) + 1}`],
        upiIds: [upiId],
        createdTimestamp: new Date(Date.now() - (100 + i) * 86400000).toISOString(),
        relatedClusterId: relatedCluster,
        status: riskScore > 85 ? 'UNDER_REVIEW' : 'ACTIVE',
        initialBalance: 50000 + (i * 2000)
      };

      this.accounts.set(accId, account);

      // Add UPI entity
      this.upiEntities.set(upiId, {
        upiId,
        associatedAccountId: accId,
        vpaHandle: upiHandle,
        riskScore,
        status: riskScore > 80 ? 'SUSPICIOUS' : 'ACTIVE'
      });
    }

    // Special Pattern Accounts (Fan-Out, Fan-In, Circular)
    this.addSpecialPatternAccounts();

    // 4. Generate 550+ Transactions
    this.generateTransactions();
  }

  private addSpecialPatternAccounts(): void {
    // Fan-Out Source & Targets
    this.accounts.set('ACC-MULE-401', {
      accountId: 'ACC-MULE-401',
      accountHolder: 'K. Verma (Dispersal Node)',
      bankName: 'Axis Bank',
      accountType: 'SAVINGS',
      riskScore: 88,
      kycStatus: 'PARTIAL',
      phoneHash: 'PH-HASH-401',
      deviceIds: ['DEV-SHARED-44'],
      upiIds: ['mule401@okaxis'],
      createdTimestamp: '2026-08-01T10:00:00Z',
      relatedClusterId: 'FNX-CL-4420',
      status: 'UNDER_REVIEW'
    });
    this.upiEntities.set('mule401@okaxis', {
      upiId: 'mule401@okaxis',
      associatedAccountId: 'ACC-MULE-401',
      vpaHandle: 'okaxis',
      riskScore: 88,
      status: 'SUSPICIOUS'
    });

    ['ACC-SUB-402', 'ACC-SUB-403', 'ACC-SUB-404', 'ACC-SUB-405'].forEach((id, idx) => {
      this.accounts.set(id, {
        accountId: id,
        accountHolder: `Sub-Receiver ${idx + 1}`,
        bankName: 'ICICI Bank',
        accountType: 'SAVINGS',
        riskScore: 72 + idx * 3,
        kycStatus: 'PARTIAL',
        phoneHash: `PH-HASH-40${idx + 2}`,
        deviceIds: [`DEV-SUB-${idx + 1}`],
        upiIds: [`sub40${idx + 2}@icici`],
        createdTimestamp: '2026-08-10T10:00:00Z',
        relatedClusterId: 'FNX-CL-4420',
        status: 'ACTIVE'
      });
    });

    // Fan-In Consolidation Target & Sources
    this.accounts.set('ACC-CONS-709', {
      accountId: 'ACC-CONS-709',
      accountHolder: 'Apex Pool Vault (Consolidation)',
      bankName: 'HDFC Bank',
      accountType: 'CURRENT',
      riskScore: 92,
      kycStatus: 'FLAGGED',
      phoneHash: 'PH-HASH-709',
      deviceIds: ['DEV-CONS-99'],
      upiIds: ['vault709@okhdfcbank'],
      createdTimestamp: '2026-07-15T08:00:00Z',
      relatedClusterId: 'FNX-CL-7090',
      status: 'UNDER_REVIEW'
    });
    this.upiEntities.set('vault709@okhdfcbank', {
      upiId: 'vault709@okhdfcbank',
      associatedAccountId: 'ACC-CONS-709',
      vpaHandle: 'okhdfcbank',
      riskScore: 92,
      status: 'SUSPICIOUS'
    });

    ['ACC-FEED-701', 'ACC-FEED-702', 'ACC-FEED-703', 'ACC-FEED-704'].forEach((id, idx) => {
      this.accounts.set(id, {
        accountId: id,
        accountHolder: `Feeder Account ${idx + 1}`,
        bankName: 'State Bank of India',
        accountType: 'SAVINGS',
        riskScore: 68 + idx * 4,
        kycStatus: 'PARTIAL',
        phoneHash: `PH-HASH-70${idx + 1}`,
        deviceIds: [`DEV-FEED-${idx + 1}`],
        upiIds: [`feeder70${idx + 1}@oksbi`],
        createdTimestamp: '2026-08-05T09:00:00Z',
        relatedClusterId: 'FNX-CL-7090',
        status: 'ACTIVE'
      });
    });

    // Circular Flow Ring Accounts
    ['ACC-RING-101', 'ACC-RING-102', 'ACC-RING-103'].forEach((id, idx) => {
      this.accounts.set(id, {
        accountId: id,
        accountHolder: `Cycle Ring Node ${idx + 1}`,
        bankName: 'Kotak Mahindra',
        accountType: 'SAVINGS',
        riskScore: 82 + idx * 3,
        kycStatus: 'PARTIAL',
        phoneHash: 'PH-HASH-RING-SHARED',
        deviceIds: ['DEV-SHARED-RING'],
        upiIds: [`ring10${idx + 1}@kotak`],
        createdTimestamp: '2026-08-12T12:00:00Z',
        relatedClusterId: 'FNX-CL-RING',
        status: 'UNDER_REVIEW'
      });
      this.upiEntities.set(`ring10${idx + 1}@kotak`, {
        upiId: `ring10${idx + 1}@kotak`,
        associatedAccountId: id,
        vpaHandle: 'kotak',
        riskScore: 85,
        status: 'SUSPICIOUS'
      });
    });
  }

  private generateTransactions(): void {
    // --- SCENARIO 1: Primary Demo Flow (TXN-FNX-9001 - ₹2,84,000 Victim Flow) ---
    // Start Time: 2026-09-09T18:42:00Z
    // ACC001 (Victim) -> ACC047 (Mule) -> ACC093 (Intermediary) -> ACC121 (Consolidation) -> Final Beneficiary (BEN009)
    // Retention breakdown: 284000 -> 284000 -> 270000 -> 254000 -> 248000
    const primaryTx1: Transaction = {
      transactionId: 'TXN-FNX-9001',
      timestamp: '2026-09-09T18:42:00Z',
      senderAccountId: 'ACC001',
      receiverAccountId: 'ACC047',
      senderUpiId: 'ramesh.sharma@okhdfcbank',
      receiverUpiId: 'mule047@okaxis',
      amount: 284000,
      currency: 'INR',
      channel: 'UPI',
      deviceId: 'DEV-001',
      status: 'SUCCESS',
      narrative: 'IMMEDIATE ONLINE TRANSFER (SIM SWAP DETECTED)',
      riskScore: 91
    };

    const primaryTx2: Transaction = {
      transactionId: 'TXN-FNX-9002',
      timestamp: '2026-09-09T18:44:15Z', // +2 min
      senderAccountId: 'ACC047',
      receiverAccountId: 'ACC093',
      senderUpiId: 'mule047@okaxis',
      receiverUpiId: 'layer093@paytm',
      amount: 270000, // 14,000 retained by mule
      currency: 'INR',
      channel: 'UPI',
      deviceId: 'DEV-047',
      status: 'SUCCESS',
      narrative: 'INSTANT EXPRESS TRANSFER',
      riskScore: 89
    };

    const primaryTx3: Transaction = {
      transactionId: 'TXN-FNX-9003',
      timestamp: '2026-09-09T18:48:30Z', // +4 min
      senderAccountId: 'ACC093',
      receiverAccountId: 'ACC121',
      senderUpiId: 'layer093@paytm',
      receiverUpiId: 'dest121@ybl',
      amount: 254000, // 16,000 retained
      currency: 'INR',
      channel: 'IMPS',
      deviceId: 'DEV-093',
      status: 'SUCCESS',
      narrative: 'COMMERCIAL SETTLEMENT TO LOGISTICS',
      riskScore: 93
    };

    const primaryTx4: Transaction = {
      transactionId: 'TXN-FNX-9004',
      timestamp: '2026-09-09T19:00:00Z', // +12 min (Total 18 min propagation)
      senderAccountId: 'ACC121',
      receiverAccountId: 'ACC015', // Offshore gateway account representing BEN009
      senderUpiId: 'dest121@ybl',
      receiverUpiId: 'apex.liquidity@okhdfcbank',
      amount: 248000, // 6,000 retained
      currency: 'INR',
      channel: 'RTGS',
      deviceId: 'DEV-121',
      status: 'SUCCESS',
      narrative: 'OFFSHORE CRYPTO OTC SETTLEMENT',
      riskScore: 96
    };

    this.transactions.set(primaryTx1.transactionId, primaryTx1);
    this.transactions.set(primaryTx2.transactionId, primaryTx2);
    this.transactions.set(primaryTx3.transactionId, primaryTx3);
    this.transactions.set(primaryTx4.transactionId, primaryTx4);

    // Also add related parallel transactions in the primary cluster
    const parallelTx1: Transaction = {
      transactionId: 'TXN-FNX-9005',
      timestamp: '2026-09-09T18:45:00Z',
      senderAccountId: 'ACC047',
      receiverAccountId: 'ACC048',
      senderUpiId: 'mule047@okaxis',
      receiverUpiId: 'user048@paytm',
      amount: 14000,
      currency: 'INR',
      channel: 'UPI',
      deviceId: 'DEV-047',
      status: 'SUCCESS',
      narrative: 'COMMISSION SPLIT',
      riskScore: 78
    };
    this.transactions.set(parallelTx1.transactionId, parallelTx1);

    // --- SCENARIO 2: Fan-Out / Split Pattern ---
    // ACC-MULE-401 receives ₹90,000 and splits to 4 accounts in 3 minutes
    const fanInTx: Transaction = {
      transactionId: 'TXN-FO-INIT',
      timestamp: '2026-09-08T11:10:00Z',
      senderAccountId: 'ACC022',
      receiverAccountId: 'ACC-MULE-401',
      senderUpiId: 'user022@okaxis',
      receiverUpiId: 'mule401@okaxis',
      amount: 90000,
      currency: 'INR',
      channel: 'IMPS',
      status: 'SUCCESS',
      narrative: 'PAYMENT DISBURSAL'
    };
    this.transactions.set(fanInTx.transactionId, fanInTx);

    const fanOutSplits = [
      { target: 'ACC-SUB-402', upi: 'sub402@icici', amount: 30000, min: 1 },
      { target: 'ACC-SUB-403', upi: 'sub403@icici', amount: 25000, min: 2 },
      { target: 'ACC-SUB-404', upi: 'sub404@icici', amount: 20000, min: 2.5 },
      { target: 'ACC-SUB-405', upi: 'sub405@icici', amount: 15000, min: 3 }
    ];

    fanOutSplits.forEach((split, idx) => {
      const tx: Transaction = {
        transactionId: `TXN-FO-SPLIT-${idx + 1}`,
        timestamp: new Date(new Date('2026-09-08T11:10:00Z').getTime() + split.min * 60000).toISOString(),
        senderAccountId: 'ACC-MULE-401',
        receiverAccountId: split.target,
        senderUpiId: 'mule401@okaxis',
        receiverUpiId: split.upi,
        amount: split.amount,
        currency: 'INR',
        channel: 'UPI',
        status: 'SUCCESS',
        narrative: `RAPID SPLIT LEG ${idx + 1}`,
        riskScore: 85
      };
      this.transactions.set(tx.transactionId, tx);
    });

    // --- SCENARIO 3: Fan-In / Consolidation Pattern ---
    // 4 Feeder accounts send funds into ACC-CONS-709
    const fanInFeeders = [
      { source: 'ACC-FEED-701', upi: 'feeder701@oksbi', amount: 20000, min: 1 },
      { source: 'ACC-FEED-702', upi: 'feeder702@oksbi', amount: 30000, min: 3 },
      { source: 'ACC-FEED-703', upi: 'feeder703@oksbi', amount: 25000, min: 4 },
      { source: 'ACC-FEED-704', upi: 'feeder704@oksbi', amount: 15000, min: 6 }
    ];

    fanInFeeders.forEach((feeder, idx) => {
      const tx: Transaction = {
        transactionId: `TXN-FI-MERGE-${idx + 1}`,
        timestamp: new Date(new Date('2026-09-08T14:00:00Z').getTime() + feeder.min * 60000).toISOString(),
        senderAccountId: feeder.source,
        receiverAccountId: 'ACC-CONS-709',
        senderUpiId: feeder.upi,
        receiverUpiId: 'vault709@okhdfcbank',
        amount: feeder.amount,
        currency: 'INR',
        channel: 'UPI',
        status: 'SUCCESS',
        narrative: `CONSOLIDATION FUND INJECTION ${idx + 1}`,
        riskScore: 84
      };
      this.transactions.set(tx.transactionId, tx);
    });

    // --- SCENARIO 4: Circular Flow Pattern ---
    // ACC-RING-101 -> ACC-RING-102 -> ACC-RING-103 -> ACC-RING-101
    const ringTx1: Transaction = {
      transactionId: 'TXN-CIRC-001',
      timestamp: '2026-09-07T14:20:00Z',
      senderAccountId: 'ACC-RING-101',
      receiverAccountId: 'ACC-RING-102',
      senderUpiId: 'ring101@kotak',
      receiverUpiId: 'ring102@kotak',
      amount: 75000,
      currency: 'INR',
      channel: 'UPI',
      status: 'SUCCESS',
      narrative: 'PEER LOAN ADVANCE',
      riskScore: 88
    };

    const ringTx2: Transaction = {
      transactionId: 'TXN-CIRC-002',
      timestamp: '2026-09-07T14:26:00Z', // +6 min
      senderAccountId: 'ACC-RING-102',
      receiverAccountId: 'ACC-RING-103',
      senderUpiId: 'ring102@kotak',
      receiverUpiId: 'ring103@kotak',
      amount: 74000,
      currency: 'INR',
      channel: 'UPI',
      status: 'SUCCESS',
      narrative: 'INTER-ENTITY SETTLEMENT',
      riskScore: 88
    };

    const ringTx3: Transaction = {
      transactionId: 'TXN-CIRC-003',
      timestamp: '2026-09-07T14:34:00Z', // +8 min
      senderAccountId: 'ACC-RING-103',
      receiverAccountId: 'ACC-RING-101', // Cycle completed
      senderUpiId: 'ring103@kotak',
      receiverUpiId: 'ring101@kotak',
      amount: 73000,
      currency: 'INR',
      channel: 'UPI',
      status: 'SUCCESS',
      narrative: 'REFUND REVERSAL - CYCLE COMPLETE',
      riskScore: 92
    };

    this.transactions.set(ringTx1.transactionId, ringTx1);
    this.transactions.set(ringTx2.transactionId, ringTx2);
    this.transactions.set(ringTx3.transactionId, ringTx3);

    // --- 5. Generate remaining ~520 Realistic Background Transactions ---
    const accList = Array.from(this.accounts.values()).map(a => a.accountId);
    const baseTime = new Date('2026-09-01T08:00:00Z').getTime();

    for (let i = 1; i <= 520; i++) {
      const senderIdx = Math.floor(Math.random() * accList.length);
      let receiverIdx = Math.floor(Math.random() * accList.length);
      while (receiverIdx === senderIdx) {
        receiverIdx = Math.floor(Math.random() * accList.length);
      }

      const senderId = accList[senderIdx];
      const receiverId = accList[receiverIdx];
      const sender = this.accounts.get(senderId)!;
      const receiver = this.accounts.get(receiverId)!;

      const randomMinutes = Math.floor(Math.random() * 12000); // spread over ~8 days
      const txTime = new Date(baseTime + randomMinutes * 60000).toISOString();
      const amount = 500 + Math.floor(Math.random() * 45000);
      const isSuspicious = (sender.riskScore > 75 || receiver.riskScore > 75) && Math.random() > 0.4;
      const channels: ('UPI' | 'IMPS' | 'NEFT')[] = ['UPI', 'UPI', 'UPI', 'IMPS', 'NEFT'];
      const channel = channels[Math.floor(Math.random() * channels.length)];

      const txId = `TXN-REG-${String(i).padStart(5, '0')}`;
      const tx: Transaction = {
        transactionId: txId,
        timestamp: txTime,
        senderAccountId: senderId,
        receiverAccountId: receiverId,
        senderUpiId: sender.upiIds[0] || `${senderId.toLowerCase()}@upi`,
        receiverUpiId: receiver.upiIds[0] || `${receiverId.toLowerCase()}@upi`,
        amount,
        currency: 'INR',
        channel,
        deviceId: sender.deviceIds[0],
        status: isSuspicious ? 'FLAGGED' : 'SUCCESS',
        narrative: isSuspicious ? 'UNUSUAL BEHAVIOR FLAGGED BY FRAUDNEXUS RULE' : 'REGULAR COMMERCIAL PAYMENT',
        riskScore: isSuspicious ? 65 + Math.floor(Math.random() * 30) : 10 + Math.floor(Math.random() * 25)
      };

      this.transactions.set(txId, tx);
    }
  }

  async getTransactions(filter?: {
    accountId?: string;
    upiId?: string;
    transactionId?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    let result = Array.from(this.transactions.values());

    if (filter?.transactionId) {
      result = result.filter(t => t.transactionId.toLowerCase() === filter.transactionId!.toLowerCase());
    }
    if (filter?.accountId) {
      result = result.filter(t => t.senderAccountId === filter.accountId || t.receiverAccountId === filter.accountId);
    }
    if (filter?.upiId) {
      result = result.filter(t => t.senderUpiId.toLowerCase() === filter.upiId!.toLowerCase() || t.receiverUpiId.toLowerCase() === filter.upiId!.toLowerCase());
    }

    // Sort by timestamp descending
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filter?.limit) {
      result = result.slice(0, filter.limit);
    }

    return result;
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccountById(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  async getUpiEntities(): Promise<UPIEntity[]> {
    return Array.from(this.upiEntities.values());
  }

  async getUpiEntityById(upiId: string): Promise<UPIEntity | null> {
    return this.upiEntities.get(upiId) || null;
  }

  async getBeneficiaries(): Promise<Beneficiary[]> {
    return Array.from(this.beneficiaries.values());
  }

  async getBeneficiaryById(beneficiaryId: string): Promise<Beneficiary | null> {
    return this.beneficiaries.get(beneficiaryId) || null;
  }

  async getFraudIncidents(): Promise<FraudIncident[]> {
    return Array.from(this.fraudIncidents.values());
  }

  async getFraudIncidentById(incidentId: string): Promise<FraudIncident | null> {
    return this.fraudIncidents.get(incidentId) || null;
  }

  async ingestTransaction(transaction: Transaction): Promise<void> {
    this.transactions.set(transaction.transactionId, transaction);
    this.lastUpdated = new Date().toISOString();

    // Ensure sender and receiver exist
    if (!this.accounts.has(transaction.senderAccountId)) {
      this.accounts.set(transaction.senderAccountId, {
        accountId: transaction.senderAccountId,
        accountHolder: `Account ${transaction.senderAccountId}`,
        bankName: 'Axis Bank',
        accountType: 'SAVINGS',
        riskScore: transaction.riskScore || 50,
        kycStatus: 'PARTIAL',
        phoneHash: `PH-NEW-${Date.now()}`,
        deviceIds: [transaction.deviceId || 'DEV-SIMULATED'],
        upiIds: [transaction.senderUpiId],
        createdTimestamp: new Date().toISOString(),
        status: 'ACTIVE'
      });
    }

    if (!this.accounts.has(transaction.receiverAccountId)) {
      this.accounts.set(transaction.receiverAccountId, {
        accountId: transaction.receiverAccountId,
        accountHolder: `Account ${transaction.receiverAccountId}`,
        bankName: 'ICICI Bank',
        accountType: 'SAVINGS',
        riskScore: transaction.riskScore || 65,
        kycStatus: 'PARTIAL',
        phoneHash: `PH-NEW-${Date.now() + 1}`,
        deviceIds: ['DEV-SIMULATED-REC'],
        upiIds: [transaction.receiverUpiId],
        createdTimestamp: new Date().toISOString(),
        status: 'ACTIVE'
      });
    }
  }

  getStatus() {
    return {
      adapterName: this.adapterName,
      status: 'READY' as const,
      totalTransactions: this.transactions.size,
      totalAccounts: this.accounts.size,
      totalUpiEntities: this.upiEntities.size,
      lastUpdated: this.lastUpdated
    };
  }
}
