import Image from "next/image";
import { ArrowDown, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { BookCallLink } from "@/components/book-call-link";
import { Header } from "@/components/header";
import { Icon, IconName } from "@/components/icons";
import { MotionEffects } from "@/components/motion-effects";
import { consultationMailto } from "@/content/contact";
import { agentProducts, audiences, engagements, proofPoints, services } from "@/content/site";

const experienceLogos = [
  { name: "Together AI", src: "/logos/together-ai-wordmark.png", className: "employer-logo-together" },
  { name: "Google Cloud", src: "/logos/google-cloud.svg", className: "employer-logo-google" },
  { name: "DigitalOcean", src: "/logos/digitalocean-wordmark.png", className: "employer-logo-digitalocean" },
  { name: "Oracle", src: "/logos/oracle.svg", className: "employer-logo-oracle" },
  { name: "Vultr", src: "/logos/vultr.svg", className: "employer-logo-vultr" },
];

export type HomepageVariant = "capacity" | "early-startups";

const pageCopy = {
  capacity: {
    heroEyebrow: "Senior strategy and execution for bold AI builders",
    heroSubhead:
      "FrontierGTM helps technical founders explain what they do, reach the right buyers, and build AI-native GTM systems—through senior consulting, hands-on execution, and specialized agents.",
    problemHeadingStacked: true,
    problemParagraphs: [
      "AI markets move quickly. Product launches, category shifts, pipeline goals, and sales needs keep moving with them.",
      "FrontierGTM brings senior judgment and hands-on execution to the moments that matter — working directly with founders or alongside existing teams to sharpen the story and turn strategy into momentum.",
    ],
    audienceLead: "Built for teams creating AI agents, infrastructure, and the platforms developers build on.",
    audienceBody: "Bring FrontierGTM in to lead a critical initiative, strengthen the team, or keep GTM moving through a period of change.",
    engagementSubhead: "Senior strategy and hands-on execution, shaped to the moment.",
    introConsultation: {
      eyebrow: "45 minutes · complimentary",
      title: "Intro Consultation",
      description:
        "A practical first conversation about your product, GTM priorities, and where focused senior help could create the most leverage.",
    },
    conversionNote: {
      label: "A path that can grow",
      heading: "Fractional first. Full-time when the fit is exceptional.",
      body: "Start with a focused or fractional engagement and see the work in action. If the fit proves exceptional on both sides, Ryan is open to the relationship evolving into a full-time marketing leadership role.",
    },
    ctaHeading: ["Ready to move your GTM", "forward?"],
    ctaBody:
      "Turn complex products into sharper positioning, stronger launches, useful content, and repeatable demand—with senior judgment, hands-on execution, and an agent layer built for the work.",
  },
  "early-startups": {
    heroEyebrow: "The AI gold rush needs a map",
    heroSubhead:
      "FrontierGTM helps AI infrastructure, cloud, and developer platform companies explain what they do, reach the right buyers, and build modern marketing engines before hiring a full team.",
    problemHeadingBefore: "Technical companies need marketing ",
    problemHeadingAccent: "before",
    problemHeadingAfter: " they have a marketing team.",
    problemHeadingStacked: false,
    problemParagraphs: [
      "Founders know the product, the market, and the technical edge. But turning that into clear messaging, useful content, demand, sales materials, and repeatable execution is hard — especially when the category is moving fast.",
      "Most early teams do not need a bloated marketing plan. They need senior judgment, sharp messaging, and hands-on execution that helps the company look bigger and move faster.",
    ],
    audienceLead: "Built for technical founders and early GTM teams.",
    audienceBody: "We work with companies building complex products in fast-moving markets, including:",
    engagementSubhead: "Senior marketing help without the full-time hire.",
    introConsultation: null,
    conversionNote: null,
    ctaHeading: ["Need senior marketing help", "before you hire the team?"],
    ctaBody:
      "FrontierGTM helps technical founders turn complex products into clear messaging, useful content, qualified demand, and repeatable GTM execution.",
  },
} as const;

export function FrontierHomepage({ variant = "capacity" }: { variant?: HomepageVariant }) {
  const copy = pageCopy[variant];

  return (
    <main className="motion-page" id="top">
      <MotionEffects />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />

      <section className="hero motion-hero" aria-labelledby="motion-hero-title">
        <div className="motion-hero-media" aria-hidden="true">
          <Image
            className="hero-image motion-hero-image"
            src="/frontier-hero-headlands-view-v8.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="motion-trail-light" aria-hidden="true">
            <Image
              className="motion-trail-image"
              src="/frontier-hero-trail-overlay-v8.png"
              alt=""
              fill
              sizes="100vw"
            />
          </div>
        </div>
        <div className="hero-scrim motion-hero-scrim" />
        <div className="hero-glow motion-hero-glow" aria-hidden="true" />
        <div className="motion-hero-horizon" aria-hidden="true" />
        <div className="hero-inner motion-hero-inner">
          <div className="hero-copy motion-hero-copy">
            <p className="motion-hero-eyebrow">{copy.heroEyebrow}</p>
            <h1 id="motion-hero-title" className="hero-title">
              <span className="hero-title-line hero-title-lead">GTM strategy for</span>
              <span className="hero-title-line hero-title-focus">
                the <span className="hero-title-gold">AI frontier</span>
              </span>
            </h1>
            <p className="hero-subhead">{copy.heroSubhead}</p>
            <div className="hero-actions">
              <BookCallLink
                className="button motion-button"
                href={consultationMailto}
                target="_blank"
                rel="noopener noreferrer"
                trackingLocation="hero"
              >
                Work with Ryan <ArrowRight size={17} weight="bold" />
              </BookCallLink>
              <a className="button button-secondary motion-button-secondary" href="/agents">
                Explore GTM Agents <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
        <a className="motion-scroll-cue" href="#main-content">
          <span>Follow the trail</span>
          <ArrowDown size={15} />
        </a>
      </section>

      <div id="main-content">
        <section className="employer-band motion-employer-band" aria-labelledby="motion-employer-title" data-section="employer_band">
          <div className="wide-shell employer-band-inner motion-reveal">
            <p id="motion-employer-title" className="employer-band-label">
              From Ryan Pollock, the pioneering marketer behind
            </p>
            <div className="employer-logo-row" aria-label="Career experience at Together AI, Google Cloud, DigitalOcean, Oracle, and Vultr">
              {experienceLogos.map((logo, index) => (
                <div
                  className={`employer-logo motion-logo ${logo.className}`}
                  key={logo.name}
                  title={logo.name}
                  style={{ "--motion-index": index } as React.CSSProperties}
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={170}
                    height={44}
                    unoptimized={logo.name === "Together AI" || logo.name === "DigitalOcean"}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="problem-section motion-problem" id="problem" data-section="problem">
          <div className="motion-route-line" aria-hidden="true"><span /></div>
          <div className="compact-shell problem-grid">
            <div className="problem-heading motion-reveal motion-reveal-left">
              <Icon name="mountains" size={58} weight="light" />
              <h2>
                {copy.problemHeadingStacked ? (
                  <>
                    The AI <span>gold rush</span> is on.
                    <span className="problem-heading-payoff">
                      Your time to strike is <span>now</span>.
                    </span>
                  </>
                ) : (
                  <>
                    {copy.problemHeadingBefore}
                    <span>{copy.problemHeadingAccent}</span>
                    {copy.problemHeadingAfter}
                  </>
                )}
              </h2>
            </div>
            <div className="problem-copy motion-reveal motion-reveal-right">
              {copy.problemParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </section>

        <section className="services-section motion-services" id="services" data-section="services">
          <div className="wide-shell">
            <div className="center-heading motion-reveal">
              <p className="motion-section-kicker">Your route forward</p>
              <h2>Senior consulting that moves with the market</h2>
              <p>Human judgment and hands-on execution across the GTM work that matters.</p>
            </div>
            <div className="services-grid">
              {services.map((service, index) => (
                <article
                  className="service-card motion-service-card motion-reveal motion-tilt"
                  key={service.title}
                  style={{ "--motion-index": index } as React.CSSProperties}
                >
                  <span className="motion-card-number">0{index + 1}</span>
                  <Icon name={service.icon as IconName} size={43} weight="light" />
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="agent-platform-section" id="gtm-agents" data-section="gtm_agents">
          <div className="wide-shell">
            <div className="agent-platform-intro motion-reveal">
              <div>
                <p className="motion-section-kicker">The FrontierGTM agent layer</p>
                <h2>Specialized GTM agents, built into how FrontierGTM works.</h2>
              </div>
              <div>
                <p>
                  Use them independently, bring their findings into a consulting engagement, or have FrontierGTM adapt the underlying workflows to your company.
                </p>
                <div className="agent-platform-links">
                  <a href="/agents">Explore Web Agents <ArrowRight size={16} weight="bold" /></a>
                  <a href="/skills">Install Open Skills <ArrowRight size={16} weight="bold" /></a>
                </div>
              </div>
            </div>

            <div className="agent-product-grid">
              {agentProducts.map((agent, index) => (
                <a className="agent-product-card motion-reveal" href={agent.href} key={agent.name} style={{ "--motion-index": index } as React.CSSProperties}>
                  <div className="agent-product-card-top">
                    <span>{agent.number}</span>
                    <Icon name={agent.icon as IconName} size={31} weight="light" />
                  </div>
                  <p className="agent-product-label">FrontierGTM {agent.name}</p>
                  <h3>{agent.question}</h3>
                  <p>{agent.description}</p>
                  <strong>{agent.outcome}</strong>
                  <span className="agent-product-action">Run {agent.name} <ArrowRight size={15} weight="bold" /></span>
                </a>
              ))}
            </div>

            <div className="agent-system-path motion-reveal" aria-label="How FrontierGTM Agents connect to consulting">
              <span><small>01</small>Use a focused agent</span>
              <i aria-hidden="true">→</i>
              <span><small>02</small>Apply the findings with Ryan</span>
              <i aria-hidden="true">→</i>
              <span><small>03</small>Build the workflow into your team</span>
            </div>
          </div>
        </section>

        <section className="agent-builds-section" id="agent-builds" data-section="agent_builds">
          <div className="wide-shell agent-builds-layout">
            <div className="agent-builds-copy motion-reveal motion-reveal-left">
              <p className="motion-section-kicker">Custom agent systems</p>
              <h2>Agents that understand your market, context, and way of working.</h2>
              <p>
                FrontierGTM designs focused GTM agents around the decisions your team repeatedly makes—then connects them to the tools and workflows people already use.
              </p>
              <div className="agent-builds-actions">
                <a className="button" href="/agent-builds">Explore Agent Builds <ArrowRight size={16} weight="bold" /></a>
                <a href="mailto:ryan@frontiergtm.ai?subject=Custom%20FrontierGTM%20Agent">Discuss an agent with Ryan</a>
              </div>
            </div>
            <div className="agent-builds-capabilities motion-reveal motion-reveal-right">
              {[
                ["Market intelligence", "Monitor competitors, categories, buyers, and high-signal change."],
                ["Account intelligence", "Turn public evidence and internal context into useful account briefs."],
                ["Launch operations", "Coordinate research, narrative, assets, enablement, and follow-through."],
                ["Content systems", "Move from source material to executive, technical, and field-ready content."],
              ].map(([title, description], index) => (
                <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section className="audience-section motion-audience" id="audience" data-section="audience">
          <div className="wide-shell audience-layout">
            <div className="audience-intro motion-reveal motion-reveal-left">
              <p className="motion-section-kicker">Built for the builders</p>
              <h2>Who It’s For</h2>
              <p className="audience-lead">{copy.audienceLead}</p>
              <p>{copy.audienceBody}</p>
            </div>
            <div className="audience-grid motion-reveal motion-reveal-right">
              {audiences.map((audience, index) => (
                <div className="audience-cell motion-audience-cell" key={audience.label} style={{ "--motion-index": index } as React.CSSProperties}>
                  <Icon name={audience.icon as IconName} size={37} weight="light" />
                  <p>{audience.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="engagements-section motion-engagements" id="engagements" data-section="engagements">
          <div className="motion-engagement-glow" aria-hidden="true" />
          <div className="wide-shell">
            <div className="center-heading light-heading motion-reveal">
              <p className="motion-section-kicker">Choose the expedition</p>
              <h2>How Engagements Work</h2>
              <p>{copy.engagementSubhead}</p>
            </div>
            <div className={`engagement-grid${copy.introConsultation ? " engagement-grid-four" : ""}`}>
              {copy.introConsultation && (
                <article
                  className="engagement-card engagement-card-intro motion-engagement-card motion-reveal motion-tilt"
                  style={{ "--motion-index": 0 } as React.CSSProperties}
                >
                  <Icon name="chats" size={39} weight="light" />
                  <div>
                    <p className="motion-engagement-eyebrow">{copy.introConsultation.eyebrow}</p>
                    <h3>{copy.introConsultation.title}</h3>
                    <p>{copy.introConsultation.description}</p>
                  </div>
                </article>
              )}
              {engagements.map((engagement, index) => (
                <article
                  className="engagement-card motion-engagement-card motion-reveal motion-tilt"
                  key={engagement.title}
                  style={{ "--motion-index": index + (copy.introConsultation ? 1 : 0) } as React.CSSProperties}
                >
                  <Icon name={engagement.icon as IconName} size={39} weight="light" />
                  <div>
                    <p className="motion-engagement-eyebrow">{engagement.eyebrow}</p>
                    <h3>{engagement.title}</h3>
                    <p>{engagement.description}</p>
                  </div>
                </article>
              ))}
            </div>
            {copy.conversionNote && (
              <aside className="engagement-conversion-note motion-reveal" aria-labelledby="conversion-note-title">
                <p className="engagement-conversion-label">{copy.conversionNote.label}</p>
                <div>
                  <h3 id="conversion-note-title">{copy.conversionNote.heading}</h3>
                  <p>{copy.conversionNote.body}</p>
                </div>
              </aside>
            )}
          </div>
        </section>

        <section className="about-section motion-about" id="about" data-section="about">
          <div className="about-landscape motion-about-landscape" aria-hidden="true" />
          <div className="wide-shell about-layout">
            <figure className="about-portrait motion-about-portrait motion-reveal motion-reveal-left">
              <div className="motion-portrait-orbit" aria-hidden="true" />
              <div className="about-portrait-frame motion-portrait-frame">
                <Image
                  src="/ryan-pollock-headshot.png"
                  alt="Ryan Pollock, founder of FrontierGTM"
                  width={512}
                  height={512}
                  sizes="(max-width: 720px) 100vw, 340px"
                  unoptimized
                />
              </div>
              <figcaption>
                <span>Ryan Pollock</span>
                Founder, FrontierGTM
              </figcaption>
            </figure>

            <div className="about-content motion-reveal motion-reveal-right">
              <p className="about-eyebrow">Why FrontierGTM</p>
              <h2>Built from hands-on experience at the AI and cloud frontier.</h2>
              <p className="about-lead">
                <a
                  className="about-lead-link"
                  href="https://www.linkedin.com/in/ryanpollock/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ryan Pollock
                </a>{" "}
                brings experience from Together AI, Google Cloud, DigitalOcean, Vultr, and Oracle across AI
                infrastructure, cloud platforms, developer products, and high-growth B2B technology.
              </p>
              <div className="proof-list">
                {proofPoints.map((proof, index) => (
                  <div className="proof-row motion-proof" key={proof} style={{ "--motion-index": index } as React.CSSProperties}>
                    <Icon name="check" size={18} weight="fill" />
                    <p>{proof}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section motion-cta" id="contact" data-section="cta">
          <div className="cta-image motion-cta-image" />
          <div className="cta-scrim" />
          <div className="motion-cta-trail" aria-hidden="true" />
          <div className="compact-shell cta-layout motion-reveal">
            <div>
              <p className="motion-section-kicker">The next move</p>
              <h2>{copy.ctaHeading[0]}<br />{copy.ctaHeading[1]}</h2>
              <p>{copy.ctaBody}</p>
            </div>
            <div className="cta-actions">
              <BookCallLink
                className="button motion-button"
                href={consultationMailto}
                target="_blank"
                rel="noopener noreferrer"
                trackingLocation="final_cta"
              >
                Work with Ryan <ArrowRight size={17} weight="bold" />
              </BookCallLink>
              <a className="button button-secondary motion-button-secondary" href="/agents">
                Explore GTM Agents <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </section>
      </div>

      <footer>
        <p>© {new Date().getFullYear()} FrontierGTM</p>
        <div className="footer-links">
          <a href="mailto:ryan@frontiergtm.ai">ryan@frontiergtm.ai</a>
          <a
            className="footer-social-link"
            href="https://www.linkedin.com/company/frontiergtm/"
            target="_blank"
            rel="noreferrer"
            aria-label="FrontierGTM on LinkedIn"
          >
            <Image src="/linkedin.svg" alt="" width={21} height={21} aria-hidden="true" />
          </a>
        </div>
      </footer>
    </main>
  );
}
