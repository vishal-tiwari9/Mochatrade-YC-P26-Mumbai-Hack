import React from 'react';
import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-brand">
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
              <span className="nav-brand-name">MuleNet</span>
            </Link>
            <p>
              A compliance and detection engine that maps illicit fund flows across accounts, devices, and IP subnets —
              and explains every flag it raises.
            </p>
          </div>

          <div className="footer-col">
            <h4>PRODUCT</h4>
            <a href="/#how-it-works">How it works</a>
            <Link to="/app/input">Data Ingestion</Link>
            <Link to="/app/overview">Live dashboard</Link>
            <a href="/#compliance">Compliance</a>
          </div>

          <div className="footer-col">
            <h4>TECHNOLOGY</h4>
            <a href="/#hgnn">Heterogeneous GNN</a>
            <a href="/#explainer">GNNExplainer</a>
            <a href="/#compliance">Evidence dossiers</a>
          </div>

          <div className="footer-col">
            <h4>ABOUT</h4>
            <a href="/#compliance">RBI SOP alignment</a>
            <Link to="/app/overview">Sample case: CASE-0417</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 MULENET — HACKATHON PROTOTYPE</span>
          <span>ALL DATA ON THIS SITE IS SIMULATED FOR DEMONSTRATION</span>
        </div>
      </div>
    </footer>
  );
}
