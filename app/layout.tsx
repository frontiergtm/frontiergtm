import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FrontierGTM | GTM strategy for the AI frontier",
  description:
    "Senior GTM strategy and execution for AI agent, infrastructure, and developer platform companies.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-ZN5DWSSYSZ" strategy="beforeInteractive" />
        <Script
          id="google-analytics"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-ZN5DWSSYSZ');
            `,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
