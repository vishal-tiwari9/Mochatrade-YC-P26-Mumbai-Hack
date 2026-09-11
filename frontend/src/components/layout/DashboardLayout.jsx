import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopBar } from './DashboardTopBar';
import { DossierModal } from '../common/DossierModal';

export function DashboardLayout() {
  return (
    <div className="dashboard-root">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardTopBar />
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
      <DossierModal />
    </div>
  );
}
