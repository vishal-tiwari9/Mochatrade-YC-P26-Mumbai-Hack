import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Inbox,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import type { EvaluationStatus, RiskGrade, TriggeredRule } from "@/types";

// ---------------------------------------------------------------------------
// Layout Primitives
// ---------------------------------------------------------------------------

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-lg border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  description,
  action,
  children,
  className = "",
  headerClassName = "",
}: {
  title: string;
  subtitle?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}) {
  return (
    <div className={`rounded-lg border border-slate-200/80 bg-white shadow-xs ${className}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 ${headerClassName}`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h2>
            {subtitle}
          </div>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  secondaryValue,
  change,
  changeType = "neutral",
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string | number;
  secondaryValue?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  icon?: typeof ShieldCheck;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variantStyles = {
    default: "border-slate-200/80 bg-white text-slate-900",
    success: "border-emerald-200/80 bg-emerald-50/40 text-emerald-950",
    warning: "border-amber-200/80 bg-amber-50/40 text-amber-950",
    danger: "border-red-200/80 bg-red-50/40 text-red-950",
    info: "border-blue-200/80 bg-blue-50/40 text-blue-950",
  };

  const iconBg = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <div className={`relative overflow-hidden rounded-lg border p-4 shadow-xs transition hover:shadow-sm ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        {Icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${iconBg[variant]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">{value}</p>
        {secondaryValue && <span className="text-xs text-slate-500">{secondaryValue}</span>}
      </div>
      {change && (
        <div className="mt-2 flex items-center gap-1 text-[11px] font-medium">
          {changeType === "positive" && <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />}
          {changeType === "negative" && <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />}
          <span
            className={
              changeType === "positive"
                ? "text-emerald-700"
                : changeType === "negative"
                ? "text-red-700"
                : changeType === "warning"
                ? "text-amber-700"
                : "text-slate-500"
            }
          >
            {change}
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Buttons & Form Controls
// ---------------------------------------------------------------------------

const BUTTON_VARIANTS = {
  primary: "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600",
  outline: "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-100",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

const BUTTON_SIZES = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-xs font-semibold",
  lg: "px-4 py-2 text-sm font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof BUTTON_VARIANTS;
  size?: keyof typeof BUTTON_SIZES;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
    />
  );
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 disabled:bg-slate-50 ${className}`}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 ${className}`}
    />
  );
}

export function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="mb-1 block text-xs font-medium text-slate-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </span>
  );
}

export function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <Label required={required}>{label}</Label>
        {hint && !error && <span className="text-[11px] text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">❌ {error}</p>}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Status / Decision Color Badges
// ---------------------------------------------------------------------------

export const DECISION_STYLE: Record<EvaluationStatus, { label: string; classes: string; dot: string }> = {
  APPROVED: { label: "Approved", classes: "bg-emerald-50 text-emerald-800 border-emerald-300", dot: "bg-emerald-500" },
  HARD_REJECT: { label: "Hard Reject", classes: "bg-red-50 text-red-800 border-red-300", dot: "bg-red-500" },
  EXCEPTION_L1: { label: "Exception — L1", classes: "bg-amber-50 text-amber-900 border-amber-300", dot: "bg-amber-500" },
  EXCEPTION_L2: { label: "Exception — L2 (Escalated)", classes: "bg-orange-50 text-orange-950 border-orange-300", dot: "bg-orange-600" },
  INSUFFICIENT_DATA: { label: "Insufficient Data", classes: "bg-slate-100 text-slate-700 border-slate-300", dot: "bg-slate-400" },
  PENDING_REVIEW: { label: "Pending Review", classes: "bg-blue-50 text-blue-800 border-blue-300", dot: "bg-blue-500" },
};

export function StatusBadge({ status, className = "" }: { status: EvaluationStatus; className?: string }) {
  const style = DECISION_STYLE[status] ?? DECISION_STYLE.PENDING_REVIEW;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${style.classes} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export const RISK_STYLE: Record<RiskGrade, { label: string; tier: string; classes: string }> = {
  LOW: { label: "Grade A", tier: "Low Risk", classes: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  MEDIUM: { label: "Grade B", tier: "Medium Risk", classes: "bg-blue-50 text-blue-800 border-blue-200" },
  HIGH: { label: "Grade C", tier: "High Risk", classes: "bg-amber-50 text-amber-900 border-amber-200" },
  CRITICAL: { label: "Grade D", tier: "Critical Risk", classes: "bg-red-50 text-red-800 border-red-200" },
};

export function RiskBadge({ grade }: { grade?: RiskGrade | null }) {
  if (!grade) return <span className="text-xs text-slate-400">—</span>;
  const style = RISK_STYLE[grade] ?? RISK_STYLE.HIGH;
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold ${style.classes}`}>
      <span>{style.label}</span>
      <span className="text-[10px] opacity-75">({style.tier})</span>
    </span>
  );
}

const SEVERITY_STYLE: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-800 border-amber-200",
  HIGH: "bg-orange-50 text-orange-900 border-orange-200",
  CRITICAL: "bg-red-50 text-red-800 border-red-200",
};

