import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui";
import { DEMO_ACCOUNTS, useAuth } from "@/lib/auth-context";
import { apiErrorMessage, checkBackendHealth } from "@/services/api";
import type { Role } from "@/types";

export function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clusterStatus, setClusterStatus] = useState<"CONNECTED" | "CONNECTING" | "OFFLINE">("CONNECTING");

  // Check if user was redirected due to session expiry
  useEffect(() => {
    if (searchParams.get("expired") === "1") {
      setError("Your session has expired. Please sign in again.");
    }
  }, [searchParams]);

  // Check live backend/Atlas health
  useEffect(() => {
    checkBackendHealth()
      .then((data) => {
        if (data.database?.status === "connected" || data.status === "healthy") {
          setClusterStatus("CONNECTED");
        } else {
          setClusterStatus("CONNECTING");
        }
      })
      .catch(() => setClusterStatus("OFFLINE"));
  }, []);

  // If already authenticated, redirect to role-specific dashboard
  if (user) {
    const from = (location.state as { from?: string } | null)?.from;
    if (from && from !== "/login") {
      return <Navigate to={from} replace />;
    }
    if (user.role === "RM") return <Navigate to="/applications" replace />;
    if (user.role === "L1_APPROVER" || user.role === "L2_APPROVER") return <Navigate to="/exceptions" replace />;
    return <Navigate to="/" replace />;
  }

  function handleSelectDemoAccount(role: Role) {
    const account = DEMO_ACCOUNTS[role];
    setEmail(account.email);
    setPassword(account.password);
    setSelectedDemoRole(role);
    setError(null);
    toast.info(`Populated credentials for ${account.label}. Click "Sign In" to authenticate.`);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your work email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Authenticate strictly against backend POST /api/auth/login
      const authenticatedUser = await login(email, password);
      toast.success(`Authenticated as ${authenticatedUser.name} (${authenticatedUser.role.replace(/_/g, " ")})`);

      // Determine redirection based strictly on the authenticated backend role
      const from = (location.state as { from?: string } | null)?.from;
      if (from && from !== "/login") {
        navigate(from, { replace: true });
        return;
      }

      if (authenticatedUser.role === "RM") {
        navigate("/applications", { replace: true });
      } else if (authenticatedUser.role === "L1_APPROVER" || authenticatedUser.role === "L2_APPROVER") {
        navigate("/exceptions", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* ------------------------------------------------------------------- */}
      {/* Left Institutional Branding & Capabilities Panel */}
      {/* ------------------------------------------------------------------- */}
      <div className="relative hidden w-1/2 flex-col justify-between border-r border-slate-800 bg-slate-950 p-12 lg:flex">
        {/* Ambient Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="relative z-10">
          {/* Header Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">OptiCredit</h1>
              <p className="text-xs uppercase tracking-widest text-slate-400">Institutional Credit Risk Engine</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="mt-14 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Configurable BRMS & Automated Decisioning</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Lending Intelligence & Exception Governance
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Automated financial spreading, CIBIL bureau normalization, policy rule evaluation, multi-tier exception escalation, and cryptographic SHA-256 audit chaining for non-banking financial companies.
            </p>
          </div>

          {/* Core Institutional Architecture Features */}
          <div className="mt-10 space-y-3.5 max-w-lg">
            <div className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-900/50 p-3.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Sub-Second Business Rule Engine (BRE)</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Evaluates income, FOIR, CIBIL, DPD 90+, and banking balances with explainable formula traces.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-900/50 p-3.5">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Multi-Tier Exception Escalation Ladder</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hierarchical approval gates: L1 Credit Approver, L2 Credit Head, and automatic escalation on compound deviations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-900/50 p-3.5">
              <Lock className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cryptographic SHA-256 Hash-Chained Audit Trail</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tamper-evident audit ledger recording every underwriting decision, rule modification, and authority endorsement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Connectivity & Node Diagnostics */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                clusterStatus === "CONNECTED"
                  ? "bg-emerald-400 animate-pulse"
                  : clusterStatus === "CONNECTING"
                  ? "bg-amber-400 animate-ping"
                  : "bg-red-500"
              }`}
            />
            <span className="font-mono text-[11px]">
              {clusterStatus === "CONNECTED"
                ? "MongoDB Atlas: Live & Synchronized"
                : clusterStatus === "CONNECTING"
                ? "Checking cluster connectivity…"
                : "Backend Offline (Port :5000)"}
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">v2.4.0-PROD</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Right Institutional Login Form */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24 bg-slate-900">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header Brand */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-md">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">OptiCredit</h1>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">Credit Risk Platform</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">Institutional Sign In</h2>
            <p className="mt-1 text-xs text-slate-400">
              Enter your enterprise credentials to access the credit underwriting workstation.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Authentication Failed</p>
                <p className="mt-0.5 text-red-300/90">{error}</p>
              </div>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email">
                Enterprise Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedDemoRole(null);
                  }}
                  placeholder="name@nbfc.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/90 pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 transition focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="password">
                  Account Password
                </label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedDemoRole(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/90 pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 transition focus:border-blue-500 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Selected Demo Account Notice */}
            {selectedDemoRole && (
              <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-300 flex items-center justify-between">
                <span>
                  Loaded credentials for <strong>{DEMO_ACCOUNTS[selectedDemoRole].label}</strong>
                </span>
                <span className="text-[10px] text-blue-400 font-medium">Ready to sign in</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 shadow-lg shadow-blue-600/30 transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials with Server…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-4 w-4" /> Sign In to Credit Platform
                </span>
              )}
            </Button>
          </form>

          {/* ----------------------------------------------------------------- */}
          {/* Demo Credentials Sandbox (Populates fields for Hackathon Demo) */}
          {/* ----------------------------------------------------------------- */}
          <div className="mt-8 border-t border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Demo Accounts Sandbox
                </span>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                Click to load credentials
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              Select any role below to pre-populate its demo credentials. You must click <strong>Sign In</strong> to authenticate through the backend RBAC service.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((role) => {
                const acc = DEMO_ACCOUNTS[role];
                const isSelected = selectedDemoRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSelectDemoAccount(role)}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-950/40 shadow-xs"
                        : "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-800/80"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-white">{acc.label}</span>
                      <ArrowRight className={`h-3 w-3 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                    </div>
                    <span className="font-mono text-[10px] text-blue-400">{acc.email}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{acc.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
