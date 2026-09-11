import React, { useState } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldAlert, CheckCircle2, Eye, Filter, ArrowRight } from 'lucide-react';

export function AlertsPage() {
  const { currentDataset, openDossier, addToWatchlist, setFocusedNodeId } = useDataset();
  const navigate = useNavigate();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [actionMessage, setActionMessage] = useState(null);

  const rawAlerts = [
    {
      id: 'ALT-1092',
      severity: 'CRITICAL',
      type: 'Pre-emptive Flag',
      target: 'ACC-9081',
      score: 94,
      timestamp: '2026-08-29 09:11:47',
      description: 'Account created on hardware device DEV-CF19A3 which resolves to blacklisted proxy subnet 103.21.58.0/24.',
      caseId: 'CASE-0417',
      details: 'Flagged prior to initial deposit. Pattern matches CASE-0201 scatter-gather syndicate.'
    },
    {
      id: 'ALT-1091',
      severity: 'CRITICAL',
      type: 'Zero-Dwell Scatter-Gather',
      target: 'ACC-7734',
      score: 95,
      timestamp: '2026-08-29 09:17:05',
      description: '₹4,80,000 dispersed across 3 legs and re-gathered in 17 seconds. Dwell time under 60s.',
      caseId: 'CASE-0417',
      details: 'Transit velocity 28x above normal baseline. Funds gathered into fresh cash-out account.'
    },
    {
      id: 'ALT-1089',
      severity: 'ELEVATED',
      type: 'Device Hardware Binding',
      target: 'DEV-118BQ',
      score: 61,
      timestamp: '2026-08-29 11:02:14',
      description: 'Device linked to 2 newly created accounts exhibiting burst transaction velocity.',
      caseId: 'CASE-0392',
      details: 'Accounts ACC-4471 and ACC-6602 opened 9 days apart. Average dwell 6.8 minutes.'
    },
    {
      id: 'ALT-1084',
      severity: 'LOW',
      type: 'Routine Sweep Variance',
      target: 'ACC-1123',
      score: 12,
      timestamp: '2026-08-28 14:10:05',
      description: 'Cohort reviewed after daily automated check. Dwell times standard (>3 days).',
      caseId: 'CASE-0388',
      details: 'No subnet overlap. Cleared as normal retail commercial transactions.'
    },
  ];

  const alerts = rawAlerts.filter(a => filterSeverity === 'ALL' || a.severity === filterSeverity);

  const handleInitiateFreeze = alert => {
    setActionMessage(`Emergency Freeze Order drafted for ${alert.target} under RBI SOP Section 4(b).`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleViewInGraph = alert => {
    setFocusedNodeId(alert.target);
    navigate('/app/overview');
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="eyebrow">SECURITY INCIDENT QUEUE</span>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
            Flagged Anomaly Alerts
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
            Real-time contact tracing alerts flagged by the Heterogeneous GNN engine.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--panel-2)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
          {['ALL', 'CRITICAL', 'ELEVATED', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`btn btn-sm ${filterSeverity === sev ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 12px' }}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            background: 'var(--teal-dim)',
            border: '1px solid var(--teal)',
            color: '#A2F2DE',
            padding: '12px 18px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px'
          }}
        >
          <CheckCircle2 size={18} />
          {actionMessage}
        </div>
      )}

      {/* Alerts Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {alerts.map(alt => {
          const isCrit = alt.severity === 'CRITICAL';
          const isElev = alt.severity === 'ELEVATED';

          return (
            <div
              key={alt.id}
              className="card"
              style={{
                borderLeft: `4px solid ${isCrit ? 'var(--red)' : isElev ? 'var(--amber)' : 'var(--teal)'}`,
                padding: '20px 24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '14px',
                      color: isCrit ? 'var(--red)' : isElev ? 'var(--amber)' : 'var(--teal)'
                    }}
                  >
                    {alt.id}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: isCrit ? 'var(--red-dim)' : isElev ? 'var(--amber-dim)' : 'var(--teal-dim)',
                      color: isCrit ? '#FBB4B6' : isElev ? '#F5C57E' : '#7FE0C6'
                    }}
                  >
                    {alt.severity}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                    {alt.timestamp}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>RISK INDEX:</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '16px',
                      color: isCrit ? 'var(--red)' : isElev ? 'var(--amber)' : 'var(--teal)'
                    }}
                  >
                    {alt.score}/100
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                {alt.type}: <span style={{ color: 'var(--blue)' }}>{alt.target}</span>
              </div>
              <p style={{ marginTop: '6px', fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                {alt.description}
              </p>
              <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                Context: {alt.details}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
                {isCrit && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleInitiateFreeze(alt)}>
                    <ShieldAlert size={13} />
                    Initiate RBI Freeze
                  </button>
                )}

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const matchedCase = currentDataset.cases?.find(c => c.id === alt.caseId) || currentDataset.cases?.[0];
                    if (matchedCase) openDossier(matchedCase);
                  }}
                >
                  <Eye size={13} />
                  Open Case Dossier
                </button>

                <button className="btn btn-ghost btn-sm" onClick={() => handleViewInGraph(alt)}>
                  <ArrowRight size={13} />
                  Focus in Graph
                </button>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    addToWatchlist({
                      id: alt.target,
                      type: alt.target.startsWith('DEV') ? 'Device' : alt.target.startsWith('NET') ? 'Subnet' : 'Account',
                      risk: alt.score,
                      reason: alt.description,
                      addedAt: '2026-08-29',
                      status: isCrit ? 'Freeze Pending' : 'Active Monitoring'
                    });
                    setActionMessage(`${alt.target} added to Watchlist.`);
                    setTimeout(() => setActionMessage(null), 3000);
                  }}
                >
                  + Add to Watchlist
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
