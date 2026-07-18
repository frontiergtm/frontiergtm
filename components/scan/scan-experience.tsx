"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle,
  ClipboardText,
  DownloadSimple,
  EnvelopeSimple,
  LinkSimple,
  MagnifyingGlass,
  Printer,
  ShieldCheck,
  Sparkle,
  SpinnerGap,
  Target,
  WarningCircle,
} from "@phosphor-icons/react";
import type { ScanReport } from "@/lib/scan/schema";
import { downloadScanPdf } from "@/lib/pdf/agent-report-pdf";
import styles from "@/app/scan/scan.module.css";

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, eventParams?: Record<string, string | number | boolean>) => void;
  }
}

const priorities = [
  { value: "general", label: "General outside-in diagnosis" },
  { value: "positioning", label: "Clarify positioning" },
  { value: "launch", label: "Prepare a launch" },
  { value: "conversion", label: "Improve website conversion" },
  { value: "competitive", label: "Understand competitors" },
  { value: "market-entry", label: "Enter a new market" },
] as const;

const roles = [
  { value: "executive", label: "Founder or executive" },
  { value: "marketing", label: "Marketing or GTM" },
  { value: "product", label: "Product" },
  { value: "sales", label: "Sales" },
  { value: "investor", label: "Investor or advisor" },
  { value: "other", label: "Other" },
] as const;

const progressSteps = [
  "Reading the public company story",
  "Identifying buyers, category, and claims",
  "Checking proof and conversion signals",
  "Connecting market evidence",
  "Prioritizing GTM moves",
];

type Status = "idle" | "scanning" | "preview" | "unlocking" | "unlocked" | "error";

function track(eventName: string, params: Record<string, string | number | boolean> = {}) {
  window.gtag?.("event", eventName, params);
}

type PublicScanSource = ScanReport["sources"][number];

function SourceLinks({ ids, sources }: { ids: string[]; sources: PublicScanSource[] }) {
  const matches = ids.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as PublicScanSource[];
  if (!matches.length) return <span className={styles.noCitation}>Outside-in inference</span>;
  return (
    <span className={styles.sourceLinks}>
      {matches.map((source) => (
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer" onClick={() => track("scan_citation_clicked", { source_kind: source.kind })}>
          {source.id} <LinkSimple size={11} />
          <span className={styles.srOnly}>{source.title}</span>
        </a>
      ))}
    </span>
  );
}

function FindingCard({
  finding,
  sources,
}: {
  finding: ScanReport["strengths"][number];
  sources: PublicScanSource[];
}) {
  return (
    <article className={styles.findingCard}>
      <div className={styles.findingMeta}>
        <span className={finding.factOrInference === "fact" ? styles.factBadge : styles.inferenceBadge}>
          {finding.factOrInference}
        </span>
        <span>{finding.confidence} confidence</span>
      </div>
      <h4>{finding.title}</h4>
      <p>{finding.observation}</p>
      <div className={styles.whyItMatters}>
        <strong>Why it matters</strong>
        <span>{finding.whyItMatters}</span>
      </div>
      <SourceLinks ids={finding.sourceIds} sources={sources} />
    </article>
  );
}

