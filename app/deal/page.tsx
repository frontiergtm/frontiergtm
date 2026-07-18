import type { Metadata } from "next";
import { Header } from "@/components/header";
import { AgentSuiteFooter } from "@/components/agents/agent-suite-footer";
import { DealExperience } from "@/components/deal/deal-experience";
import styles from "./deal.module.css";

export const metadata: Metadata = {
  title: "AI Account & Meeting Intelligence | FrontierGTM Deal",
  description: "Research a target account, find the real why-now signals, and build an evidence-grounded meeting and opportunity brief.",
  alternates: { canonical: "https://www.frontiergtm.ai/deal" },
  openGraph: {
    title: "FrontierGTM Deal Intelligence | Walk into the meeting with a thesis",
    description: "An evidence-grounded account, opportunity, and meeting brief for high-stakes B2B deals.",
    url: "https://www.frontiergtm.ai/deal",
    siteName: "FrontierGTM",
    type: "website",
  },
};

export default function DealPage() {
  return <main className={styles.page} id="top">
    <Header />
    <section className={styles.hero}>
      <div className={styles.signalMap} aria-hidden="true"><span /><span /><span /><i /><b /></div>
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>FrontierGTM Agents · Deal Intelligence · Founding release</p>
        <h1>Walk into the meeting<br /><em>with a real thesis.</em></h1>
        <p className={styles.heroLead}>Research the account, find the evidence behind “why them, why now,” and turn it into a meeting plan built to earn the next step.</p>
        <div className={styles.trustRow}><span>Public evidence</span><span>Fit tested honestly</span><span>Full brief $39</span></div>
      </div>
    </section>
    <DealExperience />
    <AgentSuiteFooter current="Deal" />
  </main>;
}
