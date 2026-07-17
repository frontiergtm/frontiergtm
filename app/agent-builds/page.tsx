import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, PlugsConnected, ShieldCheck, Wrench } from "@phosphor-icons/react/dist/ssr";
import { Header } from "@/components/header";
import styles from "./agent-builds.module.css";

export const metadata: Metadata = {
  title: "Custom GTM Agent Builds | FrontierGTM",
  description: "FrontierGTM designs focused AI agents and workflows for market intelligence, account strategy, launches, content, and sales enablement.",
  alternates: { canonical: "https://www.frontiergtm.ai/agent-builds" },
};

const capabilities = [
  ["Market and competitor intelligence", "Monitor the companies, categories, buyer priorities, and market changes your team actually needs to understand."],
  ["Account intelligence", "Create evidence-backed account briefs, opportunity narratives, talk tracks, and next-step recommendations."],
  ["Launch operations", "Coordinate research, positioning, claims, content, field enablement, activation, and post-launch follow-through."],
  ["Executive and technical content", "Turn source material and subject-matter expertise into credible, reviewable content workflows."],
  ["Sales enablement", "Support competitive positioning, objections, proof selection, discovery preparation, and buyer-specific messaging."],
  ["Recurring GTM briefs", "Deliver useful intelligence and recommended actions through the channels where the team already works."],
];

export default function AgentBuildsPage() {
  const contactHref = "mailto:ryan@frontiergtm.ai?subject=FrontierGTM%20Custom%20Agent%20Build&body=I%27d%20like%20to%20discuss%20a%20GTM%20agent%20or%20workflow%20for%20our%20team.";
  return <main className={styles.page}>
    <Header />
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <p>FrontierGTM Agent Builds</p>
        <h1>Build GTM agents around the way your team actually works.</h1>
        <div className={styles.heroBottom}>
          <p>Focused agent systems for AI infrastructure, agent, cloud, data, and developer-platform companies—designed with senior GTM judgment and embedded into real operating workflows.</p>
          <a href={contactHref}>Discuss an agent with Ryan <ArrowRight size={17} weight="bold" /></a>
        </div>
      </div>
    </section>

    <section className={styles.definition}>
      <div className={styles.shell}>
        <div><p>Not a generic chatbot</p><h2>An agent should own a useful piece of GTM work.</h2></div>
        <div><p>FrontierGTM starts with the decision, deliverable, evidence, and review process—not with a model demo. The result is a focused system your team can understand, govern, and improve.</p><ul><li><Check size={15} />Built around a recurring business need</li><li><Check size={15} />Grounded in approved sources and company context</li><li><Check size={15} />Designed for human review and accountable action</li></ul></div>
      </div>
    </section>

    <section className={styles.capabilities}>
      <div className={styles.shell}>
        <div className={styles.sectionHead}><p>High-leverage use cases</p><h2>Where focused GTM agents can create leverage.</h2></div>
        <div className={styles.capabilityGrid}>{capabilities.map(([title, description], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
      </div>
    </section>

    <section className={styles.workflow}>
      <div className={styles.shell}>
        <div className={styles.workflowIntro}><p>Designed for the operating environment</p><h2>Connected to the tools and channels your team already uses.</h2><span>Depending on the workflow and client environment, an Agent Build can be designed for Slack, email, CRM systems, ChatGPT, Claude, MCP-compatible tools, research APIs, and internal knowledge sources.</span></div>
        <div className={styles.toolGrid}><span>Slack</span><span>Email</span><span>HubSpot</span><span>Salesforce</span><span>ChatGPT</span><span>Claude</span><span>MCP</span><span>Research APIs</span></div>
      </div>
    </section>

    <section className={styles.process}>
      <div className={styles.shell}>
        <div className={styles.sectionHead}><p>From workflow to working system</p><h2>A practical build process.</h2></div>
        <div className={styles.processGrid}>
          <article><Wrench size={27} /><span>01 · Map</span><h3>Define the job</h3><p>Identify the repeated decision, required evidence, users, inputs, outputs, controls, and success criteria.</p></article>
          <article><PlugsConnected size={27} /><span>02 · Build</span><h3>Design the workflow</h3><p>Connect the right models, research, company context, tools, prompts, structured outputs, and review steps.</p></article>
          <article><ShieldCheck size={27} /><span>03 · Embed</span><h3>Put it into practice</h3><p>Test with realistic work, document the system, enable the users, and establish responsible operating boundaries.</p></article>
          <article><ArrowRight size={27} /><span>04 · Improve</span><h3>Learn from use</h3><p>Review quality, adoption, and business usefulness—then improve what the system retrieves, reasons over, and produces.</p></article>
        </div>
      </div>
    </section>

    <section className={styles.engagement}>
      <div className={styles.shell}><div><p>Consulting + implementation</p><h2>Bring the agent layer into your GTM operation.</h2><span>Start with a focused workflow. FrontierGTM can shape the strategy, build the agent, work through implementation with your team, and help turn it into a repeatable capability.</span></div><div><a href={contactHref}>Discuss an Agent Build <ArrowRight size={16} /></a><Link href="/agents">Explore public FrontierGTM Agents</Link></div></div>
    </section>
  </main>;
}