export function ScanExperience() {
  const [status, setStatus] = useState<Status>("idle");
  const [url, setUrl] = useState("");
  const [priority, setPriority] = useState<(typeof priorities)[number]["value"]>("general");
  const [competitor, setCompetitor] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("executive");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== "scanning") return;
    setProgress(0);
    const timer = window.setInterval(() => setProgress((current) => Math.min(current + 1, progressSteps.length - 1)), 2_200);
    return () => window.clearInterval(timer);
  }, [status]);

  async function runScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("scanning");
    setError("");
    setReport(null);
    track("scan_started", { priority });

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 110_000);
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, priority, competitor: competitor || undefined, website: honeypot }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The scan could not be completed.");
      setReport(payload as ScanReport);
      setStatus("preview");
      track("scan_completed", { priority, source_count: payload.sources?.length ?? 0, target_fit: payload.company?.targetFit ?? "unknown" });
      window.setTimeout(() => document.getElementById("scan-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (caught) {
      const message = caught instanceof DOMException && caught.name === "AbortError"
        ? "The analysis took too long. Please try again."
        : caught instanceof Error ? caught.message : "The scan could not be completed.";
      setError(message);
      setStatus("error");
      track("scan_failed", { priority });
    }
  }

  async function unlockReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!report) return;
    setStatus("unlocking");
    setError("");
    try {
      const response = await fetch("/api/scan/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          role,
          priority,
          companyUrl: report.company.url,
          companyName: report.company.name,
          executiveReadout: report.executiveReadout,
          website: honeypot,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "We could not unlock the report.");
      setStatus("unlocked");
      track("scan_unlocked", { role, priority, target_fit: report.company.targetFit });
      track("generate_lead", { source: "frontiergtm_scan", role, priority });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not unlock the report.");
      setStatus("preview");
    }
  }

  async function copyReadout() {
    if (!report) return;
    await navigator.clipboard.writeText(`${report.company.name} — FrontierGTM Scan\n\n${report.executiveReadout}\n\n${report.actions.map((action, index) => `${index + 1}. ${action.title}: ${action.recommendation}`).join("\n")}`);
    setCopied(true);
    track("scan_report_copied");
    window.setTimeout(() => setCopied(false), 1_800);
  }

  const auditHref = report
    ? `mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`FrontierGTM audit for ${report.company.name}`)}&body=${encodeURIComponent(`I ran a FrontierGTM Scan for ${report.company.url} and would like the $495 human-reviewed Narrative & Market Audit.`)}`
    : "mailto:ryan@frontiergtm.ai";

  return (
    <section className={styles.experience}>
      <div className={styles.scanShell}>
        <div className={styles.formIntro}>
          <p className={styles.stepLabel}>Start with one URL</p>
          <h2>Run your free GTM scan</h2>
          <p>No account required. The initial scan uses public evidence and usually takes under a minute.</p>
        </div>

        <form className={styles.scanForm} onSubmit={runScan}>
          <label className={styles.primaryField}>
            <span>Company website</span>
            <div className={styles.urlInput}>
              <MagnifyingGlass size={21} aria-hidden="true" />
              <input type="text" inputMode="url" autoComplete="url" placeholder="company.ai" value={url} onChange={(event) => setUrl(event.target.value)} required disabled={status === "scanning"} />
            </div>
          </label>
          <div className={styles.formGrid}>
            <label>
              <span>What are you trying to improve?</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)} disabled={status === "scanning"}>
                {priorities.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Competitor or alternative <em>optional</em></span>
              <input type="text" placeholder="Company or product name" value={competitor} onChange={(event) => setCompetitor(event.target.value)} maxLength={200} disabled={status === "scanning"} />
            </label>
          </div>
          <label className={styles.honeypot} aria-hidden="true">
            Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
          </label>
          <button className={styles.scanButton} type="submit" disabled={status === "scanning" || !url.trim()}>
            {status === "scanning" ? <><SpinnerGap className={styles.spinner} size={20} /> Scanning the public story</> : <>Run free scan <ArrowRight size={18} weight="bold" /></>}
          </button>
          <p className={styles.formNote}><ShieldCheck size={16} /> Outside-in analysis only. We do not access private company systems.</p>
        </form>

        {status === "scanning" && (
          <div className={styles.progressPanel} aria-live="polite">
            <div className={styles.progressHeader}><Sparkle size={19} weight="fill" /><span>{progressSteps[progress]}</span></div>
            <div className={styles.progressTrack}><span style={{ width: `${18 + progress * 19}%` }} /></div>
            <div className={styles.progressSteps}>
              {progressSteps.map((step, index) => <span key={step} className={index <= progress ? styles.progressActive : ""}>{index < progress ? <Check size={13} weight="bold" /> : index + 1}</span>)}
            </div>
          </div>
        )}

        {error && <div className={styles.errorMessage} role="alert"><WarningCircle size={19} weight="fill" /><span>{error}</span></div>}
      </div>

      {report && (
        <div className={styles.results} id="scan-results">
          <div className={styles.reportHeader}>
            <div>
              <p className={styles.stepLabel}>Outside-in GTM snapshot</p>
              <h2>{report.company.name}</h2>
              <p>{report.company.description}</p>
            </div>
            <div className={styles.reportHeaderMeta}>
              <span>{report.company.category}</span>
              <span>{report.company.targetFit === "strong" ? "FrontierGTM core market" : `${report.company.targetFit} fit`}</span>
              <span>{report.evidenceCoverage.confidence} evidence confidence</span>
            </div>
          </div>

          <div className={styles.snapshotGrid}>
            <article><CheckCircle size={23} weight="fill" /><span>What lands clearly</span><p>{report.snapshot.whatLandsClearly}</p></article>
            <article><WarningCircle size={23} weight="fill" /><span>What remains unclear</span><p>{report.snapshot.whatRemainsUnclear}</p></article>
            <article className={styles.leverageCard}><Target size={23} weight="fill" /><span>Highest-leverage move</span><p>{report.snapshot.highestLeverageMove}</p></article>
          </div>

          {status !== "unlocked" ? (
            <div className={styles.unlockSection}>
              <div className={styles.unlockCopy}>
                <p className={styles.stepLabel}>Your complete scan is ready</p>
                <h3>Unlock the evidence, narrative gaps, and three priority moves.</h3>
                <ul>
                  <li><Check size={16} weight="bold" /> Executive readout</li>
                  <li><Check size={16} weight="bold" /> Buyer and market-story analysis</li>
                  <li><Check size={16} weight="bold" /> Positioning, proof, and conversion findings</li>
                  <li><Check size={16} weight="bold" /> Three concrete GTM actions with examples</li>
                </ul>
              </div>
              <form className={styles.unlockForm} onSubmit={unlockReport}>
                <label><span>Work email</span><input type="email" autoComplete="email" placeholder="you@company.ai" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                <label><span>Your role</span><select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>{roles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <button type="submit" disabled={status === "unlocking"}>{status === "unlocking" ? <><SpinnerGap className={styles.spinner} size={18} /> Unlocking</> : <>Unlock full report <ArrowRight size={17} weight="bold" /></>}</button>
                <p>FrontierGTM may follow up about this scan. No mailing-list enrollment without permission.</p>
              </form>
            </div>
          ) : (
            <div className={styles.fullReport}>
              <div className={styles.reportTools}>
                <span>Full report unlocked</span>
                <div>
                  <button onClick={copyReadout} type="button"><ClipboardText size={16} /> {copied ? "Copied" : "Copy summary"}</button>
                  <button onClick={() => { void downloadScanPdf(report); track("scan_report_pdf_downloaded"); }} type="button"><DownloadSimple size={16} /> Download PDF</button>
                  <button onClick={() => { window.print(); track("scan_report_printed"); }} type="button"><Printer size={16} /> Print</button>
                </div>
              </div>

              <section className={styles.reportSection}>
                <div className={styles.sectionNumber}>01</div><div><p className={styles.stepLabel}>Executive readout</p><h3>What the public story communicates</h3><p className={styles.executiveReadout}>{report.executiveReadout}</p></div>
              </section>

              <section className={styles.reportSection}>
                <div className={styles.sectionNumber}>02</div>
                <div>
                  <p className={styles.stepLabel}>Market story</p><h3>The apparent GTM narrative</h3>
                  <dl className={styles.storyGrid}>
                    {Object.entries(report.marketStory).map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{value}</dd></div>)}
                  </dl>
                </div>
              </section>

              <section className={styles.reportSection}>
                <div className={styles.sectionNumber}>03</div>
                <div>
                  <p className={styles.stepLabel}>Buyer clarity</p><h3>Who appears to buy—and why</h3>
                  <dl className={styles.buyerGrid}>
                    <div><dt>Likely buyer</dt><dd>{report.buyerClarity.likelyBuyer}</dd></div>
                    <div><dt>Likely user</dt><dd>{report.buyerClarity.likelyUser}</dd></div>
                    <div><dt>Trigger</dt><dd>{report.buyerClarity.trigger}</dd></div>
                    <div><dt>Ambiguity</dt><dd>{report.buyerClarity.ambiguity}</dd></div>
                  </dl>
                </div>
              </section>

              {([
                ["04", "Positioning strengths", "What is already working", report.strengths],
                ["05", "Narrative gaps", "Where the story loses force", report.gaps],
                ["06", "Proof and conversion", "Whether the story earns the next step", report.proofAndConversion],
              ] as const).map(([number, kicker, heading, findings]) => (
                <section className={styles.reportSection} key={number}>
                  <div className={styles.sectionNumber}>{number}</div>
                  <div><p className={styles.stepLabel}>{kicker}</p><h3>{heading}</h3><div className={styles.findingsGrid}>{findings.map((finding) => <FindingCard key={finding.title} finding={finding} sources={report.sources} />)}</div></div>
                </section>
              ))}

              <section className={`${styles.reportSection} ${styles.actionsSection}`}>
                <div className={styles.sectionNumber}>07</div>
                <div>
                  <p className={styles.stepLabel}>Priority actions</p><h3>The three moves FrontierGTM would make first</h3>
                  <div className={styles.actionsList}>
                    {report.actions.map((action, index) => (
                      <article key={action.title}>
                        <span className={styles.actionIndex}>0{index + 1}</span>
                        <div><div className={styles.actionMeta}><span>{action.impact} impact</span><span>{action.effort} effort</span></div><h4>{action.title}</h4><p>{action.recommendation}</p><strong>Why now</strong><p>{action.rationale}</p><div className={styles.actionExample}><strong>What this could look like</strong><span>{action.example}</span></div><SourceLinks ids={action.sourceIds} sources={report.sources} /></div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.evidenceSection}>
                <div><ShieldCheck size={25} weight="fill" /><div><p className={styles.stepLabel}>Evidence ledger</p><h3>{report.evidenceCoverage.confidence} confidence from {report.sources.length} public {report.sources.length === 1 ? "source" : "sources"}</h3><p>{report.evidenceCoverage.summary}</p></div></div>
                {report.evidenceCoverage.limitations.length > 0 && <ul>{report.evidenceCoverage.limitations.map((item) => <li key={item}>{item}</li>)}</ul>}
                <div className={styles.sourceLedger}>{report.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer"><span>{source.id}</span><div><strong>{source.title}</strong><small>{source.kind === "company" ? "First-party source" : "External source"}</small></div><ArrowRight size={14} /></a>)}</div>
              </section>

              <section className={styles.commercialCta}>
                <div>
                  <p className={styles.stepLabel}>Want the inside-out version?</p>
                  <h3>Turn this scan into a GTM decision.</h3>
                  <p>A machine can inspect the public story. FrontierGTM can pressure-test it against your product, buyers, competitors, and current priorities.</p>
                </div>
                <div className={styles.commercialOptions}>
                  <a className={styles.auditOption} href={auditHref} onClick={() => track("scan_audit_interest", { target_fit: report.company.targetFit })}><span>Founding beta · $495</span><strong>Human-reviewed Narrative & Market Audit</strong><small>Deeper research, annotated messaging critique, 30-day action plan, and a 30-minute readout.</small><ArrowRight size={17} weight="bold" /></a>
                  <a className={styles.consultOption} href={`mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`GTM working session for ${report.company.name}`)}`} onClick={() => track("scan_consultation_interest", { target_fit: report.company.targetFit })}><EnvelopeSimple size={19} /><strong>Discuss the scan with Ryan</strong><span>Start a consulting conversation</span></a>
                </div>
              </section>

              <div className={styles.feedback}>
                <span>Was this outside-in scan useful?</span>
                <button type="button" onClick={() => track("scan_feedback", { useful: true })}>Yes</button>
                <button type="button" onClick={() => track("scan_feedback", { useful: false })}>Not yet</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!report && status !== "scanning" && (
        <div className={styles.howItWorks}>
          <article><span>01</span><MagnifyingGlass size={28} /><h3>Read the evidence</h3><p>FrontierGTM examines the company’s public website and available market sources.</p></article>
          <article><span>02</span><Sparkle size={28} /><h3>Separate signal from inference</h3><p>Every conclusion is labeled by confidence and connected to the evidence behind it.</p></article>
          <article><span>03</span><Target size={28} /><h3>Prioritize the next moves</h3><p>The report ends with three specific actions—not a pile of generic recommendations.</p></article>
        </div>
      )}
    </section>
  );
}
