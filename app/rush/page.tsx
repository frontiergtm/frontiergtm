import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Check,
  Clock as Clock3,
  Cpu,
  Crosshair,
  Diamond as Gem,
  Lightbulb,
  Mountains as Mountain,
  Sparkle as Sparkles,
  Lightning as Zap,
} from '@phosphor-icons/react/dist/ssr';
import { RushForm } from '@/components/rush-application-form';
import './rush.css';

export const metadata: Metadata = {
  title: 'FrontierGTM Rush | Free Hands-On GTM Consulting for Frontier AI',
  description:
    'Apply for FrontierGTM Rush Fall 2026: up to three hours of hands-on GTM consulting and up to $500 in AI token usage, free of charge.',
  alternates: { canonical: 'https://www.frontiergtm.ai/rush' },
  openGraph: {
    title: 'FrontierGTM Rush | Bring a hard GTM problem',
    description: 'Apply for FrontierGTM Rush Fall 2026 and receive up to three hours of hands-on GTM consulting, free.',
    type: 'website',
    url: 'https://www.frontiergtm.ai/rush',
    images: [{ url: '/frontiergtm-rush-social-preview.png', width: 1200, height: 630, alt: 'FrontierGTM Rush — Bring a hard GTM problem' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrontierGTM Rush | Bring a hard GTM problem',
    description: 'Apply for FrontierGTM Rush Fall 2026 and receive up to three hours of hands-on GTM consulting, free.',
    images: ['/frontiergtm-rush-social-preview.png'],
  },
};

const problemTypes = [
  'Sharpen positioning or messaging',
  'Pressure-test an ICP',
  'Develop a launch strategy',
  'Analyze competitors or target accounts',
  'Create technical or category content',
  'Design an AI-native GTM workflow',
];

const fitSignals = [
  'You are building an ambitious, technically complex product.',
  'You can name a specific GTM problem that matters now.',
  'A few focused hours could unlock a decision or useful output.',
  'You are ready to work directly, candidly, and quickly.',
];

export default function RushPage() {
  return (
    <main id="top" className="rush-page">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className="rush-header">
        <div className="site-shell header-inner">
          <Link className="brand" href="https://www.frontiergtm.ai/" aria-label="FrontierGTM home">
            <Image src="/frontiergtm-logo-header-transparent.png" alt="FrontierGTM" width={1636} height={429} priority />
          </Link>
          <nav aria-label="Rush page navigation">
            <a href="#program">The program</a>
            <a href="#fit">Who it&apos;s for</a>
            <a className="nav-cta" href="#apply">Apply now <ArrowRight aria-hidden="true" /></a>
          </nav>
        </div>
      </header>

      <section className="rush-hero" aria-labelledby="rush-title">
        <div className="hero-media" aria-hidden="true">
          <Image src="/frontier-hero-headlands-view-v8.png" alt="" fill priority sizes="100vw" />
        </div>
        <div className="hero-scrim" aria-hidden="true" />
        <div className="hero-trail" aria-hidden="true" />

        <div className="site-shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles aria-hidden="true" /> FrontierGTM Rush Fall 2026 · Applications open</p>
            <h1 id="rush-title">
              Bring a hard GTM problem.
              <span>Let&apos;s solve it in a rush.</span>
            </h1>
            <p className="hero-lede">
              FrontierGTM Rush is a focused, hands-on program for a small inaugural cohort of frontier AI
              companies, offering up to three hours of GTM consulting—plus up to $500 in AI token usage—free of charge.
            </p>
            <div className="hero-actions">
              <a className="button button-gold" href="#apply">
                Join the Rush <ArrowRight aria-hidden="true" />
              </a>
              <a className="text-link" href="#program">See how it works <ArrowDown aria-hidden="true" /></a>
            </div>
            <div className="offer-strip" aria-label="Program highlights">
              <span><Clock3 aria-hidden="true" /> Up to 3 hours</span>
              <span><Cpu aria-hidden="true" /> Up to $500 in AI usage</span>
              <span><Check aria-hidden="true" /> No cost or obligation</span>
            </div>
          </div>

          <aside className="hero-note" aria-label="Frontier AI Cohort summary">
            <div className="note-topline"><span>Frontier AI Cohort</span><span>01 / Fall 2026</span></div>
            <Mountain aria-hidden="true" />
            <p>Selected teams skip the long proposal process and go straight to useful work.</p>
            <a href="#apply">Bring your problem <ArrowRight aria-hidden="true" /></a>
          </aside>
        </div>
      </section>

      <div id="main-content">
        <section className="statement-section" id="program">
          <div className="site-shell statement-grid">
            <div>
              <p className="section-kicker">Why Rush?</p>
              <h2>The AI gold rush is on. Breakthrough products still need a way to market.</h2>
            </div>
            <div className="statement-copy">
              <p>
                New models, infrastructure, developer platforms, agents, and categories are forming
                almost as quickly as companies can name them. The technology moves fast. The story,
                market choice, and go-to-market system have to catch up.
              </p>
              <p>
                Rush is a short, focused way to evaluate fit by doing real work together—not by
                spending weeks discussing hypothetical work.
              </p>
            </div>
          </div>
        </section>

        <section className="value-section" aria-labelledby="value-title">
          <div className="site-shell">
            <div className="section-heading centered-heading">
              <p className="section-kicker">What selected companies receive</p>
              <h2 id="value-title">Three focused hours. One consequential problem.</h2>
              <p>No retainer. No long proposal process. No obligation to continue afterward.</p>
            </div>
            <div className="value-grid">
              <article>
                <span>01</span><Crosshair aria-hidden="true" />
                <h3>Hands-on GTM work</h3>
                <p>Up to three hours of senior strategy and execution applied to a real, specific challenge.</p>
              </article>
              <article>
                <span>02</span><Zap aria-hidden="true" />
                <h3>AI-native leverage</h3>
                <p>Up to $500 in AI token usage where research, synthesis, testing, or prototyping improves the result.</p>
              </article>
              <article>
                <span>03</span><Gem aria-hidden="true" />
                <h3>Something useful</h3>
                <p>Leave with a sharper decision, a stronger point of view, or a concrete asset you can use.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="problems-section" aria-labelledby="problems-title">
          <div className="site-shell problems-grid">
            <div className="problems-intro">
              <p className="section-kicker">Bring a real GTM problem</p>
              <h2 id="problems-title">Specific beats generic.</h2>
              <p>The strongest applications identify a problem where a few hours of focused work can materially improve the answer.</p>
              <div className="priority-note">
                <Lightbulb aria-hidden="true" />
                <p>Priority goes to AI infrastructure, developer platforms, inference systems, models, agents, and other technically complex products.</p>
              </div>
            </div>
            <ul className="problem-list">
              {problemTypes.map((problem, index) => (
                <li key={problem}>
                  <span>{String(index + 1).padStart(2, '0')}</span><p>{problem}</p><ArrowRight aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="fit-section" id="fit" aria-labelledby="fit-title">
          <div className="site-shell fit-grid">
            <div className="fit-heading">
              <p className="section-kicker">Who should apply</p>
              <h2 id="fit-title">For ambitious builders at a meaningful GTM moment.</h2>
              <p>
                A competitor launched. The product changed. A new market is opening. Your team needs a
                better story before an important moment. Rush was made for situations like these.
              </p>
            </div>
            <div className="fit-card">
              <p className="fit-label">A strong application usually means:</p>
              <ul>
                {fitSignals.map((signal) => (
                  <li key={signal}><Check aria-hidden="true" /><span>{signal}</span></li>
                ))}
              </ul>
              <p className="fit-footnote">The exact deliverable matters less than the quality of the problem.</p>
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="site-shell">
            <div className="section-heading centered-heading">
              <p className="section-kicker">How it works</p>
              <h2 id="process-title">Skip ahead to the part that matters.</h2>
            </div>
            <ol className="process-list">
              <li><span>01</span><div><h3>Apply with a real problem</h3><p>Tell us what you are building, what is stuck, and why the moment matters now.</p></div></li>
              <li><span>02</span><div><h3>FrontierGTM selects the cohort</h3><p>We look for strong fit, a focused challenge, and the potential to create value quickly.</p></div></li>
              <li><span>03</span><div><h3>We do the work together</h3><p>Use up to three focused hours to challenge, decide, create, test, or prototype.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="apply-section" id="apply" aria-labelledby="apply-title">
          <div className="site-shell apply-grid">
            <div className="apply-copy">
              <p className="section-kicker">Applications are open</p>
              <h2 id="apply-title">What could we get done in three focused hours?</h2>
              <p>Tell us what you are building, the GTM problem, why it matters now, and what a useful outcome would look like.</p>
              <div className="apply-details">
                <span>FrontierGTM Rush Fall 2026</span><span>Small inaugural cohort</span><span>Free for selected companies</span>
              </div>
            </div>
            <div className="form-card">
              <div className="form-card-heading">
                <p>FrontierGTM Rush application</p><span>All fields are reviewed by Ryan Pollock.</span>
              </div>
              <RushForm />
            </div>
          </div>
        </section>
      </div>

      <footer>
        <div className="site-shell footer-inner">
          <Link className="brand footer-brand" href="https://www.frontiergtm.ai/" aria-label="FrontierGTM home">
            <Image src="/frontiergtm-logo-header-transparent.png" alt="FrontierGTM" width={1636} height={429} />
          </Link>
          <p>Forward-deployed GTM for bold AI builders.</p>
          <div><a href="mailto:ryan@frontiergtm.ai">ryan@frontiergtm.ai</a><span>© 2026 FrontierGTM</span></div>
        </div>
      </footer>
    </main>
  );
}
