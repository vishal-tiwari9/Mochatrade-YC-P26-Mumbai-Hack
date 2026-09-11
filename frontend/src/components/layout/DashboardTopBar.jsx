import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, RefreshCw } from 'lucide-react';
import { useDataset } from '../../context/DatasetContext';

export function DashboardTopBar() {
  const {
    activeMode,
    currentDataset,
    loadDemoDataset,
    searchAccountQuery,
    setSearchAccountQuery
  } = useDataset();

  const navigate = useNavigate();

  return (
    <>
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <div className="topbar-search">
            <Search />
            <input
              type="text"
              placeholder="Search entity, account, device, IP..."
              value={searchAccountQuery}
              onChange={e => setSearchAccountQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="topbar-right">
          {/* Ticker metrics */}
          <div className="dash-ticker">
            <div className="dash-ticker-item">
              <div className="dash-ticker-val">1,28,406</div>
              <div className="dash-ticker-lbl">accounts monitored</div>
            </div>
            <div className="dash-ticker-item">
              <div className="dash-ticker-val live">14</div>
              <div className="dash-ticker-lbl">flagged today</div>
            </div>
            <div className="dash-ticker-item">
              <div className="dash-ticker-val">340ms</div>
              <div className="dash-ticker-lbl">avg. detection time</div>
            </div>
          </div>
        </div>
      </header>

      {/* Dataset Status Bar */}
      <div className="dataset-status-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-faint)', fontSize: '10px', letterSpacing: '0.5px' }}>DATA SOURCE:</span>
          <span className={`status-pill ${activeMode}`}>
            {activeMode === 'uploaded' ? 'Uploaded Dataset' : 'Demo Dataset'}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>
            {currentDataset.statusDetails || 'Sample Scenario · CASE-0417 Scatter-Gather Ring · 15 nodes'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeMode === 'uploaded' && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={loadDemoDataset}
              style={{ display: 'inline-flex', gap: '6px' }}
            >
              <RefreshCw size={12} />
              Switch to Demo Dataset
            </button>
          )}

          <Link to="/app/input" className="btn btn-ghost btn-sm">
            <Upload size={12} />
            Upload Dataset
          </Link>
        </div>
      </div>
    </>
  );
}
