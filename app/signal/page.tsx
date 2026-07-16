import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
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
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="FrontierGTM home">
          <Image src="/frontiergtm-logo-header-transparent.png" alt="FrontierGTM" width={1636} height={429} priority />
        </Link>
        <div className={styles.headerLinks}>
          <Link href="/scan">GTM Scan</Link>
          <Link href="/"><ArrowLeft size={15} weight="bold" /> FrontierGTM</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.radar} aria-hidden="true"><span /><span /><span /><i /></div>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>FrontierGTM Signal · Research beta</p>
          <h1>Know what moved.<br /><em>Know what to do next.</em></h1>
          <p className={styles.heroLead}>A source-backed market move brief for AI executives and operators—recent developments, competitive implications, and three concrete GTM actions.</p>
          <div className={styles.trustRow}><span>Live public research</span><span>Evidence linked</span><span>Built for AI markets</span></div>
        </div>
      </section>

      <SignalExperience />
    </main>
  );
}
