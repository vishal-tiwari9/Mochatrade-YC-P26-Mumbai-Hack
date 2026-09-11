import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  ArrowLeftRight,
  Sparkles,
  Shield,
  FileText,
  Briefcase,
  Settings,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

export function DashboardSidebar() {
  const { currentDataset, watchlist } = useDataset();
  const alertCount = currentDataset.cases?.filter(c => c.status === 'CRITICAL').length || 1;

  const navItems = [
    { label: 'Overview', to: '/app/overview', icon: LayoutDashboard },
    { label: 'Alerts', to: '/app/alerts', icon: AlertTriangle, badge: '14', badgeClass: 'badge-crit' },
    { label: 'Transactions', to: '/app/transactions', icon: ArrowLeftRight },
    { label: 'AI Insights', to: '/app/ai-insights', icon: Sparkles },
    { section: 'MANAGEMENT' },
    { label: 'Watchlist', to: '/app/watchlist', icon: Shield, badge: watchlist.length.toString(), badgeClass: 'badge-blue' },
    { label: 'Reports', to: '/app/reports', icon: FileText },
    { label: 'Case Mgmt', to: '/app/cases', icon: Briefcase, badge: currentDataset.cases?.length.toString(), badgeClass: 'badge-blue' },
    { label: 'Data Ingestion', to: '/app/input', icon: Upload },
    { section: 'SYSTEM' },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="dashboard-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="nav-mark">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" fill="#fff" />
              <circle cx="4" cy="6" r="2" fill="#fff" opacity="0.85" />
              <circle cx="20" cy="6" r="2" fill="#fff" opacity="0.85" />
              <circle cx="4" cy="19" r="2" fill="#fff" opacity="0.85" />
              <line x1="12" y1="12" x2="4" y2="6" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
              <line x1="12" y1="12" x2="20" y2="6" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
              <line x1="12" y1="12" x2="4" y2="19" stroke="#fff" strokeWidth="1.2" opacity="0.7" />
            </svg>
          </div>
          <div>
            <div className="nav-brand-name">MuleNet</div>
            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>
              ANALYST CONSOLE
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="nav-section-label">
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.badge && <span className={`badge ${item.badgeClass}`}>{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Return to marketing website */}
      <div className="sidebar-footer">
        <Link
          to="/"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '11px' }}
        >
          <ArrowLeft size={13} />
          <span>Marketing Site</span>
        </Link>
        <span style={{ fontSize: '10px', color: 'var(--teal)', fontWeight: 700 }}>v2.4-PRO</span>
      </div>
    </aside>
  );
}
