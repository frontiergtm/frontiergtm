import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrontierGTM | GTM strategy for the AI frontier",
  description:
    "Senior GTM strategy and execution for AI agent, infrastructure, and developer platform companies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
