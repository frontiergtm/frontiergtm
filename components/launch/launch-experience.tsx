"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, CalendarBlank, Check, ClipboardText, DownloadSimple, EnvelopeSimple, Flag, Gauge, LinkSimple, Megaphone, Printer, RocketLaunch, ShieldCheck, Sparkle, SpinnerGap, Target, WarningCircle } from "@phosphor-icons/react";
import type { LaunchReport } from "@/lib/launch/schema";
import { downloadLaunchPdf } from "@/lib/pdf/agent-report-pdf";
import styles from "@/app/launch/launch.module.css";

const types = [
  ["product", "New product"], ["feature", "Major feature"], ["platform", "Platform"], ["pricing", "Pricing or packaging"],
  ["partnership", "Partnership"], ["availability", "Availability milestone"], ["company", "Company or category"], ["other", "Other"],
] as const;
const stages = [["exploring", "Exploring the launch"], ["planning", "Planning"], ["ready", "Ready to announce"], ["announced", "Already announced"]] as const;
const goals = [["awareness", "Market awareness"], ["pipeline", "Create pipeline"], ["adoption", "Drive adoption"], ["expansion", "Expand usage"], ["category", "Shape the category"]] as const;
const roles = ["executive", "marketing", "product", "sales", "strategy", "investor", "other"] as const;
const progressSteps = ["Reading the company and product", "Researching buyers and the market", "Testing claims and differentiation", "Building the launch narrative", "Sequencing activation"];
type Status = "idle" | "building" | "preview" | "unlocking" | "unlocked" | "error";

function track(name: string, params: Record<string, string | number | boolean> = {}) { window.gtag?.("event", name, params); }
function label(value: string) { return value.replace(/-/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()); }

