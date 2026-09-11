import React, { useState } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { Shield, Plus, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WatchlistPage() {
  const { watchlist, addToWatchlist, removeFromWatchlist, setFocusedNodeId } = useDataset();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newType, setNewType] = useState('Account');
  const [newReason, setNewReason] = useState('');
  const [newRisk, setNewRisk] = useState(75);

  const handleAdd = e => {
    e.preventDefault();
    if (!newId.trim()) return;
    addToWatchlist({
      id: newId.trim().toUpperCase(),
      type: newType,
      risk: Number(newRisk),
      reason: newReason.trim() || 'Manual analyst surveillance flag',
      addedAt: new Date().toISOString().slice(0, 10),
      status: Number(newRisk) > 80 ? 'Freeze Pending' : 'Active Monitoring'
    });
    setNewId('');
    setNewReason('');
    setShowModal(false);
  };

  const handleInspect = id => {
    setFocusedNodeId(id);
    navigate('/app/overview');
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="eyebrow">ACTIVE SURVEILLANCE</span>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
            Entity Watchlist &amp; Sanctions
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
            High-risk bank accounts, shared devices, and suspicious IP subnets under active surveillance.
          </p>
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
          <Plus size={14} />
          Add Entity to Watchlist
        </button>
      </div>

      {/* Watchlist Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ENTITY IDENTIFIER</th>
              <th>TYPE</th>
              <th>RISK SCORE</th>
              <th>SURVEILLANCE REASON</th>
              <th>ADDED DATE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map(item => {
              const isCrit = item.risk > 80;
              return (
                <tr key={item.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>
                    {item.id}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: item.type === 'Device' ? 'var(--amber)' : item.type === 'Subnet' ? 'var(--violet)' : 'var(--blue)'
                      }}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: isCrit ? 'var(--red)' : 'var(--amber)'
                      }}
                    >
                      {item.risk}/100
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '12px' }}>{item.reason}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
                    {item.addedAt}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: isCrit ? 'var(--red-dim)' : 'var(--amber-dim)',
                        color: isCrit ? '#FBB4B6' : '#F5C57E'
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => handleInspect(item.id)}
                        title="View in graph"
                      >
                        <ExternalLink size={12} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => removeFromWatchlist(item.id)}
                        title="Remove from watchlist"
                        style={{ color: 'var(--red)' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Entity Modal */}
      {showModal && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="dossier-content" style={{ maxWidth: '480px' }}>
            <div className="d-head">
              <div className="d-head-left">
                <div className="d-eyebrow">NEW SURVEILLANCE RECORD</div>
                <h2>Add to Watchlist</h2>
              </div>
              <button className="d-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAdd} className="d-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Entity Identifier (e.g. ACC-1234, DEV-XXXX, 103.x.x.x)</label>
                <input
                  type="text"
                  required
                  placeholder="ACC-9920"
                  value={newId}
                  onChange={e => setNewId(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: '#fff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Entity Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--panel-2)',
                      border: '1px solid var(--line)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '13px'
                    }}
                  >
                    <option value="Account">Bank Account</option>
                    <option value="Device">Device Fingerprint</option>
                    <option value="Subnet">IP Subnet</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Assigned Risk (0-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newRisk}
                    onChange={e => setNewRisk(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--panel-2)',
                      border: '1px solid var(--line)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Flag Reason / Notes</label>
                <textarea
                  rows="3"
                  placeholder="Associated with rapid fund transit and proxy subnet..."
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--panel-2)',
                    border: '1px solid var(--line)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '12px',
                    resize: 'none'
                  }}
                />
              </div>

              <div className="d-footer" style={{ padding: '16px 0 0', borderTop: '1px solid var(--line-soft)', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary">
                  Save Entity
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
