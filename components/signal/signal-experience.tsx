"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Binoculars, Check, ClipboardText, EnvelopeSimple, LinkSimple, Newspaper, Printer, ShieldCheck, Sparkle, SpinnerGap, Target, TrendUp, WarningCircle } from "@phosphor-icons/react";
import type { SignalReport } from "@/lib/signal/schema";
import styles from "@/app/signal/signal.module.css";

const roles = ["executive", "marketing", "product", "sales", "strategy", "investor", "other"] as const;
const progressSteps = ["Searching the market", "Checking recent moves", "Connecting competitive signals", "Testing strategic implications", "Prioritizing actions"];
type Status = "idle" | "researching" | "preview" | "unlocking" | "unlocked" | "error";

function track(name: string, params: Record<string, string | number | boolean> = {}) { window.gtag?.("event", name, params); }

function Sources({ ids, sources }: { ids: string[]; sources: SignalReport["sources"] }) {
  const matches = ids.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as SignalReport["sources"];
  if (!matches.length) return <span className={styles.inference}>Strategic inference</span>;
  return <span className={styles.sourceLinks}>{matches.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.title}>{source.id} <LinkSimple size={10} /></a>)}</span>;
}

export function SignalExperience() {
  const [status, setStatus] = useState<Status>("idle");
  const [company, setCompany] = useState("");
  const [market, setMarket] = useState("");
  const [question, setQuestion] = useState("");
  const [watchlistText, setWatchlistText] = useState("");
  const [horizon, setHorizon] = useState<"7d" | "30d" | "90d">("30d");
  const [honeypot, setHoneypot] = useState("");
  const [report, setReport] = useState<SignalReport | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("executive");
  const [weeklyInterest, setWeeklyInterest] = useState(true);
  const [copied, setCopied] = useState(false);

  const watchlist = watchlistText.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 3);

  useEffect(() => {
    if (status !== "researching") return;
    setProgress(0);
    const timer = window.setInterval(() => setProgress((current) => Math.min(current + 1, progressSteps.length - 1)), 2_500);
    return () => window.clearInterval(timer);
  }, [status]);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("researching"); setError(""); setReport(null);
    track("signal_started", { horizon, watchlist_count: watchlist.length });
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 115_000);
      const response = await fetch("/api/signal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ company, market, question, watchlist, horizon, website: honeypot }), signal: controller.signal });
      window.clearTimeout(timeout);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The brief could not be completed.");
      setReport(payload); setStatus("preview");
      track("signal_completed", { horizon, source_count: payload.sources?.length ?? 0 });
      window.setTimeout(() => document.getElementById("signal-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === "AbortError" ? "The research took too long. Please try again." : caught instanceof Error ? caught.message : "The brief could not be completed.");
      setStatus("error"); track("signal_failed", { horizon });
    }
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!report) return;
    setStatus("unlocking"); setError("");
    try {
      const response = await fetch("/api/signal/unlock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, role, company, market, question, reportTitle: report.title, executiveSummary: report.executiveSummary, watchlist, horizon, weeklyInterest, website: honeypot }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "We could not unlock the brief.");
      setStatus("unlocked"); track("signal_unlocked", { role, horizon, weekly_interest: weeklyInterest }); track("generate_lead", { source: "frontiergtm_signal" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not unlock the brief."); setStatus("preview"); }
  }

  async function copyBrief() {
    if (!report) return;
    const text = `${report.title}\n\n${report.executiveSummary}\n\nDevelopments\n${report.developments.map((item, i) => `${i + 1}. ${item.headline}: ${item.whatChanged}`).join("\n")}\n\nActions\n${report.actions.map((item, i) => `${i + 1}. ${item.title}: ${item.action}`).join("\n")}`;
    await navigator.clipboard.writeText(text); setCopied(true); track("signal_brief_copied"); window.setTimeout(() => setCopied(false), 1_800);
  }

  return (
    <section className={styles.experience}>
      <div className={styles.briefShell}>
        <div className={styles.formIntro}><p className={styles.stepLabel}>Frame the decision</p><h2>Generate a market move brief</h2><p>Tell Signal what market you are watching and what decision you need to make.</p></div>
        <form className={styles.signalForm} onSubmit={generate}>
          <div className={styles.formGrid}>
            <label><span>Your company or product</span><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="FrontierGTM" required maxLength={120} /></label>
            <label><span>Market or category</span><input value={market} onChange={(e) => setMarket(e.target.value)} placeholder="AI inference platforms" required maxLength={160} /></label>
          </div>
          <label className={styles.questionField}><span>The strategic question</span><textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What changed in this market, and which move should we make next?" required minLength={10} maxLength={400} /></label>
          <div className={styles.formGrid}>
            <label><span>Companies to watch <em>up to 3, comma-separated</em></span><input value={watchlistText} onChange={(e) => setWatchlistText(e.target.value)} placeholder="Together AI, Fireworks AI, Groq" maxLength={320} /></label>
            <label><span>Research window</span><select value={horizon} onChange={(e) => setHorizon(e.target.value as typeof horizon)}><option value="7d">Past 7 days</option><option value="30d">Past 30 days</option><option value="90d">Past 90 days</option></select></label>
          </div>
          <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
          <button className={styles.signalButton} type="submit" disabled={status === "researching" || !company.trim() || !market.trim() || question.trim().length < 10}>{status === "researching" ? <><SpinnerGap className={styles.spinner} size={20} /> Researching live signals</> : <>Generate free brief <ArrowRight size={18} weight="bold" /></>}</button>
          <p className={styles.formNote}><ShieldCheck size={16} /> Public sources only. Every material development links to evidence.</p>
        </form>
        {status === "researching" && <div className={styles.progressPanel} aria-live="polite"><div><Sparkle size={19} weight="fill" />{progressSteps[progress]}</div><div className={styles.progressTrack}><span style={{ width: `${18 + progress * 19}%` }} /></div></div>}
        {error && <div className={styles.errorWrap}><div className={styles.errorMessage} role="alert"><WarningCircle size={19} weight="fill" /><span>{error}</span></div>{error.includes("research connection") && <a className={styles.betaLink} href={`mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent("FrontierGTM Signal research beta")}&body=${encodeURIComponent(`I’d like beta access to FrontierGTM Signal.\n\nCompany: ${company}\nMarket: ${market}\nQuestion: ${question}`)}`}>Join the research beta <ArrowRight size={14} /></a>}</div>}
      </div>

      {report && <div className={styles.results} id="signal-results">
        <div className={styles.reportHeader}><div><p className={styles.stepLabel}>Market move brief</p><h2>{report.title}</h2><p>{report.request.market} · {report.request.horizon.replace("d", " days")} · Generated {new Date(report.generatedAt).toLocaleDateString()}</p></div><div className={styles.marketRead}><span>{report.marketRead.velocity}</span><strong>{report.marketRead.direction}</strong><small>{report.marketRead.confidence} evidence confidence</small></div></div>
        <section className={styles.executiveSummary}><Newspaper size={25} weight="fill" /><div><p className={styles.stepLabel}>Executive summary</p><p>{report.executiveSummary}</p></div></section>
        <div className={styles.previewDevelopments}>{report.developments.slice(0, 2).map((item, index) => <article key={item.headline}><span>0{index + 1}</span><div><div className={styles.itemMeta}><b>{item.signalType}</b><small>{item.confidence} confidence</small></div><h3>{item.headline}</h3><p>{item.whatChanged}</p><strong>Why it matters</strong><p>{item.whyItMatters}</p><Sources ids={item.sourceIds} sources={report.sources} /></div></article>)}</div>

        {status !== "unlocked" ? <section className={styles.unlockSection}><div><p className={styles.stepLabel}>The complete brief is ready</p><h3>Unlock every move, implication, and action.</h3><ul><li><Check size={15} />All market developments</li><li><Check size={15} />Company-by-company watchlist</li><li><Check size={15} />Strategic implications for {company}</li><li><Check size={15} />Three concrete GTM actions</li></ul></div><form onSubmit={unlock}><label><span>Work email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.ai" required /></label><label><span>Your role</span><select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>{roles.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label><label className={styles.checkField}><input type="checkbox" checked={weeklyInterest} onChange={(e) => setWeeklyInterest(e.target.checked)} /><span>I’m interested in a weekly version of this watchlist.</span></label><button disabled={status === "unlocking"}>{status === "unlocking" ? <><SpinnerGap className={styles.spinner} /> Unlocking</> : <>Unlock full brief <ArrowRight size={16} /></>}</button><p>FrontierGTM may follow up about this brief. No general mailing-list enrollment.</p></form></section> : <div className={styles.fullReport}>
          <div className={styles.reportTools}><span>Complete brief unlocked</span><div><button onClick={copyBrief}><ClipboardText size={15} />{copied ? "Copied" : "Copy"}</button><button onClick={() => window.print()}><Printer size={15} />Print</button></div></div>
          <section className={styles.reportSection}><p className={styles.sectionNumber}>01</p><div><p className={styles.stepLabel}>Developments that matter</p><h2>What moved in the market</h2><div className={styles.developmentList}>{report.developments.map((item, index) => <article key={item.headline}><span>0{index + 1}</span><div><div className={styles.itemMeta}><b>{item.signalType}</b><small>{item.confidence} confidence</small></div><h3>{item.headline}</h3><p>{item.whatChanged}</p><strong>Why it matters</strong><p>{item.whyItMatters}</p><Sources ids={item.sourceIds} sources={report.sources} /></div></article>)}</div></div></section>
          {report.watchlistMoves.length > 0 && <section className={styles.reportSection}><p className={styles.sectionNumber}>02</p><div><p className={styles.stepLabel}>Watchlist</p><h2>Company moves to track</h2><div className={styles.watchGrid}>{report.watchlistMoves.map((item) => <article key={`${item.company}-${item.move}`}><Binoculars size={20} /><h3>{item.company}</h3><p>{item.move}</p><strong>Implication</strong><p>{item.implication}</p><Sources ids={item.sourceIds} sources={report.sources} /></article>)}</div></div></section>}
          <section className={styles.reportSection}><p className={styles.sectionNumber}>03</p><div><p className={styles.stepLabel}>Implications</p><h2>What this means for {company}</h2><div className={styles.implicationGrid}>{report.implications.map((item) => <article key={item.title}><span>{item.urgency}</span><h3>{item.title}</h3><p>{item.explanation}</p></article>)}</div></div></section>
          <section className={styles.reportSection}><p className={styles.sectionNumber}>04</p><div><p className={styles.stepLabel}>Recommended moves</p><h2>Three actions to take next</h2><div className={styles.actionList}>{report.actions.map((item, index) => <article key={item.title}><span>0{index + 1}</span><div><small>{item.timing.replace("-", " ")}</small><h3>{item.title}</h3><p>{item.action}</p><strong>Why this move</strong><p>{item.rationale}</p><Sources ids={item.sourceIds} sources={report.sources} /></div></article>)}</div></div></section>
          <section className={styles.evidence}><ShieldCheck size={24} /><div><p className={styles.stepLabel}>Evidence ledger</p><h2>{report.sources.length} public sources · {report.evidenceCoverage.confidence} confidence</h2><p>{report.evidenceCoverage.summary}</p>{report.evidenceCoverage.limitations.length > 0 && <ul>{report.evidenceCoverage.limitations.map((item) => <li key={item}>{item}</li>)}</ul>}<div>{report.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><span>{source.id}</span><p><strong>{source.title}</strong><small>{source.domain}{source.publishedDate ? ` · ${new Date(source.publishedDate).toLocaleDateString()}` : ""}</small></p><ArrowRight size={13} /></a>)}</div></div></section>
          <section className={styles.commercialCta}><div><p className={styles.stepLabel}>From briefing to advantage</p><h2>Turn market motion into a GTM move.</h2><p>FrontierGTM can build the recurring intelligence system, pressure-test the decision, and help your team execute the response.</p></div><a href={`mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`FrontierGTM Signal Sprint for ${company}`)}`}><span>Founding offer</span><strong>Signal Sprint</strong><small>A focused research, positioning, and activation engagement built around this brief.</small><ArrowRight size={17} /></a><a href={`mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`Discuss my FrontierGTM Signal brief for ${company}`)}`}><EnvelopeSimple size={18} /><strong>Discuss the brief with Ryan</strong></a></section>
        </div>}
      </div>}

      {!report && status !== "researching" && <div className={styles.howItWorks}><article><span>01</span><Binoculars size={28} /><h3>Search what changed</h3><p>Signal researches recent market and company moves across public sources.</p></article><article><span>02</span><TrendUp size={28} /><h3>Find the strategic signal</h3><p>It separates meaningful changes from the week’s background noise.</p></article><article><span>03</span><Target size={28} /><h3>Make the next move</h3><p>The brief turns evidence into three GTM actions for your company.</p></article></div>}
    </section>
  );
}
