import React from 'react';
import { useDataset } from '../../context/DatasetContext';
import { FileText, Download, Printer, ShieldCheck, CheckCircle } from 'lucide-react';

export function ReportsPage() {
  const { currentDataset, openDossier } = useDataset();

  const reports = [
    {
      title: 'RBI SOP Section 4(b) Freeze Request — CASE-0417',
      category: 'Regulatory Emergency Freeze',
      date: '2026-08-29',
      reference: 'RBI-MULE-2026-0417',
      status: 'Ready for Signature',
      action: () => {
        const c = currentDataset.cases?.[0];
        if (c) openDossier(c);
      }
    },
    {
      title: 'FIU-IND Suspicious Transaction Report (STR) — Ring CASE-0417',
      category: 'Statutory AML Filing',
      date: '2026-08-29',
      reference: 'FIU-STR-8921-X',
      status: 'Compiled',
      action: () => {
        const c = currentDataset.cases?.[0];
        if (c) openDossier(c);
      }
    },
    {
      title: 'Heterogeneous Subgraph Cryptographic Audit Package',
      category: 'Forensic Evidence Hash',
      date: '2026-08-28',
      reference: 'SHA256-AUDIT-7A41',
      status: 'Verified ✓',
      action: () => window.print()
    }
  ];

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">COMPLIANCE &amp; REGULATORY FILINGS</span>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
          RBI Standard Operating Procedure (SOP) Dossier Center
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
          Generate, sign, and export court-ready evidentiary packages with zero-black-box proof.
        </p>
      </div>

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
        {reports.map((rep, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              padding: '20px 24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--blue-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--blue)'
                }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-head)', fontSize: '15px', color: '#fff' }}>{rep.title}</h4>
                <div style={{ display: 'flex', gap: '14px', marginTop: '4px', fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <span>REF: {rep.reference}</span>
                  <span>·</span>
                  <span>{rep.category}</span>
                  <span>·</span>
                  <span>{rep.date}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'var(--teal-dim)',
                  color: 'var(--teal)'
                }}
              >
                {rep.status}
              </span>
              <button className="btn btn-primary btn-sm" onClick={rep.action}>
                <Printer size={13} />
                Generate Dossier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Regulatory Compliance Overview */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <ShieldCheck size={20} color="var(--teal)" />
          <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '16px' }}>RBI SOP Framework Alignment</h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '18px' }}>
          MuleNet packages comply with the 4 pillars required by the Reserve Bank of India’s Standard Operating Procedures for
          freezing mule accounts across payment intermediaries:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line-soft)' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '6px' }}>1. Minimal Subgraph</div>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: '1.5' }}>
              Isolates strictly the 4–6 accounts and edges involved in transit, preventing privacy violations of unrelated accounts.
            </p>
          </div>
          <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line-soft)' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '6px' }}>2. Cryptographic Hashing</div>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: '1.5' }}>
              Every dossier is stamped with a SHA-256 integrity hash ensuring evidentiary integrity before judicial review.
            </p>
          </div>
          <div style={{ background: 'var(--panel)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line-soft)' }}>
            <div style={{ fontWeight: 600, fontSize: '13px', color: '#fff', marginBottom: '6px' }}>3. Hardware Binding</div>
            <p style={{ fontSize: '12px', color: 'var(--text-faint)', lineHeight: '1.5' }}>
              Device fingerprints and subnet allocations corroborate velocity patterns with physical syndication proof.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
