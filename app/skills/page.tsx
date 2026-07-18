import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BracketsCurly, Browser, Check, GithubLogo, LockKeyOpen, Wrench } from "@phosphor-icons/react/dist/ssr";
import { Header } from "@/components/header";
import { Icon, type IconName } from "@/components/icons";
import { frontierSkills, frontierSkillsRepository } from "@/content/skills";
import styles from "./skills.module.css";

export const metadata: Metadata = {
  title: "Open GTM Skills for ChatGPT, Claude, Codex & Agents | FrontierGTM",
  description: "Install free, open FrontierGTM skills for positioning, market intelligence, launches, account strategy, and GTM agent design.",
  alternates: { canonical: "https://www.frontiergtm.ai/skills" },
};

const githubSkillUrl = (slug: string) => `${frontierSkillsRepository}/tree/main/skills/${slug}`;

export default function SkillsPage() {
  return <main className={styles.page}>
    <Header />

    <section className={styles.hero}>
      <div className={styles.shell}>
        <p>FrontierGTM Open Skills</p>
        <h1>Bring FrontierGTM into the agent where you already work.</h1>
        <div className={styles.heroBottom}>
          <span>Free, inspectable Agent Skills for ChatGPT Work, Codex, Claude, Hermes, and other compatible agents—built for AI and technical infrastructure GTM.</span>
          <a href="#install">Install the collection <ArrowRight size={16} weight="bold" /></a>
        </div>
      </div>
    </section>

    <section className={styles.layers}>
      <div className={styles.shell}>
        <div className={styles.sectionIntro}><p>One FrontierGTM system</p><h2>Use the right layer for the work.</h2></div>
        <div className={styles.layerGrid}>
          <article><Browser size={29} /><span>01 · Web Agents</span><h3>Start immediately</h3><p>Run a focused, hosted experience with public-safe inputs and a controlled research and analysis workflow.</p><Link href="/agents">Explore Web Agents <ArrowRight size={14} /></Link></article>
          <article className={styles.activeLayer}><BracketsCurly size={29} /><span>02 · Open Skills</span><h3>Work inside your agent</h3><p>Use FrontierGTM methods with your own files, context, research tools, and preferred agent environment.</p><a href="#collection">See the collection <ArrowRight size={14} /></a></article>
          <article><Wrench size={29} /><span>03 · Custom Systems</span><h3>Embed the workflow</h3><p>Adapt the method to company knowledge, operating tools, permissions, evaluations, and repeatable team use.</p><Link href="/agent-builds">Explore Agent Builds <ArrowRight size={14} /></Link></article>
        </div>
      </div>
    </section>

    <section className={styles.collection} id="collection">
      <div className={styles.shell}>
        <div className={styles.collectionIntro}><div><p>The first collection</p><h2>Five useful jobs. Not five generic prompts.</h2></div><span>Each skill defines evidence standards, a repeatable workflow, operating boundaries, and a concrete executive deliverable.</span></div>
        <div className={styles.skillGrid}>
          {frontierSkills.map((skill) => <article key={skill.slug} className={styles.skillCard}>
            <div className={styles.skillTop}><span>{skill.number}</span><Icon name={skill.icon as IconName} size={28} weight="light" /></div>
            <small>{skill.type}</small>
            <h3>{skill.name}</h3>
            <h4>{skill.question}</h4>
            <p>{skill.description}</p>
            <strong>{skill.outcome}</strong>
            <a href={githubSkillUrl(skill.slug)} target="_blank" rel="noreferrer">Inspect the skill <GithubLogo size={16} weight="bold" /></a>
          </article>)}
        </div>
      </div>
    </section>

    <section className={styles.install} id="install">
      <div className={styles.shell}>
        <div className={styles.installIntro}><p>Open and portable</p><h2>Install the whole collection from GitHub.</h2><span>The skills use the open Agent Skills format. They contain readable instructions and references, require no FrontierGTM account or API key, and send no telemetry to FrontierGTM.</span></div>
        <div className={styles.commandCard}>
          <div><span>Claude Code · Codex · Cursor · compatible agents</span><code>npx skills add frontiergtm/frontiergtm-skills</code></div>
          <a href={frontierSkillsRepository} target="_blank" rel="noreferrer"><GithubLogo size={18} /> View source on GitHub</a>
        </div>
        <div className={styles.platformGrid}>
          <article><h3>ChatGPT Work + Codex</h3><p>The repository includes FrontierGTM plugin packaging and a marketplace definition. Add the GitHub marketplace, then install FrontierGTM directly or from the Plugins browser.</p><code>codex plugin marketplace add frontiergtm/frontiergtm-skills<br />codex plugin add frontiergtm@frontiergtm</code></article>
          <article><h3>Claude + Claude Code</h3><p>Use the universal installer with Claude Code. The repository also includes Claude-compatible marketplace metadata; individual skill folders can be uploaded to supported Claude Skills surfaces.</p></article>
          <article><h3>Hermes Agent</h3><p>Add the repository as a tap, then search or install any FrontierGTM skill from the collection.</p><code>hermes skills tap add frontiergtm/frontiergtm-skills</code></article>
        </div>
        <div className={styles.trust}><LockKeyOpen size={25} /><div><h3>Designed to be inspected</h3><p>No bundled executable scripts. No automatic external actions. No hidden data collection. The installed agent uses only the context and tools the user chooses to provide.</p></div><Check size={22} /></div>
      </div>
    </section>

    <section className={styles.cta}>
      <div className={styles.shell}><div><p>From open method to operating system</p><h2>Make the workflow specific to your company.</h2><span>FrontierGTM can adapt these methods to your market, knowledge, tools, review process, and GTM operation—or design a new agent around the work your team repeatedly does.</span></div><div><a href="mailto:ryan@frontiergtm.ai?subject=FrontierGTM%20Skill%20or%20Agent%20Build">Discuss a custom system <ArrowRight size={16} /></a><Link href="/agent-builds">Explore Agent Builds</Link></div></div>
    </section>
  </main>;
}
