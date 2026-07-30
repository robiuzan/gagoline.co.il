"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Subtle fade-up as content scrolls into view — implemented as *progressive
 * enhancement*. The content is fully visible by default (SSR / no-JS / if the
 * observer never fires) and only opts into the hidden→visible animation once
 * JS has mounted and can guarantee it will be revealed again. This matters on
 * the static export: nothing can get "stuck" at opacity:0 if a client-side
 * observer fails to fire. Respects `prefers-reduced-motion`.
 */
type RevealState = "static" | "hidden" | "shown";

export function Reveal({
  className,
  delay = 0,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Start "static" (= fully visible) so the very first paint is never hidden.
  const [state, setState] = useState<RevealState>("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen at mount → just show it (no hide-then-fade flash).
    const rect = el.getBoundingClientRect();
    const inViewNow = rect.top < window.innerHeight && rect.bottom > 0;
    if (inViewNow) {
      setState("shown");
      return;
    }

    // Below the fold → hide it, then fade up when it scrolls into view.
    setState("hidden");
    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("shown");
          obs.disconnect();
        }
      },
      { rootMargin: "-60px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        state === "hidden" ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
