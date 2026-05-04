"use client";

import { useEffect, useState } from "react";

/**
 * useReducedMotion — true when the user has prefers-reduced-motion: reduce
 * set in their OS or browser. Used to skip JS-driven animations
 * (typewriter, stage carousels) that CSS can't suppress.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