function SourceLinks({ ids, sources }: { ids: string[]; sources: LaunchReport["sources"] }) {
  const matches = ids.map((id) => sources.find((source) => source.id === id)).filter(Boolean) as LaunchReport["sources"];
  if (!matches.length) return <span className={styles.contextLabel}>Strategic recommendation</span>;
  return <span className={styles.sourceLinks}>{matches.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" title={source.title}>{source.id}<LinkSimple size={10} /></a>)}</span>;
}

export function LaunchExperience() {
  const [status, setStatus] = useState<Status>("idle");
  const [companyUrl, setCompanyUrl] = useState("");
  const [launchName, setLaunchName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryBuyer, setPrimaryBuyer] = useState("");
  const [launchType, setLaunchType] = useState<(typeof types)[number][0]>("product");
  const [stage, setStage] = useState<(typeof stages)[number][0]>("planning");
  const [goal, setGoal] = useState<(typeof goals)[number][0]>("pipeline");
  const [launchUrl, setLaunchUrl] = useState("");
  const [launchDate, setLaunchDate] = useState("");
  const [competitorText, setCompetitorText] = useState("");
  const [proofAndConstraints, setProofAndConstraints] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [report, setReport] = useState<LaunchReport | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("executive");
  const [reviewedInterest, setReviewedInterest] = useState(true);
  const [copied, setCopied] = useState(false);
  const competitors = competitorText.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 3);

  useEffect(() => {
    if (status !== "building") return;
    setProgress(0);
    const timer = window.setInterval(() => setProgress((current) => Math.min(current + 1, progressSteps.length - 1)), 2_600);
    return () => window.clearInterval(timer);
  }, [status]);

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("building"); setError(""); setReport(null);
    track("launch_started", { launch_type: launchType, stage, goal });
    try {
      const controller = new AbortController(); const timeout = window.setTimeout(() => controller.abort(), 118_000);
      const response = await fetch("/api/launch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ companyUrl, launchName, description, primaryBuyer, launchType, stage, goal, launchUrl: launchUrl || undefined, launchDate: launchDate || undefined, competitors, proofAndConstraints: proofAndConstraints || undefined, website: honeypot }), signal: controller.signal });
      window.clearTimeout(timeout); const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "The launch brief could not be completed.");
      setReport(payload); setStatus("preview"); track("launch_completed", { readiness: payload.readiness?.score ?? 0, verdict: payload.readiness?.verdict ?? "unknown", source_count: payload.sources?.length ?? 0 });
      window.setTimeout(() => document.getElementById("launch-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === "AbortError" ? "The launch analysis took too long. Please try again." : caught instanceof Error ? caught.message : "The launch brief could not be completed.");
      setStatus("error"); track("launch_failed", { launch_type: launchType, stage });
    }
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!report) return; setStatus("unlocking"); setError("");
    try {
      const response = await fetch("/api/launch/unlock", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, role, companyName: report.identity.companyName, companyUrl: report.request.companyUrl, launchName: report.identity.launchName, launchType, stage, goal, readinessScore: report.readiness.score, executiveDiagnosis: report.executiveDiagnosis, reviewedInterest, website: honeypot }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.message || "We could not unlock the launch brief.");
      setStatus("unlocked"); track("launch_unlocked", { role, reviewed_interest: reviewedInterest, readiness: report.readiness.score }); track("generate_lead", { source: "frontiergtm_launch" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not unlock the launch brief."); setStatus("preview"); }
  }

  async function copyBrief() {
    if (!report) return;
    const text = `${report.identity.companyName} — ${report.identity.launchName}\n\nREADINESS ${report.readiness.score}/100 · ${report.readiness.verdict}\n${report.executiveDiagnosis}\n\nLAUNCH THESIS\n${report.launchThesis.oneLine}\n\nHEADLINE\n${report.claimStack.headline}\n\nACTIVATION\n${[...report.activationPlan.preLaunch, ...report.activationPlan.launchDay, ...report.activationPlan.sustain].map((item) => `- ${item.title}: ${item.deliverable}`).join("\n")}`;
    await navigator.clipboard.writeText(text); setCopied(true); track("launch_brief_copied"); window.setTimeout(() => setCopied(false), 1_800);
  }

  const sprintHref = report ? `mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`FrontierGTM Launch Sprint — ${report.identity.launchName}`)}&body=${encodeURIComponent(`I generated a FrontierGTM Launch brief for ${report.identity.companyName} and would like to discuss the $1,500 founding Launch Sprint.`)}` : "mailto:ryan@frontiergtm.ai";

  return <section className={styles.experience}>
    <div className={styles.launchShell}>
      <div className={styles.formIntro}><p className={styles.stepLabel}>Define the launch moment</p><h2>Build your launch strategy</h2><p>Use public-safe context only. FrontierGTM will research the company, buyer, category, and alternatives.</p></div>
      <form className={styles.launchForm} onSubmit={generate}>
        <div className={styles.formGrid}><label><span>Company website</span><input value={companyUrl} onChange={(event) => setCompanyUrl(event.target.value)} placeholder="company.ai" required /></label><label><span>Working launch name</span><input value={launchName} onChange={(event) => setLaunchName(event.target.value)} placeholder="Provisioned Throughput" required maxLength={160} /></label></div>
        <label className={styles.descriptionField}><span>What are you launching—and why should the buyer care?</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the product, capability, market change, and intended customer value. Facts here are treated as user-provided context." required minLength={30} maxLength={1200} /></label>
        <div className={styles.formGrid}><label><span>Primary buyer</span><input value={primaryBuyer} onChange={(event) => setPrimaryBuyer(event.target.value)} placeholder="VP of AI Platform at a large enterprise" required maxLength={200} /></label><label><span>Product, docs, or announcement URL <em>optional</em></span><input value={launchUrl} onChange={(event) => setLaunchUrl(event.target.value)} placeholder="company.ai/product" maxLength={500} /></label></div>
        <div className={styles.formGridThree}><label><span>Launch type</span><select value={launchType} onChange={(event) => setLaunchType(event.target.value as typeof launchType)}>{types.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label><label><span>Current stage</span><select value={stage} onChange={(event) => setStage(event.target.value as typeof stage)}>{stages.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label><label><span>Primary goal</span><select value={goal} onChange={(event) => setGoal(event.target.value as typeof goal)}>{goals.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label></div>
        <details className={styles.advanced}><summary>Sharpen the brief <span>optional details</span></summary><div className={styles.advancedInner}><div className={styles.formGrid}><label><span>Target launch date</span><input type="date" value={launchDate} onChange={(event) => setLaunchDate(event.target.value)} /></label><label><span>Competitors or alternatives <em>up to 3</em></span><input value={competitorText} onChange={(event) => setCompetitorText(event.target.value)} placeholder="Competitor A, build in-house, status quo" maxLength={320} /></label></div><label><span>Proof, constraints, and facts we must respect</span><textarea value={proofAndConstraints} onChange={(event) => setProofAndConstraints(event.target.value)} placeholder="Available proof, approved claims, known gaps, pricing constraints, launch dependencies…" maxLength={1200} /></label></div></details>
        <label className={styles.honeypot} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} /></label>
        <button className={styles.launchButton} disabled={status === "building" || !companyUrl.trim() || !launchName.trim() || description.trim().length < 30 || !primaryBuyer.trim()}>{status === "building" ? <><SpinnerGap className={styles.spinner} size={20} /> Building the launch brief</> : <>Pressure-test this launch <RocketLaunch size={18} weight="fill" /></>}</button>
        <p className={styles.formNote}><ShieldCheck size={16} /> Public research plus your context. Do not submit confidential information.</p>
      </form>
      {status === "building" && <div className={styles.progressPanel} aria-live="polite"><div><Sparkle size={18} weight="fill" /><span>{progressSteps[progress]}</span></div><div className={styles.progressTrack}><span style={{ width: `${18 + progress * 19}%` }} /></div><div className={styles.progressDots}>{progressSteps.map((step, index) => <i key={step} className={index <= progress ? styles.activeDot : ""}>{index < progress ? <Check size={11} /> : index + 1}</i>)}</div></div>}
      {error && <div className={styles.errorMessage} role="alert"><WarningCircle size={19} weight="fill" /><span>{error}</span></div>}
    </div>

    {report && <div className={styles.results} id="launch-results">
      <div className={styles.reportHeader}><div><p className={styles.stepLabel}>Launch command brief</p><h2>{report.identity.launchName}</h2><p>{report.identity.companyName} · {report.identity.category} · {label(report.request.stage)}</p></div><div className={styles.readinessDial} style={{ "--score": report.readiness.score } as React.CSSProperties}><div><strong>{report.readiness.score}</strong><small>/100</small></div><span>{label(report.readiness.verdict)}</span></div></div>
      <section className={styles.diagnosis}><Gauge size={27} weight="fill" /><div><p className={styles.stepLabel}>Executive diagnosis</p><p>{report.executiveDiagnosis}</p>{report.readiness.blockers.length > 0 && <div className={styles.blockers}>{report.readiness.blockers.map((blocker) => <span key={blocker}>{blocker}</span>)}</div>}</div></section>
      <div className={styles.previewGrid}><article><Target size={22} /><p className={styles.stepLabel}>Recommended thesis</p><h3>{report.launchThesis.oneLine}</h3><p>{report.launchThesis.whyNow}</p></article><article><Sparkle size={22} /><p className={styles.stepLabel}>Strongest opening</p><p>{report.preview.marketOpening}</p></article><article className={styles.riskPreview}><WarningCircle size={22} /><p className={styles.stepLabel}>Critical risk</p><p>{report.preview.criticalRisk}</p></article></div>

      {status !== "unlocked" ? <section className={styles.unlockSection}><div><p className={styles.stepLabel}>Your launch operating brief is ready</p><h3>Unlock the narrative, claims, assets, and activation sequence.</h3><ul><li><Check size={15} />Evidence-backed market openings</li><li><Check size={15} />Buyer frame and claim stack</li><li><Check size={15} />Three-phase activation plan</li><li><Check size={15} />Announcement, executive post, and sales talk track</li><li><Check size={15} />14-day launch calendar</li></ul></div><form onSubmit={unlock}><label><span>Work email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.ai" required /></label><label><span>Your role</span><select value={role} onChange={(event) => setRole(event.target.value as typeof role)}>{roles.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label><label className={styles.checkField}><input type="checkbox" checked={reviewedInterest} onChange={(event) => setReviewedInterest(event.target.checked)} /><span>I’m interested in a Ryan-reviewed version of this launch brief.</span></label><button disabled={status === "unlocking"}>{status === "unlocking" ? <><SpinnerGap className={styles.spinner} /> Unlocking</> : <>Unlock complete brief <ArrowRight size={16} /></>}</button><p>FrontierGTM may follow up about this launch. No general mailing-list enrollment.</p></form></section> : <div className={styles.fullReport}>
        <div className={styles.reportTools}><span>Complete launch brief unlocked</span><div><button onClick={copyBrief}><ClipboardText size={15} />{copied ? "Copied" : "Copy brief"}</button><button onClick={() => { void downloadLaunchPdf(report); track("launch_brief_pdf_downloaded"); }}><DownloadSimple size={15} />Download PDF</button><button onClick={() => { window.print(); track("launch_brief_printed"); }}><Printer size={15} />Print</button></div></div>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>01</p><div><p className={styles.stepLabel}>Market openings</p><h2>Why this launch can matter now</h2><div className={styles.openingGrid}>{report.marketOpenings.map((opening) => <article key={opening.title}><div><span>{opening.confidence} confidence</span><h3>{opening.title}</h3></div><p>{opening.evidence}</p><strong>Launch implication</strong><p>{opening.implication}</p><SourceLinks ids={opening.sourceIds} sources={report.sources} /></article>)}</div></div></section>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>02</p><div><p className={styles.stepLabel}>Narrative architecture</p><h2>The story this launch should tell</h2><div className={styles.narrativeFlow}>{Object.entries(report.narrative).map(([key, value], index) => <article key={key}><span>0{index + 1}</span><div><h3>{label(key)}</h3><p>{value}</p></div></article>)}</div></div></section>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>03</p><div><p className={styles.stepLabel}>Buyer frame</p><h2>Make the launch legible to the buyer</h2><div className={styles.buyerGrid}>{[["Buyer", report.buyerFrame.buyer], ["Trigger", report.buyerFrame.trigger], ["Desired outcome", report.buyerFrame.desiredOutcome], ["Primary objection", report.buyerFrame.primaryObjection], ["Required proof", report.buyerFrame.requiredProof]].map(([name, value]) => <article key={name}><span>{name}</span><p>{value}</p></article>)}</div><div className={styles.languageGrid}><div><strong>Language to use</strong>{report.buyerFrame.languageToUse.map((item) => <span key={item}><Check size={12} />{item}</span>)}</div><div><strong>Language to avoid</strong>{report.buyerFrame.languageToAvoid.map((item) => <span key={item}><WarningCircle size={12} />{item}</span>)}</div></div></div></section>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>04</p><div><p className={styles.stepLabel}>Claim stack</p><h2>What the market should remember</h2><div className={styles.claimHero}><span>{report.claimStack.categoryLine}</span><h3>{report.claimStack.headline}</h3></div><div className={styles.claimGrid}>{report.claimStack.supportingClaims.map((claim, index) => <article key={claim.claim}><span>0{index + 1}</span><div className={styles.claimStatus}>{label(claim.evidenceStatus)}</div><h3>{claim.claim}</h3><strong>Proof required</strong><p>{claim.proofNeeded}</p><SourceLinks ids={claim.sourceIds} sources={report.sources} /></article>)}</div></div></section>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>05</p><div><p className={styles.stepLabel}>Risk register</p><h2>What could weaken the launch</h2><div className={styles.riskList}>{report.risks.map((risk) => <article key={risk.title}><span className={`${styles.severity} ${styles[risk.severity]}`}>{risk.severity}</span><div><h3>{risk.title}</h3><p>{risk.why}</p><strong>Mitigation</strong><p>{risk.mitigation}</p><SourceLinks ids={risk.sourceIds} sources={report.sources} /></div></article>)}</div></div></section>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>06</p><div><p className={styles.stepLabel}>Activation plan</p><h2>Turn the narrative into coordinated action</h2><div className={styles.phaseGrid}>{([['preLaunch', 'Pre-launch'], ['launchDay', 'Launch day'], ['sustain', 'Sustain']] as const).map(([key, title]) => <div key={key}><div className={styles.phaseHeader}><Flag size={18} /><h3>{title}</h3></div>{report.activationPlan[key].map((action) => <article key={action.title}><div><span>{label(action.owner)}</span><small>{action.timing}</small></div><h4>{action.title}</h4><p>{action.deliverable}</p><em>{action.rationale}</em></article>)}</div>)}</div></div></section>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>07</p><div><p className={styles.stepLabel}>Launch assets</p><h2>Three assets ready for refinement</h2><div className={styles.assetStack}><article><span>Announcement structure</span><h3>{report.assets.announcement.title}</h3><p className={styles.subhead}>{report.assets.announcement.subhead}</p><ol>{report.assets.announcement.outline.map((item) => <li key={item.section}><strong>{item.section}</strong><p>{item.brief}</p></li>)}</ol></article><article><span>Executive post</span><div className={styles.finishedCopy}>{report.assets.executivePost}</div></article><article><span>Sales talk track</span><dl>{Object.entries(report.assets.salesTalkTrack).map(([key, value]) => <div key={key}><dt>{label(key)}</dt><dd>{value}</dd></div>)}</dl></article></div></div></section>

        <section className={styles.reportSection}><p className={styles.sectionNumber}>08</p><div><p className={styles.stepLabel}>14-day sequence</p><h2>Give the launch a beginning, peak, and afterlife</h2><div className={styles.calendar}>{report.calendar.map((item) => <article key={`${item.day}-${item.moment}`}><span>{item.day}</span><div><small>{item.channel}</small><h3>{item.moment}</h3><p>{item.action}</p><strong>{item.goal}</strong></div></article>)}</div></div></section>

        <section className={styles.evidence}><ShieldCheck size={24} /><div><p className={styles.stepLabel}>Evidence ledger</p><h2>{report.sources.length} public sources · {report.evidenceCoverage.confidence} confidence</h2><p>{report.evidenceCoverage.summary}</p>{report.evidenceCoverage.limitations.length > 0 && <ul>{report.evidenceCoverage.limitations.map((item) => <li key={item}>{item}</li>)}</ul>}<div>{report.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><span>{source.id}</span><p><strong>{source.title}</strong><small>{source.domain} · {label(source.purpose)}{source.publishedDate ? ` · ${new Date(source.publishedDate).toLocaleDateString()}` : ""}</small></p><ArrowRight size={13} /></a>)}</div></div></section>

        <section className={styles.commercialCta}><div><p className={styles.stepLabel}>Human judgment at the moment that matters</p><h2>Turn this brief into a launch your team can ship.</h2><p>FrontierGTM will validate the research, refine the narrative and claims, direct the critical assets, and work through the plan with your team.</p></div><a href={sprintHref} onClick={() => track("launch_sprint_interest", { readiness: report.readiness.score })}><span>Founding offer · $1,500</span><strong>FrontierGTM Launch Sprint</strong><small>Human research review, narrative refinement, asset direction, and a 45-minute working session.</small><ArrowRight size={17} /></a><a href={`mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`Discuss ${report.identity.launchName}`)}`}><EnvelopeSimple size={18} /><strong>Discuss the launch with Ryan</strong></a></section>
      </div>}
    </div>}

    {!report && status !== "building" && <div className={styles.howItWorks}><article><span>01</span><Gauge size={27} /><h3>Pressure-test readiness</h3><p>Find narrative, buyer, proof, and differentiation gaps before the market does.</p></article><article><span>02</span><Megaphone size={27} /><h3>Build the market story</h3><p>Turn technical capability into a credible thesis, claim stack, and buyer frame.</p></article><article><span>03</span><CalendarBlank size={27} /><h3>Coordinate the moment</h3><p>Move from announcement day to a sequenced launch with assets, owners, and sustainment.</p></article></div>}
  </section>;
}
