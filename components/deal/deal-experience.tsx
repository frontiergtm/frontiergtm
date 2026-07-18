"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Check, ClipboardText, Crosshair, EnvelopeSimple, LinkSimple, LockKey, MagnifyingGlass, Printer, ShieldCheck, Sparkle, SpinnerGap, Target, UsersThree, WarningCircle } from "@phosphor-icons/react";
import type { DealPreview, DealReport } from "@/lib/deal/schema";
import styles from "@/app/deal/deal.module.css";

const meetingTypes = ["discovery", "executive", "technical", "renewal", "expansion", "partner", "other"] as const;
const progressSteps = ["Reading both companies", "Finding account triggers", "Testing the opportunity thesis", "Mapping the buying conversation", "Building the meeting plan"];
type Status = "idle" | "researching" | "preview" | "checkout" | "unlocking" | "unlocked" | "error";

function track(name: string, params: Record<string, string | number | boolean> = {}) { window.gtag?.("event", name, params); }

function Sources({ ids, sources }: { ids: string[]; sources: DealPreview["sources"] }) {
  const matches = ids.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as DealPreview["sources"];
  if (!matches.length) return <span className={styles.inference}>Hypothesis to validate</span>;
  return <span className={styles.sourceLinks}>{matches.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.title}>{source.id} <LinkSimple size={10} /></a>)}</span>;
}

