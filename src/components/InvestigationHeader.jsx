import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Download, 
  Lock, 
  Clock, 
  Share2, 
  Activity, 
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';

export default function InvestigationHeader({
  currentCase,
  onSwitchCase,
  availableCases = []
}) {
  const txn = currentCase?.transaction || {};

  const handleExportReport = () => {
    const reportJson = JSON.stringify(currentCase, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SAR_Report_${currentCase.caseId}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="investigation-header">
      {/* Top Level Brand & Global Meta */}
      <div className="header-top-row">
        <div className="brand-group">
          <div className="brand-logo-icon">
            <Share2 size={22} className="text-cyan" />
            <div className="brand-dot-pulse" />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-name">FraudNexus</h1>
              <span className="brand-version-badge">SOC v4.2</span>
              <span className="live-stream-tag">
                <span className="live-dot" /> LIVE STREAM
              </span>
            </div>
            <p className="brand-tagline">Graph Neural Network & Explainable Fraud Discovery Engine</p>
          </div>
        </div>

        {/* Case Switcher & Controls */}
        <div className="header-actions-group">
          <div className="case-selector-wrapper">
            <span className="selector-label">Active Case:</span>
            <select
              className="case-dropdown"
              value={currentCase?.caseId}
              onChange={(e) => onSwitchCase(e.target.value)}
            >
              {availableCases.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.caseId}: {c.title.substring(0, 32)}…
                </option>
              ))}
            </select>
          </div>

          <button 
            className="action-btn header-export-btn"
            onClick={handleExportReport}
            title="Export Suspicious Activity Report (SAR)"
          >
            <Download size={14} />
            <span>Export SAR</span>
          </button>

          <button 
            className="action-btn header-freeze-btn"
            onClick={() => alert(`All linked accounts and VPAs in Case ${currentCase?.caseId} placed under immediate debit freeze.`)}
            title="Execute Emergency Containment"
          >
            <Lock size={14} />
            <span>Freeze Ring</span>
          </button>
        </div>
      </div>

      {/* Case Context & Flagged Transaction Bar */}
      <div className="header-summary-strip">
        <div className="summary-item case-id-item">
          <span className="strip-label">CASE ID</span>
          <span className="strip-value case-id-text">{currentCase?.caseId}</span>
        </div>

        <div className="summary-divider" />

        <div className="summary-item">
          <span className="strip-label">FLAGGED TRANSACTION</span>
          <div className="strip-value-row">
            <code className="strip-code">{txn.id}</code>
            <span className="strip-amount text-red">{txn.amount}</span>
          </div>
        </div>

        <div className="summary-divider" />

        <div className="summary-item">
          <span className="strip-label">CHANNEL / TIMESTAMP</span>
          <span className="strip-value">{txn.channel} • {txn.timestamp}</span>
        </div>

        <div className="summary-divider" />

        <div className="summary-item">
          <span className="strip-label">MERCHANT / IP GEO</span>
          <span className="strip-value">{txn.merchant} ({txn.location})</span>
        </div>

        <div className="summary-divider" />

        <div className="summary-item status-pill-item">
          <span className="strip-label">SEVERITY</span>
          <div className={`severity-badge badge-${(currentCase?.severity || 'HIGH').toLowerCase()}`}>
            <ShieldAlert size={12} />
            <span>{currentCase?.severity} ({currentCase?.riskScore}/100)</span>
          </div>
        </div>
      </div>
    </header>
  );
}
