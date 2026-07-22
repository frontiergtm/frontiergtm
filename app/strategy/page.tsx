import type { Metadata } from "next";
import { Header } from "@/components/header";
import { AgentSuiteFooter } from "@/components/agents/agent-suite-footer";
import { StrategyExperience } from "@/components/strategy/strategy-experience";
import styles from "./strategy.module.css";

export const metadata: Metadata = {
  title: "AI GTM Strategy Agent | FrontierGTM Strategy",
  description: "Turn company context and public evidence into explicit GTM choices, non-priorities, assumptions, measures, and a focused 90-day operating agenda.",
  alternates: { canonical: "https://www.frontiergtm.ai/strategy" },
  openGraph: { title: "FrontierGTM Strategy | Make the choices that govern GTM", description: "An evidence-grounded strategy brief for AI infrastructure, agent, cloud, data, and developer-platform companies.", url: "https://www.frontiergtm.ai/strategy", siteName: "FrontierGTM", type: "website" },
};

export default function StrategyPage() { return <main className={styles.page} id="top"><Header /><section className={styles.hero}><div className={styles.architecture} aria-hidden="true"><span /><span /><span /><i /><b /></div><div className={styles.heroInner}><p className={styles.eyebrow}>FrontierGTM Agents · Strategy · Founding release</p><h1>Make the choices<br /><em>that govern GTM.</em></h1><p className={styles.heroLead}>Turn company context and public evidence into a focused market choice, a credible path to win, and a 90-day operating agenda built around what matters now.</p><div className={styles.trustRow}><span>Evidence + executive context</span><span>Explicit non-priorities</span><span>Full brief after preview</span></div></div></section><StrategyExperience /><AgentSuiteFooter current="Strategy" /></main>; }
