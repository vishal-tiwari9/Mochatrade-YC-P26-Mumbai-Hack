import React, { useState } from 'react';
import {
  TrendingUp,
  FileCheck,
  Shield,
  Activity,
  AlertOctagon,
  RefreshCw,
  Bell,
  Search,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import EmergingFraudPanel from '../components/EmergingFraudPanel';
import FraudResponsePanel from '../components/FraudResponsePanel';

export function EmergingFraudAndResponse() {
  const [activeTab, setActiveTab] = useState('emerging'); // 'emerging' | 'response'

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans">
      {/* ── Top Navigation Bar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    Fraud<span className="text-indigo-600">Nexus</span>
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                    Enterprise
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none">
                  AI Financial Crime & Graph Intelligence Platform
                </p>
              </div>
            </div>

            {/* Global Search / Context Bar */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search network ID, UPI handle, account, phone number..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Quick Actions & Status */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Graph Engine: Live
              </div>

              <button
                type="button"
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Module Header & Tab Switcher ────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <span>Dashboard</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Financial Crime</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800 font-semibold">Early Warning & Response</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Emerging Fraud Intelligence & Evidence Pack
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Proactively identify expanding mule rings before scale-out and assemble court-ready evidentiary dossiers.
            </p>
          </div>

          {/* Module Tab Switcher */}
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 self-start md:self-auto shadow-inner border border-slate-300/60">
            <button
              type="button"
              onClick={() => setActiveTab('emerging')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'emerging'
                  ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Emerging Threats</span>
              <span className="bg-red-100 text-red-700 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                2 Alert
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('response')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'response'
                  ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Fraud Response & Evidence Pack</span>
            </button>
          </div>
        </div>

        {/* ── Active Component View ─────────────────────────────────── */}
        <div className="transition-opacity duration-300">
          {activeTab === 'emerging' && (
            <EmergingFraudPanel
              onSelectNetwork={(net) => {
                console.log('Selected network:', net);
              }}
            />
          )}

          {activeTab === 'response' && (
            <FraudResponsePanel
              onNavigateToThreats={() => setActiveTab('emerging')}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default EmergingFraudAndResponse;
