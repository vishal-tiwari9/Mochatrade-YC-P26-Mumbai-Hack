import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroCanvas } from '../../components/graph/HeroCanvas';
import { useDataset } from '../../context/DatasetContext';
import { ArrowRight, Upload } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { loadDemoDataset } = useDataset();

  const handleExploreDemo = () => {
    loadDemoDataset();
    navigate('/app/overview');
  };

  return (
    <div className="home-page-wrap">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="eyebrow">GRAPH-NATIVE MULE ACCOUNT DETECTION</span>
            <h1>
              Money laundering spreads<br />
              like a virus.<br />
              <span className="accent">Now it can be traced like one.</span>
            </h1>
            <p className="hero-sub">
              MuleNet runs contact tracing on illicit funds — mapping accounts, devices, and IP subnets into one living
              graph, catching mule networks before the first rupee moves, and handing compliance teams an evidence-ready
              case file instead of a vague alert.
            </p>
            <div className="hero-actions">
              <Link to="/app/input" className="btn btn-primary btn-lg" id="heroTryCustomBtn">
                <Upload size={16} />
                Try with your own dataset →
              </Link>
              <button className="btn btn-ghost btn-lg" id="heroLoadDemoBtn" onClick={handleExploreDemo}>
                Use Demo Dataset →
              </button>
            </div>
            <div className="hero-proof">
              <div>
                <b>128,406</b>
                <span>accounts monitored</span>
              </div>
              <div>
                <b>340ms</b>
                <span>avg. detection time</span>
              </div>
              <div>
                <b>94/100</b>
                <span>sample risk score, CASE-0417</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <HeroCanvas />
            <div className="hero-visual-tag">interactive topology — prototype feed</div>
            <div className="hero-visual-tag risk">● cluster flagged — scatter-gather pattern</div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <div className="strip">
        <div
          className="container"
          style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', width: '100%' }}
        >
          <span>HETEROGENEOUS GNN TOPOLOGY</span>
          <span>ZERO-DWELL VELOCITY SCORING</span>
          <span>GNNEXPLAINER SUBGRAPH ISOLATION</span>
          <span>RBI SOP-ALIGNED EVIDENCE DOSSIERS</span>
        </div>
      </div>

      {/* The Problem Section */}
      <section className="section" id="problem">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">THE PROBLEM</span>
            <h2>Mule networks move faster than the alerts meant to catch them</h2>
            <p>
              Legacy AML systems watch single accounts and score single transactions. Mule rings exploit exactly that
              blind spot — spreading funds across throwaway accounts, shared devices, and disposable SIMs faster than
              any human reviewer can connect the dots.
            </p>
          </div>
          <div className="stat-row">
            <div className="stat-card">
              <div className="n">&lt;60s</div>
              <div className="l">
                Typical dwell time in a scatter-gather ring — funds are gone before a rules-based threshold even triggers.
              </div>
            </div>
            <div className="stat-card">
              <div className="n">1-in-1</div>
              <div className="l">
                Account-to-account graphs miss the shared devices and IP subnets that actually link a mule cluster
                together.
              </div>
            </div>
            <div className="stat-card">
              <div className="n">"Black box"</div>
              <div className="l">
                A risk score with no explanation isn't enough to execute a legal freeze — compliance teams need the
                exact evidence trail.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Approach (Pillars) Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">THE APPROACH</span>
            <h2>Two pillars: see the whole outbreak, then explain the diagnosis</h2>
            <p>
              MuleNet treats a mule ring the way an epidemiologist treats an outbreak — map every contact, then isolate
              the exact chain of transmission before recommending containment.
            </p>
          </div>
          <div className="pillars">
            <div className="pillar p1">
              <div className="pillar-num">PILLAR 01</div>
              <h3>Heterogeneous Graph Neural Networks</h3>
              <p className="desc">
                A multi-dimensional topology across bank accounts, device fingerprints, IP subnets, and temporal
                transaction velocity — not just who paid whom.
              </p>
              <div className="pillar-feats">
                <div className="pillar-feat">
                  <span className="dot"></span>
                  <div>
                    <b>Pre-emptive detection</b>
                    <span>
                      A brand-new account on a device already linked to a known scammer's subnet gets flagged before a
                      single fraudulent transaction occurs.
                    </span>
                  </div>
                </div>
                <div className="pillar-feat">
                  <span className="dot"></span>
                  <div>
                    <b>Zero-dwell velocity scoring</b>
                    <span>
                      Legitimate users hold balances; mules disperse them. Dynamic edge weights recognize the geometric
                      signature of algorithmic scatter-gather in real time.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pillar p2">
              <div className="pillar-num">PILLAR 02</div>
              <h3>GNNExplainer &amp; Autonomous Evidence Dossiers</h3>
              <p className="desc">
                MuleNet eliminates the AI black-box problem. Every flagged cluster comes with the exact minimal subgraph
                responsible for its risk score.
              </p>
              <div className="pillar-feats">
                <div className="pillar-feat">
                  <span className="dot"></span>
                  <div>
                    <b>Evidence-ready dossiers</b>
                    <span>
                      Topology, dwell-time timestamps, and device hashes compile automatically into a clean, printable
                      evidentiary package for an RBI SOP-aligned freeze order.
                    </span>
                  </div>
                </div>
                <div className="pillar-feat">
                  <span className="dot"></span>
                  <div>
                    <b>Minimal subgraph isolation</b>
                    <span>
                      GNNExplainer isolates the specific accounts and transactions driving a risk score — not the whole
                      account graph, just the evidence that matters.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section" id="how-it-works" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">HOW IT WORKS</span>
            <h2>From raw transaction feed to compliance-ready case file</h2>
          </div>
          <div className="flow">
            <div className="flow-step">
              <div className="flow-num">01</div>
              <h4>Ingest the topology</h4>
              <p>
                Accounts, device fingerprints, IP subnets, and transaction timing stream into one heterogeneous graph —
                updated continuously.
              </p>
            </div>
            <div className="flow-step">
              <div className="flow-num">02</div>
              <h4>Score continuously</h4>
              <p>
                The H-GNN scores every node and edge on velocity, device overlap, and subnet history — flagging risk
                before dispersal completes.
              </p>
            </div>
            <div className="flow-step">
              <div className="flow-num">03</div>
              <h4>Isolate the evidence</h4>
              <p>
                Once a cluster crosses threshold, GNNExplainer extracts the minimal subgraph — the specific accounts and
                transactions responsible.
              </p>
            </div>
            <div className="flow-step">
              <div className="flow-num">04</div>
              <h4>Compile the dossier</h4>
              <p>
                Topology, dwell-time ledger, and device hashes are packaged into an evidence dossier compliance teams
                can act on immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Overview Section */}
      <section className="section" id="hgnn" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">TECHNICAL ARCHITECTURE</span>
            <h2>How the Heterogeneous GNN Detects What Humans Miss</h2>
          </div>

          <div className="tech-block">
            <div className="tech-text">
              <span className="eyebrow">PILLAR 01</span>
              <h3>Heterogeneous Graph Neural Networks</h3>
              <p>
                A standard AML graph only knows account-to-account transfers. MuleNet builds a richer, multi-dimensional
                topology — the same account can sit at the intersection of a device, a subnet, and a velocity pattern,
                and the model reasons across all four at once.
              </p>
              <ul>
                <li><b>Bank accounts</b> — balances, age, transaction history</li>
                <li><b>Device fingerprints</b> — the hardware and app signature behind a login</li>
                <li><b>IP subnets</b> — network-level clustering, including known mule infrastructure</li>
                <li><b>Temporal transaction velocity</b> — how fast money moves through a node, not just how much</li>
              </ul>
            </div>
            <div className="tech-visual">
              <div className="layers">
                <div className="layer-row">
                  <div className="layer-label">ACCOUNTS</div>
                  <div className="layer-nodes">
                    <div className="lnode acc hot">7734</div>
                    <div className="lnode acc hot">2210</div>
                    <div className="lnode acc hot">5589</div>
                    <div className="lnode acc hot">9081</div>
                    <div className="lnode acc" style={{ opacity: 0.4 }}>1123</div>
                  </div>
                </div>
                <div className="layer-row">
                  <div className="layer-label">DEVICES</div>
                  <div className="layer-nodes">
                    <div className="lnode dev hot">CF</div>
                    <div className="lnode dev" style={{ opacity: 0.4 }}>77</div>
                  </div>
                </div>
                <div className="layer-row">
                  <div className="layer-label">IP SUBNETS</div>
                  <div className="layer-nodes">
                    <div className="lnode net hot"><span>.58</span></div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-faint)', marginTop: '20px', fontFamily: 'var(--font-mono)', lineHeight: '1.6' }}>
                4 accounts share one device and one subnet — a pattern invisible to an account-only graph, obvious to a heterogeneous one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dwell Comparison Section */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tech-block reverse">
            <div className="tech-visual">
              <div className="dwell-compare">
                <div className="dwell-row legit">
                  <div className="dr-top"><span>Legitimate account — avg. dwell</span><span>6.2 days</span></div>
                  <div className="dwell-bar"><div style={{ width: '88%', background: 'var(--teal)' }}></div></div>
                </div>
                <div className="dwell-row mule">
                  <div className="dr-top"><span>Mule hub — CASE-0417</span><span>17 seconds</span></div>
                  <div className="dwell-bar"><div style={{ width: '4%', background: 'var(--red)' }}></div></div>
                </div>
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-faint)', marginTop: '22px', fontFamily: 'var(--font-mono)', lineHeight: '1.6' }}>
                Zero-dwell velocity scoring weights edges by how fast a node scatters incoming funds — not just whether the amount looks unusual.
              </p>
            </div>
            <div className="tech-text">
              <span className="eyebrow">PRE-EMPTIVE + REAL-TIME</span>
              <h3>Catch the pattern, not just the transaction</h3>
              <p>Two behaviors give a mule ring away before any single transaction looks suspicious on its own.</p>
              <ul>
                <li><b>Pre-emptive detection</b> — a brand-new account created on a device already linked to a known scammer's subnet is flagged at creation, before it ever moves a rupee.</li>
                <li><b>Zero-dwell velocity scoring</b> — legitimate users hold balances for days; mules scatter them in seconds. The H-GNN recognizes that geometric signature instantly, weighting edges dynamically as funds move.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* GNNExplainer Section */}
      <section className="section" id="explainer" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">PILLAR 02</span>
            <h2>GNNExplainer: from risk score to evidence-ready dossier</h2>
            <p>A risk score alone isn't actionable. When a cluster crosses threshold, GNNExplainer works backward through the graph to isolate the smallest set of accounts and transactions that actually explain the score.</p>
          </div>
          <div className="spec-grid">
            <div className="spec-card">
              <h4>01 — ISOLATE</h4>
              <p>From a graph of thousands of accounts, GNNExplainer extracts the minimal subgraph responsible for a flag — in CASE-0417, exactly 4 accounts and 5 transactions.</p>
            </div>
            <div className="spec-card">
              <h4>02 — ANNOTATE</h4>
              <p>Every edge in the isolated subgraph is stamped with its dwell time, amount, and timestamp — the raw material of a transaction ledger, not a model score.</p>
            </div>
            <div className="spec-card">
              <h4>03 — COMPILE</h4>
              <p>Topology, dwell-time ledger, and device hashes are assembled automatically into an evidence dossier — ready for regulatory freeze review.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Freeze Orders Section */}
      <section className="section" id="compliance" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">COMPLIANCE WORKFLOW</span>
            <h2>From flagged cluster to freeze order</h2>
            <p>A risk score isn't enough to act on. MuleNet's dossier is built to hand a compliance team exactly what they need to execute a freeze under RBI SOP-aligned mule-account procedures — nothing vague, nothing black-boxed.</p>
          </div>

          <div className="workflow">
            <div className="wf-step">
              <div className="wf-dot">01</div>
              <div className="wf-body">
                <h4>Cluster crosses risk threshold</h4>
                <p>The H-GNN's risk score for a cluster passes the configured threshold — in the sample case, 0.94, driven by zero-dwell velocity and shared device/subnet signals.</p>
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-dot">02</div>
              <div className="wf-body">
                <h4>Minimal subgraph isolated</h4>
                <p>GNNExplainer extracts only the accounts and transactions that explain the score — a compact, reviewable subgraph instead of the full account network.</p>
              </div>
            </div>
            <div className="wf-step crit">
              <div className="wf-dot">03</div>
              <div className="wf-body">
                <h4>Dossier auto-compiled</h4>
                <p>Topology, a dwell-time ledger per transaction, and device fingerprint records are assembled into one document — ready for compliance review immediately, no manual write-up required.</p>
              </div>
            </div>
            <div className="wf-step">
              <div className="wf-dot">04</div>
              <div className="wf-body">
                <h4>Compliance team acts</h4>
                <p>The dossier gives a compliance officer the specific evidence — not a probability score — needed to justify and execute an account freeze.</p>
              </div>
            </div>
          </div>

          {/* Sample Dossier Preview Card */}
          <div className="doc-preview" style={{ marginTop: '48px' }}>
            <div className="doc-bar">
              <div className="doc-dot"></div>
              <div className="doc-dot"></div>
              <div className="doc-dot"></div>
            </div>
            <div className="doc-body">
              <div className="doc-eyebrow">EVIDENTIARY DOSSIER · AUTO-COMPILED</div>
              <div className="doc-title">CASE-0417</div>
              <div className="doc-meta">risk score 94/100 · CRITICAL · 4 accounts · 5 transactions</div>
              <div className="doc-hr"></div>
              <div className="doc-sec-label">SUMMARY</div>
              <p className="doc-text">
                Algorithmic scatter-gather pattern: funds dispersed from a 14-day-old hub account into two legs and
                re-gathered into a 2-day-old cash-out account, all under one minute of dwell time. Hub and cash-out
                account share a device fingerprint linked to a known mule subnet.
              </p>
              <div className="doc-hr"></div>
              <div className="doc-sec-label">DWELL-TIME LEDGER</div>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th>LEG</th>
                    <th>FLOW</th>
                    <th>AMOUNT</th>
                    <th>DWELL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>TX1</td>
                    <td>ACC-7734 → ACC-2210</td>
                    <td>₹1,60,000</td>
                    <td className="hot">38s</td>
                  </tr>
                  <tr>
                    <td>TX2</td>
                    <td>ACC-7734 → ACC-5589</td>
                    <td>₹1,60,000</td>
                    <td className="hot">47s</td>
                  </tr>
                  <tr>
                    <td>TX3</td>
                    <td>ACC-7734 → ACC-9081</td>
                    <td>₹1,60,000</td>
                    <td className="hot">55s</td>
                  </tr>
                  <tr>
                    <td>TX4</td>
                    <td>ACC-2210 → ACC-9081</td>
                    <td>₹90,000</td>
                    <td className="hot">29s</td>
                  </tr>
                  <tr>
                    <td>TX5</td>
                    <td>ACC-5589 → ACC-9081</td>
                    <td>₹85,000</td>
                    <td className="hot">24s</td>
                  </tr>
                </tbody>
              </table>
              <div className="doc-hr"></div>
              <div className="doc-sec-label">DEVICE FINGERPRINT RECORD</div>
              <p className="doc-text">
                DEV-CF19A3 — linked accounts ACC-7734, ACC-9081 · first seen 2026-08-29 · prior mule cases CASE-0201, CASE-0388
              </p>
              <div className="doc-hash">dossier integrity hash · sha256:7a41c9889f02be3a10b42d87e14c3309</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '26px' }}>
            <button className="btn btn-primary" onClick={handleExploreDemo}>
              Open this case in the live dashboard →
            </button>
          </div>
        </div>
      </section>

      {/* Design Principles */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">DESIGN PRINCIPLES</span>
            <h2>Built for the standard a freeze order needs to meet</h2>
          </div>
          <div className="principles">
            <div className="principle">
              <h4>Minimal, not exhaustive</h4>
              <p>The dossier shows the smallest evidence set that explains the score — easier to review, and easier to defend, than a dump of the full account graph.</p>
            </div>
            <div className="principle">
              <h4>Timestamped and hashed</h4>
              <p>Every transaction carries its exact timestamp and dwell time; the dossier itself carries an integrity hash so it can't be silently altered after generation.</p>
            </div>
            <div className="principle">
              <h4>Aligned to existing SOPs</h4>
              <p>Structured to map directly onto the mule-account reporting and freeze provisions banks already operate under — not a new process to learn.</p>
            </div>
          </div>

          <div className="disclaimer-box" style={{ marginTop: '36px' }}>
            This page and all figures, case IDs, and dossier contents shown are simulated for a hackathon prototype demonstration. MuleNet does not currently connect to live banking data or generate real regulatory filings. References to RBI SOP alignment describe an intended design goal, not a certified or audited compliance claim.
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h3>Ready to evaluate MuleNet with your own data?</h3>
              <p>Upload a transaction dataset or explore the pre-computed scatter-gather mule ring demonstration (CASE-0417).</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/app/input" className="btn btn-primary btn-lg">
                Upload Dataset →
              </Link>
              <button className="btn btn-ghost btn-lg" onClick={handleExploreDemo}>
                Explore Demo Case →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
