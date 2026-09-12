import { useEffect, useRef, useState } from "react";
import {
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  currency,
  LoadingState,
  PageHeader,
  percent,
  RiskBadge,
  SectionCard,
  Select,
  StatusBadge,
} from "@/components/ui";
import { apiErrorMessage, getApplication, listApplications, simulateApplication } from "@/services/api";
import type { ApplicantResponse, Evaluation, NormalizedMetrics, RawFinancials } from "@/types";

const DEBOUNCE_MS = 350;

export function Simulator() {
  const [applications, setApplications] = useState<ApplicantResponse[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [base, setBase] = useState<ApplicantResponse | null>(null);
  const [overrides, setOverrides] = useState<Partial<RawFinancials>>({});
  const [scenario, setScenario] = useState<{ evaluation: Evaluation; normalizedMetrics: NormalizedMetrics } | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    listApplications()
      .then(setApplications)
      .catch((err) => toast.error(apiErrorMessage(err)))
      .finally(() => setLoadingList(false));
  }, []);

  async function selectApplication(id: string) {
    setSelectedId(id);
    setScenario(null);
    setOverrides({});
    if (!id) {
      setBase(null);
      return;
    }
    try {
      const app = await getApplication(id);
      setBase(app);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  function setOverride(field: keyof RawFinancials, value: number) {
    setOverrides((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    if (!base || Object.keys(overrides).length === 0) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSimulating(true);
      try {
        const result = await simulateApplication(base.applicantId, overrides);
        setScenario({ evaluation: result.evaluation, normalizedMetrics: result.normalizedMetrics });
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setSimulating(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [overrides, base]);

  const currentValues = base
    ? {
        requestedAmount: overrides.requestedAmount ?? base.rawFinancials.requestedAmount ?? 1000000,
        tenureMonths: overrides.tenureMonths ?? base.rawFinancials.tenureMonths ?? 60,
        monthlyIncome: overrides.monthlyIncome ?? base.rawFinancials.monthlyIncome ?? 100000,
        existingObligations: overrides.existingObligations ?? base.rawFinancials.existingObligations ?? 0,
        cibilScore: overrides.cibilScore ?? base.rawFinancials.cibilScore ?? 750,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Interactive What-If Loan Simulator"
        subtitle="Simulate adjustments to loan amount, tenure, income, and obligations against live BRE policies in real-time."
      />

      {/* Case Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Select Base Case for Feasibility Simulation
        </label>
        {loadingList ? (
          <LoadingState rows={1} />
        ) : (
          <Select
            value={selectedId}
            onChange={(e) => selectApplication(e.target.value)}
            className="text-xs"
          >
            <option value="">Choose an existing applicant from portfolio…</option>
            {applications.map((app) => (
              <option key={app._id} value={app.applicantId}>
                {app.applicantId} — {app.personalDetails.fullName} (Requested: {currency(app.rawFinancials.requestedAmount)}, CIBIL: {app.rawFinancials.cibilScore ?? "—"})
              </option>
            ))}
          </Select>
        )}
      </div>

      {base && currentValues && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Sliders / Parameter Adjustments */}
          <div className="lg:col-span-5 space-y-6">
            <SectionCard title="Adjust Simulation Parameters" description="Drag sliders to test credit policy boundaries">
              <div className="space-y-5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Requested Loan Amount</span>
                    <span className="font-bold text-slate-900 tabular-nums">{currency(currentValues.requestedAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min={100000}
                    max={5000000}
                    step={50000}
                    value={currentValues.requestedAmount}
                    onChange={(e) => setOverride("requestedAmount", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹1 Lakh</span>
                    <span>₹25 Lakhs</span>
                    <span>₹50 Lakhs</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Loan Tenure</span>
                    <span className="font-bold text-slate-900 tabular-nums">{currentValues.tenureMonths} Months</span>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={84}
                    step={12}
                    value={currentValues.tenureMonths}
                    onChange={(e) => setOverride("tenureMonths", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>12m (1 Yr)</span>
                    <span>36m</span>
                    <span>60m (5 Yrs)</span>
                    <span>84m (7 Yrs)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Net Monthly Income</span>
                    <span className="font-bold text-slate-900 tabular-nums">{currency(currentValues.monthlyIncome)}</span>
                  </div>
                  <input
                    type="range"
                    min={25000}
                    max={1000000}
                    step={10000}
                    value={currentValues.monthlyIncome}
                    onChange={(e) => setOverride("monthlyIncome", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹25k</span>
                    <span>₹5 Lakhs</span>
                    <span>₹10 Lakhs</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">Existing Monthly Debt Obligations</span>
                    <span className="font-bold text-slate-900 tabular-nums">{currency(currentValues.existingObligations)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    step={5000}
                    value={currentValues.existingObligations}
                    onChange={(e) => setOverride("existingObligations", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-600">CIBIL Bureau Score</span>
                    <span className="font-bold text-slate-900 tabular-nums">{currentValues.cibilScore}</span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={900}
                    step={10}
                    value={currentValues.cibilScore}
                    onChange={(e) => setOverride("cibilScore", Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>300 (Poor)</span>
                    <span>650 (High Risk)</span>
                    <span>750+ (Prime)</span>
                    <span>900</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setOverrides({})}>
                  Reset to Original Case
                </Button>
              </div>
            </SectionCard>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base Actual Case */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Base Application</span>
                  <StatusBadge status={base.evaluation.status} />
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Requested Amount</span>
                    <span className="font-bold text-slate-900 tabular-nums">{currency(base.rawFinancials.requestedAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Tenure</span>
                    <span className="font-semibold text-slate-800">{base.rawFinancials.tenureMonths || 60}m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Proposed EMI</span>
                    <span className="font-bold text-slate-900 tabular-nums">{currency(base.normalizedMetrics?.proposedEmi)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Evaluated FOIR</span>
                    <span className="font-bold text-slate-900 tabular-nums">{percent(base.normalizedMetrics?.foir)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Risk Tier</span>
                    <RiskBadge grade={base.normalizedMetrics?.riskGrade} />
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Quoted Rate</span>
                    <span className="font-bold text-slate-900">{base.normalizedMetrics?.rateOfInterest ? `${base.normalizedMetrics.rateOfInterest}%` : "—"}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Scenario */}
              <div className="rounded-xl border border-blue-300 bg-blue-50/40 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Simulated Outcome</span>
                    {simulating && <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />}
                  </div>
                  {scenario ? (
                    <StatusBadge status={scenario.evaluation.status} />
                  ) : (
                    <span className="text-xs text-slate-400">Awaiting adjustment</span>
                  )}
                </div>

                {scenario ? (
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-600">Simulated Amount</span>
                      <span className="font-bold text-blue-950 tabular-nums">{currency(currentValues.requestedAmount)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-600">Simulated Tenure</span>
                      <span className="font-semibold text-slate-900">{currentValues.tenureMonths}m</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-600">Recalculated EMI</span>
                      <span className="font-bold text-blue-950 tabular-nums">{currency(scenario.normalizedMetrics.proposedEmi)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-600">Recalculated FOIR</span>
                      <span className="font-bold text-blue-950 tabular-nums">{percent(scenario.normalizedMetrics.foir)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-slate-600">Simulated Risk</span>
                      <RiskBadge grade={scenario.normalizedMetrics.riskGrade} />
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Simulated Rate</span>
                      <span className="font-bold text-blue-950">{scenario.normalizedMetrics.rateOfInterest ? `${scenario.normalizedMetrics.rateOfInterest}%` : "—"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Adjust any slider on the left to see live BRE recalculations.
                  </div>
                )}
              </div>
            </div>

            {/* Simulation Feedback Note */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-xs">
              <span className="font-semibold text-slate-900">Institutional Note:</span> What-If projections run live against the Business Rule Engine but are strictly read-only and not persisted to the database.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
