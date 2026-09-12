import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  CategoryBadge,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  SectionCard,
  Select,
  SeverityBadge,
  Textarea,
} from "@/components/ui";
import {
  apiErrorMessage,
  createRule,
  duplicateRule,
  getRules,
  updateRule,
  validateRule,
} from "@/services/api";
import type { RuleCategory, RuleDraft, RuleRecord, RuleSeverity } from "@/types";
import { validateDraftLocally } from "@/utils/ruleValidation";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "All Policy Categories" },
  { value: "HARD_REJECT", label: "Hard Reject (Stop Checks)" },
  { value: "EXCEPTION_L1", label: "Exception — Level 1" },
  { value: "EXCEPTION_L2", label: "Exception — Level 2" },
  { value: "PRICING", label: "Pricing & Risk Adjustment" },
];

const OPERATORS = ["<", "<=", ">", ">=", "==", "!="];
const ACTIONS = ["REJECT", "FLAG_L1", "FLAG_L2", "ADJUST_RATE"];
const SEVERITIES: RuleSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const METRICS = [
  "cibilScore",
  "hasWriteOff",
  "hasSettlement",
  "hasDefault",
  "dpd90Count",
  "bounceCountLast6M",
  "activeLoansCount",
  "creditEnquiriesCount",
  "overdueAmount",
  "foir",
  "obligationRatio",
  "requestedAmount",
  "monthlyIncome",
  "monthlyCreditsAvg",
  "emiDebitsFromStatement",
  "cashFlowVolatilityPct",
  "avgMonthlyBalance",
  "declaredAssets",
  "mlRiskScore",
];
const BOOLEAN_METRICS = ["hasWriteOff", "hasSettlement", "hasDefault"];

const EMPTY_DRAFT: RuleDraft = {
  ruleCode: "",
  name: "",
  category: "EXCEPTION_L1",
  metric: "cibilScore",
  operator: "<",
  thresholdValue: 700,
  action: "FLAG_L1",
  reasonCode: "",
  description: "",
  severity: "MEDIUM",
  priority: 100,
  rateAdjustmentPct: 0,
  isActive: true,
};

