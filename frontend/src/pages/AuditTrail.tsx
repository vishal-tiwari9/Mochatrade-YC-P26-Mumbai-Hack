import { useEffect, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  dateTime,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  SectionCard,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { apiErrorMessage, getAuditTrail, verifyAuditChain } from "@/services/api";
import type { AuditLogEntry, AuditVerifyResult } from "@/types";

const ACTION_LABEL: Record<string, { label: string; badge: string }> = {
  APPLICATION_SUBMISSION: { label: "Underwriting Execution", badge: "bg-blue-100 text-blue-800 border-blue-200" },
  RULE_UPDATE: { label: "BRE Policy Re-Versioned", badge: "bg-purple-100 text-purple-900 border-purple-200" },
  EXCEPTION_DECISION: { label: "Credit Authority Decision", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  SECURITY_VIOLATION: { label: "Security Incident Flagged", badge: "bg-red-100 text-red-800 border-red-200" },
};

function summarizeSnapshot(entry: AuditLogEntry): string {
  const snap = (entry.newSnapshot ?? {}) as Record<string, unknown>;
  if (entry.action === "APPLICATION_SUBMISSION") return `Outcome: ${snap.status ?? "—"} (${snap.deviationsCount ?? 0} deviations)`;
  if (entry.action === "RULE_UPDATE") {
    if (snap.thresholdValue !== undefined) return `Threshold adjusted to ${snap.thresholdValue} (v${snap.version})`;
    if (snap.duplicatedFrom) return `Duplicated from ${snap.duplicatedFrom}`;
    return "Rule created / activated";
  }
  if (entry.action === "EXCEPTION_DECISION") return `Endorsement: ${snap.decision ?? "—"} ${snap.note ? `("${snap.note}")` : ""}`;
  return JSON.stringify(snap);
}

export function AuditTrail() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<AuditVerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    getAuditTrail()
      .then(setLogs)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function verify() {
    setVerifying(true);
    try {
      const result = await verifyAuditChain();
      setVerifyResult(result);
      if (result.verified) {
        toast.success(`Chain verified — ${result.totalEntries} records, 0 tampering detected.`);
      } else {
        toast.error(`Chain integrity broken at block: ${result.brokenAt}`);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Cryptographic Audit Trail & Governance"
        subtitle={
          user?.role === "ADMIN"
            ? "Full SHA-256 hash-chained immutable log of all privileged underwriting and policy actions."
            : "Audit log of credit actions performed under your authorized session."
        }
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            {user?.role === "ADMIN" && (
              <Button
                variant="primary"
                size="sm"
                loading={verifying}
                onClick={verify}
                className="bg-slate-900 hover:bg-slate-800"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Verify Hash Chain Integrity
              </Button>
            )}
          </div>
        }
      />

      {/* Verification Result Banner */}
      {verifyResult && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 shadow-xs ${
            verifyResult.verified
              ? "border-emerald-300 bg-emerald-50/80 text-emerald-950"
              : "border-red-300 bg-red-50/80 text-red-950"
          }`}
        >
          {verifyResult.verified ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="h-6 w-6 text-red-600 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-bold">
              {verifyResult.verified ? "Cryptographic Chain Verified Valid" : "Tamper Detected in Hash Sequence"}
            </h4>
            <p className="text-xs">
              {verifyResult.verified
                ? `All ${verifyResult.totalEntries} blocks sequentially hashed and verified from GENESIS_HASH. Zero unauthorized mutations.`
                : `Hash mismatch at block ID: ${verifyResult.brokenAt}. Manual database inspection required.`}
            </p>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <SectionCard
        title="Immutable Audit Blocks"
        subtitle={<span className="text-xs text-slate-500">{logs.length} privileged actions recorded</span>}
      >
        {loading && <LoadingState label="Loading audit blocks…" rows={6} />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          logs.length === 0 ? (
            <EmptyState title="No audit entries logged" description="Perform an underwriting decision or rule edit to generate an audit block." />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full min-w-[950px] border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Timestamp (IST)</th>
                    <th className="py-3 px-4">Action Type</th>
                    <th className="py-3 px-4">Authorized Actor</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Snapshot / Delta</th>
                    <th className="py-3 px-4">SHA-256 Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {logs.map((entry) => {
                    const actionInfo = ACTION_LABEL[entry.action] ?? {
                      label: entry.action,
                      badge: "bg-slate-100 text-slate-700 border-slate-200",
                    };
                    return (
                      <tr key={entry._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-mono text-slate-500">{dateTime(entry.timestamp)}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold ${actionInfo.badge}`}>
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">{entry.actorRole}</span>
                          <span className="block font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{entry.actorId}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700">{entry.targetEntity}</span>
                          {entry.targetId && (
                            <span className="block font-mono text-[10px] text-slate-400 truncate max-w-[140px]">{entry.targetId}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-800 max-w-xs truncate" title={summarizeSnapshot(entry)}>
                          {summarizeSnapshot(entry)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 font-bold" title={entry.hash}>
                            {entry.hash.slice(0, 10)}…
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </SectionCard>
    </div>
  );
}
