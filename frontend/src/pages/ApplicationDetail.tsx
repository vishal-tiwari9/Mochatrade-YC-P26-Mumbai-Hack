import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ShieldQuestion,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  CreditScoreGauge,
  currency,
  EmptyState,
  ErrorState,
  Field,
  FOIRGauge,
  Input,
  LoadingState,
  PageHeader,
  percent,
  RiskBadge,
  RuleDrawer,
  SectionCard,
  SeverityBadge,
  StatusBadge,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { apiErrorMessage, decideException, evaluateApplication, getApplication } from "@/services/api";
import type { ApplicantResponse, TriggeredRule } from "@/types";

function ProfileRow({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs last:border-0">
      <span className="text-slate-500">{label}</span>
      <div className="text-right">
        <span className="font-semibold text-slate-800">{value}</span>
        {hint && <span className="block text-[10px] text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}

function DecisionSection({ app, onActioned }: { app: ApplicantResponse; onActioned: () => void }) {
  const { user } = useAuth();
  const { evaluation } = app;
  const normalizedMetrics = app.normalizedMetrics ?? {};
  const [note, setNote] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  const requiredRole =
    evaluation.status === "EXCEPTION_L1"
      ? "L1_APPROVER"
      : evaluation.status === "EXCEPTION_L2"
      ? "L2_APPROVER"
      : null;

  const canAct = requiredRole !== null && (user?.role === requiredRole || user?.role === "ADMIN");

  async function act(decision: "APPROVED" | "REJECTED" | "ESCALATE") {
    setActing(decision);
    try {
      await decideException(app._id, decision, note);
      toast.success(`Exception decision recorded: ${decision}`);
      setNote("");
      onActioned();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setActing(null);
    }
  }

  // 1. APPROVED Case
  if (evaluation.status === "APPROVED") {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-6 shadow-xs">
        <div className="flex items-center gap-3 text-emerald-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Approved — Standard Lending Terms Generated</h3>
            <p className="text-xs text-emerald-700">Applicant satisfies all automated Business Rule Engine criteria without policy deviations.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Approved Loan Amount</p>
            <p className="mt-1 text-xl font-extrabold text-emerald-700 tabular-nums">
              {currency(normalizedMetrics.maxEligibleLoanAmount)}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">Requested: {currency(app.rawFinancials.requestedAmount)}</p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Risk-Adjusted ROI</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900 tabular-nums">
              {normalizedMetrics.rateOfInterest ? `${normalizedMetrics.rateOfInterest}% p.a.` : "—"}
            </p>
            {normalizedMetrics.pricingAdjustmentPct ? (
              <p className="mt-0.5 text-[10px] text-slate-500">
                Base {normalizedMetrics.baseRateOfInterest}% {normalizedMetrics.pricingAdjustmentPct > 0 ? "+" : ""}
                {normalizedMetrics.pricingAdjustmentPct}% from active pricing rules
              </p>
            ) : (
              <p className="mt-0.5 text-[10px] text-slate-500">Grade: {normalizedMetrics.riskGrade || "Prime"}</p>
            )}
          </div>

          <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Monthly EMI</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900 tabular-nums">
              {currency(normalizedMetrics.eligibleEmi)}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">Tenure: {app.rawFinancials.tenureMonths || 60} Months</p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-white p-4 shadow-xs">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Evaluated FOIR</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900 tabular-nums">
              {percent(normalizedMetrics.foir)}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">Policy Cap: 50.0%</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. HARD REJECT Case
  if (evaluation.status === "HARD_REJECT") {
    const failed = evaluation.triggeredRules.filter((r) => r.category === "HARD_REJECT");
    return (
      <div className="rounded-xl border border-red-300 bg-red-50/70 p-6 shadow-xs">
        <div className="flex items-center gap-3 text-red-950">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Hard Reject — Non-Eligible Policy Stops Triggered</h3>
            <p className="text-xs text-red-700">{evaluation.decisionSummary || "Application violated mandatory institutional credit criteria."}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {failed.map((r) => (
            <div key={r.ruleCode} className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-white p-3 text-xs text-red-900">
              <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{r.reasonCode}</span> — <span className="font-semibold">{r.ruleName}</span>
                <p className="mt-0.5 text-[11px] text-slate-600">
                  Actual Value <strong className="font-mono">{String(r.actualValue)}</strong> failed policy threshold <strong className="font-mono">{r.operator} {String(r.thresholdValue)}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. INSUFFICIENT DATA Case
  if (evaluation.status === "INSUFFICIENT_DATA") {
    return (
      <div className="rounded-xl border border-slate-300 bg-slate-50 p-6 shadow-xs">
        <div className="flex items-center gap-3 text-slate-800">
          <ShieldQuestion className="h-8 w-8 text-slate-500" />
          <div>
            <h3 className="text-base font-bold">Incomplete Intake Information</h3>
            <p className="text-xs text-slate-500">{evaluation.decisionSummary || "Critical financial variables were omitted during intake."}</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. EXCEPTION REQUIRED (L1 or L2)
  const isL2 = evaluation.status === "EXCEPTION_L2";
  const levelLabel = isL2 ? "Level 2 (Credit Head)" : "Level 1 (Approver)";

  return (
    <div className={`rounded-xl border p-6 shadow-xs ${isL2 ? "border-orange-300 bg-orange-50/70" : "border-amber-300 bg-amber-50/70"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm ${isL2 ? "bg-orange-600" : "bg-amber-600"}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Credit Exception Required — {levelLabel}</h3>
              {evaluation.autoEscalated && (
                <span className="rounded border border-orange-300 bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-950">
                  Auto-Escalated (Compound Risk)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">{evaluation.decisionSummary || "Policy deviations require authorized credit sign-off."}</p>
          </div>
        </div>
      </div>

      {/* Triggered Deviations List */}
      <div className="mt-4 space-y-2">
        {evaluation.triggeredRules.map((r) => (
          <div key={r.ruleCode} className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-white p-3 text-xs text-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">{r.reasonCode}</span> — <span className="font-semibold text-slate-800">{r.ruleName}</span>
              <p className="mt-0.5 text-[11px] text-slate-600">
                Observed: <strong className="font-mono">{String(r.actualValue)}</strong> vs Policy Threshold: <strong className="font-mono">{r.operator} {String(r.thresholdValue)}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Decision Authority Panel */}
      <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
          <span className="font-medium text-slate-600">
            Mandatory Authority: <strong className="text-slate-900">{requiredRole?.replace(/_/g, " ")}</strong>
          </span>
          <span className="text-slate-400">
            Current Session: <strong className="text-slate-800">{user?.name} ({user?.role})</strong>
          </span>
        </div>

        {canAct ? (
          <div className="mt-3 space-y-3">
            {user?.role === "ADMIN" && (
              <p className="rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-[11px] font-medium text-purple-800">
                You are deciding this as an ADMIN OVERRIDE, not as the {requiredRole?.replace(/_/g, " ")}. This will be recorded distinctly in the audit trail.
              </p>
            )}
            <Field label="Exception Justification / Decision Note">
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="State institutional rationale for approval or rejection…"
                className="text-xs"
              />
            </Field>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="success"
                loading={acting === "APPROVED"}
                onClick={() => act("APPROVED")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve Exception
              </Button>

              <Button
                variant="danger"
                loading={acting === "REJECTED"}
                onClick={() => act("REJECTED")}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-3.5 w-3.5" /> Reject Application
              </Button>

              {!isL2 && (
                <Button
                  variant="secondary"
                  loading={acting === "ESCALATE"}
                  onClick={() => act("ESCALATE")}
                >
                  <ShieldAlert className="h-3.5 w-3.5 text-orange-600" /> Escalate to L2 Credit Head
                </Button>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500 italic">
            You do not have the required authority role ({requiredRole?.replace(/_/g, " ")}) to decision this exception. Sign in with an authorized {requiredRole?.replace(/_/g, " ")} account to record a credit decision.
          </p>
        )}
      </div>
    </div>
  );
}

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<ApplicantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rerunning, setRerunning] = useState(false);
  const [selectedRule, setSelectedRule] = useState<TriggeredRule | null>(null);

  function load() {
    if (!id) return;
    setLoading(true);
    setError(null);
    getApplication(id)
      .then(setApp)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function rerun() {
    if (!app) return;
    setRerunning(true);
    try {
      const result = await evaluateApplication({
        applicantId: app.applicantId,
        personalDetails: app.personalDetails,
        rawFinancials: app.rawFinancials,
      });
      toast.success(`Underwriting complete: ${result.evaluation.status.replace(/_/g, " ")}`);
      setApp(result);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setRerunning(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Underwriting Case File" subtitle="Loading applicant dossier and bureau records…" />
        <LoadingState rows={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Underwriting Case File" subtitle="Case File Retrieval" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-6">
        <PageHeader title="Underwriting Case File" subtitle="Case File Retrieval" />
        <EmptyState title="Application not found" description="The requested case record does not exist or has been archived." />
      </div>
    );
  }

  const { personalDetails: p, rawFinancials: f } = app;
  const m = app.normalizedMetrics ?? {};

  return (
    <div className="space-y-6">
      {/* Interactive Rule Inspection Drawer */}
      {selectedRule && <RuleDrawer rule={selectedRule} onClose={() => setSelectedRule(null)} />}

      {/* Case Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
            title="Back to portfolio"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-900">{p.fullName}</h1>
              <StatusBadge status={app.evaluation.status} />
              <RiskBadge grade={m.riskGrade} />
            </div>
            <p className="font-mono text-xs text-slate-400">
              Case ID: <span className="font-semibold text-slate-600">{app.applicantId}</span> · PAN: <span className="font-semibold text-slate-600">{p.panNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" loading={rerunning} onClick={rerun}>
            <RefreshCw className="h-3.5 w-3.5" /> Re-run Underwriting
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. Final Decision Banner & Authority Actions */}
      {/* ------------------------------------------------------------------- */}
      <DecisionSection app={app} onActioned={load} />

      {/* ------------------------------------------------------------------- */}
      {/* 2. Applicant Dossier & Bureau Profile Cards */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Applicant Profile */}
        <SectionCard title="Applicant Dossier">
          <div className="space-y-0.5">
            <ProfileRow label="Full Name" value={p.fullName} />
            <ProfileRow label="PAN Identification" value={<span className="font-mono">{p.panNumber}</span>} />
            <ProfileRow label="Phone Contact" value={p.phone || "—"} />
            <ProfileRow label="Email Address" value={p.email || "—"} />
            <ProfileRow label="Employment Classification" value={p.employmentType || "SALARIED"} />
            <ProfileRow label="Applicant Age" value={p.age ? `${p.age} Years` : "—"} />
            <ProfileRow label="Business / Work Vintage" value={f.businessVintageMonths ? `${f.businessVintageMonths} Months` : "—"} />
            <div className="mt-2 border-t border-slate-100 pt-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Declared Assets</p>
              <ProfileRow label="Mutual Funds" value={currency(f.mutualFundsValue)} />
              <ProfileRow label="Equities" value={currency(f.equitiesValue)} />
              <ProfileRow label="Other Assets" value={currency(f.otherAssetsValue)} />
              <ProfileRow label="Total Declared Assets" value={<span className="font-bold">{currency(f.declaredAssets)}</span>} />
            </div>
          </div>
        </SectionCard>

        {/* Credit Bureau Profile */}
        <SectionCard title="Credit Bureau Profile">
          <CreditScoreGauge score={f.cibilScore} dpd90Count={f.dpd90Count} hasWriteOff={f.hasWriteOff} />
          <div className="mt-3 space-y-0.5">
            <ProfileRow label="Active Loans" value={f.activeLoansCount ?? 0} />
            <ProfileRow label="Recent Enquiries" value={f.creditEnquiriesCount ?? 0} />
            <ProfileRow label="Overdue Amount" value={currency(f.overdueAmount)} />
            <ProfileRow
              label="Settlement on Record"
              value={f.hasSettlement ? <span className="text-red-700">Yes</span> : "No"}
            />
            <ProfileRow
              label="Default Indicator"
              value={f.hasDefault ? <span className="text-red-700">Yes</span> : "No"}
            />
          </div>
          {m.mlRiskScore !== undefined && m.mlRiskScore !== null && (
            <div className="mt-3 rounded-md border border-purple-200 bg-purple-50/60 p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-purple-800">
                  <Brain className="h-3.5 w-3.5" /> ML Risk Score
                </span>
                <RiskBadge grade={m.mlRiskGrade} />
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums text-purple-900">{percent(m.mlRiskScore * 100)}</p>
              <p className="text-[10px] text-purple-700">
                Advisory model signal — only affects the decision if an Admin has configured a rule against it.
              </p>
              {m.mlTopFactors && m.mlTopFactors.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-purple-200 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-800">
                    Why this applicant scored this way
                  </p>
                  {m.mlTopFactors.map((factor) => (
                    <div key={factor.feature} className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-purple-900">
                        {factor.feature} = {factor.value}
                      </span>
                      <span className={factor.direction === "increases_risk" ? "font-semibold text-red-700" : "font-semibold text-emerald-700"}>
                        {factor.contribution > 0 ? "+" : ""}
                        {factor.contribution.toFixed(3)} ({factor.direction === "increases_risk" ? "↑ risk" : "↓ risk"})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </SectionCard>

        {/* Financial Obligations & FOIR */}
        <SectionCard title="Debt Service Capacity">
          <FOIRGauge foir={m.foir} obligationRatio={m.obligationRatio} />
          <div className="mt-4 space-y-0.5">
            <ProfileRow label="Net Monthly Income" value={currency(f.monthlyIncome)} />
            <ProfileRow label="Existing Debt EMI" value={currency(f.existingObligations)} />
            <ProfileRow label="Proposed Loan EMI" value={currency(m.proposedEmi)} />
            <div className="mt-2 border-t border-slate-100 pt-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">ITR Income Trend</p>
              <ProfileRow label="ITR Year 1" value={currency(f.itrYear1)} />
              <ProfileRow label="ITR Year 2 (Recent)" value={currency(f.itrYear2)} />
              <ProfileRow
                label="Income Trend"
                value={
                  m.incomeTrendPct !== undefined && m.incomeTrendPct !== null
                    ? <span className={m.incomeTrendPct < 0 ? "font-semibold text-red-700" : "font-semibold text-emerald-700"}>
                        {m.incomeTrendPct > 0 ? "+" : ""}{m.incomeTrendPct}% ({m.incomeStability || "UNKNOWN"})
                      </span>
                    : "—"
                }
              />
            </div>
            <ProfileRow label="Average Bank Balance" value={currency(f.avgMonthlyBalance)} />
            <ProfileRow label="Avg. Monthly Credits (Statement)" value={currency(f.monthlyCreditsAvg)} />
            <ProfileRow label="EMI Debits (Statement)" value={currency(f.emiDebitsFromStatement)} />
            <ProfileRow label="Cash-Flow Volatility" value={f.cashFlowVolatilityPct !== undefined ? `${f.cashFlowVolatilityPct}%` : "—"} />
          </div>
        </SectionCard>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. Business Rule Engine (BRE) Decision Matrix Table */}
      {/* ------------------------------------------------------------------- */}
      <SectionCard
        title="Business Rule Engine (BRE) Evaluation Matrix"
        description={`Evaluated against Policy Engine v${app.evaluation.ruleEngineVersionUsed ?? 1}. Click any rule for mathematical inspection.`}
      >
        {app.evaluation.triggeredRules.length === 0 ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>All institutional credit rules passed successfully without triggers or deviations.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full min-w-[850px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3">Rule Policy</th>
                  <th className="py-2.5 px-3">Evaluated Metric</th>
                  <th className="py-2.5 px-3">Actual Value</th>
                  <th className="py-2.5 px-3">Policy Threshold</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Reason Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {app.evaluation.triggeredRules.map((rule) => {
                  const isFail = rule.category === "HARD_REJECT";
                  return (
                    <tr
                      key={rule.ruleCode}
                      onClick={() => setSelectedRule(rule)}
                      className="cursor-pointer hover:bg-slate-50 transition"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{rule.ruleName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{rule.metric}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{String(rule.actualValue)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{rule.operator} {String(rule.thresholdValue)}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-bold ${isFail ? "text-red-600" : "text-amber-600"}`}>
                          {isFail ? "✕ FAIL (Stop)" : "⚠ EXCEPTION"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3"><SeverityBadge severity={rule.severity} /></td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{rule.reasonCode}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ------------------------------------------------------------------- */}
      {/* 4. Cryptographic Audit & Status History Timeline */}
      {/* ------------------------------------------------------------------- */}
      {app.statusHistory && app.statusHistory.length > 0 && (
        <SectionCard
          title="Approval Hierarchy & Audit History"
          description="Sequential timeline of status transitions and authority endorsements"
        >
          <ol className="relative space-y-4 border-l border-slate-200 pl-5 ml-2">
            {app.statusHistory
              .slice()
              .reverse()
              .map((h, i) => (
                <li key={i} className="relative text-xs">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
                  <div className="flex items-center gap-2">
                    <StatusBadge status={h.status as any} />
                    <span className="font-mono text-slate-400">{new Date(h.timestamp).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="mt-1 font-medium text-slate-800">
                    Actioned by: <strong className="text-slate-900">{h.updatedBy}</strong> {h.updatedByRole ? `(${h.updatedByRole})` : ""}
                  </p>
                  {h.note && <p className="mt-0.5 text-slate-600 italic">"{h.note}"</p>}
                </li>
              ))}
          </ol>
        </SectionCard>
      )}
    </div>
  );
}
