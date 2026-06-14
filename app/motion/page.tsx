import Image from "next/image";
import { ArrowDown, ArrowRight, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { Header } from "@/components/header";
import { Icon, IconName } from "@/components/icons";
import { MotionEffects } from "@/components/motion-effects";
import { audiences, engagements, proofPoints, services } from "@/content/site";

const experienceLogos = [
  { name: "Together AI", src: "/logos/together-ai-wordmark.png", className: "employer-logo-together" },
  { name: "Google Cloud", src: "/logos/google-cloud.svg", className: "employer-logo-google" },
  { name: "DigitalOcean", src: "/logos/digitalocean-wordmark.png", className: "employer-logo-digitalocean" },
  { name: "Oracle", src: "/logos/oracle.svg", className: "employer-logo-oracle" },
  { name: "Vultr", src: "/logos/vultr.svg", className: "employer-logo-vultr" },
];

export default function MotionHome() {
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
            <p className="motion-hero-eyebrow">The AI gold rush needs a map</p>
            <h1 id="motion-hero-title" className="hero-title">
              <span className="hero-title-line hero-title-lead">GTM strategy for</span>
              <span className="hero-title-line hero-title-focus">
                the <span className="hero-title-gold">AI frontier</span>
              </span>
            </h1>
            <p className="hero-subhead">
              FrontierGTM helps AI infrastructure, cloud, and developer platform companies explain what they do,
              reach the right buyers, and build modern marketing engines before hiring a full team.
            </p>
            <div className="hero-actions">
              <a className="button motion-button" href="#contact">Book a Call <ArrowRight size={17} weight="bold" /></a>
              <a className="button button-secondary motion-button-secondary" href="#services">
                See What We Help With <ArrowDown size={17} />
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
        <section className="employer-band motion-employer-band" aria-labelledby="motion-employer-title">
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

        <section className="problem-section motion-problem" id="problem">
          <div className="motion-route-line" aria-hidden="true"><span /></div>
          <div className="compact-shell problem-grid">
            <div className="problem-heading motion-reveal motion-reveal-left">
              <Icon name="mountains" size={58} weight="light" />
              <h2>Technical companies need marketing <span>before</span> they have a marketing team.</h2>
            </div>
            <div className="problem-copy motion-reveal motion-reveal-right">
              <p>
                Founders know the product, the market, and the technical edge. But turning that into clear messaging,
                useful content, demand, sales materials, and repeatable execution is hard — especially when the
                category is moving fast.
              </p>
              <p>
                Most early teams do not need a bloated marketing plan. They need senior judgment, sharp messaging,
                and hands-on execution that helps the company look bigger and move faster.
              </p>
            </div>
          </div>
        </section>

        <section className="services-section motion-services" id="services">
          <div className="wide-shell">
            <div className="center-heading motion-reveal">
              <p className="motion-section-kicker">Your route forward</p>
              <h2>What FrontierGTM Does</h2>
              <p>Strategy, messaging, content, demand gen, and AI-native execution.</p>
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

        <section className="audience-section motion-audience" id="audience">
          <div className="wide-shell audience-layout">
            <div className="audience-intro motion-reveal motion-reveal-left">
              <p className="motion-section-kicker">Built for the builders</p>
              <h2>Who It’s For</h2>
              <p className="audience-lead">Built for technical founders and early GTM teams.</p>
              <p>We work with companies building complex products in fast-moving markets, including:</p>
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

        <section className="engagements-section motion-engagements" id="engagements">
          <div className="motion-engagement-glow" aria-hidden="true" />
          <div className="wide-shell">
            <div className="center-heading light-heading motion-reveal">
              <p className="motion-section-kicker">Choose the expedition</p>
              <h2>How Engagements Work</h2>
              <p>Senior marketing help without the full-time hire.</p>
            </div>
            <div className="engagement-grid">
              {engagements.map((engagement, index) => (
                <article
                  className="engagement-card motion-engagement-card motion-reveal motion-tilt"
                  key={engagement.title}
                  style={{ "--motion-index": index } as React.CSSProperties}
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
          </div>
        </section>

        <section className="about-section motion-about" id="about">
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
                Ryan brings experience from Together AI, Google Cloud, DigitalOcean, Vultr, and Oracle across AI
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

        <section className="cta-section motion-cta" id="contact">
          <div className="cta-image motion-cta-image" />
          <div className="cta-scrim" />
          <div className="motion-cta-trail" aria-hidden="true" />
          <div className="compact-shell cta-layout motion-reveal">
            <div>
              <p className="motion-section-kicker">The next move</p>
              <h2>Need senior marketing help<br />before you hire the team?</h2>
              <p>
                FrontierGTM helps technical founders turn complex products into clear messaging, useful content,
                qualified demand, and repeatable GTM execution.
              </p>
            </div>
            <div className="cta-actions">
              <a className="button motion-button" href="mailto:hello@frontiergtm.com?subject=FrontierGTM%20intro">
                Book a Call <ArrowRight size={17} weight="bold" />
              </a>
              <a className="button button-secondary motion-button-secondary" href="mailto:hello@frontiergtm.com">
                Send a Note <EnvelopeSimple size={18} />
              </a>
            </div>
          </div>
        </section>
      </div>

      <footer>
        <p>© {new Date().getFullYear()} FrontierGTM</p>
        <a href="mailto:hello@frontiergtm.com">hello@frontiergtm.com</a>
      </footer>
    </main>
  );
}
