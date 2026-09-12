import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Gavel,
  RefreshCw,
} from "lucide-react";

import {
  Button,
  currency,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { apiErrorMessage, getExceptionQueue } from "@/services/api";
import type { ApplicantResponse } from "@/types";

type LevelTab = "ALL" | "L1" | "L2";
type StatusTab = "PENDING" | "APPROVED" | "REJECTED";

export function Exceptions() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [level, setLevel] = useState<LevelTab>(isAdmin ? "ALL" : user?.role === "L2_APPROVER" ? "L2" : "L1");
  const [status, setStatus] = useState<StatusTab>("PENDING");
  const [queue, setQueue] = useState<ApplicantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    getExceptionQueue({ level: level === "ALL" ? undefined : level, status })
      .then(setQueue)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, [level, status]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Credit Exception Governance Queue"
        subtitle={
          isAdmin
            ? "Unified multi-tier exception log for L1 Approvers & L2 Credit Heads."
            : `Cases requiring your authority sign-off (${user?.role.replace(/_/g, " ")}).`
        }
        actions={
          <Button variant="secondary" size="sm" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
          </Button>
        }
      />

      {/* Authority Level & Status Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        {/* Authority Level Tabs */}
        {isAdmin ? (
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setLevel("ALL")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                level === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Exception Levels
            </button>
            <button
              onClick={() => setLevel("L1")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                level === "L1" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              L1 Approver Queue
            </button>
            <button
              onClick={() => setLevel("L2")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                level === "L2" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              L2 Credit Head Queue
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Gavel className="h-4 w-4 text-blue-600" />
            <span>Authority Scope: <strong>{user?.role.replace(/_/g, " ")}</strong></span>
          </div>
        )}

        {/* Resolution Status Tabs */}
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setStatus("PENDING")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              status === "PENDING" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pending Authority ({status === "PENDING" ? queue.length : "—"})
          </button>
          <button
            onClick={() => setStatus("APPROVED")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              status === "APPROVED" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Approved Exceptions
          </button>
          <button
            onClick={() => setStatus("REJECTED")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              status === "REJECTED" ? "bg-white text-red-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Rejected Exceptions
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <SectionCard
        title={`${status.charAt(0) + status.slice(1).toLowerCase()} Exception Cases`}
        subtitle={<span className="text-xs text-slate-500">{queue.length} cases matching authority filters</span>}
      >
        {loading && <LoadingState label="Fetching exception queue…" rows={5} />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          queue.length === 0 ? (
            <EmptyState
              title="Exception queue is clear"
              description={`No ${status.toLowerCase()} exception cases pending authority endorsement in this tier.`}
            />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full min-w-[900px] border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Case ID</th>
                    <th className="py-3 px-4">Applicant Profile</th>
                    <th className="py-3 px-4">Requested Loan</th>
                    <th className="py-3 px-4">CIBIL Bureau</th>
                    <th className="py-3 px-4">FOIR Ratio</th>
                    <th className="py-3 px-4">Triggered Policy Deviations</th>
                    <th className="py-3 px-4">Required Authority</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {queue.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{app.applicantId}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{app.personalDetails.fullName}</p>
                        <p className="font-mono text-[11px] text-slate-400">{app.personalDetails.panNumber}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                        {currency(app.rawFinancials.requestedAmount)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 tabular-nums">
                        {app.rawFinancials.cibilScore ?? "—"}
                      </td>
                      <td className="py-3 px-4 tabular-nums text-slate-700">
                        {app.normalizedMetrics?.foir ? `${app.normalizedMetrics.foir}%` : "—"}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-1">
                          {app.evaluation.triggeredRules.slice(0, 2).map((r) => (
                            <div key={r.ruleCode} className="truncate text-[11px] text-amber-900 font-medium">
                              • {r.reasonCode}: {r.ruleName}
                            </div>
                          ))}
                          {app.evaluation.triggeredRules.length > 2 && (
                            <span className="text-[10px] text-slate-400">+{app.evaluation.triggeredRules.length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={app.evaluation.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/applications/${app.applicantId}`}>
                          <Button variant="primary" size="sm" className="bg-slate-900 hover:bg-slate-800">
                            Review Case <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </SectionCard>
    </div>
  );
}
