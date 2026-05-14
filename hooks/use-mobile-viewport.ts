"use client";

import { useEffect, useState } from "react";

/** Matches Tailwind `md` breakpoint: mobile-style viewports below 768px */
const QUERY = "(max-width: 767px)";

export function useMobileViewport(): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return matches;
}
