import React from 'react';
import { Sparkles, GitGraph, Clock, Layers, ShieldCheck, Cpu } from 'lucide-react';

export function AIInsightsPage() {
  const featureAttributions = [
    { feature: 'Zero-Dwell Transit Velocity', weight: 42, color: '#E5484D', desc: 'Funds exiting node in <60 seconds from receipt' },
    { feature: 'Shared Hardware Fingerprint', weight: 31, color: '#F2A93C', desc: 'Multiple newly opened accounts binding to identical device hash' },
    { feature: 'Known Mule Subnet Density', weight: 19, color: '#8B5CF6', desc: 'IP routing matching proxy clusters flagged in prior FIU circulars' },
    { feature: 'Algorithmic Fan-Out Geometry', weight: 8, color: '#4C8DFF', desc: 'Symmetrical split into equal legs followed by rapid re-consolidation' },
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">MODEL EXPLAINABILITY &amp; SIGNALS</span>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
          Heterogeneous GNN &amp; GNNExplainer Intelligence
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
          Transparent, audited topological scoring metrics and sub-graph attribution weights.
        </p>
      </div>

      {/* Grid: Topology + Dwell velocity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px', marginBottom: '24px' }}>
        {/* Topology Breakdown Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Layers size={18} color="var(--blue)" />
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px' }}>Heterogeneous Graph Topology</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
            Traditional AML systems analyze scalar account balances. MuleNet reasons over a multi-relational graph
            simultaneously embedding three distinct entity layers:
          </p>

          <div className="layers">
            <div className="layer-row">
              <div className="layer-label">ACCOUNTS</div>
              <div className="layer-nodes">
                <div className="lnode acc hot">7734</div>
                <div className="lnode acc hot">2210</div>
                <div className="lnode acc hot">5589</div>
                <div className="lnode acc hot">9081</div>
                <div className="lnode acc" style={{ opacity: 0.4 }}>1123</div>
              </div>
            </div>
            <div className="layer-row">
              <div className="layer-label">DEVICES</div>
              <div className="layer-nodes">
                <div className="lnode dev hot">CF</div>
                <div className="lnode dev" style={{ opacity: 0.4 }}>77</div>
              </div>
            </div>
            <div className="layer-row">
              <div className="layer-label">IP SUBNETS</div>
              <div className="layer-nodes">
                <div className="lnode net hot"><span>.58</span></div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '16px', fontFamily: 'var(--font-mono)' }}>
            ✓ Relational edges weighted dynamically by temporal transit speed.
          </div>
        </div>

        {/* Dwell Velocity Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Clock size={18} color="var(--red)" />
            <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px' }}>Zero-Dwell Velocity Scoring</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
            Legitimate banking customers maintain deposits for days or weeks. Mule accounts operate as pass-through
            relays, draining balances within minutes or seconds of arrival:
          </p>

          <div className="dwell-compare" style={{ marginTop: '14px' }}>
            <div className="dwell-row legit">
              <div className="dr-top">
                <span>Legitimate Retail Cohort (Baseline)</span>
                <span>6.2 days avg. dwell</span>
              </div>
              <div className="dwell-bar">
                <div style={{ width: '92%', background: 'var(--teal)' }}></div>
              </div>
            </div>

            <div className="dwell-row mule">
              <div className="dr-top">
                <span>Flagged Scatter-Gather Cluster (CASE-0417)</span>
                <span>17 seconds dwell</span>
              </div>
              <div className="dwell-bar">
                <div style={{ width: '3.5%', background: 'var(--red)' }}></div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '22px', fontFamily: 'var(--font-mono)' }}>
            Velocity Anomaly Factor: <b>31,400x speedup</b> compared to legitimate accounts.
          </div>
        </div>
      </div>

      {/* Feature Attribution Matrix (GNNExplainer) */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Cpu size={18} color="var(--teal)" />
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px' }}>
            GNNExplainer Subgraph Feature Attribution
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.6', marginBottom: '20px' }}>
          To avoid black-box ambiguity during legal freeze challenges, GNNExplainer computes the mutual information
          between the prediction and minimal subgraphs:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {featureAttributions.map((fa, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fa.feature}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: fa.color }}>{fa.weight}% Influence</span>
              </div>
              <div style={{ height: '8px', background: 'var(--line-soft)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${fa.weight}%`, background: fa.color, height: '100%', borderRadius: '4px' }}></div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginTop: '4px' }}>
                {fa.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
