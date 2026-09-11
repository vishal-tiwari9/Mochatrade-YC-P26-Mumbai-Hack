import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SiteNav } from './components/common/SiteNav';
import { SiteFooter } from './components/common/SiteFooter';
import { DossierModal } from './components/common/DossierModal';
import { HomePage } from './pages/marketing/HomePage';

import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { AlertsPage } from './pages/dashboard/AlertsPage';
import { TransactionsPage } from './pages/dashboard/TransactionsPage';
import { AIInsightsPage } from './pages/dashboard/AIInsightsPage';
import { WatchlistPage } from './pages/dashboard/WatchlistPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { CaseMgmtPage } from './pages/dashboard/CaseMgmtPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { DataInputPage } from './pages/dashboard/DataInputPage';

export function App() {
  return (
    <Routes>
      {/* 1. Marketing Website Layer (Home, Problem, Solution, Tech, Compliance, Footer) */}
      <Route
        path="/"
        element={
          <div className="marketing-site-root">
            <SiteNav />
            <HomePage />
            <SiteFooter />
            <DossierModal />
          </div>
        }
      />

      {/* 2. Enterprise Analyst Dashboard Layer (/app/*) */}
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/app/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="ai-insights" element={<AIInsightsPage />} />
        <Route path="watchlist" element={<WatchlistPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="cases" element={<CaseMgmtPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="input" element={<DataInputPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
