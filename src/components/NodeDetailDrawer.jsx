import React from 'react';
import { 
  X, 
  ShieldAlert, 
  Building2, 
  CreditCard, 
  Smartphone, 
  Laptop, 
  AtSign, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Lock, 
  FileText,
  Target
} from 'lucide-react';

const getNodeIcon = (type) => {
  switch (type) {
    case 'TRANSACTION': return CreditCard;
    case 'ACCOUNT': return Building2;
    case 'UPI': return AtSign;
    case 'PHONE': return Smartphone;
    case 'DEVICE': return Laptop;
    default: return ShieldAlert;
  }
};

export default function NodeDetailDrawer({
  node,
  onClose,
  fraudCase,
  onSelectRiskFactor
}) {
  const [copied, setCopied] = React.useState(false);

  if (!node) return null;

  const IconComponent = getNodeIcon(node.type);
  const meta = node.meta || {};

  // Find linked risk factors
  const linkedFactors = (fraudCase?.riskFactors || []).filter(
    rf => node.riskFactorIds?.includes(rf.id) || rf.nodeIds?.includes(node.id)
  );

  const handleCopyId = () => {
    const idToCopy = meta.id || node.subtitle || node.id;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="node-detail-drawer" id="node-detail-drawer">
      {/* Drawer Header */}
      <div className="drawer-header">
        <div className="drawer-header-info">
          <div className={`drawer-icon-box risk-${(node.riskLevel || 'HIGH').toLowerCase()}`}>
            <IconComponent size={20} />
          </div>
          <div>
            <div className="drawer-type-row">
              <span className="drawer-type-badge">{node.type} ENTITY</span>
              <span className={`drawer-risk-tag tag-${(node.riskLevel || 'HIGH').toLowerCase()}`}>
                {node.riskLevel || 'HIGH'} RISK
              </span>
            </div>
            <h3 className="drawer-title">{node.label}</h3>
          </div>
        </div>

        <button className="drawer-close-btn" onClick={onClose} title="Close details panel">
          <X size={16} />
        </button>
      </div>

      {/* Primary Identifier Banner with Copy */}
      <div className="drawer-identifier-bar">
        <div className="id-block">
          <span className="id-label">Primary Entity Identifier</span>
          <code className="id-code">{meta.id || node.subtitle || node.id}</code>
        </div>
        <button 
          className={`copy-id-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopyId}
          title="Copy identifier to clipboard"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Forensic Metadata Attributes Grid */}
      <div className="drawer-attributes-section">
        <h4 className="section-heading">Forensic Telemetry Attributes</h4>
        
        <div className="attributes-grid">
          {Object.entries(meta).map(([key, value]) => {
            if (key === 'id') return null; // Already displayed above
            
            // Format camelCase key to Human Title
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase());

            const isHighRiskVal = String(value).includes('MATCH') || 
                                  String(value).includes('FLAGGED') || 
                                  String(value).includes('YES') || 
                                  String(value).includes('Failed');

            return (
              <div key={key} className="attribute-card">
                <span className="attr-key">{formattedKey}</span>
                <span className={`attr-val ${isHighRiskVal ? 'attr-high-risk' : ''}`}>
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tags List */}
      {node.tags && node.tags.length > 0 && (
        <div className="drawer-tags-section">
          <h4 className="section-heading">Investigation Tags</h4>
          <div className="tags-flex">
            {node.tags.map((tag) => (
              <span key={tag} className="forensic-tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Associated Risk Factors in Score Model */}
      <div className="drawer-risk-factors-section">
        <h4 className="section-heading">Associated Risk Model Reasons ({linkedFactors.length})</h4>
        <div className="drawer-factors-list">
          {linkedFactors.map((factor) => (
            <div 
              key={factor.id} 
              className="drawer-factor-item"
              onClick={() => onSelectRiskFactor?.(factor.id)}
            >
              <div className="drawer-factor-top">
                <div className="factor-pill-badge">
                  <Target size={11} />
                  <span>{factor.label}</span>
                </div>
                <span className="factor-pts">+{factor.points} pts</span>
              </div>
              <p className="factor-explanation">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Actions Footer */}
      <div className="drawer-actions-footer">
        <button 
          className="action-btn-hold"
          onClick={() => alert(`Entity ${node.label} (${node.subtitle}) flagged and marked for forensic containment.`)}
        >
          <Lock size={13} />
          <span>Contain & Freeze Entity</span>
        </button>
      </div>
    </div>
  );
}
