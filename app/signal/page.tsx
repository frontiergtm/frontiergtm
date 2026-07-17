import type { Metadata } from "next";
import { Header } from "@/components/header";
import { AgentSuiteFooter } from "@/components/agents/agent-suite-footer";
import { SignalExperience } from "@/components/signal/signal-experience";
import styles from "./signal.module.css";

export const metadata: Metadata = {
  title: "AI Market Intelligence Brief | FrontierGTM Signal",
  description: "Turn recent market, competitor, and category moves into an evidence-backed executive brief and three concrete GTM actions.",
  alternates: { canonical: "https://www.frontiergtm.ai/signal" },
  openGraph: {
    title: "FrontierGTM Signal | Know what moved—and what to do next",
    description: "A source-backed market move brief for AI infrastructure and agent company executives.",
    url: "https://www.frontiergtm.ai/signal",
    siteName: "FrontierGTM",
    type: "website",
  },
};

export default function SignalPage() {
  return (
    <main className={styles.page} id="top">
      <Header />

      <section className={styles.hero}>
        <div className={styles.radar} aria-hidden="true"><span /><span /><span /><i /></div>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>FrontierGTM Agents · Signal · Research beta</p>
          <h1>Know what moved.<br /><em>Know what to do next.</em></h1>
          <p className={styles.heroLead}>A source-backed market move brief for AI executives and operators—recent developments, competitive implications, and three concrete GTM actions.</p>
          <div className={styles.trustRow}><span>Live public research</span><span>Evidence linked</span><span>Built for AI markets</span></div>
        </div>
      </section>

      <SignalExperience />
      <AgentSuiteFooter current="Signal" />
    </main>
  );
}
