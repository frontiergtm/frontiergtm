import type { DealReport } from "@/lib/deal/schema";
import type { LaunchReport } from "@/lib/launch/schema";
import type { ScanReport } from "@/lib/scan/schema";
import type { SignalReport } from "@/lib/signal/schema";

type PdfEntry = { title: string; body?: string; meta?: string; bullets?: string[] };
type PdfSection = { label: string; title: string; intro?: string; entries?: PdfEntry[] };
type PdfSource = { id: string; title: string; url: string; detail: string };
type PdfReport = {
  agent: string;
  title: string;
  subject: string;
  generatedAt: string;
  meta: string[];
  summary: string;
  sections: PdfSection[];
  sources: PdfSource[];
};

const NAVY = [10, 24, 41] as const;
const INK = [23, 35, 51] as const;
const MUTED = [91, 105, 121] as const;
const LINE = [218, 224, 230] as const;
const LIME = [180, 232, 91] as const;

function ascii(value: unknown) {
  return String(value ?? "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u2192/g, "->")
    .replace(/\u00b7/g, "|")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function titleCase(value: string) {
  return ascii(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function citations(ids: string[]) {
  return ids.length ? `Sources: ${ids.join(", ")}` : "Outside-in inference";
}

function filename(report: PdfReport) {
  const stem = `${report.agent}-${report.subject}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
  return `${stem || "frontiergtm-report"}.pdf`;
}

async function downloadPdf(report: PdfReport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = width - margin * 2;
  let y = 0;

  const setText = (color: readonly [number, number, number]) => doc.setTextColor(color[0], color[1], color[2]);
  const setFill = (color: readonly [number, number, number]) => doc.setFillColor(color[0], color[1], color[2]);
  const setDraw = (color: readonly [number, number, number]) => doc.setDrawColor(color[0], color[1], color[2]);

  function pageHeader() {
    setText(NAVY); doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text("FRONTIERGTM", margin, 13);
    setText(MUTED); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text(ascii(report.agent), width - margin, 13, { align: "right" });
    setDraw(LINE); doc.setLineWidth(0.3); doc.line(margin, 17, width - margin, 17);
    y = 26;
  }

  function addPage() { doc.addPage(); pageHeader(); }
  function ensure(space: number) { if (y + space > height - 20) addPage(); }

  function paragraph(text: string, options: { size?: number; color?: readonly [number, number, number]; bold?: boolean; indent?: number; gap?: number } = {}) {
    const size = options.size ?? 10;
    const indent = options.indent ?? 0;
    const lines = doc.splitTextToSize(ascii(text), contentWidth - indent) as string[];
    const lineHeight = size * 0.43;
    doc.setFont("helvetica", options.bold ? "bold" : "normal"); doc.setFontSize(size); setText(options.color ?? INK);
    for (const line of lines) { ensure(lineHeight + 1); doc.text(line, margin + indent, y); y += lineHeight; }
    y += options.gap ?? 3;
  }

  function sectionHeading(section: PdfSection) {
    ensure(24);
    setText([79, 123, 34]); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(ascii(section.label).toUpperCase(), margin, y); y += 6;
    const lines = doc.splitTextToSize(ascii(section.title), contentWidth) as string[];
    doc.setFont("helvetica", "bold"); doc.setFontSize(19); setText(NAVY);
    for (const line of lines) { doc.text(line, margin, y); y += 8; }
    y += 2;
    if (section.intro) paragraph(section.intro, { size: 10, color: MUTED, gap: 5 });
  }

  function entry(item: PdfEntry, index: number) {
    ensure(22);
    if (index > 0) { setDraw(LINE); doc.setLineWidth(0.25); doc.line(margin, y, width - margin, y); y += 6; }
    if (item.meta) { setText([79, 123, 34]); doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.text(ascii(item.meta).toUpperCase(), margin, y); y += 5; }
    paragraph(item.title, { size: 12, bold: true, color: NAVY, gap: 2 });
    if (item.body) paragraph(item.body, { size: 9.5, color: INK, gap: item.bullets?.length ? 2 : 5 });
    for (const bullet of item.bullets ?? []) {
      ensure(8); setFill(LIME); doc.circle(margin + 1.5, y - 1.2, 0.8, "F"); paragraph(bullet, { size: 9, indent: 5, color: INK, gap: 1.5 });
    }
    y += 2;
  }

  // Branded cover.
  setFill(NAVY); doc.rect(0, 0, width, height, "F");
  setFill(LIME); doc.rect(margin, 22, 22, 2, "F");
  setText([255, 255, 255]); doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.text("FRONTIERGTM", margin, 37);
  setText(LIME); doc.setFontSize(9); doc.text(ascii(report.agent).toUpperCase(), margin, 56);
  const coverTitle = doc.splitTextToSize(ascii(report.title), contentWidth) as string[];
  setText([255, 255, 255]); doc.setFontSize(30); doc.setFont("helvetica", "bold"); let coverY = 73;
  for (const line of coverTitle) { doc.text(line, margin, coverY); coverY += 13; }
  setText([189, 201, 213]); doc.setFont("helvetica", "normal"); doc.setFontSize(12);
  const summaryLines = doc.splitTextToSize(ascii(report.summary), contentWidth) as string[];
  coverY += 8; for (const line of summaryLines.slice(0, 9)) { doc.text(line, margin, coverY); coverY += 6; }
  setDraw([72, 91, 110]); doc.line(margin, height - 53, width - margin, height - 53);
  setText([189, 201, 213]); doc.setFontSize(8.5); doc.setFont("helvetica", "normal");
  doc.text(ascii(report.meta.join("  |  ")), margin, height - 42, { maxWidth: contentWidth });
  doc.text(`Generated ${new Date(report.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, height - 31);
  setText(LIME); doc.setFont("helvetica", "bold"); doc.text("frontiergtm.ai", width - margin, height - 31, { align: "right" });

  for (const section of report.sections) {
    addPage(); sectionHeading(section); (section.entries ?? []).forEach(entry);
  }

  if (report.sources.length) {
    addPage(); sectionHeading({ label: "Evidence ledger", title: `${report.sources.length} public sources`, intro: "Source links used to ground this report. Review primary evidence before making consequential decisions." });
    report.sources.forEach((source, index) => {
      ensure(18);
      if (index > 0) { setDraw(LINE); doc.line(margin, y, width - margin, y); y += 5; }
      setText([79, 123, 34]); doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.text(ascii(source.id), margin, y);
      paragraph(source.title, { size: 9.5, bold: true, indent: 10, gap: 1 });
      paragraph(source.detail, { size: 8, color: MUTED, indent: 10, gap: 1 });
      const urlLines = doc.splitTextToSize(ascii(source.url), contentWidth - 10) as string[];
      doc.setFont("helvetica", "normal"); doc.setFontSize(7); setText([49, 91, 140]);
      for (const line of urlLines) { ensure(4); doc.textWithLink(line, margin + 10, y, { url: source.url }); y += 3.5; }
      y += 3;
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 2; page <= pageCount; page += 1) {
    doc.setPage(page); setDraw(LINE); doc.line(margin, height - 14, width - margin, height - 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7); setText(MUTED);
    doc.text("AI-generated outside-in analysis. Verify critical claims before use.", margin, height - 8);
    doc.text(`${page - 1} / ${pageCount - 1}`, width - margin, height - 8, { align: "right" });
  }
  doc.save(filename(report));
}

export function downloadScanPdf(report: ScanReport) {
  const findings = (items: ScanReport["strengths"]) => items.map((item) => ({ title: item.title, meta: `${item.factOrInference} | ${item.confidence} confidence | ${citations(item.sourceIds)}`, body: `${item.observation}\n\nWhy it matters: ${item.whyItMatters}` }));
  return downloadPdf({
    agent: "FrontierGTM Scan", title: `${report.company.name}: Outside-in GTM Scan`, subject: report.company.name, generatedAt: report.generatedAt,
    meta: [report.company.category, `${report.company.targetFit} FrontierGTM fit`, `${report.evidenceCoverage.confidence} evidence confidence`], summary: report.executiveReadout,
    sections: [
      { label: "01 Executive readout", title: "What the public story communicates", entries: [{ title: "Executive readout", body: report.executiveReadout }, { title: "Highest-leverage move", body: report.snapshot.highestLeverageMove, meta: "Priority" }] },
      { label: "02 Snapshot", title: "What lands - and what remains unclear", entries: [{ title: "What lands clearly", body: report.snapshot.whatLandsClearly }, { title: "What remains unclear", body: report.snapshot.whatRemainsUnclear }] },
      { label: "03 Market story", title: "The apparent GTM narrative", entries: Object.entries(report.marketStory).map(([key, value]) => ({ title: titleCase(key), body: value })) },
      { label: "04 Buyer clarity", title: "Who appears to buy - and why", entries: Object.entries(report.buyerClarity).map(([key, value]) => ({ title: titleCase(key), body: value })) },
      { label: "05 Positioning strengths", title: "What is already working", entries: findings(report.strengths) },
      { label: "06 Narrative gaps", title: "Where the story loses force", entries: findings(report.gaps) },
      { label: "07 Proof and conversion", title: "Whether the story earns the next step", entries: findings(report.proofAndConversion) },
      { label: "08 Priority actions", title: "The three moves FrontierGTM would make first", entries: report.actions.map((item) => ({ title: item.title, meta: `${item.impact} impact | ${item.effort} effort | ${citations(item.sourceIds)}`, body: `${item.recommendation}\n\nWhy now: ${item.rationale}\n\nExample: ${item.example}` })) },
      { label: "09 Evidence quality", title: `${titleCase(report.evidenceCoverage.confidence)} confidence`, intro: report.evidenceCoverage.summary, entries: report.evidenceCoverage.limitations.length ? [{ title: "Limitations", bullets: report.evidenceCoverage.limitations }] : [] },
    ],
    sources: report.sources.map((source) => ({ id: source.id, title: source.title, url: source.url, detail: source.kind === "company" ? "First-party company source" : "External market source" })),
  });
}

export function downloadSignalPdf(report: SignalReport) {
  return downloadPdf({
    agent: "FrontierGTM Signal", title: report.title, subject: report.request.company, generatedAt: report.generatedAt,
    meta: [report.request.market, report.request.horizon, `${report.marketRead.velocity} velocity`, `${report.marketRead.confidence} confidence`], summary: report.executiveSummary,
    sections: [
      { label: "01 Executive summary", title: report.marketRead.direction, entries: [{ title: "Executive summary", body: report.executiveSummary }] },
      { label: "02 Developments", title: "What changed", entries: report.developments.map((item) => ({ title: item.headline, meta: `${item.signalType} | ${item.confidence} confidence | ${citations(item.sourceIds)}`, body: `${item.whatChanged}\n\nWhy it matters: ${item.whyItMatters}` })) },
      { label: "03 Watchlist", title: "Moves worth watching", entries: report.watchlistMoves.map((item) => ({ title: item.company, meta: citations(item.sourceIds), body: `${item.move}\n\nImplication: ${item.implication}` })) },
      { label: "04 Implications", title: "What this means for the GTM motion", entries: report.implications.map((item) => ({ title: item.title, meta: item.urgency, body: item.explanation })) },
      { label: "05 Actions", title: "Three moves to make", entries: report.actions.map((item) => ({ title: item.title, meta: `${titleCase(item.timing)} | ${citations(item.sourceIds)}`, body: `${item.action}\n\nRationale: ${item.rationale}` })) },
      { label: "06 Evidence quality", title: `${titleCase(report.evidenceCoverage.confidence)} confidence`, intro: report.evidenceCoverage.summary, entries: report.evidenceCoverage.limitations.length ? [{ title: "Limitations", bullets: report.evidenceCoverage.limitations }] : [] },
    ],
    sources: report.sources.map((source) => ({ id: source.id, title: source.title, url: source.url, detail: `${source.domain} | ${titleCase(source.purpose)}${source.publishedDate ? ` | ${source.publishedDate}` : ""}` })),
  });
}

export function downloadLaunchPdf(report: LaunchReport) {
  const activationEntries = (items: LaunchReport["activationPlan"]["preLaunch"]) => items.map((item) => ({ title: item.title, meta: `${titleCase(item.owner)} | ${item.timing}`, body: `${item.deliverable}\n\nRationale: ${item.rationale}` }));
  return downloadPdf({
    agent: "FrontierGTM Launch", title: `${report.identity.launchName}: Launch Command Brief`, subject: `${report.identity.companyName}-${report.identity.launchName}`, generatedAt: report.generatedAt,
    meta: [report.identity.companyName, report.identity.category, `${report.readiness.score}/100 readiness`, titleCase(report.readiness.verdict)], summary: report.executiveDiagnosis,
    sections: [
      { label: "01 Readiness", title: `${report.readiness.score}/100 - ${titleCase(report.readiness.verdict)}`, entries: [{ title: "Executive diagnosis", body: report.executiveDiagnosis }, { title: "Readiness rationale", body: report.readiness.rationale, bullets: report.readiness.blockers }] },
      { label: "02 Launch thesis", title: report.launchThesis.oneLine, entries: Object.entries(report.launchThesis).filter(([key]) => key !== "oneLine").map(([key, value]) => ({ title: titleCase(key), body: value })) },
      { label: "03 Market openings", title: "Why this launch can matter now", entries: report.marketOpenings.map((item) => ({ title: item.title, meta: `${item.confidence} confidence | ${citations(item.sourceIds)}`, body: `${item.evidence}\n\nLaunch implication: ${item.implication}` })) },
      { label: "04 Narrative architecture", title: "The story this launch should tell", entries: Object.entries(report.narrative).map(([key, value]) => ({ title: titleCase(key), body: value })) },
      { label: "05 Buyer frame", title: "Make the launch legible to the buyer", entries: [...Object.entries(report.buyerFrame).filter(([, value]) => !Array.isArray(value)).map(([key, value]) => ({ title: titleCase(key), body: String(value) })), { title: "Language to use", bullets: report.buyerFrame.languageToUse }, { title: "Language to avoid", bullets: report.buyerFrame.languageToAvoid }] },
      { label: "06 Claim stack", title: report.claimStack.headline, intro: report.claimStack.categoryLine, entries: report.claimStack.supportingClaims.map((item) => ({ title: item.claim, meta: `${titleCase(item.evidenceStatus)} | ${citations(item.sourceIds)}`, body: `Proof needed: ${item.proofNeeded}` })) },
      { label: "07 Risk register", title: "What could weaken the launch", entries: report.risks.map((item) => ({ title: item.title, meta: `${item.severity} severity | ${citations(item.sourceIds)}`, body: `${item.why}\n\nMitigation: ${item.mitigation}` })) },
      { label: "08 Pre-launch", title: "Prepare the market and the team", entries: activationEntries(report.activationPlan.preLaunch) },
      { label: "09 Launch day", title: "Coordinate the moment", entries: activationEntries(report.activationPlan.launchDay) },
      { label: "10 Sustain", title: "Give the launch an afterlife", entries: activationEntries(report.activationPlan.sustain) },
      { label: "11 Announcement", title: report.assets.announcement.title, intro: report.assets.announcement.subhead, entries: report.assets.announcement.outline.map((item) => ({ title: item.section, body: item.brief })) },
      { label: "12 Executive post", title: "Ready-to-edit executive copy", entries: [{ title: "Executive post", body: report.assets.executivePost }] },
      { label: "13 Sales talk track", title: "The field conversation", entries: Object.entries(report.assets.salesTalkTrack).map(([key, value]) => ({ title: titleCase(key), body: value })) },
      { label: "14 Calendar", title: "The 14-day launch sequence", entries: report.calendar.map((item) => ({ title: `${item.day}: ${item.moment}`, meta: item.channel, body: `${item.action}\n\nGoal: ${item.goal}` })) },
      { label: "15 Evidence quality", title: `${titleCase(report.evidenceCoverage.confidence)} confidence`, intro: report.evidenceCoverage.summary, entries: report.evidenceCoverage.limitations.length ? [{ title: "Limitations", bullets: report.evidenceCoverage.limitations }] : [] },
    ],
    sources: report.sources.map((source) => ({ id: source.id, title: source.title, url: source.url, detail: `${source.domain} | ${titleCase(source.purpose)}${source.publishedDate ? ` | ${source.publishedDate}` : ""}` })),
  });
}

export function downloadDealPdf(report: DealReport) {
  return downloadPdf({
    agent: "FrontierGTM Deal Intelligence", title: report.title, subject: `${report.identity.sellerName}-${report.identity.targetName}`, generatedAt: report.generatedAt,
    meta: [`${report.identity.sellerName} -> ${report.identity.targetName}`, titleCase(report.request.meetingType), `${report.opportunity.fit} fit`, `${report.accountThesis.confidence} confidence`], summary: report.accountThesis.oneLine,
    sections: [
      { label: "01 Account thesis", title: report.accountThesis.oneLine, entries: [{ title: "Why them", body: report.accountThesis.whyThem }, { title: "Why now", body: report.accountThesis.whyNow }] },
      { label: "02 Trigger events", title: "What changed", entries: report.triggerEvents.map((item) => ({ title: item.headline, meta: `${item.confidence} confidence | ${citations(item.sourceIds)}`, body: `${item.whatHappened}\n\nCommercial implication: ${item.commercialImplication}` })) },
      { label: "03 Priorities", title: "Observed priorities and useful hypotheses", entries: report.priorities.map((item) => ({ title: item.priority, meta: `${item.status} | ${citations(item.sourceIds)}`, body: `${item.evidence}\n\nRelevance: ${item.relevance}` })) },
      { label: "04 Opportunity test", title: `${titleCase(report.opportunity.fit)} fit - not assumed fit`, entries: [{ title: "Problem hypothesis", body: report.opportunity.problemHypothesis }, { title: "Value hypothesis", body: report.opportunity.valueHypothesis }, { title: "Fit rationale", body: report.opportunity.fitRationale }, { title: "Proof to bring", bullets: report.opportunity.proofToBring }, { title: "Proof gaps", bullets: report.opportunity.proofGaps }, { title: "Non-fit risks", bullets: report.opportunity.nonFitRisks }] },
      { label: "05 Buying committee", title: "People and politics", entries: report.buyingCommittee.map((item) => ({ title: item.role, meta: item.status, body: `Likely concern: ${item.likelyConcern}\n\nMessage: ${item.message}` })) },
      { label: "06 Meeting plan", title: "A conversation designed to earn the next step", intro: report.meetingPlan.openingPointOfView, entries: [...report.meetingPlan.agenda.map((item) => ({ title: `${item.minute}: ${item.objective}`, body: item.move })), { title: "Desired next step", body: report.meetingPlan.desiredNextStep }, { title: "Walk-away signal", body: report.meetingPlan.walkAwaySignal }] },
      { label: "07 Discovery", title: "Questions that expose the real deal", entries: report.discoveryQuestions.map((item, index) => ({ title: `${index + 1}. ${item.question}`, body: `Why ask: ${item.whyAsk}\n\nListen for: ${item.listenFor}` })) },
      { label: "08 Objections", title: "Resistance and response", entries: report.objections.map((item) => ({ title: item.objection, body: `${item.response}\n\nProof needed: ${item.proofNeeded}` })) },
      { label: "09 Unknowns", title: "Do not leave without learning", entries: [{ title: "Critical unknowns", bullets: report.unknowns }] },
      { label: "10 Follow-up", title: report.followUpEmail.subject, entries: [{ title: "Ready-to-edit email", body: report.followUpEmail.body }] },
      { label: "11 Evidence quality", title: `${titleCase(report.evidenceCoverage.confidence)} confidence`, intro: report.evidenceCoverage.summary, entries: report.evidenceCoverage.limitations.length ? [{ title: "Limitations", bullets: report.evidenceCoverage.limitations }] : [] },
    ],
    sources: report.sources.map((source) => ({ id: source.id, title: source.title, url: source.url, detail: `${source.domain} | ${titleCase(source.purpose)}${source.publishedDate ? ` | ${source.publishedDate}` : ""}` })),
  });
}
