"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";

const HUBSPOT_FORM_ID = "3b37ce17-0835-4311-9592-cec41a160819";
const HUBSPOT_PORTAL_ID = "246863187";

export function HubSpotLeadModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const openModal = () => setOpen(true);
    window.addEventListener("frontiergtm:open-lead-form", openModal);
    return () => window.removeEventListener("frontiergtm:open-lead-form", openModal);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <Script
        src={`https://js-na2.hsforms.net/forms/embed/${HUBSPOT_PORTAL_ID}.js`}
        strategy="afterInteractive"
      />
      <div
        className={`lead-form-overlay${open ? " lead-form-overlay-open" : ""}`}
        aria-hidden={!open}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
      >
        <div
          ref={dialogRef}
          className="lead-form-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-form-title"
        >
          <button
            ref={closeButtonRef}
            className="lead-form-close"
            type="button"
            aria-label="Close contact form"
            onClick={() => setOpen(false)}
          >
            <X size={22} weight="bold" />
          </button>

          <aside className="lead-form-intro">
            <p className="lead-form-kicker">Request a consultation</p>
            <h2 id="lead-form-title">Let’s find the highest-leverage next move.</h2>
            <p>
              Share a little about your company and GTM challenge. FrontierGTM will
              review the context before following up.
            </p>
            <div className="lead-form-direct">
              <span>Prefer a direct route?</span>
              <a href="mailto:ryan@frontiergtm.ai">ryan@frontiergtm.ai</a>
            </div>
          </aside>

          <section className="lead-form-embed" aria-label="FrontierGTM contact form">
            <div
              className="hs-form-frame"
              data-region="na2"
              data-form-id={HUBSPOT_FORM_ID}
              data-portal-id={HUBSPOT_PORTAL_ID}
            />
          </section>
        </div>
      </div>
    </>
  );
}
