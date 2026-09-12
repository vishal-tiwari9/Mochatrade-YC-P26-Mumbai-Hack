import { useEffect, useState } from "react";
import { Brain, FlaskConical, Info, ScrollText, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import {
  Button,
  ErrorState,
  Field,
  Input,
  LoadingState,
  PageHeader,
  RiskBadge,
  SectionCard,
  Select,
  StatCard,
  percent,
} from "@/components/ui";
import { apiErrorMessage, getMlModelInfo, predictMlRisk } from "@/services/api";
import type { MlModelInfo, MlPredictRequest, MlPredictResult } from "@/types";

const DEFAULT_TEST_INPUT: MlPredictRequest = {
  cibilScore: 680,
  foir: 40,
  dpd90Count: 0,
  bounceCountLast6M: 1,
  hasWriteOff: false,
  obligationRatio: 20,
  loanToIncomeRatio: 1.2,
  assetToLoanRatio: 0.3,
  incomeTrendPct: 5,
};

function WeightBar({ feature, coefficient, description, maxAbs }: { feature: string; coefficient: number; description: string; maxAbs: number }) {
  const pct = maxAbs > 0 ? (Math.abs(coefficient) / maxAbs) * 100 : 0;
  const isRisk = coefficient > 0;
  return (
    <div className="py-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-semibold text-slate-800">{feature}</span>
        <span className={`font-mono font-bold ${isRisk ? "text-red-700" : "text-emerald-700"}`}>
          {coefficient > 0 ? "+" : ""}
          {coefficient.toFixed(3)}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${isRisk ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
    </div>
  );
}

export function MlRiskModel() {
  const [info, setInfo] = useState<MlModelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [testInput, setTestInput] = useState<MlPredictRequest>(DEFAULT_TEST_INPUT);
  const [testResult, setTestResult] = useState<MlPredictResult | null>(null);
  const [testing, setTesting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    getMlModelInfo()
      .then((data) => {
        setInfo(data);
        if (!data.ready) setError(data.error || "Model not ready.");
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function runTest() {
    setTesting(true);
    try {
      const result = await predictMlRisk(testInput);
      setTestResult(result);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setTesting(false);
    }
  }

  const maxAbsCoefficient = Math.max(...(info?.featureWeights?.map((f) => Math.abs(f.coefficient)) ?? [1]), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ML Risk Model"
        subtitle="A trained default-risk classifier feeding the deterministic BRE as one more input signal — never the decision authority."
        badge={
          info?.ready && (
            <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-800">
              <Brain className="h-3 w-3" /> Model Live
            </span>
          )
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          This score is <strong>advisory</strong>, not authoritative. It is exposed to the rule engine as a metric
          called <code className="rounded bg-blue-100 px-1 font-mono">mlRiskScore</code> — Admin makes it actually
          affect decisions by writing a threshold rule against it, exactly like any other metric, in{" "}
          <Link to="/rules" className="font-semibold underline">
            Rules &amp; BRE
          </Link>
          . A seeded example (<code className="rounded bg-blue-100 px-1 font-mono">RULE_ML_HIGH_RISK</code>) is
          already active.
        </p>
      </div>

      {loading && <LoadingState label="Loading model status…" rows={4} />}
      {error && !loading && <ErrorState message={error} onRetry={load} />}

      {info?.ready && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Algorithm" value="Logistic Regression" icon={Brain} variant="info" />
            <StatCard label="Accuracy" value={percent((info.accuracy ?? 0) * 100)} icon={ShieldAlert} variant="default" />
            <StatCard label="AUC-ROC" value={(info.aucRoc ?? 0).toFixed(3)} secondaryValue="discrimination power" variant="default" />
            <StatCard label="Training Samples" value={info.trainingSamples ?? 0} secondaryValue={`+${info.testSamples ?? 0} test`} variant="default" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="Feature Weights" description="Standardized logistic regression coefficients — sign shows direction, magnitude shows influence.">
              <div className="divide-y divide-slate-100">
                {info.featureWeights?.map((fw) => (
                  <WeightBar key={fw.feature} feature={fw.feature} coefficient={fw.coefficient} description={fw.description} maxAbs={maxAbsCoefficient} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Data Source & Honesty Disclosure" description="Full transparency for judging — this is not trained on real loan outcomes.">
              <p className="text-xs leading-relaxed text-slate-600">{info.dataSource}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] uppercase text-slate-400">Trained At</p>
                  <p className="font-mono font-semibold text-slate-800">{info.trainedAt}</p>
                </div>
                <div className="rounded-md border border-slate-100 bg-slate-50 p-2.5">
                  <p className="text-[10px] uppercase text-slate-400">Base Positive Rate</p>
                  <p className="font-mono font-semibold text-slate-800">{percent((info.positiveRate ?? 0) * 100)}</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                <ScrollText className="h-3 w-3" /> Retrain by running{" "}
                <code className="rounded bg-slate-100 px-1 font-mono">python ml/train_model.py</code> in the
                extractor service.
              </p>
            </SectionCard>
          </div>

          <SectionCard
            title="Test the Model"
            description="Run a live prediction against the current model — advisory only, nothing is saved."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Field label="CIBIL Score">
                <Input type="number" value={testInput.cibilScore} onChange={(e) => setTestInput({ ...testInput, cibilScore: Number(e.target.value) })} />
              </Field>
              <Field label="FOIR %">
                <Input type="number" value={testInput.foir} onChange={(e) => setTestInput({ ...testInput, foir: Number(e.target.value) })} />
              </Field>
              <Field label="DPD 90+ Count">
                <Input type="number" value={testInput.dpd90Count} onChange={(e) => setTestInput({ ...testInput, dpd90Count: Number(e.target.value) })} />
              </Field>
              <Field label="Bounces (6M)">
                <Input type="number" value={testInput.bounceCountLast6M} onChange={(e) => setTestInput({ ...testInput, bounceCountLast6M: Number(e.target.value) })} />
              </Field>
              <Field label="Has Write-Off">
                <Select value={String(testInput.hasWriteOff)} onChange={(e) => setTestInput({ ...testInput, hasWriteOff: e.target.value === "true" })}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </Field>
              <Field label="Obligation Ratio %">
                <Input type="number" value={testInput.obligationRatio} onChange={(e) => setTestInput({ ...testInput, obligationRatio: Number(e.target.value) })} />
              </Field>
              <Field label="Loan / Income Ratio">
                <Input type="number" step="0.1" value={testInput.loanToIncomeRatio} onChange={(e) => setTestInput({ ...testInput, loanToIncomeRatio: Number(e.target.value) })} />
              </Field>
              <Field label="Asset / Loan Ratio">
                <Input type="number" step="0.1" value={testInput.assetToLoanRatio} onChange={(e) => setTestInput({ ...testInput, assetToLoanRatio: Number(e.target.value) })} />
              </Field>
              <Field label="Income Trend %">
                <Input type="number" value={testInput.incomeTrendPct} onChange={(e) => setTestInput({ ...testInput, incomeTrendPct: Number(e.target.value) })} />
              </Field>
            </div>

            <Button className="mt-4" onClick={runTest} loading={testing}>
              <FlaskConical className="h-3.5 w-3.5" /> Run Prediction
            </Button>

            {testResult && (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Predicted Default Risk</p>
                    <p className="text-2xl font-bold tabular-nums text-slate-900">{percent(testResult.riskScore * 100)}</p>
                  </div>
                  <RiskBadge grade={testResult.riskGrade} />
                </div>
                <div className="mt-3 space-y-1.5">
                  {testResult.topFactors.map((f) => (
                    <div key={f.feature} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-600">
                        {f.feature} = {f.value}
                      </span>
                      <span className={f.direction === "increases_risk" ? "font-semibold text-red-700" : "font-semibold text-emerald-700"}>
                        {f.contribution > 0 ? "+" : ""}
                        {f.contribution.toFixed(3)} ({f.direction === "increases_risk" ? "↑ risk" : "↓ risk"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
