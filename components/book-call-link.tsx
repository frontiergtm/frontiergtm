"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      eventParams?: Record<string, string | number | boolean>,
    ) => void;
  }
}

type BookCallLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  trackingLocation: string;
};

export function BookCallLink({ children, href, onClick, trackingLocation, ...props }: BookCallLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    window.gtag?.("event", "generate_lead", {
      lead_source: "book_call_button",
      button_location: trackingLocation,
      link_url: href ?? "",
    });

    onClick?.(event);
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
