import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileUp,
  Loader2,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button, currency, Field, Input, PageHeader, SectionCard, Select } from "@/components/ui";
import { apiErrorMessage, evaluateApplication, extractPdf } from "@/services/api";
import type { PersonalDetails, RawFinancials } from "@/types";

interface Scenario {
  label: string;
  expected: string;
  badgeColor: string;
  personalDetails: PersonalDetails;
  rawFinancials: RawFinancials;
}

const SCENARIOS: Scenario[] = [
  {
    label: "Prime Salaried (Clean)",
    expected: "APPROVED",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    personalDetails: {
      fullName: "Ananya Sharma",
      panNumber: "STRNG1234A",
      phone: "9820011223",
      email: "ananya.sharma@example.com",
      employmentType: "SALARIED",
      age: 34,
    },
    rawFinancials: {
      monthlyIncome: 150000,
      existingObligations: 10000,
      requestedAmount: 1000000,
      tenureMonths: 60,
      cibilScore: 780,
      hasWriteOff: false,
      dpd90Count: 0,
      bounceCountLast6M: 0,
      avgMonthlyBalance: 200000,
      businessVintageMonths: 96,
      itrYear1: 1500000,
      itrYear2: 1650000,
      declaredAssets: 500000,
    },
  },
  {
    label: "Historical Write-Off",
    expected: "HARD_REJECT",
    badgeColor: "bg-red-100 text-red-800 border-red-300",
    personalDetails: {
      fullName: "Rakesh Verma",
      panNumber: "DELNQ5678B",
      phone: "9820033445",
      email: "rakesh.verma@example.com",
      employmentType: "SELF_EMPLOYED",
      age: 45,
    },
    rawFinancials: {
      monthlyIncome: 300000,
      existingObligations: 10000,
      requestedAmount: 800000,
      tenureMonths: 36,
      cibilScore: 720,
      hasWriteOff: true,
      dpd90Count: 0,
      bounceCountLast6M: 0,
      avgMonthlyBalance: 400000,
      businessVintageMonths: 144,
      itrYear1: 3000000,
      itrYear2: 3200000,
      declaredAssets: 1000000,
    },
  },
  {
    label: "Borderline CIBIL (660)",
    expected: "EXCEPTION_L1",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    personalDetails: {
      fullName: "Pooja Hegde",
      panNumber: "BRDLN9012C",
      phone: "9999988888",
      email: "pooja.hegde@example.com",
      employmentType: "SALARIED",
      age: 29,
    },
    rawFinancials: {
      monthlyIncome: 120000,
      existingObligations: 15000,
      requestedAmount: 1200000,
      tenureMonths: 60,
      cibilScore: 660,
      hasWriteOff: false,
      dpd90Count: 0,
      bounceCountLast6M: 0,
      avgMonthlyBalance: 60000,
      businessVintageMonths: 30,
      itrYear1: 900000,
      itrYear2: 1020000,
      declaredAssets: 400000,
    },
  },
  {
    label: "Multiple Bounces (Compound)",
    expected: "EXCEPTION_L2",
    badgeColor: "bg-orange-100 text-orange-950 border-orange-300",
    personalDetails: {
      fullName: "Karan Mehta",
      panNumber: "L2ESC3456D",
      phone: "9820055667",
      email: "karan.mehta@example.com",
      employmentType: "BUSINESS",
      age: 52,
    },
    rawFinancials: {
      monthlyIncome: 90000,
      existingObligations: 15000,
      requestedAmount: 1200000,
      tenureMonths: 60,
      cibilScore: 640,
      hasWriteOff: false,
      dpd90Count: 0,
      bounceCountLast6M: 3,
      avgMonthlyBalance: 40000,
      businessVintageMonths: 18,
      itrYear1: 800000,
      itrYear2: 820000,
      declaredAssets: 100000,
    },
  },
];

const EMPTY_PERSONAL: PersonalDetails = {
  fullName: "",
  panNumber: "",
  phone: "",
  email: "",
  employmentType: "SALARIED",
  age: undefined,
};

