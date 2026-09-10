import React, { useState } from 'react';
import { Transaction } from '../types';
import { ArrowUpDown, Filter, IndianRupee, ExternalLink, CheckCircle, Clock } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTx: (txId: string) => void;
  selectedTxId: string | null;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onSelectTx,
  selectedTxId
}) => {
  const [filterText, setFilterText] = useState('');
  const [sortField, setSortField] = useState<'timestamp' | 'amount' | 'riskScore'>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  if (!transactions || transactions.length === 0) return null;

  // Filter transactions
  const filtered = transactions.filter(t => 
    t.transactionId.toLowerCase().includes(filterText.toLowerCase()) ||
    t.senderAccountId.toLowerCase().includes(filterText.toLowerCase()) ||
    t.receiverAccountId.toLowerCase().includes(filterText.toLowerCase()) ||
    t.channel.toLowerCase().includes(filterText.toLowerCase())
  );

  // Sort transactions
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'timestamp') {
      const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return sortAsc ? diff : -diff;
    }
    if (sortField === 'amount') {
      return sortAsc ? a.amount - b.amount : b.amount - a.amount;
    }
    if (sortField === 'riskScore') {
      return sortAsc ? (a.riskScore || 0) - (b.riskScore || 0) : (b.riskScore || 0) - (a.riskScore || 0);
    }
    return 0;
  });

  const handleSort = (field: 'timestamp' | 'amount' | 'riskScore') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-dark-900 border border-slate-800 rounded-xl p-4 shadow-xl mb-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Path Transaction Telemetry Log
          </h2>
          <p className="text-[11px] text-slate-400">
            Click any row to cross-highlight its corresponding directed edge on the graph.
          </p>
        </div>

        {/* Search filter */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Filter table rows..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="bg-dark-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-mono text-slate-400">
              <th className="py-2.5 px-3">Transaction ID</th>
              <th
                onClick={() => handleSort('timestamp')}
                className="py-2.5 px-3 cursor-pointer hover:text-white"
              >
                <div className="flex items-center space-x-1">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3">From (Sender)</th>
              <th className="py-2.5 px-3">To (Receiver)</th>
              <th
                onClick={() => handleSort('amount')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount (INR)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Channel</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th
                onClick={() => handleSort('riskScore')}
                className="py-2.5 px-3 text-center cursor-pointer hover:text-white"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Risk</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right">Hop Interval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {sorted.map((tx, idx) => {
              const isSelected = selectedTxId === tx.transactionId;
              let timeSincePrev = '0 min (Root)';
              if (idx > 0) {
                const prev = new Date(sorted[idx - 1].timestamp).getTime();
                const curr = new Date(tx.timestamp).getTime();
                const diff = Math.max(0, Math.round((curr - prev) / 60000));
                timeSincePrev = `+${diff} min`;
              }

              return (
                <tr
                  key={tx.transactionId}
                  onClick={() => onSelectTx(tx.transactionId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-200 ring-1 ring-cyan-500'
                      : 'hover:bg-dark-850/70 text-slate-300'
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-cyan-400">
                    {tx.transactionId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {tx.senderAccountId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">
                    {tx.receiverAccountId}
                  </td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-950 border border-slate-700 text-slate-300">
                      {tx.channel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.status === 'SUCCESS' ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      (tx.riskScore || 0) > 80 ? 'text-red-400 bg-red-950/60 border border-red-500/40' : 'text-amber-400 bg-amber-950/40'
                    }`}>
                      {tx.riskScore || 50}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400 text-[11px]">
                    {timeSincePrev}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
