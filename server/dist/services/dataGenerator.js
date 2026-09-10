"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSyntheticDataset = generateSyntheticDataset;
function generateSyntheticDataset() {
    const transactions = [];
    const fraudIncidents = [];
    // -------------------------------------------------------------
    // 1. PRIMARY CRITICAL DEMO CLUSTER: FNX-CL-2841
    // Target:
    // - 17 Accounts: ACC_2841_01 to ACC_2841_17
    // - 11 UPI IDs: upi_2841_01@okhdfcbank to upi_2841_11@ybl
    // - 5 Devices: DEV_2841_A to DEV_2841_E
    // - 4 Phone Hashes: HASH_PH_2841_1 to HASH_PH_2841_4
    // - 142 Transactions
    // - Total Exposure: exactly ₹2,84,000
    // - 3 Linked Fraud Incidents
    // -------------------------------------------------------------
    const cluster1Accounts = Array.from({ length: 17 }, (_, i) => `ACC_2841_${String(i + 1).padStart(2, '0')}`);
    const cluster1Upis = Array.from({ length: 11 }, (_, i) => `syndicate_${String(i + 1).padStart(2, '0')}@upi`);
    const cluster1Devices = ['DEV_2841_ALPHA', 'DEV_2841_BETA', 'DEV_2841_GAMMA', 'DEV_2841_DELTA', 'DEV_2841_EPSILON'];
    const cluster1Phones = ['HASH_PH_9841A', 'HASH_PH_9841B', 'HASH_PH_9841C', 'HASH_PH_9841D'];
    const cluster1Beneficiaries = ['BENE_MULE_HQ_01', 'BENE_SHELL_CORP_02'];
    const cluster1Merchants = ['MER_SHELL_99', 'MER_CRYPTO_OTC_01'];
    // Base timestamps over a 7-day span leading up to 2026-09-09
    const baseDate = new Date('2026-09-03T08:00:00Z');
    // Distribution to sum up to exactly ₹2,84,000 across 142 transactions
    // 142 txns: 141 txns @ various realistic amounts, last txn adjusts to exactly 284000.
    let runningSum = 0;
    const targetTotal1 = 284000;
    const count1 = 142;
    // Track entity introduction to reflect realistic network expansion:
    // Day 1: 3 accounts
    // Day 3: 7 accounts
    // Day 5: 12 accounts
    // Day 7: 17 accounts
    for (let i = 0; i < count1; i++) {
        // Determine active account pool based on transaction progress (growth over time)
        let availableAccCount = 3;
        let dayOffset = 0;
        let hourOffset = Math.floor(i * 1.1);
        if (i < 20) {
            availableAccCount = 3;
            dayOffset = 0; // Day 1
        }
        else if (i < 50) {
            availableAccCount = 7;
            dayOffset = 2; // Day 3
        }
        else if (i < 95) {
            availableAccCount = 12;
            dayOffset = 4; // Day 5
        }
        else {
            availableAccCount = 17;
            dayOffset = 6; // Day 7
        }
        const senderIdx = i % availableAccCount;
        let receiverIdx = (i + 1) % availableAccCount;
        if (receiverIdx === senderIdx)
            receiverIdx = (senderIdx + 1) % availableAccCount;
        const senderAccount = cluster1Accounts[senderIdx];
        const receiverAccount = cluster1Accounts[receiverIdx];
        const senderUpi = cluster1Upis[i % cluster1Upis.length];
        const receiverUpi = cluster1Upis[(i + 1) % cluster1Upis.length];
        // Shared devices (Multiple accounts accessed via same device!)
        const device = cluster1Devices[i % cluster1Devices.length];
        const phone = cluster1Phones[i % cluster1Phones.length];
        // Transaction amount
        let amount = 0;
        if (i === count1 - 1) {
            amount = targetTotal1 - runningSum;
        }
        else {
            // Deterministic amounts between 800 and 3500
            amount = 800 + ((i * 137) % 2700);
            runningSum += amount;
        }
        const txnDate = new Date(baseDate.getTime() + (dayOffset * 24 * 3600 * 1000) + (hourOffset * 3600 * 1000) + ((i * 13) % 60) * 60 * 1000);
        const isBeneTransfer = i % 5 === 0;
        const isMerchant = i % 7 === 0;
        transactions.push({
            transactionId: `TXN_2841_${String(i + 1).padStart(4, '0')}`,
            timestamp: txnDate.toISOString(),
            senderAccountId: senderAccount,
            receiverAccountId: receiverAccount,
            senderUpiId: senderUpi,
            receiverUpiId: receiverUpi,
            deviceId: device,
            phoneHash: phone,
            amount: amount,
            currency: 'INR',
            merchantId: isMerchant ? cluster1Merchants[i % cluster1Merchants.length] : undefined,
            beneficiaryId: isBeneTransfer ? cluster1Beneficiaries[i % cluster1Beneficiaries.length] : undefined,
            channel: i % 4 === 0 ? 'IMPS' : 'UPI',
            status: 'SUCCESS',
            location: {
                city: 'Mumbai',
                state: 'Maharashtra',
                ipHash: `IP_HASH_MUM_${(i % 3) + 1}`
            }
        });
    }
    // Fraud Incidents linked to Cluster 1
    fraudIncidents.push({
        incidentId: 'INC-2026-0891',
        reportedAt: '2026-09-05T11:20:00Z',
        category: 'MULE_NETWORK',
        description: 'Coordinated digital mule operation routing illicit funds through multiple UPI handles',
        reportedLoss: 95000,
        involvedEntityIds: ['ACCOUNT:ACC_2841_01', 'DEVICE:DEV_2841_ALPHA', 'PHONE:HASH_PH_9841A'],
        status: 'CONFIRMED'
    }, {
        incidentId: 'INC-2026-0914',
        reportedAt: '2026-09-07T14:45:00Z',
        category: 'PHISHING',
        description: 'Phishing syndicate harvesting credentials and binding DEV_2841_BETA to multiple customer VPAs',
        reportedLoss: 120000,
        involvedEntityIds: ['ACCOUNT:ACC_2841_04', 'DEVICE:DEV_2841_BETA', 'UPI:syndicate_04@upi'],
        status: 'CONFIRMED'
    }, {
        incidentId: 'INC-2026-0978',
        reportedAt: '2026-09-09T09:10:00Z',
        category: 'MULE_NETWORK',
        description: 'Rapid velocity circular fund layer flagged by Banking Cyber Intelligence unit',
        reportedLoss: 69000,
        involvedEntityIds: ['ACCOUNT:ACC_2841_09', 'DEVICE:DEV_2841_GAMMA', 'PHONE:HASH_PH_9841C'],
        status: 'CONFIRMED'
    });
    // -------------------------------------------------------------
    // 2. HIGH RISK CLUSTER: FNX-CL-1092
    // - 8 Accounts: ACC_1092_01 to ACC_1092_08
    // - 6 UPI IDs
    // - 3 Devices
    // - 3 Phones
    // - 45 Transactions
    // - Total Exposure: ~₹1,15,000
    // - 1 Fraud Incident
    // -------------------------------------------------------------
    const cluster2Accounts = Array.from({ length: 8 }, (_, i) => `ACC_1092_${String(i + 1).padStart(2, '0')}`);
    const cluster2Upis = Array.from({ length: 6 }, (_, i) => `fastmule_${String(i + 1).padStart(2, '0')}@ibl`);
    const cluster2Devices = ['DEV_1092_X', 'DEV_1092_Y', 'DEV_1092_Z'];
    const cluster2Phones = ['HASH_PH_1092_A', 'HASH_PH_1092_B', 'HASH_PH_1092_C'];
    const baseDate2 = new Date('2026-09-06T10:00:00Z');
    for (let i = 0; i < 45; i++) {
        const sender = cluster2Accounts[i % 8];
        const receiver = cluster2Accounts[(i + 2) % 8];
        const txnDate = new Date(baseDate2.getTime() + (i * 2.5 * 3600 * 1000));
        transactions.push({
            transactionId: `TXN_1092_${String(i + 1).padStart(4, '0')}`,
            timestamp: txnDate.toISOString(),
            senderAccountId: sender,
            receiverAccountId: receiver,
            senderUpiId: cluster2Upis[i % 6],
            receiverUpiId: cluster2Upis[(i + 1) % 6],
            deviceId: cluster2Devices[i % 3],
            phoneHash: cluster2Phones[i % 3],
            amount: 1500 + ((i * 180) % 3500),
            currency: 'INR',
            merchantId: i % 6 === 0 ? 'MER_GAMING_77' : undefined,
            beneficiaryId: i % 4 === 0 ? 'BENE_OFFSHORE_09' : undefined,
            channel: 'UPI',
            status: 'SUCCESS',
            location: {
                city: 'Bengaluru',
                state: 'Karnataka',
                ipHash: 'IP_HASH_BLR_09'
            }
        });
    }
    fraudIncidents.push({
        incidentId: 'INC-2026-0743',
        reportedAt: '2026-09-08T16:30:00Z',
        category: 'SIM_SWAP',
        description: 'SIM-swap enabled unauthorized UPI transfers funneling into common offshore beneficiary',
        reportedLoss: 115000,
        involvedEntityIds: ['ACCOUNT:ACC_1092_01', 'PHONE:HASH_PH_1092_A', 'DEVICE:DEV_1092_X'],
        status: 'CONFIRMED'
    });
    // -------------------------------------------------------------
    // 3. MEDIUM RISK CLUSTER: FNX-CL-3320
    // - 5 Accounts: ACC_3320_01 to ACC_3320_05
    // - 4 UPI IDs
    // - 2 Devices
    // - 2 Phones
    // - 22 Transactions
    // - Total Exposure: ~₹64,000
    // -------------------------------------------------------------
    const cluster3Accounts = Array.from({ length: 5 }, (_, i) => `ACC_3320_${String(i + 1).padStart(2, '0')}`);
    const cluster3Upis = Array.from({ length: 4 }, (_, i) => `finroute_${String(i + 1).padStart(2, '0')}@axis`);
    const cluster3Devices = ['DEV_3320_1', 'DEV_3320_2'];
    const cluster3Phones = ['HASH_PH_3320_A', 'HASH_PH_3320_B'];
    const baseDate3 = new Date('2026-09-07T12:00:00Z');
    for (let i = 0; i < 22; i++) {
        const sender = cluster3Accounts[i % 5];
        const receiver = cluster3Accounts[(i + 1) % 5];
        const txnDate = new Date(baseDate3.getTime() + (i * 3 * 3600 * 1000));
        transactions.push({
            transactionId: `TXN_3320_${String(i + 1).padStart(4, '0')}`,
            timestamp: txnDate.toISOString(),
            senderAccountId: sender,
            receiverAccountId: receiver,
            senderUpiId: cluster3Upis[i % 4],
            receiverUpiId: cluster3Upis[(i + 1) % 4],
            deviceId: cluster3Devices[i % 2],
            phoneHash: cluster3Phones[i % 2],
            amount: 1800 + ((i * 220) % 2400),
            currency: 'INR',
            merchantId: 'MER_ECOM_21',
            channel: 'UPI',
            status: 'SUCCESS',
            location: {
                city: 'Delhi',
                state: 'Delhi',
                ipHash: 'IP_HASH_DEL_12'
            }
        });
    }
    // -------------------------------------------------------------
    // 4. LEGITIMATE / BACKGROUND TRAFFIC
    // - 25+ Independent Accounts
    // - 15+ Independent UPI IDs
    // - 8+ Independent Devices
    // - 12+ Independent Phones
    // - 8 Merchants
    // - 35+ Regular Transactions
    // Bringing totals well over 55+ Accounts, 35+ UPIs, 18+ Devices, 22+ Phones, 10+ Merchants, 240+ Txns!
    // -------------------------------------------------------------
    const bgAccounts = Array.from({ length: 25 }, (_, i) => `ACC_BG_${String(i + 1).padStart(2, '0')}`);
    const bgUpis = Array.from({ length: 15 }, (_, i) => `legit_user_${String(i + 1).padStart(2, '0')}@icici`);
    const bgDevices = Array.from({ length: 8 }, (_, i) => `DEV_LEGIT_${String(i + 1).padStart(2, '0')}`);
    const bgPhones = Array.from({ length: 12 }, (_, i) => `HASH_PH_LEGIT_${String(i + 1).padStart(2, '0')}`);
    const bgMerchants = ['MER_SWIGGY_01', 'MER_AMAZON_IN_02', 'MER_ZOMATO_03', 'MER_FLIPKART_04', 'MER_RELIANCE_05', 'MER_UBER_IN_06'];
    for (let i = 0; i < 35; i++) {
        const sender = bgAccounts[i % bgAccounts.length];
        const receiver = bgAccounts[(i + 3) % bgAccounts.length];
        const txnDate = new Date(baseDate.getTime() + (i * 4 * 3600 * 1000));
        transactions.push({
            transactionId: `TXN_BG_${String(i + 1).padStart(4, '0')}`,
            timestamp: txnDate.toISOString(),
            senderAccountId: sender,
            receiverAccountId: receiver,
            senderUpiId: bgUpis[i % bgUpis.length],
            receiverUpiId: bgUpis[(i + 1) % bgUpis.length],
            deviceId: bgDevices[i % bgDevices.length],
            phoneHash: bgPhones[i % bgPhones.length],
            amount: 350 + ((i * 310) % 4500),
            currency: 'INR',
            merchantId: bgMerchants[i % bgMerchants.length],
            channel: i % 3 === 0 ? 'CARD' : 'UPI',
            status: 'SUCCESS',
            location: {
                city: i % 2 === 0 ? 'Pune' : 'Hyderabad',
                state: i % 2 === 0 ? 'Maharashtra' : 'Telangana',
                ipHash: `IP_HASH_LEGIT_${(i % 5) + 1}`
            }
        });
    }
    return { transactions, fraudIncidents };
}
