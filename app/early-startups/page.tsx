import type { Metadata } from "next";
import { FrontierHomepage } from "@/components/frontier-homepage";

export const metadata: Metadata = {
  title: "GTM Strategy for Early AI Startups | FrontierGTM",
  description:
    "Senior GTM strategy and hands-on marketing execution for technical founders before they hire a full marketing team.",
};

export default function EarlyStartupsPage() {
  return <FrontierHomepage variant="early-startups" />;
}