function RuleEditorModal({
  initial,
  onCancel,
  onSaved,
}: {
  initial: RuleRecord | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<RuleDraft>(
    initial
      ? {
          ruleCode: initial.ruleCode,
          name: initial.name,
          category: initial.category,
          metric: initial.metric,
          operator: initial.operator,
          thresholdValue: initial.thresholdValue as number | boolean,
          action: initial.action,
          reasonCode: initial.reasonCode,
          description: initial.description ?? "",
          severity: initial.severity,
          priority: initial.priority,
          rateAdjustmentPct: initial.rateAdjustmentPct ?? 0,
          isActive: initial.isActive,
        }
      : EMPTY_DRAFT,
  );
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pendingWarnings, setPendingWarnings] = useState<string[] | null>(null);
  const [blockingErrors, setBlockingErrors] = useState<string[]>([]);

  // Instant, client-side feedback as the admin types — hard limits and
  // per-field errors. Cross-rule logical checks (overlaps, escalation
  // ordering, duplicate priority) need the full rule list and only run
  // against the backend at Save time.
  const local = useMemo(() => validateDraftLocally(draft), [draft]);

  // Any edit after a warning/error was surfaced invalidates that check —
  // force a fresh Save click to re-run validation rather than silently
  // reusing a stale "Save Anyway" confirmation on different values.
  useEffect(() => {
    setPendingWarnings(null);
    setBlockingErrors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  async function commitSave() {
    setSaving(true);
    try {
      let saved: RuleRecord & { _warnings?: string[] };
      if (initial) {
        saved = await updateRule(initial._id, draft);
        toast.success(`Policy ${draft.ruleCode} updated and re-versioned.`);
      } else {
        saved = await createRule(draft);
        toast.success(`Policy ${draft.ruleCode} created in BRE.`);
      }
      if (saved._warnings && saved._warnings.length > 0) {
        toast.warning(`Saved with ${saved._warnings.length} warning(s) — review the policy before relying on it.`);
      }
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function save() {
    setBlockingErrors([]);
    if (local.errors.length > 0) {
      toast.error(local.errors[0]);
      return;
    }

    // If the admin already saw the warning banner for this exact click and
    // pressed "Save Anyway", skip straight to saving.
    if (pendingWarnings !== null) {
      setPendingWarnings(null);
      await commitSave();
      return;
    }

    setChecking(true);
    try {
      const { errors, warnings } = await validateRule(draft, initial?._id);
      if (errors.length > 0) {
        setBlockingErrors([...new Set(errors)]);
        toast.error(errors[0]);
        return;
      }
      // Client-side and server-side checks cover the same metric bounds, so
      // the same warning text often comes back from both — dedupe before
      // display (and before using the text as a React list key).
      const allWarnings = [...new Set([...local.warnings, ...warnings])];
      if (allWarnings.length > 0) {
        setPendingWarnings(allWarnings);
        return;
      }
      await commitSave();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={onCancel}>
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initial ? `Edit Policy: ${initial.ruleCode} (v${initial.version})` : "Define New Underwriting Policy"}
            </h3>
            <p className="text-xs text-slate-500">Configures live deterministic rules in the credit decision engine.</p>
          </div>
          <button onClick={onCancel} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <Field label="Rule Code" required hint="Unique uppercase identifier">
            <Input
              disabled={!!initial}
              value={draft.ruleCode}
              onChange={(e) => setDraft({ ...draft, ruleCode: e.target.value.toUpperCase() })}
              placeholder="e.g. EX_CIBIL_TIER"
              className="font-mono uppercase"
            />
          </Field>

          <Field label="Policy Name" required>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Minimum Prime CIBIL"
            />
          </Field>

          <Field label="Policy Category" required>
            <Select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as RuleCategory })}
            >
              <option value="HARD_REJECT">Hard Reject (Zero-Tolerance)</option>
              <option value="EXCEPTION_L1">Exception — Level 1</option>
              <option value="EXCEPTION_L2">Exception — Level 2</option>
              <option value="PRICING">Pricing & Interest Rate</option>
            </Select>
          </Field>

          <Field label="Target Financial Metric" required>
            <Select
              value={draft.metric}
              onChange={(e) => setDraft({ ...draft, metric: e.target.value })}
            >
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Mathematical Operator" required>
            <Select
              value={draft.operator}
              onChange={(e) => setDraft({ ...draft, operator: e.target.value })}
            >
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op} ({op === "<" ? "Less than" : op === ">" ? "Greater than" : op === "==" ? "Equals" : op})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Policy Threshold Value" required error={local.fieldErrors.thresholdValue}>
            {BOOLEAN_METRICS.includes(draft.metric) ? (
              <Select
                value={String(draft.thresholdValue)}
                onChange={(e) => setDraft({ ...draft, thresholdValue: e.target.value === "true" })}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </Select>
            ) : (
              <Input
                type="number"
                value={draft.thresholdValue as number}
                onChange={(e) => setDraft({ ...draft, thresholdValue: Number(e.target.value) })}
                placeholder="700"
              />
            )}
          </Field>

          <Field label="Engine Action" required>
            <Select
              value={draft.action}
              onChange={(e) => setDraft({ ...draft, action: e.target.value })}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Reason Code" required hint="e.g. CIBIL_BELOW_FLOOR">
            <Input
              value={draft.reasonCode}
              onChange={(e) => setDraft({ ...draft, reasonCode: e.target.value.toUpperCase() })}
              placeholder="e.g. BORDERLINE_CIBIL"
              className="font-mono uppercase"
            />
          </Field>

          <Field label="Risk Severity">
            <Select
              value={draft.severity}
              onChange={(e) => setDraft({ ...draft, severity: e.target.value as RuleSeverity })}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Execution Priority (1-100)" hint="Lower executes first" error={local.fieldErrors.priority}>
            <Input
              type="number"
              value={draft.priority}
              onChange={(e) => setDraft({ ...draft, priority: Number(e.target.value) })}
              placeholder="100"
            />
          </Field>

          {draft.category === "PRICING" && (
            <Field
              label="Rate Adjustment (percentage points)"
              hint="Only applies to Pricing rules"
              error={local.fieldErrors.rateAdjustmentPct}
            >
              <Input
                type="number"
                step="0.1"
                value={draft.rateAdjustmentPct ?? 0}
                onChange={(e) => setDraft({ ...draft, rateAdjustmentPct: Number(e.target.value) })}
                placeholder="e.g. 1.5 to add 1.5%, -0.5 to discount 0.5%"
              />
            </Field>
          )}
        </div>

        <div className="mt-3">
          <Field label="Institutional Policy Description">
            <Textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Describe the credit risk justification and RBI compliance reasoning for this policy…"
              className="h-16 text-xs"
            />
          </Field>
        </div>

        {blockingErrors.length > 0 && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-[11px] text-red-800">
            <p className="font-bold uppercase tracking-wide">❌ Cannot save — fix the following</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {blockingErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {pendingWarnings && pendingWarnings.length > 0 && (
          <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
            <p className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
              <AlertTriangle className="h-3.5 w-3.5" /> Unusual values detected — please verify
            </p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4">
              {pendingWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
            <p className="mt-1.5 text-amber-700">
              These values are technically valid and can be saved, but double-check they're intentional before continuing.
            </p>
          </div>
        )}

        {blockingErrors.length === 0 && !pendingWarnings && local.errors.length === 0 && local.warnings.length === 0 && (
          <p className="mt-3 text-[11px] font-medium text-emerald-700">✓ Valid configuration</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={saving || checking}
            onClick={save}
            className={pendingWarnings ? "bg-amber-600 hover:bg-amber-500" : "bg-blue-600 hover:bg-blue-500"}
          >
            {pendingWarnings
              ? "Save Anyway"
              : initial
                ? "Save & Bump Policy Version"
                : "Commit Rule to Policy Engine"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Rules() {
  const [rules, setRules] = useState<RuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editingRule, setEditingRule] = useState<RuleRecord | null>(null);
  const [creating, setCreating] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    getRules()
      .then(setRules)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleToggle(rule: RuleRecord) {
    try {
      await updateRule(rule._id, { isActive: !rule.isActive });
      toast.success(`${rule.ruleCode} status set to ${!rule.isActive ? "ACTIVE" : "DISABLED"}`);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleDuplicate(rule: RuleRecord) {
    try {
      const dup = await duplicateRule(rule._id);
      toast.success(`Duplicated ${rule.ruleCode} as ${dup.ruleCode}`);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  const filteredRules = rules.filter((r) => {
    if (categoryFilter && r.category !== categoryFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        r.ruleCode.toLowerCase().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.metric.toLowerCase().includes(term) ||
        r.reasonCode.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Editor Modal */}
      {(editingRule || creating) && (
        <RuleEditorModal
          initial={editingRule}
          onCancel={() => {
            setEditingRule(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditingRule(null);
            setCreating(false);
            load();
          }}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Business Rules Management System (BRMS)"
        subtitle="Configure live deterministic credit underwriting policies, risk thresholds, and exception ladders."
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="sm" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Policies
            </Button>
            <Button variant="primary" size="sm" onClick={() => setCreating(true)} className="bg-blue-600 hover:bg-blue-500">
              <Plus className="h-3.5 w-3.5" /> Create New Rule
            </Button>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search policies by Rule Code, Name, or Metric…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="w-56">
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs">
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Rules Data Table */}
      <SectionCard
        title="Active Policy Inventory"
        subtitle={<span className="text-xs text-slate-500">{filteredRules.length} policy rules registered</span>}
      >
        {loading && <LoadingState label="Loading BRE policy definitions…" rows={6} />}
        {error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && (
          filteredRules.length === 0 ? (
            <EmptyState title="No rules found" description="No policies matched your category or search query." />
          ) : (
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="w-full min-w-[950px] border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Rule Code</th>
                    <th className="py-3 px-4">Policy Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Mathematical Condition</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredRules.map((rule) => (
                    <tr key={rule._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{rule.ruleCode}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{rule.name}</p>
                        {rule.description && <p className="text-[11px] text-slate-500 line-clamp-1">{rule.description}</p>}
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category={rule.category} />
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {rule.metric} {rule.operator} {String(rule.thresholdValue)}
                        {rule.category === "PRICING" && (
                          <span className={`ml-2 font-sans text-[10px] font-semibold ${(rule.rateAdjustmentPct ?? 0) >= 0 ? "text-red-700" : "text-emerald-700"}`}>
                            {(rule.rateAdjustmentPct ?? 0) >= 0 ? "+" : ""}
                            {rule.rateAdjustmentPct ?? 0}% rate
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <SeverityBadge severity={rule.severity} />
                      </td>
                      <td className="py-3 px-4 tabular-nums font-mono text-slate-600">{rule.priority}</td>
                      <td className="py-3 px-4 tabular-nums font-mono text-slate-600">v{rule.version}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggle(rule)}
                          className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase transition ${
                            rule.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {rule.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingRule(rule)}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Edit policy definition"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(rule)}
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            title="Duplicate policy"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
