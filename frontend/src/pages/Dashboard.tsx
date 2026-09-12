import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FilePlus,
  Gavel,
  RefreshCw,
  XCircle,
} from "lucide-react";

import {
  Button,
  currency,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  RiskBadge,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { apiErrorMessage, getDashboardStats } from "@/services/api";
import type { DashboardStats } from "@/types";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then(setStats)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Underwriting Dashboard" subtitle="Loading live portfolio metrics from MongoDB Atlas…" />
        <LoadingState label="Computing credit statistics & portfolio health…" rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Underwriting Dashboard" subtitle="Credit Portfolio Performance & Decision Overview" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Underwriting Dashboard" subtitle="Credit Portfolio Performance & Decision Overview" />
        <EmptyState title="No portfolio data" description="Submit loan applications to populate live credit metrics." />
      </div>
    );
  }

  const { totals, funnel, riskDistribution, recentApplications, pendingExceptions } = stats;

  const totalRiskCount =
    (riskDistribution.LOW || 0) +
    (riskDistribution.MEDIUM || 0) +
    (riskDistribution.HIGH || 0) +
    (riskDistribution.CRITICAL || 0);

  const lowPct = totalRiskCount > 0 ? Math.round(((riskDistribution.LOW || 0) / totalRiskCount) * 100) : 0;
  const medPct = totalRiskCount > 0 ? Math.round(((riskDistribution.MEDIUM || 0) / totalRiskCount) * 100) : 0;
  const highPct = totalRiskCount > 0 ? Math.round(((riskDistribution.HIGH || 0) / totalRiskCount) * 100) : 0;
  const critPct = totalRiskCount > 0 ? Math.round(((riskDistribution.CRITICAL || 0) / totalRiskCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* Executive Page Header */}
      {/* ------------------------------------------------------------------- */}
      <PageHeader
        title="Executive Underwriting Dashboard"
        subtitle={`Portfolio performance, active credit risk profile & exception queue · Logged in as ${user?.role.replace(/_/g, " ")}`}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
            </Button>
            {(user?.role === "RM" || user?.role === "ADMIN") && (
              <Link to="/applications/new">
                <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500">
                  <FilePlus className="h-3.5 w-3.5" /> Intake New Case
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* ------------------------------------------------------------------- */}
      {/* Primary KPI Grid */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={totals.applications}
          secondaryValue={`Evaluated: ${funnel.evaluated}`}
          icon={ClipboardList}
          change={`${totals.approvalRate}% Approval Rate`}
          changeType="positive"
        />

        <StatCard
          label="Approved Portfolio"
          value={totals.approved}
          secondaryValue="Direct Policy Passes"
          icon={CheckCircle2}
          variant="success"
          change="Within Standard Risk Policy"
          changeType="positive"
        />

        <StatCard
          label="Pending Exception Queue"
          value={totals.exceptionL1 + totals.exceptionL2}
          secondaryValue={`L1: ${totals.exceptionL1} | L2: ${totals.exceptionL2}`}
          icon={Gavel}
          variant="warning"
          change="Requires Credit Authority Review"
          changeType="warning"
        />

        <StatCard
          label="Hard Rejections"
          value={totals.hardRejected}
          secondaryValue="Zero-Tolerance Stops"
          icon={XCircle}
          variant="danger"
          change="Bureau or Severe Write-Off"
          changeType="negative"
        />
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Risk Distribution & Underwriting Funnel */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Distribution Card */}
        <SectionCard
          title="Portfolio Risk Quality Distribution"
          description="CIBIL bureau banding and debt-to-income risk tiers"
          className="lg:col-span-2"
        >
          {totalRiskCount === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No evaluated applications in risk distribution.</p>
          ) : (
            <div className="space-y-5">
              {/* Stacked Percentage Bar */}
              <div>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                  {lowPct > 0 && <div className="h-full bg-emerald-500 rounded-l" style={{ width: `${lowPct}%` }} title={`Low Risk: ${lowPct}%`} />}
                  {medPct > 0 && <div className="h-full bg-blue-500" style={{ width: `${medPct}%` }} title={`Medium Risk: ${medPct}%`} />}
                  {highPct > 0 && <div className="h-full bg-amber-500" style={{ width: `${highPct}%` }} title={`High Risk: ${highPct}%`} />}
                  {critPct > 0 && <div className="h-full bg-red-500 rounded-r" style={{ width: `${critPct}%` }} title={`Critical Risk: ${critPct}%`} />}
                </div>
              </div>

              {/* Metric Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                    <span>Grade A · Low</span>
                    <span>{lowPct}%</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{riskDistribution.LOW || 0} Cases</p>
                  <p className="text-[10px] text-slate-500">CIBIL 750+ (10.5% ROI)</p>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
                    <span>Grade B · Medium</span>
                    <span>{medPct}%</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{riskDistribution.MEDIUM || 0} Cases</p>
                  <p className="text-[10px] text-slate-500">CIBIL 700-749 (12.0% ROI)</p>
                </div>

                <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                    <span>Grade C · High</span>
                    <span>{highPct}%</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{riskDistribution.HIGH || 0} Cases</p>
                  <p className="text-[10px] text-slate-500">CIBIL 650-699 (13.5% ROI)</p>
                </div>

                <div className="rounded-lg border border-red-100 bg-red-50/50 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-red-800">
                    <span>Grade D · Critical</span>
                    <span>{critPct}%</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-900 tabular-nums">{riskDistribution.CRITICAL || 0} Cases</p>
                  <p className="text-[10px] text-slate-500">CIBIL &lt;650 or Delinquent</p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Approval Funnel Card */}
        <SectionCard
          title="Underwriting Pipeline Funnel"
          description="Case conversion across policy gates"
        >
          <div className="space-y-3 text-xs">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5 flex items-center justify-between">
              <span className="font-medium text-slate-600">1. Total Intake</span>
              <span className="font-bold text-slate-900 tabular-nums">{funnel.applications}</span>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5 flex items-center justify-between">
              <span className="font-medium text-slate-600">2. Evaluated Cases</span>
              <span className="font-bold text-slate-900 tabular-nums">{funnel.evaluated}</span>
            </div>

            <div className="rounded-md border border-emerald-100 bg-emerald-50/70 p-2.5 flex items-center justify-between text-emerald-900">
              <span className="font-semibold">3. Standard Approved</span>
              <span className="font-bold tabular-nums">{funnel.approved}</span>
            </div>

            <div className="rounded-md border border-amber-100 bg-amber-50/70 p-2.5 flex items-center justify-between text-amber-900">
              <span className="font-semibold">4. Exception Queue (L1/L2)</span>
              <span className="font-bold tabular-nums">{funnel.exception}</span>
            </div>

            <div className="rounded-md border border-red-100 bg-red-50/70 p-2.5 flex items-center justify-between text-red-900">
              <span className="font-semibold">5. Hard Rejected</span>
              <span className="font-bold tabular-nums">{funnel.rejected}</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Actionable Exception Queue & Recent Applications Table */}
      {/* ------------------------------------------------------------------- */}
      <div className="space-y-6">
        {/* Actionable Pending Exceptions Queue */}
        {pendingExceptions && pendingExceptions.length > 0 && (
          <SectionCard
            title="Actionable Exception Approvals"
            subtitle={<span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">{pendingExceptions.length} Awaiting Authority</span>}
            action={
              <Link to="/exceptions">
                <Button variant="secondary" size="sm">
                  View Complete Queue <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Case ID</th>
                    <th className="py-2.5 px-3">Applicant Name</th>
                    <th className="py-2.5 px-3">Requested Loan</th>
                    <th className="py-2.5 px-3">Exception Level</th>
                    <th className="py-2.5 px-3">Trigger Summary</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingExceptions.slice(0, 5).map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{app.applicantId}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{app.personalDetails.fullName}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 tabular-nums">{currency(app.rawFinancials.requestedAmount)}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={app.evaluation.status} />
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate" title={app.evaluation.decisionSummary}>
                        {app.evaluation.decisionSummary || "Policy deviation flagged"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {(() => {
                          const requiredRole = app.evaluation.status === "EXCEPTION_L1" ? "L1_APPROVER" : "L2_APPROVER";
                          const canDecide = user?.role === requiredRole || user?.role === "ADMIN";
                          return (
                            <Link to={`/applications/${app.applicantId}`}>
                              <Button variant="primary" size="sm" className="bg-slate-900 hover:bg-slate-800">
                                {canDecide ? "Review & Decide" : "View Case"}
                              </Button>
                            </Link>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

        {/* Recent Applications Data Table */}
        <SectionCard
          title="Recent Underwriting Case Files"
          description="Real-time intake stream with credit score, FOIR, and rule engine outcomes"
          action={
            <Link to="/applications">
              <Button variant="outline" size="sm">
                View All Case Files <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        >
          {recentApplications.length === 0 ? (
            <EmptyState title="No recent cases found" description="Submit an application to start the automated underwriting workflow." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Application ID</th>
                    <th className="py-2.5 px-3">Applicant Name</th>
                    <th className="py-2.5 px-3">Requested Loan</th>
                    <th className="py-2.5 px-3">CIBIL Score</th>
                    <th className="py-2.5 px-3">FOIR %</th>
                    <th className="py-2.5 px-3">Risk Grade</th>
                    <th className="py-2.5 px-3">Decision Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{app.applicantId}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{app.personalDetails.fullName}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 tabular-nums">{currency(app.rawFinancials.requestedAmount)}</td>
                      <td className="py-2.5 px-3 tabular-nums font-semibold text-slate-800">{app.rawFinancials.cibilScore ?? "—"}</td>
                      <td className="py-2.5 px-3 tabular-nums text-slate-700">{app.normalizedMetrics?.foir ? `${app.normalizedMetrics.foir}%` : "—"}</td>
                      <td className="py-2.5 px-3">
                        <RiskBadge grade={app.normalizedMetrics?.riskGrade} />
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={app.evaluation.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to={`/applications/${app.applicantId}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Open Case File
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
