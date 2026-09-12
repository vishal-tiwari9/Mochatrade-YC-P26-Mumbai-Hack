import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  Button,
  currency,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageHeader,
  RiskBadge,
  SectionCard,
  Select,
  StatusBadge,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { apiErrorMessage, listApplications } from "@/services/api";
import type { ApplicantResponse } from "@/types";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Decisions" },
  { value: "APPROVED", label: "Approved" },
  { value: "EXCEPTION_L1", label: "Exception — L1" },
  { value: "EXCEPTION_L2", label: "Exception — L2" },
  { value: "HARD_REJECT", label: "Hard Reject" },
  { value: "INSUFFICIENT_DATA", label: "Insufficient Data" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
];

const RISK_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Risk Tiers" },
  { value: "LOW", label: "Grade A · Low Risk" },
  { value: "MEDIUM", label: "Grade B · Medium Risk" },
  { value: "HIGH", label: "Grade C · High Risk" },
  { value: "CRITICAL", label: "Grade D · Critical Risk" },
];

const PAGE_SIZE = 12;

export function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [riskGrade, setRiskGrade] = useState("");
  const [page, setPage] = useState(1);

  function load() {
    setLoading(true);
    setError(null);
    listApplications({
      search: search.trim() || undefined,
      status: status || undefined,
      riskGrade: riskGrade || undefined,
    })
      .then((data) => {
        setApplications(data);
        setPage(1);
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [search, status, riskGrade]);

  const canCreate = user?.role === "RM" || user?.role === "ADMIN";
  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE));
  const pageItems = applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Underwriting Case Portfolio"
        subtitle={
          user?.role === "RM"
            ? "Loan cases originated by or assigned to your underwriting queue."
            : "Complete institutional lending portfolio & risk evaluation records."
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            {canCreate && (
              <Link to="/applications/new">
                <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500">
                  <FilePlus className="h-3.5 w-3.5" /> Intake New Case
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by Applicant Name, Application ID, or PAN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="text-xs">
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-44">
          <Select value={riskGrade} onChange={(e) => setRiskGrade(e.target.value)} className="text-xs">
            {RISK_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        {(search || status || riskGrade) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatus("");
              setRiskGrade("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Portfolio Table */}
      <SectionCard
        title="Case Records"
        subtitle={<span className="text-xs font-semibold text-slate-500">{applications.length} cases found</span>}
      >
        {loading && <LoadingState label="Filtering underwriting records…" rows={6} />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          applications.length === 0 ? (
            <EmptyState
              title="No applications found"
              description="No underwriting records matched your filter criteria. Try broadening your search."
              action={
                canCreate ? (
                  <Link to="/applications/new">
                    <Button variant="primary" size="sm">
                      Create First Application
                    </Button>
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full min-w-[950px] border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 font-semibold">Case ID</th>
                      <th className="py-3 px-4 font-semibold">Applicant Profile</th>
                      <th className="py-3 px-4 font-semibold">Requested Amount</th>
                      <th className="py-3 px-4 font-semibold">Bureau CIBIL</th>
                      <th className="py-3 px-4 font-semibold">FOIR %</th>
                      <th className="py-3 px-4 font-semibold">Risk Grade</th>
                      <th className="py-3 px-4 font-semibold">Decision Outcome</th>
                      <th className="py-3 px-4 font-semibold">Last Evaluated</th>
                      <th className="py-3 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pageItems.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{app.applicantId}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900">{app.personalDetails.fullName}</p>
                          <p className="font-mono text-[11px] text-slate-400">{app.personalDetails.panNumber}</p>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                          {currency(app.rawFinancials.requestedAmount)}
                        </td>
                        <td className="py-3 px-4 tabular-nums font-semibold text-slate-800">
                          {app.rawFinancials.cibilScore ?? "—"}
                        </td>
                        <td className="py-3 px-4 tabular-nums font-medium text-slate-700">
                          {app.normalizedMetrics?.foir ? `${app.normalizedMetrics.foir}%` : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <RiskBadge grade={app.normalizedMetrics?.riskGrade} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={app.evaluation.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString("en-IN") : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/applications/${app.applicantId}`}
                            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                          >
                            Open Case
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span>
                    Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, applications.length)} of {applications.length} records
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </Button>
                    <span className="px-2 font-medium text-slate-700">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </SectionCard>
    </div>
  );
}
