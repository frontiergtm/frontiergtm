"use client";

import { useEffect } from "react";

export function MotionEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    root.classList.add("motion-ready");

    const updateScroll = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const heroProgress = Math.min(scrollTop / Math.max(window.innerHeight * 0.9, 1), 1);

      root.style.setProperty("--motion-scroll-progress", `${scrollTop / scrollRange}`);
      root.style.setProperty("--motion-hero-progress", `${heroProgress}`);
      root.classList.toggle("motion-has-scrolled", scrollTop > 32);
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (reduceMotion.matches) return;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      root.style.setProperty("--motion-pointer-x", `${x}`);
      root.style.setProperty("--motion-pointer-y", `${y}`);
    };

    const reveals = Array.from(document.querySelectorAll<HTMLElement>(".motion-reveal"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -7%" },
    );

    reveals.forEach((element) => observer.observe(element));

    const tiltCards = Array.from(document.querySelectorAll<HTMLElement>(".motion-tilt"));
    const cleanups = tiltCards.map((card) => {
      const move = (event: PointerEvent) => {
        if (reduceMotion.matches) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${y * -3.2}deg`);
        card.style.setProperty("--tilt-y", `${x * 4.2}deg`);
        card.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
        card.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
      };
      const leave = () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      };

      card.addEventListener("pointermove", move);
      card.addEventListener("pointerleave", leave);
      return () => {
        card.removeEventListener("pointermove", move);
        card.removeEventListener("pointerleave", leave);
      };
    });

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      root.classList.remove("motion-has-scrolled");
      root.classList.remove("motion-ready");
      root.style.removeProperty("--motion-scroll-progress");
      root.style.removeProperty("--motion-hero-progress");
      root.style.removeProperty("--motion-pointer-x");
      root.style.removeProperty("--motion-pointer-y");
    };
  }, []);

  return (
    <>
      <div className="motion-progress" aria-hidden="true">
        <span className="motion-progress-label">The trail</span>
        <span className="motion-progress-rail"><span /></span>
        <span className="motion-progress-marker" />
      </div>
    </>
  );
}