export function DealExperience() {
  const [status, setStatus] = useState<Status>("idle");
  const [sellerUrl, setSellerUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [meetingType, setMeetingType] = useState<(typeof meetingTypes)[number]>("discovery");
  const [meetingGoal, setMeetingGoal] = useState("");
  const [context, setContext] = useState("");
  const [knownContacts, setKnownContacts] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [preview, setPreview] = useState<DealPreview | null>(null);
  const [report, setReport] = useState<DealReport | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== "researching") return;
    setProgress(0);
    const timer = window.setInterval(() => setProgress((current) => Math.min(current + 1, progressSteps.length - 1)), 3_000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get("report");
    const sessionId = params.get("session_id");
    if (!reportId) return;
    const stored = window.sessionStorage.getItem(`frontiergtm-deal:${reportId}`);
    if (stored) {
      try { setPreview(JSON.parse(stored)); } catch { /* A stale preview should not block paid unlock. */ }
    }
    if (!sessionId) {
      if (stored) setStatus("preview");
      return;
    }
    setStatus("unlocking");
    fetch("/api/deal/unlock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reportId, sessionId }) })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "We could not unlock the brief.");
        setReport(payload); setStatus("unlocked"); setError("");
        track("deal_unlocked", { source_count: payload.sources?.length ?? 0 });
        window.setTimeout(() => document.getElementById("deal-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      })
      .catch((caught) => { setError(caught instanceof Error ? caught.message : "We could not unlock the brief."); setStatus(stored ? "preview" : "error"); });
  }, []);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("researching"); setError(""); setPreview(null); setReport(null);
    track("deal_started", { meeting_type: meetingType });
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 118_000);
      const response = await fetch("/api/deal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sellerUrl, targetUrl, meetingType, meetingGoal, context, knownContacts, website: honeypot }), signal: controller.signal });
      window.clearTimeout(timeout);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The deal brief could not be completed.");
      setPreview(payload); setStatus("preview");
      window.sessionStorage.setItem(`frontiergtm-deal:${payload.reportId}`, JSON.stringify(payload));
      window.history.replaceState({}, "", `/deal?report=${encodeURIComponent(payload.reportId)}`);
      track("deal_preview_completed", { source_count: payload.sources?.length ?? 0, confidence: payload.accountThesis?.confidence || "unknown" });
      window.setTimeout(() => document.getElementById("deal-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === "AbortError" ? "The research took too long. Please try again." : caught instanceof Error ? caught.message : "The deal brief could not be completed.");
      setStatus("error"); track("deal_failed", { meeting_type: meetingType });
    }
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!preview) return;
    setStatus("checkout"); setError("");
    try {
      const response = await fetch("/api/deal/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reportId: preview.reportId, email, website: honeypot }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Checkout could not start.");
      track("deal_checkout_started", { target: preview.identity.targetName });
      window.location.assign(payload.url);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Checkout could not start."); setStatus("preview"); }
  }

  async function copyBrief() {
    if (!report) return;
    const text = `${report.title}\n\n${report.accountThesis.oneLine}\n\nWhy them\n${report.accountThesis.whyThem}\n\nWhy now\n${report.accountThesis.whyNow}\n\nDiscovery questions\n${report.discoveryQuestions.map((item, index) => `${index + 1}. ${item.question}`).join("\n")}\n\nNext step\n${report.meetingPlan.desiredNextStep}`;
    await navigator.clipboard.writeText(text); setCopied(true); track("deal_brief_copied"); window.setTimeout(() => setCopied(false), 1_800);
  }

  const visible = report || preview;
  return <section className={styles.experience}>
    <div className={styles.briefShell}>
      <div className={styles.formIntro}><p className={styles.stepLabel}>Frame the opportunity</p><h2>Build an account intelligence brief</h2><p>Give Deal Intelligence the two companies and the meeting you need to win.</p></div>
      <form className={styles.dealForm} onSubmit={generate}>
        <div className={styles.formGrid}>
          <label><span>Your company website</span><input value={sellerUrl} onChange={(event) => setSellerUrl(event.target.value)} placeholder="yourcompany.ai" required maxLength={500} /></label>
          <label><span>Target account website</span><input value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} placeholder="target.com" required maxLength={500} /></label>
        </div>
        <div className={styles.formGrid}>
          <label><span>Meeting type</span><select value={meetingType} onChange={(event) => setMeetingType(event.target.value as typeof meetingType)}>{meetingTypes.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>
          <label><span>Known contact or role <em>optional</em></span><input value={knownContacts} onChange={(event) => setKnownContacts(event.target.value)} placeholder="VP Infrastructure, Jane Doe" maxLength={500} /></label>
        </div>
        <label><span>What do you need this meeting to accomplish?</span><textarea value={meetingGoal} onChange={(event) => setMeetingGoal(event.target.value)} placeholder="Validate whether inference cost and deployment speed are priorities, and earn a technical follow-up." required minLength={10} maxLength={500} /></label>
        <label><span>What do you already know? <em>optional, but useful</em></span><textarea value={context} onChange={(event) => setContext(event.target.value)} placeholder="How the opportunity started, what has been said, current alternatives, constraints, or concerns." maxLength={1500} /></label>
        <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>
        <button className={styles.dealButton} type="submit" disabled={status === "researching" || !sellerUrl.trim() || !targetUrl.trim() || meetingGoal.trim().length < 10}>{status === "researching" ? <><SpinnerGap className={styles.spinner} size={20} /> Researching the account</> : <>Generate free preview <ArrowRight size={18} weight="bold" /></>}</button>
        <p className={styles.formNote}><ShieldCheck size={16} /> Public sources only. No CRM access required. Full brief is $39 only after you see the preview.</p>
      </form>
      {status === "researching" && <div className={styles.progressPanel} aria-live="polite"><div><Sparkle size={19} weight="fill" />{progressSteps[progress]}</div><div className={styles.progressTrack}><span style={{ width: `${18 + progress * 19}%` }} /></div></div>}
      {error && <div className={styles.errorMessage} role="alert"><WarningCircle size={19} weight="fill" /><span>{error}</span></div>}
    </div>

    {visible && <div className={styles.results} id="deal-results">
      <header className={styles.reportHeader}><div><p className={styles.stepLabel}>{report ? "Paid account brief" : "Free account preview"}</p><h2>{visible.title}</h2><p>{visible.identity.sellerName} → {visible.identity.targetName} · Generated {new Date(visible.generatedAt).toLocaleDateString()}</p></div><div className={styles.fitBadge}><span>{visible.accountThesis.confidence} confidence</span><strong>{report ? report.opportunity.fit : "Thesis ready"}</strong></div></header>
      <section className={styles.thesis}><Crosshair size={27} weight="fill" /><div><p className={styles.stepLabel}>Account thesis</p><h3>{visible.accountThesis.oneLine}</h3><div><p><strong>Why them</strong>{visible.accountThesis.whyThem}</p><p><strong>Why now</strong>{visible.accountThesis.whyNow}</p></div></div></section>
      {!report && <>
        <div className={styles.previewGrid}>
          {preview!.triggerEvents.map((item) => <article key={item.headline}><span>{item.confidence} confidence</span><h3>{item.headline}</h3><p>{item.whatHappened}</p><strong>Commercial implication</strong><p>{item.commercialImplication}</p><Sources ids={item.sourceIds} sources={preview!.sources} /></article>)}
        </div>
        <section className={styles.openingQuestion}><Target size={23} /><div><p className={styles.stepLabel}>Question worth opening with</p><h3>“{preview!.preview.openingQuestion}”</h3></div></section>
        <section className={styles.paywall}><div><p className={styles.stepLabel}>Your complete brief is ready</p><h2>Turn the signal into a meeting you can run.</h2><ul><li><Check size={15} />Priorities: observed vs. inferred</li><li><Check size={15} />Opportunity fit and non-fit risks</li><li><Check size={15} />Buying committee hypotheses</li><li><Check size={15} />Timed meeting plan and discovery questions</li><li><Check size={15} />Objections, proof gaps, and follow-up email</li></ul></div><form onSubmit={checkout}><div className={styles.price}><span>One complete account brief</span><strong>$39</strong><small>No subscription. Secure checkout by Stripe.</small></div><label><span>Work email for your receipt</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.ai" required /></label><button disabled={status === "checkout"}>{status === "checkout" ? <><SpinnerGap className={styles.spinner} /> Opening secure checkout</> : <><LockKey size={17} weight="bold" /> Unlock the full brief</>}</button><p>Payment unlocks this report immediately. The report remains available in this browser for seven days.</p></form></section>
      </>}

      {report && <div className={styles.fullReport}>
        <div className={styles.reportTools}><span><Check size={14} weight="bold" /> Complete brief unlocked</span><div><button onClick={copyBrief}><ClipboardText size={15} />{copied ? "Copied" : "Copy"}</button><button onClick={() => window.print()}><Printer size={15} />Print</button></div></div>
        <section className={styles.reportSection}><p>01</p><div><p className={styles.stepLabel}>Account motion</p><h2>Triggers and priorities</h2><div className={styles.twoColumns}><div>{report.triggerEvents.map((item) => <article key={item.headline}><small>{item.confidence} confidence</small><h3>{item.headline}</h3><p>{item.whatHappened}</p><strong>{item.commercialImplication}</strong><Sources ids={item.sourceIds} sources={report.sources} /></article>)}</div><div>{report.priorities.map((item) => <article key={item.priority}><small>{item.status}</small><h3>{item.priority}</h3><p>{item.evidence}</p><strong>{item.relevance}</strong><Sources ids={item.sourceIds} sources={report.sources} /></article>)}</div></div></div></section>
        <section className={styles.reportSection}><p>02</p><div><p className={styles.stepLabel}>Opportunity test</p><h2>{report.opportunity.fit} fit—not assumed fit</h2><div className={styles.opportunity}><article><h3>Problem hypothesis</h3><p>{report.opportunity.problemHypothesis}</p><h3>Value hypothesis</h3><p>{report.opportunity.valueHypothesis}</p><strong>{report.opportunity.fitRationale}</strong></article><article><h3>Proof to bring</h3><ul>{report.opportunity.proofToBring.map((item) => <li key={item}><Check size={13} />{item}</li>)}</ul><h3>Proof gaps</h3><ul>{report.opportunity.proofGaps.map((item) => <li key={item}><WarningCircle size={13} />{item}</li>)}</ul></article><article><h3>Non-fit risks</h3><ul>{report.opportunity.nonFitRisks.map((item) => <li key={item}>{item}</li>)}</ul></article></div></div></section>
        <section className={styles.reportSection}><p>03</p><div><p className={styles.stepLabel}>People and politics</p><h2>Buying committee hypotheses</h2><div className={styles.committee}>{report.buyingCommittee.map((item) => <article key={item.role}><UsersThree size={19} /><small>{item.status}</small><h3>{item.role}</h3><p>{item.likelyConcern}</p><strong>{item.message}</strong></article>)}</div></div></section>
        <section className={styles.reportSection}><p>04</p><div><p className={styles.stepLabel}>Meeting plan</p><h2>A conversation designed to earn the next step</h2><blockquote>{report.meetingPlan.openingPointOfView}</blockquote><div className={styles.agenda}>{report.meetingPlan.agenda.map((item) => <article key={`${item.minute}-${item.objective}`}><span>{item.minute}</span><div><h3>{item.objective}</h3><p>{item.move}</p></div></article>)}</div><div className={styles.nextStep}><p><strong>Desired next step</strong>{report.meetingPlan.desiredNextStep}</p><p><strong>Walk-away signal</strong>{report.meetingPlan.walkAwaySignal}</p></div></div></section>
        <section className={styles.reportSection}><p>05</p><div><p className={styles.stepLabel}>Discovery</p><h2>Questions that expose the real deal</h2><div className={styles.questions}>{report.discoveryQuestions.map((item, index) => <article key={item.question}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.question}</h3><p><strong>Why ask:</strong> {item.whyAsk}</p><p><strong>Listen for:</strong> {item.listenFor}</p></div></article>)}</div></div></section>
        <section className={styles.reportSection}><p>06</p><div><p className={styles.stepLabel}>Resistance and uncertainty</p><h2>Objections, responses, and unknowns</h2><div className={styles.objections}>{report.objections.map((item) => <article key={item.objection}><h3>{item.objection}</h3><p>{item.response}</p><strong>Proof needed: {item.proofNeeded}</strong></article>)}</div><div className={styles.unknowns}><strong>Do not leave without learning:</strong>{report.unknowns.map((item) => <span key={item}>{item}</span>)}</div></div></section>
        <section className={styles.emailDraft}><EnvelopeSimple size={25} /><div><p className={styles.stepLabel}>Ready-to-edit follow-up</p><h2>{report.followUpEmail.subject}</h2><pre>{report.followUpEmail.body}</pre></div></section>
        <section className={styles.evidence}><ShieldCheck size={24} /><div><p className={styles.stepLabel}>Evidence ledger</p><h2>{report.sources.length} public sources · {report.evidenceCoverage.confidence} confidence</h2><p>{report.evidenceCoverage.summary}</p>{report.evidenceCoverage.limitations.length > 0 && <ul>{report.evidenceCoverage.limitations.map((item) => <li key={item}>{item}</li>)}</ul>}<div>{report.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><span>{source.id}</span><p><strong>{source.title}</strong><small>{source.domain} · {source.purpose}</small></p><ArrowRight size={13} /></a>)}</div></div></section>
        <section className={styles.commercialCta}><div><p className={styles.stepLabel}>One account is the wedge</p><h2>Build the intelligence system around your pipeline.</h2><p>FrontierGTM can adapt this workflow to your ICP, connect it to your team’s tools, and help turn account evidence into repeatable sales motion.</p></div><a href={`mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`Deal Intelligence system for ${report.identity.sellerName}`)}`}>Build this for our team <ArrowRight size={16} /></a></section>
      </div>}
    </div>}

    {!visible && status !== "researching" && <div className={styles.howItWorks}><article><MagnifyingGlass size={28} /><span>01</span><h3>Research the account</h3><p>Read the companies and search for current priorities, investments, launches, and trigger events.</p></article><article><Crosshair size={28} /><span>02</span><h3>Test the fit</h3><p>Separate observed evidence from hypotheses—and say when the opportunity is weak or unclear.</p></article><article><Target size={28} /><span>03</span><h3>Run the meeting</h3><p>Turn the thesis into questions, proof, objection handling, and a concrete next step.</p></article></div>}
  </section>;
}
