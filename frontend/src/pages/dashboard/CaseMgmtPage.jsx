import React, { useState } from 'react';
import { useDataset } from '../../context/DatasetContext';
import { Briefcase, ShieldAlert, CheckCircle, Clock, User, ArrowRight } from 'lucide-react';

export function CaseMgmtPage() {
  const { currentDataset, openDossier } = useDataset();
  const cases = currentDataset.cases || [];

  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'CASE-0417');
  const activeCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const stages = [
    { label: 'Cluster Flagged', done: true, desc: 'H-GNN crossed 0.85 velocity & device threshold' },
    { label: 'Subgraph Isolated', done: true, desc: 'GNNExplainer extracted minimal causal graph' },
    { label: 'Dossier Compiled', done: true, desc: 'Ledger & sha256 hardware evidence assembled' },
    { label: 'RBI Freeze Filing', done: activeCase?.status === 'CRITICAL', desc: 'Section 4 emergency account hold issued' },
    { label: 'Judicial Close', done: false, desc: 'FIU review & final fund recovery' },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <span className="eyebrow">WORKFLOW &amp; CASE FILES</span>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
          Compliance Case Management
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
          Track investigations through the RBI Standard Operating Procedure lifecycle.
        </p>
      </div>

      {/* Case Grid: Left selector, Right detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '22px' }}>
        {/* Left Column: Cases List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {cases.map(c => {
            const isSelected = c.id === selectedCaseId;
            const isCrit = c.status === 'CRITICAL';
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className="card"
                style={{
                  padding: '16px 18px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--blue)' : 'var(--line)',
                  background: isSelected ? 'rgba(76, 141, 255, 0.08)' : 'var(--panel-2)',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#fff' }}>
                    {c.id}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isCrit ? 'var(--red-dim)' : 'var(--amber-dim)',
                      color: isCrit ? '#FBB4B6' : '#F5C57E'
                    }}
                  >
                    {c.status}
                  </span>
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-dim)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.summary}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  <span>Risk: {c.risk}/100</span>
                  <span>{c.accounts} Accs · {c.tx} TXs</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Case Lifecycle & Detail */}
        {activeCase && (
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--line-soft)', paddingBottom: '18px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>CASE FILE DETAIL</span>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '22px', marginTop: '4px' }}>{activeCase.id}</h3>
                <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> Officer: Compliance Triage Lead #4</span>
                  <span>·</span>
                  <span>Created: 2026-08-29</span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => openDossier(activeCase)}>
                <ShieldAlert size={14} />
                Open Full Dossier
              </button>
            </div>

            {/* Lifecycle Stages */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.4px', marginBottom: '14px' }}>
                INVESTIGATION LIFECYCLE STAGES
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stages.map((stg, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: stg.done ? 'rgba(47, 191, 159, 0.05)' : 'var(--panel)',
                      border: `1px solid ${stg.done ? 'rgba(47, 191, 159, 0.3)' : 'var(--line-soft)'}`
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: stg.done ? 'var(--teal)' : 'var(--panel-2)',
                        color: stg.done ? '#0B0F1A' : 'var(--text-faint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {stg.done ? '✓' : i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: stg.done ? 'var(--teal)' : 'var(--text-dim)' }}>
                        {stg.label}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{stg.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Summary */}
            <div style={{ background: 'var(--panel)', padding: '16px 18px', borderRadius: '8px', border: '1px solid var(--line-soft)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '6px' }}>Incident Summary</div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-dim)', lineHeight: 1.6 }}>{activeCase.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
