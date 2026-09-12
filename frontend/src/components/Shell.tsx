import { useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Brain,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FilePlus,
  Gavel,
  History,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/types";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Executive Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Case Portfolio", icon: ClipboardList },
  { to: "/applications/new", label: "Intake & AI Spreading", icon: FilePlus, roles: ["RM", "ADMIN"] },
  { to: "/exceptions", label: "Exception Governance", icon: Gavel, roles: ["L1_APPROVER", "L2_APPROVER", "ADMIN"] },
  { to: "/rules", label: "BRE Policy Engine", icon: ScrollText, roles: ["ADMIN"] },
  { to: "/ml-risk-model", label: "ML Risk Model", icon: Brain, roles: ["ADMIN"] },
  { to: "/simulator", label: "What-If Simulator", icon: SlidersHorizontal, roles: ["RM", "ADMIN"] },
  { to: "/audit", label: "Audit & Hash Chain", icon: History },
];

const ROLE_DISPLAY: Record<Role, { title: string; badge: string; color: string }> = {
  RM: { title: "Relationship Manager", badge: "Underwriting RM", color: "bg-blue-950 text-blue-300 border-blue-800" },
  L1_APPROVER: { title: "L1 Credit Approver", badge: "L1 Authority", color: "bg-amber-950 text-amber-300 border-amber-800" },
  L2_APPROVER: { title: "Credit Head (L2)", badge: "L2 Authority", color: "bg-orange-950 text-orange-300 border-orange-800" },
  ADMIN: { title: "Policy Administrator", badge: "System Admin", color: "bg-purple-950 text-purple-300 border-purple-800" },
};

const BREADCRUMB_MAP: Record<string, string> = {
  "/": "Executive Underwriting Dashboard",
  "/applications": "Underwriting Case Portfolio",
  "/applications/new": "Case Intake & Document Spreading",
  "/exceptions": "Credit Exception Governance Queue",
  "/rules": "Business Rules Management System (BRMS)",
  "/ml-risk-model": "ML Risk Model — Admin Console",
  "/simulator": "What-If Feasibility Simulator",
  "/audit": "Cryptographic Audit Trail",
};

export function Shell() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/applications?search=${encodeURIComponent(searchQuery.trim())}`);
  }

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));
  const roleMeta = user ? ROLE_DISPLAY[user.role] : ROLE_DISPLAY.RM;
  const currentTitle = BREADCRUMB_MAP[location.pathname] || "Underwriting Case File";

  return (
    <div className="flex min-h-screen bg-slate-100/70 text-slate-900 font-sans">
      {/* ------------------------------------------------------------------- */}
      {/* Enterprise Institutional Sidebar */}
      {/* ------------------------------------------------------------------- */}
      <aside
        className={`flex shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-100 transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
          {!collapsed ? (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-600/30">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-white">OptiCredit</span>
                <span className="block text-[10px] font-medium tracking-wide text-slate-400">Credit Risk Engine</span>
              </div>
            </Link>
          ) : (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-4">
          {!collapsed && (
            <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Navigation
            </div>
          )}
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                } ${collapsed ? "justify-center px-2" : ""}`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Authenticated User Session Panel in Sidebar */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-900/50">
          {!collapsed ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-blue-400 font-bold text-xs border border-slate-700">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{user?.name || "Authenticated User"}</p>
                  <p className="truncate text-[10px] font-mono text-slate-400">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className={`inline-block rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${roleMeta.color}`}>
                  {roleMeta.badge}
                </span>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition"
                  title="Sign out of session"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="mx-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-red-400"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ------------------------------------------------------------------- */}
      {/* Main Content Area */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Institutional Top Navigation Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-2xs">
          {/* Breadcrumb / Section Header */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Underwriting Platform</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-800">{currentTitle}</span>
          </div>

          {/* Topbar Actions & Global Search */}
          <div className="flex items-center gap-3.5">
            {/* Global Search Bar */}
            <form onSubmit={handleSearch} className="relative hidden md:block w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search applicant or Case ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>

            {/* Atlas Synchronized Status Pill */}
            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MongoDB Atlas Connected</span>
            </div>

            {/* User Session Pill with Role Badge */}
            <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-900">{user?.name}</span>
                <span className="block font-mono text-[10px] text-slate-500">{user?.role}</span>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/70">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
