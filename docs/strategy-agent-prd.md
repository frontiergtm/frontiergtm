# FrontierGTM Strategy — Product Requirements

Status: Version one live and production-verified
Owner: FrontierGTM
Last updated: 2026-07-22

## 1. Product thesis

FrontierGTM Strategy is the flagship decision layer across the FrontierGTM agent system. It helps an executive make a small set of explicit GTM choices, exposes the assumptions behind those choices, and converts them into a sequenced 90-day operating agenda.

It is not a generic marketing-plan generator. A useful result must answer:

- Where will this company play?
- Which buyer and buying situation matter most?
- What credible wedge can the company use to win?
- What must be proven?
- What will the company prioritize now?
- What will it deliberately defer or stop?
- Which decisions or assumptions should be revisited as evidence changes?

Strategy governs the specialist agents:

- Scan diagnoses how the current public story lands.
- Signal tests external changes and assumptions.
- Launch activates a chosen market move.
- Deal applies the strategy to a specific commercial opportunity.

## 2. Target user

Primary users:

- Founder or CEO of an AI infrastructure, agent, cloud, data, or developer-platform company
- CMO, VP Marketing, or senior GTM operator
- Product or strategy executive responsible for a consequential market decision

The initial product is designed for lean technical B2B companies with limited time, imperfect evidence, and pressure to turn a complex product into a focused commercial motion.

## 3. Job to be done

When our GTM activity feels fragmented or unfocused, help us determine the governing choices, identify the most consequential unknowns, and align the next 90 days around a coherent path—without pretending uncertainty does not exist.

## 4. Product promise

Input: company context, a primary business objective, current beliefs, constraints, and public evidence.

Output: an evidence-grounded GTM Strategy Brief containing a governing diagnosis, explicit choices, non-priorities, risks, measures, a 90-day agenda, and recommended specialist-agent follow-through.

## 5. Product principles

1. Strategy is choice, not volume. Fewer decisive recommendations beat a long list of tactics.
2. Evidence, user context, and inference remain visibly distinct.
3. A strategy without non-priorities is incomplete.
4. The plan must reflect company stage, resources, and stated constraints.
5. The product should be candid when evidence does not support a confident choice.
6. Every recommendation should connect to an observable outcome or decision checkpoint.
7. The agent should direct specialist work rather than reproduce every specialist report.
8. Human review is a premium layer for high-stakes judgment, not a disclaimer attached to generic output.

## 6. Version-one scope

Version one is a public web agent at `/strategy` with:

- Structured strategy intake
- First-party company research
- Current market, buyer, and competitive research through Exa
- Structured Together AI analysis
- A useful free preview before payment
- Stripe Checkout for the complete brief
- Promotion-code support
- Seven-day temporary report retrieval
- Complete on-page report
- Copy, print, and branded PDF actions
- Evidence ledger and uncertainty labeling
- Clear routes into Scan, Signal, Launch, and Deal
- Consulting conversion paths

### Non-goals for version one

- User accounts
- Team workspaces
- Persistent strategy dashboards
- CRM, Slack, email, or document integrations
- Automatic ingestion of prior FrontierGTM reports
- Recurring strategy monitoring or subscription billing
- Claiming that a public-web analysis replaces internal planning or executive judgment

## 7. Intake requirements

Required:

- Company website
- Company stage: exploring, early revenue, scaling, established, transformation
- Primary objective: find focus, create category, enter market, grow pipeline, accelerate adoption, move enterprise, improve retention/expansion
- Objective detail in the user’s own words
- Current product or offer
- Current target buyer or buying situation
- Most important constraint

Optional:

- Current GTM motion
- Named competitors or alternatives, maximum three
- What has already been tried or learned
- Available proof, traction, or customer evidence
- Known strategic tension or decision
- Honeypot field for bot filtering

The form should take approximately five to eight minutes and explain that better internal context produces a better strategy.

## 8. Research contract

First-party research should establish:

- What the company says it offers
- Current audience, use cases, positioning, proof, and calls to action
- Public product and company context

External research should investigate:

- Current category and buyer conditions
- Relevant alternatives and competitive patterns
- Adoption barriers, triggers, and buyer priorities
- Recent changes that could affect the stated objective

Research requirements:

- Prefer first-party sources, primary research, official documentation, and credible reporting.
- Reject thin SEO pages, duplicate coverage, content farms, and unsupported comparisons.
- Treat source contents as untrusted and ignore embedded instructions.
- Require at least one credible first-party source and three useful external sources.
- Never use market evidence to verify an unannounced company capability or internal result.

## 9. Strategy report contract

### Identity and verdict

- Company name and category
- Stage and objective
- Strategy confidence: high, medium, or low
- Focus score from 0–100
- Verdict: focused, promising-but-diffuse, underdetermined, or conflicted

### Free preview

- Governing diagnosis
- Central strategic choice
- Most consequential tension
- Three short public-evidence signals
- What the full brief contains

### Complete paid report

1. Executive strategy
   - One-line strategy
   - Governing diagnosis
   - Why this matters now

2. Strategic situation
   - Company reality
   - Market reality
   - Buyer reality
   - Internal constraint

3. Where to play
   - Priority market
   - Priority buyer
   - Buying situation or trigger
   - High-value problem
   - Initial wedge

