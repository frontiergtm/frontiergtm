import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
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
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="FrontierGTM home"><Image src="/frontiergtm-logo-header-transparent.png" alt="FrontierGTM" width={1636} height={429} priority /></Link>
      <div className={styles.headerLinks}><Link href="/scan">Scan</Link><Link href="/signal">Signal</Link><Link href="/"><ArrowLeft size={15} weight="bold" /> FrontierGTM</Link></div>
    </header>
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
