import type { Metadata } from "next";
import { Header } from "@/components/header";
import { LaunchExperience } from "@/components/launch/launch-experience";
import styles from "./launch.module.css";

export const metadata: Metadata = {
  title: "AI Product Launch Strategist | FrontierGTM Launch",
  description: "Pressure-test an AI product launch, find the strongest market thesis, and generate an evidence-backed narrative and activation plan.",
  alternates: { canonical: "https://www.frontiergtm.ai/launch" },
  openGraph: {
    title: "FrontierGTM Launch | Turn a product release into market movement",
    description: "An evidence-grounded launch strategist for AI infrastructure, agent, and technical product companies.",
    url: "https://www.frontiergtm.ai/launch",
    siteName: "FrontierGTM",
    type: "website",
  },
};

export default function LaunchPage() {
  return <main className={styles.page} id="top">
    <Header />
    <section className={styles.hero}>
      <div className={styles.trajectory} aria-hidden="true"><span /><span /><span /><i /><b /></div>
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>FrontierGTM Launch · Strategy beta</p>
        <h1>Don’t just announce it.<br /><em>Create market movement.</em></h1>
        <p className={styles.heroLead}>Pressure-test the launch, find the strongest credible thesis, and turn public evidence into a narrative and activation plan your GTM team can use.</p>
        <div className={styles.trustRow}><span>Evidence-grounded</span><span>Buyer-specific</span><span>Built for technical AI launches</span></div>
      </div>
    </section>
    <LaunchExperience />
  </main>;
}
