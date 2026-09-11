import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const [gnnThreshold, setGnnThreshold] = useState(0.85);
  const [zeroDwellCutoff, setZeroDwellCutoff] = useState(60);
  const [autoDraftFreeze, setAutoDraftFreeze] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://aml-core.internal.bank/hooks/mulenet-v1');
  const [saved, setSaved] = useState(false);

  const handleSave = e => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">SYSTEM CONFIGURATION</span>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
          Engine &amp; Compliance Parameters
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
          Calibrate detection thresholds and automated freeze order generation.
        </p>
      </div>

      {saved && (
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
          Configuration parameters successfully saved to MuleNet engine.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* H-GNN Threshold Card */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', marginBottom: '6px' }}>
            H-GNN Flagging Sensitivity Threshold
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.5 }}>
            Clusters with model confidence exceeding this threshold trigger automated case creation and minimal subgraph isolation.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <input
              type="range"
              min="0.50"
              max="0.99"
              step="0.01"
              value={gnnThreshold}
              onChange={e => setGnnThreshold(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--blue)' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: 'var(--blue)', minWidth: '45px' }}>
              {gnnThreshold.toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>
            Default: 0.85 · Lowering threshold increases recall; raising decreases false positives.
          </div>
        </div>

        {/* Zero-Dwell Time Threshold */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', marginBottom: '6px' }}>
            Zero-Dwell Velocity Cutoff (Seconds)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px', lineHeight: 1.5 }}>
            Transactions where balance is dispersed within this time window are weighted as algorithmic transit legs.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={zeroDwellCutoff}
              onChange={e => setZeroDwellCutoff(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--red)' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: 'var(--red)', minWidth: '45px' }}>
              {zeroDwellCutoff}s
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '8px' }}>
            Default: 60s · Mule networks typically operate below 45 seconds.
          </div>
        </div>

        {/* Automation Toggles */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px', marginBottom: '14px' }}>
            Automated Compliance Triggers
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Auto-Draft RBI Freeze Order on Critical Flag</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-faint)' }}>Pre-populates minimal subgraph evidence sheet for compliance officer sign-off.</div>
            </div>
            <input
              type="checkbox"
              checked={autoDraftFreeze}
              onChange={e => setAutoDraftFreeze(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--teal)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
              Core Banking AML Webhook Dispatch URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--panel-2)',
                border: '1px solid var(--line)',
                padding: '9px 12px',
                borderRadius: '6px',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          <Save size={14} />
          Save Configuration
        </button>
      </form>
    </div>
  );
}
