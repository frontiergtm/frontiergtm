import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, Compass, FlowArrow, Wrench } from "@phosphor-icons/react/dist/ssr";
import { Header } from "@/components/header";
import { Icon, type IconName } from "@/components/icons";
import { agentProducts } from "@/content/site";
import styles from "./agents.module.css";

export const metadata: Metadata = {
  title: "FrontierGTM Agents | Specialized AI agents for GTM work",
  description: "Use FrontierGTM Agents for positioning diagnosis, market intelligence, launch strategy, and deal preparation—independently or as part of a FrontierGTM consulting engagement.",
  alternates: { canonical: "https://www.frontiergtm.ai/agents" },
};

export default function AgentsPage() {
  return <main className={styles.page}>
    <Header />
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <p>FrontierGTM Agents</p>
        <h1>A specialized agent layer for high-stakes GTM work.</h1>
        <div className={styles.heroGrid}>
          <p>Research the market, pressure-test the story, and prepare the move—then bring the findings into a working engagement with Ryan or adapt the workflow to your company.</p>
          <div><span>Public-safe research</span><span>Evidence-grounded outputs</span><span>Human judgment when it matters</span></div>
        </div>
      </div>
    </section>

    <section className={styles.agents}>
      <div className={styles.shell}>
        <div className={styles.sectionIntro}><p>Choose the question in front of you</p><h2>Four focused agents. One connected GTM system.</h2></div>
        <div className={styles.agentGrid}>
          {agentProducts.map((agent) => <Link href={agent.href} className={styles.agentCard} key={agent.name}>
            <div><span>{agent.number}</span><Icon name={agent.icon as IconName} size={32} weight="light" /></div>
            <small>FrontierGTM {agent.name}</small>
            <h3>{agent.question}</h3>
            <p>{agent.description}</p>
            <strong>{agent.outcome}</strong>
            <em>Run {agent.name} <ArrowRight size={15} weight="bold" /></em>
          </Link>)}
        </div>
      </div>
    </section>

    <section className={styles.openSkills}>
      <div className={styles.shell}><div><p>FrontierGTM Open Skills</p><h2>Prefer to work inside your own agent?</h2><span>Install FrontierGTM methods into ChatGPT Work, Codex, Claude, Hermes, and compatible agents—then use them with the files, context, and tools you choose.</span></div><Link href="/skills">Explore and install Open Skills <ArrowRight size={16} weight="bold" /></Link></div>
    </section>

    <section className={styles.operatingModel}>
      <div className={styles.shell}>
        <div className={styles.operatingIntro}><p>How the platform works</p><h2>Start with an agent. Keep the human judgment.</h2><span>The agents create a useful first layer of research and strategy. FrontierGTM consulting turns that work into decisions, assets, execution, and repeatable systems.</span></div>
        <div className={styles.steps}>
          <article><Compass size={28} /><span>01</span><h3>Use a focused agent</h3><p>Answer one important GTM question with public evidence and a structured point of view.</p></article>
          <article><CheckCircle size={28} /><span>02</span><h3>Work the problem with Ryan</h3><p>Validate the evidence, sharpen the judgment, and apply the result to the company’s actual constraints.</p></article>
          <article><FlowArrow size={28} /><span>03</span><h3>Connect the work</h3><p>Move from a one-time result to an ongoing operating rhythm across launches, market intelligence, content, and sales.</p></article>
          <article><Wrench size={28} /><span>04</span><h3>Build what is specific</h3><p>Adapt or create an agent around the team’s context, tools, decisions, and workflow.</p></article>
        </div>
      </div>
    </section>

    <section className={styles.cta}>
      <div className={styles.shell}><div><p>FrontierGTM consulting + agents</p><h2>Use the platform—or bring it into the room.</h2><span>FrontierGTM combines senior GTM judgment with specialized agents that make the research, strategy, and execution more rigorous and repeatable.</span></div><div><a href="mailto:ryan@frontiergtm.ai?subject=Work%20with%20FrontierGTM">Work with Ryan <ArrowRight size={16} /></a><Link href="/agent-builds">Explore custom Agent Builds</Link></div></div>
    </section>
  </main>;
}
