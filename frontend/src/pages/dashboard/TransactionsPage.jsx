import React, { useState } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { fmtCurrency } from '../../utils/csvParser';
import { useNavigate } from 'react-router-dom';
import { Search, Download, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { downloadSampleCSVFile } from '../../data/syntheticCsv';

export function TransactionsPage() {
  const { currentDataset, setFocusedNodeId } = useDataset();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [minAmount, setMinAmount] = useState(0);

  // Extract transactions from edges or raw rows
  const rawTx = currentDataset.rawRows
    ? currentDataset.rawRows.map((r, i) => ({
        id: `TX-${1000 + i}`,
        sender: r.sender_id,
        receiver: r.receiver_id,
        amount: r.amount,
        timestamp: r.timestamp,
        device: r.device_id,
        subnet: r.ip_subnet,
        dwellSec: 20 + (i * 12) % 65
      }))
    : [
        { id: 'TX-1001', sender: 'ACC-7734', receiver: 'ACC-2210', amount: 160000, timestamp: '2026-08-29 09:14:02', device: 'DEV-CF19A3', subnet: '103.21.58.0/24', dwellSec: 38 },
        { id: 'TX-1002', sender: 'ACC-7734', receiver: 'ACC-5589', amount: 160000, timestamp: '2026-08-29 09:14:11', device: 'DEV-CF19A3', subnet: '103.21.58.0/24', dwellSec: 47 },
        { id: 'TX-1003', sender: 'ACC-7734', receiver: 'ACC-9081', amount: 160000, timestamp: '2026-08-29 09:14:19', device: 'DEV-CF19A3', subnet: '103.21.58.0/24', dwellSec: 55 },
        { id: 'TX-1004', sender: 'ACC-2210', receiver: 'ACC-9081', amount: 90000, timestamp: '2026-08-29 09:16:40', device: 'DEV-CF19A3', subnet: '103.21.58.0/24', dwellSec: 29 },
        { id: 'TX-1005', sender: 'ACC-5589', receiver: 'ACC-9081', amount: 85000, timestamp: '2026-08-29 09:17:05', device: 'DEV-CF19A3', subnet: '103.21.58.0/24', dwellSec: 24 },
        { id: 'TX-1006', sender: 'ACC-4471', receiver: 'ACC-6602', amount: 52000, timestamp: '2026-08-29 11:02:14', device: 'DEV-118BQ', subnet: '185.220.101.0/24', dwellSec: 410 },
        { id: 'TX-1007', sender: 'ACC-1123', receiver: 'ACC-8890', amount: 12000, timestamp: '2026-08-28 10:15:00', device: 'DEV-77CX9', subnet: '45.33.32.0/24', dwellSec: 536000 },
        { id: 'TX-1008', sender: 'ACC-3345', receiver: 'ACC-5567', amount: 7000, timestamp: '2026-08-28 12:40:22', device: 'DEV-99A12', subnet: '192.0.2.0/24', dwellSec: 298000 },
        { id: 'TX-1009', sender: 'ACC-2298', receiver: 'ACC-8890', amount: 15500, timestamp: '2026-08-28 14:10:05', device: 'DEV-44Z88', subnet: '198.51.100.0/24', dwellSec: 406000 },
        { id: 'TX-1010', sender: 'ACC-6671', receiver: 'ACC-1123', amount: 24000, timestamp: '2026-08-28 16:22:40', device: 'DEV-33K91', subnet: '203.0.113.0/24', dwellSec: 180000 },
      ];

  const filtered = rawTx.filter(tx => {
    const matchQuery =
      !searchTerm ||
      tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.subnet.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMin = tx.amount >= minAmount;
    return matchQuery && matchMin;
  });

  const handleInspect = id => {
    setFocusedNodeId(id);
    navigate('/app/overview');
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="eyebrow">LEDGER INTELLIGENCE</span>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
            Multi-Party Transaction Monitor
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
            Audited transaction ledger with dwell transit speed and hardware fingerprint binding.
          </p>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={downloadSampleCSVFile}>
          <Download size={14} />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          background: 'var(--panel-2)',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid var(--line)',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Filter by sender, receiver, device, or subnet..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>Min Amount:</span>
          <select
            value={minAmount}
            onChange={e => setMinAmount(Number(e.target.value))}
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <option value={0}>All Amounts</option>
            <option value={50000}>&gt; ₹50,000</option>
            <option value={100000}>&gt; ₹1,00,000</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>TX ID</th>
              <th>SENDER ACCOUNT</th>
              <th>RECEIVER ACCOUNT</th>
              <th>AMOUNT</th>
              <th>TIMESTAMP</th>
              <th>DEVICE FINGERPRINT</th>
              <th>IP SUBNET</th>
              <th>DWELL TIME</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(tx => {
              const isZeroDwell = tx.dwellSec < 60;
              return (
                <tr key={tx.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontSize: '11px' }}>{tx.id}</td>
                  <td>
                    <button
                      onClick={() => handleInspect(tx.sender)}
                      style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)', textAlign: 'left' }}
                    >
                      {tx.sender}
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handleInspect(tx.receiver)}
                      style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-mono)', textAlign: 'left' }}
                    >
                      {tx.receiver}
                    </button>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontWeight: 600 }}>
                    {fmtCurrency(tx.amount)}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
                    {tx.timestamp}
                  </td>
                  <td>
                    <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
                      {tx.device}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--violet)', fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
                      {tx.subnet}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: isZeroDwell ? 'var(--red)' : 'var(--text-dim)',
                        background: isZeroDwell ? 'var(--red-dim)' : 'transparent',
                        padding: isZeroDwell ? '2px 6px' : '0',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isZeroDwell && <Zap size={11} />}
                      {tx.dwellSec < 60 ? `${tx.dwellSec}s (Zero-Dwell)` : `${Math.round(tx.dwellSec / 60)} min`}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleInspect(tx.sender)}
                      title="Inspect sender in network graph"
                    >
                      <ExternalLink size={12} />
                      Graph
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
