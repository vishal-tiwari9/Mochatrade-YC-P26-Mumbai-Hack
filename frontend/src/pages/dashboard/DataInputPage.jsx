import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataset } from '../../context/DatasetContext';
import { parseCSV, computeDatasetMetrics, fmtCurrency } from '../../utils/csvParser';
import { buildUploadedDatasetModel } from '../../utils/riskEngine';
import { SYNTHETIC_CSV_TEXT, downloadSampleCSVFile } from '../../data/syntheticCsv';
import { Upload, FileText, CheckCircle2, AlertCircle, Play, Download } from 'lucide-react';

export function DataInputPage() {
  const navigate = useNavigate();
  const { loadUploadedDataset } = useDataset();

  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [lastParsedRows, setLastParsedRows] = useState(null);
  const [lastFilename, setLastFilename] = useState('');

  // 7-step pipeline modal state
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipeStep, setPipeStep] = useState(0);
  const [pipePercent, setPipePercent] = useState(0);

  const pipelineSteps = [
    { title: 'CSV DATA', desc: 'Parsing rows & timestamps' },
    { title: 'DATA VALIDATION', desc: 'Schema & entity validation' },
    { title: 'GRAPH CONSTRUCTION', desc: 'Accounts · Devices · Subnets' },
    { title: 'HETEROGENEOUS GNN', desc: 'Topology embeddings' },
    { title: 'RISK SCORING', desc: 'Zero-dwell & velocity scoring' },
    { title: 'SUSPICIOUS CLUSTER DETECTION', desc: 'Scatter-gather clustering' },
    { title: 'EVIDENCE DOSSIER', desc: 'Compiling case file & hash' },
  ];

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileSelect = e => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = file => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationResult({
        isValid: false,
        msg: 'Invalid file format: Please upload a file with a .csv extension.'
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationResult({
        isValid: false,
        msg: 'File exceeds maximum size: Dataset must be under 10 MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      processCSVContent(ev.target.result, file.name);
    };
    reader.readAsText(file);
  };

  const processCSVContent = (text, filename) => {
    setLastFilename(filename);
    const res = parseCSV(text);
    if (!res.success) {
      setValidationResult({
        isValid: false,
        msg: res.error || 'Failed to parse CSV schema.'
      });
      setLastParsedRows(null);
      return;
    }

    const metrics = computeDatasetMetrics(res.rows);
    setLastParsedRows(res.rows);
    setValidationResult({
      isValid: true,
      filename,
      metrics,
      rows: res.rows
    });
  };

  const handleLoadSynthetic = () => {
    processCSVContent(SYNTHETIC_CSV_TEXT, 'synthetic_mule_dataset.csv');
  };

  const handleAnalyzeDataset = () => {
    if (!lastParsedRows) return;
    setIsPipelineRunning(true);
    setPipeStep(0);
    setPipePercent(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setPipeStep(current);
      const pct = Math.min(100, Math.round((current / 7) * 100));
      setPipePercent(pct);

      if (current >= 7) {
        clearInterval(interval);
        setTimeout(() => {
          setIsPipelineRunning(false);
          const model = buildUploadedDatasetModel(lastParsedRows, lastFilename || 'custom_dataset.csv');
          loadUploadedDataset(model);
          navigate('/app/overview');
        }, 500);
      }
    }, 280);
  };

  return (
    <div style={{ padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">DATA INGESTION</span>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', marginTop: '6px' }}>
          Upload Transaction Dataset
        </h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '13.5px', marginTop: '4px' }}>
          Upload transaction logs containing account, device, and network telemetry to construct the heterogeneous graph.
        </p>
      </div>

      {/* Upload Dropzone Card */}
      <div
        className={`upload-card ${isDragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-icon">
          <Upload size={30} />
        </div>
        <h3>Drag &amp; drop CSV file here</h3>
        <p>Upload your multi-party transaction log to construct the heterogeneous graph and run the risk-scoring pipeline.</p>

        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={14} />
            Choose CSV File
          </button>
          <button className="btn btn-ghost" onClick={handleLoadSynthetic}>
            <FileText size={14} />
            Load Synthetic Mule Dataset (1-Click)
          </button>
          <button className="btn btn-ghost" onClick={downloadSampleCSVFile}>
            <Download size={14} />
            Download Sample CSV
          </button>
        </div>

        <div style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          Accepted format: .csv &nbsp;·&nbsp; Maximum file size: 10 MB
        </div>
      </div>

      {/* Expected Schema Info */}
      <div className="schema-box">
        <div className="schema-title">Expected CSV Column Structure (6 Required Columns)</div>
        <div className="schema-cols">
          <span className="schema-badge req">sender_id</span>
          <span className="schema-badge req">receiver_id</span>
          <span className="schema-badge req">amount</span>
          <span className="schema-badge req">timestamp</span>
          <span className="schema-badge req">device_id</span>
          <span className="schema-badge req">ip_subnet</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '6px' }}>Sample Row:</div>
        <div className="schema-example">ACC-7734 | ACC-9081 | 160000 | 2026-08-29 14:32:10 | DEV-CF19A3 | 103.21.58.0/24</div>
      </div>

      {/* Validation Feedback Card */}
      {validationResult && (
        <div className={`validation-card ${validationResult.isValid ? 'valid' : 'invalid'}`}>
          <div className="val-header">
            <div className={`val-status ${validationResult.isValid ? 'success' : 'error'}`}>
              {validationResult.isValid ? (
                <>
                  <CheckCircle2 size={22} />
                  Dataset validated ✓
                </>
              ) : (
                <>
                  <AlertCircle size={22} />
                  Invalid dataset
                </>
              )}
            </div>

            {validationResult.isValid && (
              <button className="btn btn-accent btn-lg" onClick={handleAnalyzeDataset}>
                <Play size={15} />
                Analyze Dataset →
              </button>
            )}
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
            {validationResult.isValid ? (
              <span>Successfully parsed and verified telemetry schema for <b>{validationResult.filename}</b>.</span>
            ) : (
              <span style={{ color: 'var(--red)' }}>{validationResult.msg}</span>
            )}
          </div>

          {validationResult.isValid && (
            <>
              {/* Stats Grid */}
              <div className="val-stats-grid">
                <div className="val-stat-item">
                  <div className="val-stat-num">{validationResult.metrics.txCount.toLocaleString()}</div>
                  <div className="val-stat-label">Transactions (Rows)</div>
                </div>
                <div className="val-stat-item">
                  <div className="val-stat-num">{validationResult.metrics.accCount.toLocaleString()}</div>
                  <div className="val-stat-label">Unique Accounts</div>
                </div>
                <div className="val-stat-item">
                  <div className="val-stat-num">{validationResult.metrics.devCount.toLocaleString()}</div>
                  <div className="val-stat-label">Unique Devices</div>
                </div>
                <div className="val-stat-item">
                  <div className="val-stat-num">{validationResult.metrics.subCount.toLocaleString()}</div>
                  <div className="val-stat-label">Unique IP Subnets</div>
                </div>
              </div>

              {/* First 5 Preview Rows */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)' }}>
                    DATASET PREVIEW (FIRST 5 ROWS)
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--teal)' }}>
                    {fmtCurrency(validationResult.metrics.totalVolume)} Total Volume
                  </span>
                </div>

                <div className="preview-table-wrap">
                  <table className="csv-preview-table">
                    <thead>
                      <tr>
                        <th>sender_id</th>
                        <th>receiver_id</th>
                        <th>amount</th>
                        <th>timestamp</th>
                        <th>device_id</th>
                        <th>ip_subnet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.rows.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          <td style={{ color: '#fff', fontWeight: 600 }}>{r.sender_id}</td>
                          <td style={{ color: '#fff', fontWeight: 600 }}>{r.receiver_id}</td>
                          <td style={{ color: 'var(--teal)' }}>{fmtCurrency(r.amount)}</td>
                          <td>{r.timestamp}</td>
                          <td><span style={{ color: 'var(--amber)' }}>{r.device_id}</span></td>
                          <td><span style={{ color: 'var(--violet)' }}>{r.ip_subnet}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Architecture pipeline horizontal representation */}
      <div style={{ marginTop: '54px' }}>
        <div className="section-head" style={{ marginBottom: '24px' }}>
          <span className="eyebrow">PIPELINE ARCHITECTURE</span>
          <h2>How MuleNet Processes Your Data</h2>
          <p>MuleNet transforms tabular transaction records into a rich heterogeneous graph connecting accounts, physical devices, and IP subnets before scoring clusters for velocity and structural anomalies.</p>
        </div>

        <div className="pillars" style={{ marginTop: '20px' }}>
          <div className="pillar p1">
            <div className="pillar-num">GRAPH REPRESENTATION</div>
            <h3>Heterogeneous Multi-Graph Structure</h3>
            <p className="desc">Accounts, devices, and IP subnets are represented as distinct node types in the graph. Unlike traditional AML graphs that only model sender-to-receiver edges, MuleNet maps:</p>
            <div className="pillar-feats">
              <div className="pillar-feat">
                <span className="dot"></span>
                <div>
                  <b>Bank Account ↔ Device Fingerprint</b>
                  <span>Links multiple bank accounts accessed from the same physical phone or browser.</span>
                </div>
              </div>
              <div className="pillar-feat">
                <span className="dot"></span>
                <div>
                  <b>Device Fingerprint ↔ IP Subnet</b>
                  <span>Catches device syndicates rotating SIMs within a single local ISP block or proxy farm.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pillar p2">
            <div className="pillar-num">ANALYSIS &amp; EXPLANATION</div>
            <h3>Graph Signal Scoring &amp; Explainability</h3>
            <p className="desc">The analysis pipeline inspects structural graph metrics to identify illicit money routing without black-box opacity:</p>
            <div className="pillar-feats">
              <div className="pillar-feat">
                <span className="dot"></span>
                <div>
                  <b>Algorithmic Scatter-Gather Detection</b>
                  <span>Detects rapid multi-leg fund splitting and immediate reconsolidation within seconds.</span>
                </div>
              </div>
              <div className="pillar-feat">
                <span className="dot"></span>
                <div>
                  <b>Minimal Subgraph Extraction</b>
                  <span>Isolates precisely the 4–6 accounts and edges necessary for compliance review.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Step Pipeline Animation Modal */}
      {isPipelineRunning && (
        <div className="pipeline-overlay">
          <div className="pipeline-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="eyebrow">PROCESSING INGESTION PIPELINE</span>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '21px', marginTop: '4px' }}>
                  Analyzing Ingested Dataset
                </h3>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--blue)', fontWeight: 700 }}>
                {pipePercent}%
              </div>
            </div>

            <div className="pipe-steps">
              {pipelineSteps.map((stg, i) => {
                const stepNum = i + 1;
                const isStepActive = pipeStep === stepNum;
                const isStepDone = pipeStep > stepNum;

                return (
                  <div
                    key={i}
                    className={`pipe-step ${isStepActive ? 'active' : ''} ${isStepDone ? 'done' : ''}`}
                  >
                    <div className="pipe-step-dot">
                      {isStepDone ? '✓' : stepNum}
                    </div>
                    <div className="pipe-step-title">{stg.title}</div>
                    <div className="pipe-step-desc">{stg.desc}</div>
                  </div>
                );
              })}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-faint)', textAlign: 'center' }}>
              Constructing graph representations and routing to interactive dashboard…
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
