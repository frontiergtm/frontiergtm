import type { Metadata } from "next";
import { Header } from "@/components/header";
import { ScanExperience } from "@/components/scan/scan-experience";
import styles from "./scan.module.css";

export const metadata: Metadata = {
  title: "Free AI GTM Scan | FrontierGTM",
  description:
    "Get a source-backed outside-in analysis of your company’s positioning, buyer clarity, proof, conversion path, and highest-leverage GTM moves.",
  alternates: { canonical: "https://www.frontiergtm.ai/scan" },
  openGraph: {
    title: "Free AI GTM Scan | FrontierGTM",
    description: "See how your company’s GTM story lands from the outside—and get three priority moves.",
    url: "https://www.frontiergtm.ai/scan",
    siteName: "FrontierGTM",
    type: "website",
  },
};

export default function ScanPage() {
  return (
    <main className={styles.page} id="top">
      <Header />

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>FrontierGTM Scan · Public beta</p>
          <h1>See how your GTM story lands from the outside.</h1>
          <p className={styles.heroLead}>
            Enter your company website. FrontierGTM will examine the public evidence and identify what is clear,
            what is getting lost, and the three moves most likely to improve your market story.
          </p>
          <div className={styles.trustRow} aria-label="Scan principles">
            <span>Source-backed</span>
            <span>Facts separated from inference</span>
            <span>Built for technical AI companies</span>
          </div>
        </div>
      </section>

      <ScanExperience />
    </main>
  );
}