export function SeverityBadge({ severity }: { severity?: string }) {
  const s = severity || "MEDIUM";
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_STYLE[s] ?? SEVERITY_STYLE.MEDIUM}`}>
      {s}
    </span>
  );
}

const CATEGORY_STYLE: Record<string, string> = {
  HARD_REJECT: "bg-red-50 text-red-800 border-red-200",
  EXCEPTION_L1: "bg-amber-50 text-amber-900 border-amber-200",
  EXCEPTION_L2: "bg-orange-50 text-orange-950 border-orange-200",
  PRICING: "bg-blue-50 text-blue-800 border-blue-200",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${CATEGORY_STYLE[category] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {category.replace(/_/g, " ")}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Credit Score & Financial Ratios Visual Gauges
// ---------------------------------------------------------------------------

export function CreditScoreGauge({ score, dpd90Count, hasWriteOff }: { score?: number | null; dpd90Count?: number; hasWriteOff?: boolean }) {
  const safeScore = score ?? 0;
  // Scale 300 to 900
  const pct = Math.min(100, Math.max(0, ((safeScore - 300) / 600) * 100));

  let tier = "Poor";
  let color = "bg-red-500 text-red-700";
  if (safeScore >= 750) {
    tier = "Excellent";
    color = "bg-emerald-500 text-emerald-700";
  } else if (safeScore >= 700) {
    tier = "Good";
    color = "bg-blue-500 text-blue-700";
  } else if (safeScore >= 600) {
    tier = "Fair / Borderline";
    color = "bg-amber-500 text-amber-700";
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-900 p-5 text-white shadow-xs">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium uppercase tracking-wider">CIBIL Bureau Score</span>
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Range: 300–900</span>
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-4xl font-bold tracking-tight text-white tabular-nums">{score ? score : "N/A"}</span>
        {score && <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">{tier}</span>}
      </div>

      {score ? (
        <div className="mt-3 space-y-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full transition-all duration-500 ${color.split(" ")[0]}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>300 (Poor)</span>
            <span>650 (High Risk)</span>
            <span>750+ (Prime)</span>
            <span>900</span>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-400">Bureau report not linked or data unavailable.</p>
      )}

      {(dpd90Count || hasWriteOff) ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-3 text-[11px]">
          {hasWriteOff && (
            <span className="inline-flex items-center gap-1 rounded bg-red-950/80 px-2 py-0.5 font-medium text-red-300 border border-red-800">
              <ShieldAlert className="h-3 w-3" /> Historical Write-Off Detected
            </span>
          )}
          {Boolean(dpd90Count && dpd90Count > 0) && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-2 py-0.5 font-medium text-amber-300 border border-amber-800">
              <AlertTriangle className="h-3 w-3" /> {dpd90Count} DPD 90+ Incidents
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function FOIRGauge({ foir, obligationRatio }: { foir?: number | null; obligationRatio?: number | null }) {
  const foirVal = foir ?? 0;
  const safePct = Math.min(100, Math.max(0, foirVal));

  let color = "bg-emerald-500";
  let statusText = "Within Policy (<50%)";
  if (foirVal > 65) {
    color = "bg-red-500";
    statusText = "Severe Breach (>65%) — L2 Escalation";
  } else if (foirVal > 50) {
    color = "bg-amber-500";
    statusText = "Policy Exception (>50%) — L1 Approval Required";
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="font-semibold uppercase tracking-wide">FOIR (Fixed Obligation to Income)</span>
        <span className="font-bold text-slate-900 tabular-nums">{percent(foir)}</span>
      </div>

      <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${safePct}%` }} />
        {/* 50% policy threshold marker line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400" title="50% Standard Policy Cap" />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">{statusText}</span>
        {obligationRatio !== undefined && (
          <span className="text-slate-400">Existing Obligation: {percent(obligationRatio)}</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rule Inspection Drawer
// ---------------------------------------------------------------------------

export function RuleDrawer({ rule, onClose }: { rule: TriggeredRule; onClose: () => void }) {
  const isFail = rule.category === "HARD_REJECT";
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-500">{rule.ruleCode}</span>
              <CategoryBadge category={rule.category} />
            </div>
            <h3 className="mt-1 text-base font-bold text-slate-900">{rule.ruleName}</h3>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <div className={`rounded-lg border p-4 ${isFail ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            <div className="flex items-center gap-2 font-semibold">
              {isFail ? <XCircle className="h-4 w-4 text-red-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
              {isFail ? "Hard Reject Triggered" : "Credit Exception Flagged"}
            </div>
            <p className="mt-1 text-xs">{rule.reasonCode}: Requires institutional authority review.</p>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Evaluated Metric</span>
              <span className="font-mono font-semibold text-slate-800">{rule.metric ?? "—"}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Policy Condition</span>
              <span className="font-mono font-semibold text-slate-800">{rule.metric} {rule.operator} {String(rule.thresholdValue)}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Applicant Actual Value</span>
              <span className="font-mono font-bold text-slate-900">{String(rule.actualValue)}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Required Action</span>
              <span className="font-semibold text-slate-800">{rule.action}</span>
            </div>
            {rule.category === "PRICING" && (
              <div className="flex justify-between text-xs py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Rate Impact</span>
                <span className={`font-mono font-semibold ${(rule.rateAdjustmentPct ?? 0) >= 0 ? "text-red-700" : "text-emerald-700"}`}>
                  {(rule.rateAdjustmentPct ?? 0) >= 0 ? "+" : ""}
                  {rule.rateAdjustmentPct ?? 0}% to interest rate
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500">Policy Version</span>
              <span className="font-mono text-slate-700">v{rule.ruleVersion ?? 1}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading / Empty / Error State Components
// ---------------------------------------------------------------------------

export function LoadingState({ label = "Loading data…", rows = 4 }: { label?: string; rows?: number }) {
  return (
    <div className="space-y-3 p-4" role="status" aria-label={label}>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />
        {label}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50/70 p-6 text-center">
      <AlertCircle className="h-6 w-6 text-red-500" />
      <p className="text-sm font-semibold text-red-900">Unable to load data</p>
      <p className="max-w-md text-xs text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-3.5 w-3.5" /> Retry Request
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------

export function currency(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function percent(value?: number | null, digits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)}%`;
}

export function dateTime(value?: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
