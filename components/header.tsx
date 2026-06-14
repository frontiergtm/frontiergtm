"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { navItems } from "@/content/site";

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex h-20 max-w-[1180px] items-center justify-between px-5 sm:px-6">
        <a className="brand-wordmark" href="#top" aria-label="FrontierGTM home">
          <Image src="/frontiergtm-logo-header-transparent.png" alt="FrontierGTM" width={1636} height={429} priority />
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <a className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="button button-small header-cta" href="#contact">
          Book a Call
        </a>

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
          {navItems.map((item) => (
            <a
              className="mobile-nav-link border-b border-white/10 py-5 text-2xl font-normal tracking-[-0.02em]"
              href={item.href}
              key={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a className="button mt-8" href="#contact" onClick={() => setOpen(false)}>
            Book a Call
          </a>
        </nav>
      </div>
    </header>
  );
}