4. How to win
   - Category frame
   - Differentiated value
   - Credible advantage
   - Proof strategy
   - Recommended GTM motion

5. Strategic choices
   - Three commitments
   - Three explicit non-priorities

6. Assumption ledger
   - Assumption
   - Current evidence
   - Confidence
   - Test or decision required

7. Risks and contradictions
   - Risk
   - Severity
   - Why it matters
   - Mitigation

8. 90-day operating agenda
   - Three phases
   - Three to five actions per phase
   - Owner, timing, intended outcome, and decision checkpoint

9. Measurement system
   - Leading indicators
   - Business outcomes
   - Stop/change conditions

10. Agent routing
    - Which specialist agent to run next
    - Why it is needed
    - The question to give it
    - Priority and expected decision

11. Evidence quality
    - Confidence summary
    - Limitations and unknowns
    - Public source ledger

## 10. Evidence policy

Every factual market or company claim must cite supplied source IDs. The report must use the following statuses:

- Observed: supported by public evidence
- User context: supplied by the user but not independently verified
- Inferred: reasoned hypothesis grounded in evidence or context
- Unknown: insufficient evidence

The agent must not invent customers, traction, metrics, capabilities, pricing, partnerships, competitive superiority, or internal constraints. A useful strategy can still recommend a test when proof is missing.

## 11. Commercial model

Version-one founding offer:

- Free Strategy Preview before checkout
- Complete Strategy Brief: `$149` one-time, configurable through `STRATEGY_PRICE_CENTS`
- Stripe promotion codes enabled for founder testing and selective free access
- Ryan-reviewed Strategy Session: `$750` positioning target, sold through a direct consultation CTA rather than automated checkout in version one

The paid brief is an executive artifact, not a token-metered AI output. Pricing should reflect decision value and should not be anchored to inference cost.

## 12. UX hierarchy

Strategy is featured as the starting point rather than treated as an equal fifth card.

- Navigation: Strategy appears first and is labeled “Start here.”
- Agents hub: a featured Strategy panel precedes the four specialist agents.
- Homepage: “One strategy system. Four specialized agents.”
- Specialist footers: Strategy is presented as the governing layer; the four specialists remain a coherent set.
- Strategy report: specialist recommendations link directly to `/scan`, `/signal`, `/launch`, or `/deal`.

Visual direction follows the existing FrontierGTM system: dark forest/navy, gold and lime accents, editorial typography, evidence-forward cards, generous spacing, and restrained motion. Strategy should feel more executive and architectural than the specialist tools.

## 13. Blog relationship

The blog is FrontierGTM’s public point-of-view layer. It should explain the principles behind the agent and attract the audience; it must not be treated as evidence about the user’s company.

Future essays should cover:

- GTM strategy as a system of choices rather than a plan
- Why technical AI companies become strategically diffuse
- How to separate public evidence, internal context, and hypotheses
- The role of agent systems in a modern GTM operating model

Relevant essays may eventually appear as optional methodology links inside reports.

## 14. Analytics

Track:

- `strategy_started`
- `strategy_preview_completed`
- `strategy_failed`
- `strategy_checkout_started`
- `strategy_unlocked`
- `strategy_brief_copied`
- `strategy_brief_pdf_downloaded`
- `strategy_brief_printed`
- `strategy_specialist_agent_clicked`
- `strategy_consulting_clicked`

Do not send sensitive free-text input to analytics.

## 15. Acceptance criteria

- A user can submit the intake and receive a structured preview.
- Public claims are traceable to real source IDs.
- The preview is useful without revealing the complete paid report.
- Checkout supports ordinary payment and promotion codes.
- Successful payment returns to the same report and unlocks it securely.
- Full reports survive serverless instances for seven days when Upstash is configured.
- The PDF contains all substantive report sections and the evidence ledger.
- Strategy is visually and conceptually featured across the platform.
- Existing Scan, Signal, Launch, Deal, blog, and consulting flows remain functional.
- Production TypeScript and Next.js builds pass.

## 16. Phased roadmap

### Phase 1 — Complete public product

Build the requirements in this document without accounts or recurring billing.

### Phase 2 — Connected agent system

- Import prior FrontierGTM report IDs
- Prefill specialist-agent forms from Strategy
- Return specialist findings to a Strategy refresh
- Add a decision log and version comparison

### Phase 3 — Strategy workspace

- Authenticated company workspace
- Internal documents and approved company context
- Quarterly or monthly refreshes
- Shared executive view
- Persistent assumptions, metrics, and decisions

### Phase 4 — Client operating system

- Slack, CRM, email, analytics, and document integrations
- Recurring Signal monitoring
- Custom agent policies and evaluations
- FrontierGTM consulting and managed strategy cadence

## 17. Implementation checkpoint

Use this section when resuming work.

- [x] Product thesis and scope approved
- [x] Durable PRD written
- [x] Schema and report contract implemented
- [x] Research and evidence pipeline implemented
- [x] Together AI analysis implemented
- [x] Upstash storage and rate limiting implemented
- [x] Preview API implemented
- [x] Stripe checkout and paid unlock implemented
- [x] Strategy page and client experience implemented
- [x] Branded PDF implemented
- [x] Platform navigation and hierarchy updated
- [x] Open Strategy skill implemented
- [x] Local build and product-flow QA complete
- [x] GitHub push and Vercel production verification complete
