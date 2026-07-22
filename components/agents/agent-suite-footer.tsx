import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { agentProducts, strategyAgent } from "@/content/site";
import styles from "./agent-suite-footer.module.css";

export function AgentSuiteFooter({ current }: { current: "Strategy" | "Scan" | "Signal" | "Launch" | "Deal" }) {
  return <section className={styles.section} id="agent-suite" aria-labelledby="agent-suite-heading">
    <div className={styles.shell}>
      <div className={styles.intro}>
        <div><p>Part of FrontierGTM Agents</p><h2 id="agent-suite-heading">One agent for the question. One system for the work.</h2></div>
        <div><p>Use the agents independently, bring the findings into a consulting engagement, or work with FrontierGTM to build the workflow around your team.</p><Link href="/agents">Explore the complete agent platform <ArrowRight size={15} weight="bold" /></Link></div>
      </div>
      <Link className={`${styles.strategy} ${current === "Strategy" ? styles.current : ""}`} href={strategyAgent.href} aria-current={current === "Strategy" ? "page" : undefined}>
        <span>Start here</span><div><small>{current === "Strategy" ? "You are here" : "FrontierGTM Strategy"}</small><h3>{strategyAgent.question}</h3></div><em>{current === "Strategy" ? "Current agent" : "Set the direction"} <ArrowRight size={14} /></em>
      </Link>
      <div className={styles.grid}>
        {agentProducts.map((agent) => <Link className={agent.name === current ? styles.current : ""} href={agent.href} key={agent.name} aria-current={agent.name === current ? "page" : undefined}>
          <span>{agent.number}</span><small>{agent.name === current ? "You are here" : `FrontierGTM ${agent.name}`}</small><h3>{agent.question}</h3><em>{agent.name === current ? "Current agent" : `Run ${agent.name}`} <ArrowRight size={14} /></em>
        </Link>)}
      </div>
      <div className={styles.consulting}>
        <div><p>Bring the work into the room</p><h3>Need judgment, refinement, or execution beyond the first brief?</h3></div>
        <a href={`mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(`FrontierGTM ${current} — work with Ryan`)}`}>Work through it with Ryan <ArrowRight size={15} weight="bold" /></a>
        <Link href="/agent-builds">Build an agent for your team</Link>
      </div>
    </div>
  </section>;
}
