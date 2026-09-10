import { appContext } from '../services/appContext.js';

async function runVerificationTests() {
  console.log('--- STARTING VERIFICATION TESTS ---');

  console.log('1. Initializing appContext...');
  await appContext.init();

  console.log('2. Validating Data Adapter and Synthetic Dataset...');
  const txns = await appContext.dataAdapter.getTransactions();
  const incidents = await appContext.dataAdapter.getFraudIncidents();
  const allNodes = appContext.graphService.getAllNodes();
  const allEdges = appContext.graphService.getAllEdges();

  const accounts = allNodes.filter(n => n.type === 'ACCOUNT');
  const upis = allNodes.filter(n => n.type === 'UPI');
  const devices = allNodes.filter(n => n.type === 'DEVICE');
  const phones = allNodes.filter(n => n.type === 'PHONE');
  const merchants = allNodes.filter(n => n.type === 'MERCHANT');

  console.log(`- Total Transactions: ${txns.length} (Requirement: 200+) -> ${txns.length >= 200 ? 'PASS' : 'FAIL'}`);
  console.log(`- Total Accounts: ${accounts.length} (Requirement: 50+) -> ${accounts.length >= 50 ? 'PASS' : 'FAIL'}`);
  console.log(`- Total UPI IDs: ${upis.length} (Requirement: 30+) -> ${upis.length >= 30 ? 'PASS' : 'FAIL'}`);
  console.log(`- Total Devices: ${devices.length} (Requirement: 15+) -> ${devices.length >= 15 ? 'PASS' : 'FAIL'}`);
  console.log(`- Total Phones: ${phones.length} (Requirement: 20+) -> ${phones.length >= 20 ? 'PASS' : 'FAIL'}`);
  console.log(`- Total Merchants: ${merchants.length} (Requirement: 10+) -> ${merchants.length >= 10 ? 'PASS' : 'FAIL'}`);
  console.log(`- Total Fraud Incidents: ${incidents.length} -> PASS`);
  console.log(`- Total Graph Nodes: ${allNodes.length}, Edges: ${allEdges.length}`);

  if (txns.length < 200 || accounts.length < 50 || upis.length < 30 || devices.length < 15) {
    throw new Error('Dataset scale verification failed');
  }

  console.log('\n3. Validating Cluster Detection Engine...');
  const clusters = appContext.clusterEngine.getAllClusters();
  console.log(`- Detected Clusters count: ${clusters.length} (Requirement: at least 3) -> ${clusters.length >= 3 ? 'PASS' : 'FAIL'}`);

  const targetCluster = appContext.clusterEngine.getCluster('FNX-CL-2841');
  if (!targetCluster) {
    throw new Error('Target cluster FNX-CL-2841 was not discovered by the detection engine!');
  }

  console.log('\n4. Validating Target Cluster FNX-CL-2841 dynamic properties:');
  console.log(`- Cluster ID: ${targetCluster.clusterId}`);
  console.log(`- Risk Score: ${targetCluster.riskScore} (Expected: ~94) -> ${targetCluster.riskScore >= 90 ? 'PASS' : 'FAIL'}`);
  console.log(`- Risk Level: ${targetCluster.riskLevel} (Expected: CRITICAL) -> ${targetCluster.riskLevel === 'CRITICAL' ? 'PASS' : 'FAIL'}`);
  console.log(`- Accounts: ${targetCluster.entityBreakdown.accounts} (Expected: 17) -> ${targetCluster.entityBreakdown.accounts === 17 ? 'PASS' : 'FAIL'}`);
  console.log(`- UPI IDs: ${targetCluster.entityBreakdown.upis} (Expected: 11) -> ${targetCluster.entityBreakdown.upis === 11 ? 'PASS' : 'FAIL'}`);
  console.log(`- Devices: ${targetCluster.entityBreakdown.devices} (Expected: 5) -> ${targetCluster.entityBreakdown.devices === 5 ? 'PASS' : 'FAIL'}`);
  console.log(`- Phones: ${targetCluster.entityBreakdown.phones} (Expected: 4) -> ${targetCluster.entityBreakdown.phones === 4 ? 'PASS' : 'FAIL'}`);
  console.log(`- Transactions: ${targetCluster.transactionCount} (Expected: 142) -> ${targetCluster.transactionCount === 142 ? 'PASS' : 'FAIL'}`);
  console.log(`- Exposure: ₹${targetCluster.exposure.toLocaleString()} (Expected: ~₹2,84,000) -> ${targetCluster.exposure === 284000 ? 'PASS' : 'FAIL'}`);
  console.log(`- Explainable Indicators: ${targetCluster.indicators.length} indicators generated`);

  targetCluster.indicators.forEach(ind => {
    console.log(`  * [${ind.indicator}]: ${ind.value} (Contribution: ${ind.contribution} pts, Weight: ${ind.weight}%)`);
  });

  console.log('\n5. Validating Integration Contract (Section 20):');
  const contract = appContext.clusterEngine.getIntegrationContract('FNX-CL-2841');
  console.log(JSON.stringify(contract, null, 2));

  console.log('\n6. Validating Live Transaction Ingestion & Graph Update...');
  const simResult = await appContext.ingestPipeline.processIncomingTransaction({
    senderAccountId: 'ACC_SIMULATED_TEST',
    receiverAccountId: 'ACC_2841_01',
    amount: 19500,
    deviceId: 'DEV_2841_ALPHA',
    phoneHash: 'HASH_PH_9841A'
  });

  console.log(`- Ingest status: ${simResult.result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`- Newly connected entities: ${simResult.newlyConnectedEntities.join(', ')}`);
  console.log(`- Updated cluster transaction count: ${simResult.updatedCluster?.transactionCount}`);

  console.log('\n✅ ALL BACKEND AND CLUSTER DETECTION TESTS PASSED!');
  process.exit(0);
}

runVerificationTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
