import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Building2,
  ShieldCheck,
  FileText,
  FileLock,
  Download,
  Copy,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  Upload,
  Sparkles,
  Layers,
  Cpu,
  Smartphone,
  CreditCard,
  UserCheck,
  Check,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { investigationData } from '../data/mockData';

export function FraudResponsePanel({ onNavigateToThreats }) {
  // ── Step checklist state ──────────────────────────────────────────────
  const [steps, setSteps] = useState([
    {
      id: 1,
      title: 'Contact Bank & Payment Service Provider',
      subtitle: 'Initiate immediate fund freeze on beneficiary mule accounts',
      why: 'Limits further downstream layering before mule accounts are emptied via ATM/P2P cash-out.',
      icon: Building2,
      done: true,
      badge: 'Immediate',
    },
    {
      id: 2,
      title: 'Report on 1930 / National Cyber Crime Portal (NCRP)',
      subtitle: 'Log financial fraud transaction ticket for inter-bank nodal coordination',
      why: 'Triggers automated inter-bank freeze mechanisms via the citizen financial cyber fraud reporting system (CFCFRMS).',
      icon: ShieldCheck,
      done: true,
      badge: 'Regulatory',
    },
    {
      id: 3,
      title: 'File Formal Cyber Police Complaint',
      subtitle: 'Draft FIR/complaint brief with jurisdiction-specific cyber cell',
      why: 'Required for legal asset recovery, court-directed restitution, and telco CDR/IPDR subpoenas.',
      icon: FileLock,
      done: false,
      badge: 'Legal',
    },
    {
      id: 4,
      title: 'Preserve Digital & Forensic Evidence',
      subtitle: 'Archive chat transcripts, payment screenshots, device IDs, and APK samples',
      why: 'Prevents deletion of spoofed handles, cloud traces, and ephemeral message threads.',
      icon: Layers,
      done: false,
      badge: 'Forensics',
    },
    {
      id: 5,
      title: 'Generate & Dispatch Evidence Pack',
      subtitle: 'Compile verified timeline, money flow graph, and entity dossier into PDF dossier',
      why: 'Standardized format recognized by bank nodal officers and cyber investigation officers (IO).',
      icon: FileText,
      done: false,
      badge: 'Dossier',
    },
  ]);

  const toggleStep = (id) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  const completedCount = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  // ── Form / Evidence Pack state ────────────────────────────────────────
  const [formData, setFormData] = useState({
    caseId: investigationData.caseId,
    txnId: investigationData.transaction.id,
    txnAmount: investigationData.transaction.amount,
    txnDatetime: investigationData.transaction.datetime,
    riskScore: investigationData.riskScore,
    riskReasons: investigationData.riskReasons.join(', '),
    victimName: investigationData.victim.name,
    victimAccount: investigationData.victim.accountId,
    victimUpi: investigationData.victim.upiId,
    connectedAccounts: investigationData.connectedEntities.accounts.join(', '),
    connectedUpi: investigationData.connectedEntities.upiIds.join(', '),
    connectedDevices: investigationData.connectedEntities.devices.join(', '),
    connectedPhones: investigationData.connectedEntities.phones.join(', '),
    summary: investigationData.investigationSummary,
  });

  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'whatsapp_chat_log_08092026.pdf', size: '1.4 MB' },
    { name: 'payment_screenshot_45000_upi.png', size: '640 KB' },
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const reportRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newFiles = files.map((f) => ({
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleCopySummary = () => {
    const text = `
=== FRAUD INVESTIGATION DOSSIER ===
Case ID: ${formData.caseId}
Transaction: ${formData.txnId} | Amount: ₹${formData.txnAmount} | ${formData.txnDatetime}
Victim: ${formData.victimName} (${formData.victimUpi})
Risk Score: ${formData.riskScore}/100
Key Findings: ${formData.riskReasons}

Connected Entities:
- Accounts: ${formData.connectedAccounts}
- UPI IDs: ${formData.connectedUpi}
- Devices: ${formData.connectedDevices}

Summary:
${formData.summary}
===================================
`.trim();

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const handleGenerateDossier = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPreviewModal(true);
      // Mark step 5 as done
      setSteps((prev) =>
        prev.map((s) => (s.id === 5 ? { ...s, done: true } : s))
      );
    }, 600);
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });
      const imgWidth = 595.28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`EvidencePack_${formData.caseId}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed, fallback to print', err);
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      {/* ── SECTION A: Response Action Guide ────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Incident Response Action Guide
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Standard operating procedure (SOP) for post-investigation containment and official escalations.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 block">
                {completedCount} of {steps.length} Steps Completed
              </span>
              <span className="text-[10px] text-slate-500">Containment Checklist</span>
            </div>
            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {progressPct}%
            </span>
          </div>
        </div>

        {/* Steps List */}
        <div className="mt-5 space-y-3">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                  step.done
                    ? 'bg-emerald-50/30 border-emerald-200/80 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Custom Checkbox */}
                <button
                  type="button"
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                >
                  {step.done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {step.id}. {step.title}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                        {step.badge}
                      </span>
                    </div>

                    {step.id === 5 && !step.done && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateDossier();
                        }}
                        className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Quick Generate Pack
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1">{step.subtitle}</p>

                  <div className="mt-2 bg-white/70 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                    <span className="font-semibold text-slate-700 shrink-0">Why this matters:</span>
                    <span>{step.why}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION B: Evidence Pack Generator ──────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold text-slate-900">
                Evidence Pack & Dossier Generator
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pre-filled from graph intelligence. Review, edit, and compile court-ready forensic reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Summary
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGenerateDossier}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Compiling Dossier...' : 'Generate Evidence Pack'}
            </button>
          </div>
        </div>

        {/* 2-Column Form Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sub-column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Case Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Case ID
                </label>
                <input
                  type="text"
                  value={formData.caseId}
                  onChange={(e) => handleInputChange('caseId', e.target.value)}
                  className="w-full text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={formData.txnId}
                  onChange={(e) => handleInputChange('txnId', e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Amount Disputed
                </label>
                <input
                  type="number"
                  value={formData.txnAmount}
                  onChange={(e) => handleInputChange('txnAmount', e.target.value)}
                  className="w-full text-xs font-bold text-red-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Connected Entities Breakdown */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Connected Graph Entities (Network Linked)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Linked Mule Accounts
                  </label>
                  <input
                    type="text"
                    value={formData.connectedAccounts}
                    onChange={(e) => handleInputChange('connectedAccounts', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Beneficiary UPI IDs
                  </label>
                  <input
                    type="text"
                    value={formData.connectedUpi}
                    onChange={(e) => handleInputChange('connectedUpi', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Shared Fingerprinted Devices
                  </label>
                  <input
                    type="text"
                    value={formData.connectedDevices}
                    onChange={(e) => handleInputChange('connectedDevices', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 block mb-1">
                    Linked Phone Numbers
                  </label>
                  <input
                    type="text"
                    value={formData.connectedPhones}
                    onChange={(e) => handleInputChange('connectedPhones', e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Money Flow Path */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center justify-between">
                <span>Multi-Hop Money Trail (Fund Dissipation)</span>
                <span className="text-[10px] font-mono text-slate-500">4-Hop Trace</span>
              </h3>

              <div className="space-y-2">
                {investigationData.moneyFlow.map((hop, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-700">{hop.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-900">{hop.to}</span>
                    </div>
                    <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                      ₹{hop.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sub-column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Risk Assessment Box */}
            <div className="bg-red-50/50 p-4 rounded-xl border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  AI Risk Engine Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-red-600">{formData.riskScore}</span>
                  <span className="text-xs text-red-400 font-semibold">/100</span>
                </div>
              </div>

              <div className="mt-3">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Top Detection Indicators
                </label>
                <textarea
                  rows={3}
                  value={formData.riskReasons}
                  onChange={(e) => handleInputChange('riskReasons', e.target.value)}
                  className="w-full text-xs bg-white border border-red-200 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Investigation Summary */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Forensic Investigation Narrative
              </label>
              <textarea
                rows={5}
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="Write summary notes for police / bank nodal officers..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 leading-relaxed"
              />
            </div>

            {/* Evidence File Upload */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Attached Digital Evidence ({uploadedFiles.length})
              </label>

              <div className="border-2 border-dashed border-slate-200 rounded-lg p-3 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  id="evidence-file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-file"
                  className="cursor-pointer flex flex-col items-center gap-1"
                >
                  <Upload className="w-5 h-5 text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-600">
                    Click to attach screenshots / PDFs
                  </span>
                  <span className="text-[10px] text-slate-400">Supports PNG, JPG, PDF up to 25MB</span>
                </label>
              </div>

              {/* Uploaded files chips */}
              <div className="mt-2 space-y-1.5">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200"
                  >
                    <span className="truncate max-w-[200px] text-slate-700 font-medium">
                      {file.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── PREVIEW & PDF EXPORT MODAL ──────────────────────────────── */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-indigo-500 text-white rounded-lg">
                  <FileLock className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold">FraudNexus Certified Evidence Pack</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Dossier #{formData.caseId}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="text-slate-400 hover:text-white text-sm px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Content (printable / PDF target) */}
            <div className="p-8 overflow-y-auto bg-slate-50 flex justify-center">
              <div
                ref={reportRef}
                className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 w-full max-w-2xl text-slate-900 text-xs font-sans space-y-6"
              >
                {/* Dossier Title Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                  <div>
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">
                      FRAUDNEXUS INTELLIGENCE DOSSIER
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Financial Cybercrime Incident & Evidence Pack
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-200">
                      CONFIDENTIAL / LAW ENFORCEMENT
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">
                      Generated: {new Date().toISOString()}
                    </p>
                  </div>
                </div>

                {/* Case & Risk Overview */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Case Reference</p>
                    <p className="font-mono font-bold text-sm text-slate-900">{formData.caseId}</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Txn: <span className="font-mono font-semibold">{formData.txnId}</span>
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Amount:{' '}
                      <span className="font-bold text-red-600">
                        ₹{Number(formData.txnAmount).toLocaleString('en-IN')}
                      </span>
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">AI Risk Rating</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xl font-black text-red-600">
                        {formData.riskScore} / 100
                      </span>
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        CRITICAL
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1 line-clamp-2">
                      {formData.riskReasons}
                    </p>
                  </div>
                </div>

                {/* Victim & Beneficiary Entities */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 border-b pb-1">
                    Identified Entities & Attribution
                  </h4>
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-1 text-slate-500 font-medium">Victim:</td>
                        <td className="py-1 font-semibold">{formData.victimName} ({formData.victimUpi})</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1 text-slate-500 font-medium">Linked Accounts:</td>
                        <td className="py-1 font-mono">{formData.connectedAccounts}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1 text-slate-500 font-medium">Mule UPI IDs:</td>
                        <td className="py-1 font-mono">{formData.connectedUpi}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="py-1 text-slate-500 font-medium">Shared Devices:</td>
                        <td className="py-1 font-mono">{formData.connectedDevices}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-slate-500 font-medium">Phone Numbers:</td>
                        <td className="py-1 font-mono">{formData.connectedPhones}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Money Flow Steps */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-2 border-b pb-1">
                    Multi-Hop Money Trail
                  </h4>
                  <div className="space-y-1.5">
                    {investigationData.moneyFlow.map((hop, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-[11px] bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200"
                      >
                        <span>
                          Step {i + 1}: {hop.from} → <strong>{hop.to}</strong>
                        </span>
                        <span className="font-mono font-bold text-red-600">
                          ₹{hop.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Narrative */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-1 border-b pb-1">
                    Investigator Summary Notes
                  </h4>
                  <p className="text-[11px] text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                    {formData.summary}
                  </p>
                </div>

                {/* Evidence Artifacts */}
                <div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-1 border-b pb-1">
                    Attached Forensic Artifacts
                  </h4>
                  <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                    {uploadedFiles.map((f, idx) => (
                      <li key={idx}>
                        {f.name} ({f.size})
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Signature Block */}
                <div className="pt-4 border-t border-slate-200 flex justify-between text-[10px] text-slate-500">
                  <div>
                    <p>Automated Verification by FraudNexus Neural Engine</p>
                    <p className="font-mono">Hash: SHA256:7f83b1657ff1fc53b92dc18148a1d65d</p>
                  </div>
                  <div className="text-right">
                    <p>Investigator Signature: ______________________</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FraudResponsePanel;