const EMPTY_FINANCIALS: RawFinancials = {
  monthlyIncome: 120000,
  existingObligations: 15000,
  requestedAmount: 1000000,
  tenureMonths: 60,
  cibilScore: 750,
  hasWriteOff: false,
  dpd90Count: 0,
  bounceCountLast6M: 0,
  avgMonthlyBalance: 80000,
  businessVintageMonths: undefined,
  itrYear1: 1200000,
  itrYear2: 1400000,
  declaredAssets: 500000,
};

export function NewApplication() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>(EMPTY_PERSONAL);
  const [rawFinancials, setRawFinancials] = useState<RawFinancials>(EMPTY_FINANCIALS);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);

  function loadScenario(scenario: Scenario) {
    setPersonalDetails(scenario.personalDetails);
    setRawFinancials(scenario.rawFinancials);
    toast.info(`Loaded scenario "${scenario.label}" — expected decision: ${scenario.expected}`);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const result = await extractPdf(file);
      if (!result.success || !result.extractedData) {
        toast.error(result.error || "Could not extract data from document");
        return;
      }
      const { extractedData, missingFields = [] } = result;
      setPersonalDetails((prev) => ({
        ...prev,
        panNumber: extractedData.panNumber ?? prev.panNumber,
      }));
      setRawFinancials((prev) => ({
        ...prev,
        monthlyIncome: extractedData.monthlyIncome ?? prev.monthlyIncome,
        cibilScore: extractedData.cibilScore ?? prev.cibilScore,
        bounceCountLast6M: extractedData.bounceCountLast6M ?? prev.bounceCountLast6M,
        avgMonthlyBalance: extractedData.avgMonthlyBalance ?? prev.avgMonthlyBalance,
      }));
      if (missingFields.length > 0) {
        toast.warning(`Extracted with gaps: ${missingFields.join(", ")}. Fill remaining manually.`);
      } else {
        toast.success("Document data extracted and populated into intake form.");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err) || "Extractor service unreachable (:8000)");
    } finally {
      setExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!personalDetails.fullName || !personalDetails.panNumber) {
      toast.error("Full Name and PAN Number are mandatory.");
      return;
    }
    setLoading(true);
    try {
      const result = await evaluateApplication({
        applicantId: `APP-${Date.now().toString().slice(-6)}`,
        personalDetails,
        rawFinancials,
      });
      toast.success(`Underwriting complete: ${result.evaluation.status.replace(/_/g, " ")}`);
      navigate(`/applications/${result.applicantId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Intake & Automated Spreading"
        subtitle="Originate lending requests, parse PDF financial statements, and execute live BRE underwriting."
      />

      {/* Preset Quick-Load Scenarios for Demo */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Demo Preset Risk Profiles
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Instant-fill calibrated applicant parameters</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.label}
              type="button"
              onClick={() => loadScenario(sc)}
              className="flex flex-col items-start gap-1 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-left transition hover:border-slate-400 hover:bg-white"
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{sc.label}</span>
                <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${sc.badgeColor}`}>
                  {sc.expected}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                CIBIL {sc.rawFinancials.cibilScore} · Income ₹{sc.rawFinancials.monthlyIncome?.toLocaleString("en-IN")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Document Extraction Dropzone */}
      <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-6 text-center shadow-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          id="pdf-upload"
        />
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <FileUp className="h-5 w-5" />
        </div>
        <h3 className="mt-2 text-sm font-bold text-slate-900">AI Financial Document Spreading</h3>
        <p className="mt-0.5 text-xs text-slate-500 max-w-md mx-auto">
          Upload PDF Bank Statements, ITR Acknowledgements, or CIBIL Bureau summaries. The microservice on :8000 extracts PAN, income, and banking metrics.
        </p>

        <div className="mt-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={extracting}
            onClick={() => fileInputRef.current?.click()}
            className="bg-white hover:bg-slate-50 border-blue-300 text-blue-800"
          >
            <Upload className="h-3.5 w-3.5" /> Choose PDF File to Parse
          </Button>
        </div>
      </div>

      {/* Structured Intake Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Section 1: Personal & KYC Details */}
          <SectionCard title="1. Identity & Employment KYC">
            <div className="space-y-3">
              <Field label="Applicant Full Name" required>
                <Input
                  required
                  value={personalDetails.fullName}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, fullName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                />
              </Field>

              <Field label="PAN Number (10 characters)" required hint="Used for bureau lookup">
                <Input
                  required
                  value={personalDetails.panNumber}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, panNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. ABCDE1234F"
                  className="font-mono uppercase"
                />
              </Field>

              <Field label="Contact Phone Number">
                <Input
                  value={personalDetails.phone || ""}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, phone: e.target.value })}
                  placeholder="e.g. 9820011223"
                />
              </Field>

              <Field label="Official Email Address">
                <Input
                  type="email"
                  value={personalDetails.email || ""}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, email: e.target.value })}
                  placeholder="e.g. applicant@company.com"
                />
              </Field>

              <Field label="Employment Type">
                <Select
                  value={personalDetails.employmentType || "SALARIED"}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, employmentType: e.target.value as any })}
                >
                  <option value="SALARIED">Salaried (MNC / Corporate)</option>
                  <option value="SELF_EMPLOYED">Self-Employed Professional</option>
                  <option value="BUSINESS">Business Owner / Enterprise</option>
                </Select>
              </Field>

              <Field label="Applicant Age" hint="Profile only — not an ML input">
                <Input
                  type="number"
                  min={18}
                  max={100}
                  value={personalDetails.age ?? ""}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, age: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="e.g. 34"
                />
              </Field>

              <Field label="Business / Employment Vintage (Months)" hint="How long at current job or running the business">
                <Input
                  type="number"
                  min={0}
                  value={rawFinancials.businessVintageMonths ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, businessVintageMonths: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="e.g. 36"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Section 2: Financials & Bureau */}
          <SectionCard title="2. Financial Profile & Banking">
            <div className="space-y-3">
              <Field label="Net Monthly Income (₹)" required>
                <Input
                  type="number"
                  required
                  value={rawFinancials.monthlyIncome ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, monthlyIncome: Number(e.target.value) })}
                  placeholder="120000"
                />
              </Field>

              <Field label="Existing Monthly Debt Obligations (₹)" required>
                <Input
                  type="number"
                  required
                  value={rawFinancials.existingObligations ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, existingObligations: Number(e.target.value) })}
                  placeholder="15000"
                />
              </Field>

              <Field label="CIBIL Bureau Score (300–900)" required>
                <Input
                  type="number"
                  required
                  min={300}
                  max={900}
                  value={rawFinancials.cibilScore ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, cibilScore: Number(e.target.value) })}
                  placeholder="750"
                />
              </Field>

              <Field label="Average Monthly Bank Balance (₹)">
                <Input
                  type="number"
                  value={rawFinancials.avgMonthlyBalance ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, avgMonthlyBalance: Number(e.target.value) })}
                  placeholder="80000"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="ITR Income — Year 1 (₹)" hint="Older of the two years">
                  <Input
                    type="number"
                    value={rawFinancials.itrYear1 ?? ""}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, itrYear1: e.target.value === "" ? undefined : Number(e.target.value) })}
                    placeholder="1200000"
                  />
                </Field>
                <Field label="ITR Income — Year 2 (₹)" hint="Most recent filed year">
                  <Input
                    type="number"
                    value={rawFinancials.itrYear2 ?? ""}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, itrYear2: e.target.value === "" ? undefined : Number(e.target.value) })}
                    placeholder="1400000"
                  />
                </Field>
              </div>
              <p className="text-[11px] text-slate-400">
                Used to compute the applicant's income trend for the risk engine.
              </p>

              <Field label="Cheque / NACH Bounces in Last 6M">
                <Input
                  type="number"
                  min={0}
                  value={rawFinancials.bounceCountLast6M ?? 0}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, bounceCountLast6M: Number(e.target.value) })}
                  placeholder="0"
                />
              </Field>

              <Field label="Average Monthly Credits — Statement Inflow (₹)" hint="From bank statement, not computed">
                <Input
                  type="number"
                  value={rawFinancials.monthlyCreditsAvg ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, monthlyCreditsAvg: Number(e.target.value) })}
                  placeholder="130000"
                />
              </Field>

              <Field label="EMI Debits Seen on Statement (₹)" hint="Actual observed debits, not the computed proposed EMI">
                <Input
                  type="number"
                  value={rawFinancials.emiDebitsFromStatement ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, emiDebitsFromStatement: Number(e.target.value) })}
                  placeholder="12000"
                />
              </Field>

              <Field label="Cash-Flow Volatility (%)" hint="Higher = less predictable month-to-month balance">
                <Input
                  type="number"
                  min={0}
                  value={rawFinancials.cashFlowVolatilityPct ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, cashFlowVolatilityPct: Number(e.target.value) })}
                  placeholder="15"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Section 3: Loan Request & Facility */}
          <SectionCard title="3. Loan Facility & Credit History">
            <div className="space-y-3">
              <Field label="Requested Loan Amount (₹)" required>
                <Input
                  type="number"
                  required
                  value={rawFinancials.requestedAmount ?? ""}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, requestedAmount: Number(e.target.value) })}
                  placeholder="1000000"
                />
              </Field>

              <Field label="Requested Tenure (Months)" required>
                <Select
                  value={rawFinancials.tenureMonths ?? 60}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, tenureMonths: Number(e.target.value) })}
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={48}>48 Months (4 Years)</option>
                  <option value={60}>60 Months (5 Years)</option>
                </Select>
              </Field>

              <Field label="Active Loan Count">
                <Input
                  type="number"
                  min={0}
                  value={rawFinancials.activeLoansCount ?? 0}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, activeLoansCount: Number(e.target.value) })}
                  placeholder="0"
                />
              </Field>

              <Field label="Recent Credit Enquiries Count">
                <Input
                  type="number"
                  min={0}
                  value={rawFinancials.creditEnquiriesCount ?? 0}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, creditEnquiriesCount: Number(e.target.value) })}
                  placeholder="0"
                />
              </Field>

              <Field label="Overdue Amount on Bureau Record (₹)">
                <Input
                  type="number"
                  min={0}
                  value={rawFinancials.overdueAmount ?? 0}
                  onChange={(e) => setRawFinancials({ ...rawFinancials, overdueAmount: Number(e.target.value) })}
                  placeholder="0"
                />
              </Field>

              <p className="pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Declared Financial Assets
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Mutual Funds (₹)">
                  <Input
                    type="number"
                    value={rawFinancials.mutualFundsValue ?? 0}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, mutualFundsValue: Number(e.target.value) })}
                    placeholder="200000"
                  />
                </Field>
                <Field label="Equities (₹)">
                  <Input
                    type="number"
                    value={rawFinancials.equitiesValue ?? 0}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, equitiesValue: Number(e.target.value) })}
                    placeholder="150000"
                  />
                </Field>
                <Field label="Other Assets (₹)">
                  <Input
                    type="number"
                    value={rawFinancials.otherAssetsValue ?? 0}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, otherAssetsValue: Number(e.target.value) })}
                    placeholder="150000"
                  />
                </Field>
              </div>
              <p className="text-[11px] text-slate-400">
                Total declared assets: {currency((rawFinancials.mutualFundsValue ?? 0) + (rawFinancials.equitiesValue ?? 0) + (rawFinancials.otherAssetsValue ?? 0))}
              </p>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={rawFinancials.hasWriteOff ?? false}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, hasWriteOff: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Applicant has Historical Write-Off</span>
                </label>
                <p className="mt-1 text-[11px] text-slate-400 pl-6">Triggers mandatory Hard Reject stop rule.</p>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={rawFinancials.hasSettlement ?? false}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, hasSettlement: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Applicant has Historical Settlement</span>
                </label>
                <p className="mt-1 text-[11px] text-slate-400 pl-6">Paid less than owed — triggers Hard Reject.</p>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={rawFinancials.hasDefault ?? false}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, hasDefault: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Bureau Default Indicator Present</span>
                </label>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={(rawFinancials.dpd90Count ?? 0) > 0}
                    onChange={(e) => setRawFinancials({ ...rawFinancials, dpd90Count: e.target.checked ? 1 : 0 })}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>90+ DPD Delinquency on Record</span>
                </label>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Submit Execution Bar */}
        <div className="flex items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setPersonalDetails(EMPTY_PERSONAL);
              setRawFinancials(EMPTY_FINANCIALS);
            }}
          >
            Reset Form
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white !py-2.5 px-6 font-bold shadow-md shadow-blue-600/30"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Execute Live Underwriting Engine
          </Button>
        </div>
      </form>
    </div>
  );
}
