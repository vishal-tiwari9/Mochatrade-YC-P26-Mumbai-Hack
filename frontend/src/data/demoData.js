export const DEMO_DATA = {
  sourceName: 'Demo Dataset',
  statusDetails: 'Sample Scenario · CASE-0417 Scatter-Gather Ring · 15 nodes',
  stats: { txCount: 1250, accCount: 184, devCount: 63, subCount: 27, totalVolume: 12450000 },
  alert: {
    title: 'PRE-EMPTIVE FLAG',
    body: 'New account <b style="color:#fff">ACC-9081</b> was flagged at creation — its device fingerprint resolves to subnet <b style="color:#fff">103.21.58.0/24</b>, already linked to confirmed mule cluster history. No fraudulent transaction had occurred yet.'
  },
  nodes: [
    { id: 'ACC-7734', type: 'account', label: 'ACC-7734', sub: 'Hub · account age 14d', cluster: 'c1', flagged: true, riskScore: 95 },
    { id: 'ACC-2210', type: 'account', label: 'ACC-2210', sub: 'Scatter leg', cluster: 'c1', flagged: true, riskScore: 89 },
    { id: 'ACC-5589', type: 'account', label: 'ACC-5589', sub: 'Scatter leg', cluster: 'c1', flagged: true, riskScore: 88 },
    { id: 'ACC-9081', type: 'account', label: 'ACC-9081', sub: 'Cash-out · account age 2d', cluster: 'c1', flagged: true, riskScore: 94 },
    { id: 'DEV-CF19A3', type: 'device', label: 'DEV-CF19A3', sub: 'Shared device fingerprint', cluster: 'c1', flagged: true, riskScore: 92 },
    { id: 'NET-10321', type: 'subnet', label: '103.21.58.0/24', sub: 'Known mule subnet', cluster: 'c1', flagged: true, riskScore: 96 },

    { id: 'ACC-4471', type: 'account', label: 'ACC-4471', sub: 'Velocity spike', cluster: 'c2', riskScore: 65 },
    { id: 'ACC-6602', type: 'account', label: 'ACC-6602', sub: 'Velocity spike', cluster: 'c2', riskScore: 61 },
    { id: 'DEV-118BQ', type: 'device', label: 'DEV-118BQ', sub: 'Device fingerprint', cluster: 'c2', riskScore: 58 },

    { id: 'ACC-1123', type: 'account', label: 'ACC-1123', sub: 'Dwell 6.2 days', cluster: 'n', riskScore: 14 },
    { id: 'ACC-8890', type: 'account', label: 'ACC-8890', sub: 'Dwell 11 days', cluster: 'n', riskScore: 10 },
    { id: 'ACC-3345', type: 'account', label: 'ACC-3345', sub: 'Dwell 3.4 days', cluster: 'n', riskScore: 16 },
    { id: 'ACC-5567', type: 'account', label: 'ACC-5567', sub: 'Dwell 8.9 days', cluster: 'n', riskScore: 12 },
    { id: 'ACC-2298', type: 'account', label: 'ACC-2298', sub: 'Dwell 4.7 days', cluster: 'n', riskScore: 11 },
    { id: 'DEV-77CX9', type: 'device', label: 'DEV-77CX9', sub: 'Clean device fingerprint', cluster: 'n', riskScore: 8 },
  ],
  edges: [
    { from: 'ACC-7734', to: 'ACC-2210', type: 'tx', amount: 160000, t: '09:14:02', dwellSec: 38, tag: 'tx1' },
    { from: 'ACC-7734', to: 'ACC-5589', type: 'tx', amount: 160000, t: '09:14:11', dwellSec: 47, tag: 'tx2' },
    { from: 'ACC-7734', to: 'ACC-9081', type: 'tx', amount: 160000, t: '09:14:19', dwellSec: 55, tag: 'tx3' },
    { from: 'ACC-2210', to: 'ACC-9081', type: 'tx', amount: 90000, t: '09:16:40', dwellSec: 29, tag: 'tx4' },
    { from: 'ACC-5589', to: 'ACC-9081', type: 'tx', amount: 85000, t: '09:17:05', dwellSec: 24, tag: 'tx5' },
    { from: 'ACC-7734', to: 'DEV-CF19A3', type: 'device' },
    { from: 'ACC-9081', to: 'DEV-CF19A3', type: 'device' },
    { from: 'ACC-7734', to: 'NET-10321', type: 'subnet' },
    { from: 'ACC-2210', to: 'NET-10321', type: 'subnet' },
    { from: 'ACC-5589', to: 'NET-10321', type: 'subnet' },

    { from: 'ACC-4471', to: 'ACC-6602', type: 'tx', amount: 52000, t: '11:02:14', dwellSec: 410 },
    { from: 'ACC-4471', to: 'DEV-118BQ', type: 'device' },
    { from: 'ACC-6602', to: 'DEV-118BQ', type: 'device' },

    { from: 'ACC-1123', to: 'ACC-8890', type: 'tx', amount: 12000, t: '08:15:00', dwellSec: 536000 },
    { from: 'ACC-3345', to: 'ACC-5567', type: 'tx', amount: 7000, t: '08:40:22', dwellSec: 298000 },
    { from: 'ACC-2298', to: 'ACC-8890', type: 'tx', amount: 15500, t: '08:55:10', dwellSec: 406000 },
    { from: 'ACC-1123', to: 'DEV-77CX9', type: 'device' },
    { from: 'ACC-3345', to: 'DEV-77CX9', type: 'device' },
  ],
  cases: [
    {
      id: 'CASE-0417',
      cluster: 'c1',
      risk: 94,
      status: 'CRITICAL',
      accounts: 4,
      tx: 5,
      summary: 'Algorithmic scatter-gather pattern: funds dispersed from a 14-day-old hub account into two legs and re-gathered into a 2-day-old cash-out account, all under one minute of dwell time. Hub and cash-out account share a device fingerprint linked to a known mule subnet.',
      dwellRows: [
        { tag: 'TX1', flow: 'ACC-7734 → ACC-2210', amount: 160000, t: '09:14:02', dwellSec: 38 },
        { tag: 'TX2', flow: 'ACC-7734 → ACC-5589', amount: 160000, t: '09:14:11', dwellSec: 47 },
        { tag: 'TX3', flow: 'ACC-7734 → ACC-9081', amount: 160000, t: '09:14:19', dwellSec: 55 },
        { tag: 'TX4', flow: 'ACC-2210 → ACC-9081', amount: 90000, t: '09:16:40', dwellSec: 29 },
        { tag: 'TX5', flow: 'ACC-5589 → ACC-9081', amount: 85000, t: '09:17:05', dwellSec: 24 },
      ],
      deviceRecord: { id: 'DEV-CF19A3', accounts: 'ACC-7734, ACC-9081', firstSeen: '2026-08-29', priorCases: 'CASE-0201, CASE-0388' },
      subgraphNodes: ['ACC-7734', 'ACC-2210', 'ACC-5589', 'ACC-9081']
    },
    {
      id: 'CASE-0392',
      cluster: 'c2',
      risk: 61,
      status: 'ELEVATED',
      accounts: 2,
      tx: 1,
      summary: 'Two accounts opened nine days apart share a device fingerprint and exhibit above-baseline transaction velocity. Dwell time (6.8 min) is short but does not yet meet the zero-dwell threshold. Monitoring continues; no freeze action recommended.',
      dwellRows: [
        { tag: 'TX1', flow: 'ACC-4471 → ACC-6602', amount: 52000, t: '11:02:14', dwellSec: 410 },
      ],
      deviceRecord: { id: 'DEV-118BQ', accounts: 'ACC-4471, ACC-6602', firstSeen: '2026-08-29', priorCases: 'None' },
      subgraphNodes: ['ACC-4471', 'ACC-6602']
    },
    {
      id: 'CASE-0388',
      cluster: 'n',
      risk: 12,
      status: 'CLEAR',
      accounts: 5,
      tx: 3,
      summary: 'Background cohort reviewed after a routine sweep. Dwell times exceed 3 days across all observed transfers and no device or subnet overlap was found. No further action.',
      dwellRows: [
        { tag: 'TX1', flow: 'ACC-1123 → ACC-8890', amount: 12000, t: '08:15:00', dwellSec: 536000 },
        { tag: 'TX2', flow: 'ACC-3345 → ACC-5567', amount: 7000, t: '08:40:22', dwellSec: 298000 },
        { tag: 'TX3', flow: 'ACC-2298 → ACC-8890', amount: 15500, t: '08:55:10', dwellSec: 406000 },
      ],
      deviceRecord: { id: 'DEV-77CX9', accounts: 'ACC-1123, ACC-3345', firstSeen: '2026-08-20', priorCases: 'None' },
      subgraphNodes: ['ACC-1123', 'ACC-8890', 'ACC-3345', 'ACC-5567']
    },
  ],
  logs: [
    { t: '09:11:47', level: 'warn', html: '<b>ACC-9081</b> created — device <b>DEV-CF19A3</b> resolves to subnet <b>103.21.58.0/24</b> (prior mule history). Pre-emptive flag issued.' },
    { t: '09:14:02', level: 'info', html: '<b>ACC-7734</b> → <b>ACC-2210</b> ₹1,60,000. Zero-dwell velocity score updated.' },
    { t: '09:14:11', level: 'info', html: '<b>ACC-7734</b> → <b>ACC-5589</b> ₹1,60,000. Scatter pattern forming across 2 legs.' },
    { t: '09:14:19', level: 'info', html: '<b>ACC-7734</b> → <b>ACC-9081</b> ₹1,60,000. Hub fully drained in 17 seconds.' },
    { t: '09:16:40', level: 'warn', html: '<b>ACC-2210</b> → <b>ACC-9081</b> ₹90,000 after 29s dwell. Gather leg detected.' },
    { t: '09:17:05', level: 'crit', html: '<b>ACC-5589</b> → <b>ACC-9081</b> ₹85,000 after 24s dwell. Scatter-gather geometry confirmed.' },
    { t: '09:17:06', level: 'crit', html: 'H-GNN risk score crossed threshold (0.94). <b>CASE-0417</b> opened. GNNExplainer isolating minimal subgraph…' },
    { t: '09:17:08', level: 'crit', html: 'Minimal subgraph isolated: <b>4 accounts, 5 transactions</b>. Evidentiary dossier compiled and ready for review.' },
  ]
};
