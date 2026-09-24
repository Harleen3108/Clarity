"use client";
import { RefObject, useEffect } from "react";

type FrameCallback = (progress: number, timeMs: number) => void;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Drives a requestAnimationFrame loop that computes a 0..1 scroll progress for a
 * section and hands it to `onFrame` every frame, together with a timestamp (for
 * idle float animations). Transforms should be written straight to DOM refs
 * inside `onFrame` — this hook never calls setState, so there is no React
 * re-render per frame.
 *
 * progress = clamp((scrollY - sectionTop) / (sectionHeight - viewportHeight), 0, 1)
 *
 * With prefers-reduced-motion the callback fires once with progress = 1 (the
 * fully-open state) and the loop never starts.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement>,
  onFrame: FrameCallback,
  mode: "pin" | "through" = "pin"
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      onFrame(1, 0);
      return;
    }

    let raf = 0;
    const loop = (now: number) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === "through") {
        // 0 when the section top hits the bottom of the viewport, 1 once it has
        // fully scrolled past the top. Suits sections shorter than the viewport.
        p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + el.offsetHeight)));
      } else {
        const sectionTop = rect.top + window.scrollY;
        const denom = el.offsetHeight - vh;
        p =
          denom <= 0
            ? 0
            : Math.min(1, Math.max(0, (window.scrollY - sectionTop) / denom));
      }
      onFrame(p, now);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // onFrame is expected to be stable (defined with useCallback by the caller)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, mode]);
}
