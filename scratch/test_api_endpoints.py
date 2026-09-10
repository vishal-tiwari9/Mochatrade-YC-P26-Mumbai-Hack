import urllib.request
import urllib.parse
import json

BASE = 'http://localhost:5000'

def request(path, method='GET', data=None):
    url = f"{BASE}{path}"
    headers = {'Content-Type': 'application/json'}
    body = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))

print("--- 1. Testing /health ---")
health = request('/health')
print("Health:", health['status'], health['service'])

print("\n--- 2. Testing /api/data-source/status ---")
status = request('/api/data-source/status')
print(f"Adapter: {status['adapterName']}, Total Tx: {status['totalTransactions']}, Total Accounts: {status['totalAccounts']}")

print("\n--- 3. Testing /api/transactions/TXN-FNX-9001 ---")
tx = request('/api/transactions/TXN-FNX-9001')
print(f"Tx: {tx['transactionId']} | {tx['senderAccountId']} -> {tx['receiverAccountId']} | Amount: INR {tx['amount']}")

print("\n--- 4. Testing /api/accounts/ACC001 ---")
acc = request('/api/accounts/ACC001')
print(f"Account: {acc['accountId']} | Holder: {acc['accountHolder']} | Bank: {acc['bankName']} | Risk: {acc['riskScore']}")

print("\n--- 5. Testing /api/money-flow/trace?source=TXN-FNX-9001&direction=outgoing&maxHops=5 ---")
trace = request('/api/money-flow/trace?source=TXN-FNX-9001&direction=outgoing&maxHops=5')
path = trace['activePath']
path_id = path['pathId']
print(f"Trace Result: Source={trace['source']}, TotalAmount=INR {trace['totalAmount']}, Hops={trace['hopCount']}, Risk={trace['pathRiskScore']}/{trace['riskLevel']}")
print(f"Path ID: {path_id} with {len(path['nodes'])} nodes, {len(path['edges'])} edges, {len(path['transactions'])} transactions")

print(f"\n--- 6. Testing /api/money-flow/path/{path_id} ---")
path_detail = request(f"/api/money-flow/path/{path_id}")
print(f"Path detail sourceEntity: {path_detail['sourceEntity']} -> {path_detail['destinationEntity']}")

print(f"\n--- 7. Testing /api/money-flow/{path_id}/transactions ---")
path_txs = request(f"/api/money-flow/{path_id}/transactions")
print(f"Path transactions count: {len(path_txs)}")

print(f"\n--- 8. Testing /api/money-flow/{path_id}/entities ---")
path_nodes = request(f"/api/money-flow/{path_id}/entities")
print(f"Path entities count: {len(path_nodes)}:")
for n in path_nodes:
    print(f"  - [{n['roleLabel']}] {n['id']} (Risk {n['riskScore']})")

print(f"\n--- 9. Testing /api/money-flow/{path_id}/risk ---")
path_risk = request(f"/api/money-flow/{path_id}/risk")
print(f"Risk Score: {path_risk['score']} ({path_risk['level']}), Factor count: {len(path_risk['breakdown'])}")

print("\n--- 10. Testing Section 28 Contract Export ---")
contract = request(f"/api/contract/export/{path_id}")
print("Contract Object:", json.dumps(contract, indent=2))

print("\n--- 11. Testing POST /api/simulation/trigger ---")
sim = request("/api/simulation/trigger", method='POST', data={'targetAccountId': 'ACC121'})
print("Simulation output:", sim['message'].encode('ascii', errors='replace').decode('ascii'))

print("\n--- 12. Testing POST /api/transactions/ingest ---")
ingest_res = request("/api/transactions/ingest", method='POST', data={
    'transactionId': 'TXN-TEST-API-001',
    'timestamp': '2026-09-10T11:00:00Z',
    'senderAccountId': 'ACC047',
    'receiverAccountId': 'ACC099',
    'senderUpiId': 'mule047@okaxis',
    'receiverUpiId': 'user099@okhdfcbank',
    'amount': 45000,
    'currency': 'INR',
    'channel': 'UPI',
    'status': 'SUCCESS'
})
print("Ingest response:", ingest_res)

print("\n--- 13. Testing /api/audit-logs ---")
audit = request('/api/audit-logs')
print(f"Audit log entries recorded: {len(audit)}")

print("\nALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY!")
