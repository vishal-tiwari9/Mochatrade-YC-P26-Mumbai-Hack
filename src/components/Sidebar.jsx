import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Share2, 
  LogOut, 
  ShieldCheck, 
  Layers, 
  Activity, 
  GitBranch, 
  Network, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';

export const CORE_FEATURES = [
  { id: 1, name: 'Animated FraudNexus Network Graph & Risk Score', badge: 'Active Engine' },
  { id: 2, name: 'Explainable Fraud Risk Score Investigation', badge: 'Active Engine' },
  { id: 3, name: 'Trace Fraud / Connected Entity Clusters', badge: 'Staging' },
  { id: 4, name: 'Coordinated Fraud Cluster Detection', badge: 'Staging' },
  { id: 5, name: 'Emerging Fraud / Early Warning Money Flow', badge: 'Staging' },
  { id: 6, name: 'Money Flow / Attack Path Response', badge: 'Staging' },
  { id: 7, name: 'Fraud Response + Evidence Pack', badge: 'Staging' }
];

export default function Sidebar({ activeFeatureId, onSelectFeature }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      {/* Brand & System Status */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <Share2 size={18} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">FraudNexus</span>
            <span className="sidebar-brand-sub">SOC Console v4.2</span>
          </div>
        </div>

        <div className="sidebar-live-badge">
          <span className="sidebar-live-dot" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Core Feature Navigation List */}
      <nav className="sidebar-menu-section" aria-label="Core Fraud Features">
        <div className="sidebar-section-title">Investigation Modules</div>

        {CORE_FEATURES.map((feature) => {
          const isActive = activeFeatureId === feature.id;
          return (
            <button
              key={feature.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectFeature(feature.id)}
              type="button"
            >
              <span className="nav-item-index">0{feature.id}</span>
              <div className="nav-item-content">
                <span className="nav-item-label">{feature.name}</span>
                <span className={`nav-item-badge ${feature.id <= 2 ? 'active-engine' : ''}`}>
                  {feature.badge}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Session User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            <span>FN</span>
          </div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">Lead Analyst</span>
            <span className="sidebar-user-role">SOC Level 3</span>
          </div>
        </div>

        <button 
          className="sidebar-logout-btn" 
          onClick={handleLogout}
          title="Sign out to Login"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
