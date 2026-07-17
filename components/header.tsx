"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { BookCallLink } from "@/components/book-call-link";
import { consultationMailto } from "@/content/contact";
import { agentNavItems, primaryNavItems } from "@/content/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const agentPageActive = pathname === "/agents" || agentNavItems.some((item) => item.href === pathname);
  const desktopAgentMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (desktopAgentMenu.current?.open && !desktopAgentMenu.current.contains(event.target as Node)) {
        desktopAgentMenu.current.removeAttribute("open");
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && desktopAgentMenu.current?.open) {
        desktopAgentMenu.current.removeAttribute("open");
        desktopAgentMenu.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 sm:px-6">
        <a className="brand-wordmark" href="/" aria-label="FrontierGTM home">
          <Image src="/frontiergtm-logo-header-transparent.png" alt="FrontierGTM" width={1636} height={429} priority />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          <a className="nav-link" href={primaryNavItems[0].href}>{primaryNavItems[0].label}</a>
          <details className="nav-menu" ref={desktopAgentMenu}>
            <summary className={`nav-link nav-menu-trigger ${agentPageActive ? "nav-menu-current" : ""}`}>GTM Agents <CaretDown size={13} weight="bold" /></summary>
            <div className="nav-menu-panel">
              <p>FrontierGTM agents</p>
              {agentNavItems.map((item) => (
                <a className={`agent-nav-item ${pathname === item.href ? "agent-nav-item-current" : ""}`} href={item.href} key={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </a>
              ))}
              <a className={`agent-nav-hub ${pathname === "/agents" ? "agent-nav-hub-current" : ""}`} href="/agents" aria-current={pathname === "/agents" ? "page" : undefined}>Explore all GTM Agents <span>→</span></a>
            </div>
          </details>
          {primaryNavItems.slice(1).map((item) => (
            <a className={`nav-link ${pathname === item.href ? "nav-menu-current" : ""}`} href={item.href} key={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</a>
          ))}
        </nav>

        <BookCallLink
          className="button button-small header-cta"
          href={consultationMailto}
          target="_blank"
          rel="noopener noreferrer"
          trackingLocation="header"
        >
          Work with Ryan
        </BookCallLink>

        <button
          className="grid size-11 place-items-center rounded-full border border-white/20 text-white lg:hidden"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={22} /> : <List size={23} />}
        </button>
      </div>

      <div
        className={`fixed inset-x-0 top-20 bottom-0 bg-ink/98 px-5 pt-10 backdrop-blur-xl transition duration-300 lg:hidden ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-4 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-lg flex-col" aria-label="Mobile navigation">
          <a className="mobile-nav-link border-b border-white/10 py-5 text-2xl font-normal tracking-[-0.02em]" href={primaryNavItems[0].href} onClick={() => setOpen(false)}>
            {primaryNavItems[0].label}
          </a>
          <details className="mobile-agent-menu border-b border-white/10">
            <summary className="mobile-nav-link flex cursor-pointer items-center justify-between py-5 text-2xl font-normal tracking-[-0.02em]">
              GTM Agents <CaretDown size={18} weight="bold" />
            </summary>
            <div className="mobile-agent-list">
              {agentNavItems.map((item) => (
                <a className={pathname === item.href ? "mobile-agent-current" : ""} href={item.href} key={item.href} aria-current={pathname === item.href ? "page" : undefined} onClick={() => setOpen(false)}>
                  <strong>{item.label}</strong><span>{item.description}</span>
                </a>
              ))}
              <a className={`mobile-agent-hub ${pathname === "/agents" ? "mobile-agent-current" : ""}`} href="/agents" aria-current={pathname === "/agents" ? "page" : undefined} onClick={() => setOpen(false)}>
                <strong>Explore all GTM Agents</strong><span>See how the agent system works</span>
              </a>
            </div>
          </details>
          {primaryNavItems.slice(1).map((item) => (
            <a
              className="mobile-nav-link border-b border-white/10 py-5 text-2xl font-normal tracking-[-0.02em]"
              href={item.href}
              key={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <BookCallLink
            className="button mt-8"
            href={consultationMailto}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            trackingLocation="mobile_nav"
          >
            Work with Ryan
          </BookCallLink>
        </nav>
      </div>
    </header>
  );
}
