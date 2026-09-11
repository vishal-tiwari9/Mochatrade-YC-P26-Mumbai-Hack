import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <nav className="site-nav">
      <div className="container">
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

        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`} id="navLinks">
          <Link to="/" className={isHome ? 'active' : ''} onClick={() => setMobileOpen(false)}>
            Home
          </Link>
          <a href="/#how-it-works" onClick={() => setMobileOpen(false)}>
            How it works
          </a>
          <Link to="/app/input" onClick={() => setMobileOpen(false)}>
            Data Input
          </Link>
          <a href="/#compliance" onClick={() => setMobileOpen(false)}>
            Compliance &amp; Dossiers
          </a>
          <Link to="/app/overview" onClick={() => setMobileOpen(false)}>
            Live Dashboard
          </Link>
          <Link to="/app/overview" className="nav-cta" onClick={() => setMobileOpen(false)}>
            Open Dashboard →
          </Link>
        </div>
      </div>
    </nav>
  );
}
