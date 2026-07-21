"use client";

import { useEffect, useState } from "react";

const focuses = ["Strategy", "Engineering", "Agents", "Consulting", "Execution"] as const;

export function RotatingGtmFocus() {
  const [focusIndex, setFocusIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let changeTimer: number | undefined;
    let swapTimer: number | undefined;

    const scheduleChange = () => {
      changeTimer = window.setTimeout(() => {
        setIsChanging(true);
        swapTimer = window.setTimeout(() => {
          setFocusIndex((current) => (current + 1) % focuses.length);
          setIsChanging(false);
          scheduleChange();
        }, 240);
      }, 2300);
    };

    if (!reducedMotion.matches) scheduleChange();

    return () => {
      if (changeTimer) window.clearTimeout(changeTimer);
      if (swapTimer) window.clearTimeout(swapTimer);
    };
  }, []);

  return (
    <span className="hero-title-rotator" aria-hidden="true">
      <span className={`hero-title-word${isChanging ? " is-changing" : ""}`}>
        {focuses[focusIndex]}
      </span>
    </span>
  );
}
