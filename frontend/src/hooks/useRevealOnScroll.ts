"use client";
import { RefObject, useEffect } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Reveals a section's marked children on first scroll into view.
 * - Elements with [data-reveal] fade + rise in, staggered 90ms each.
 * - Elements with [data-reveal-3d] animate from flat to their designed depth,
 *   starting 250ms after reveal and staggered 60ms each.
 * With prefers-reduced-motion everything is shown immediately.
 */
export function useRevealOnScroll(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const flat = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const deep = el.querySelectorAll<HTMLElement>("[data-reveal-3d]");

    const revealAll = () => {
      flat.forEach((node, i) => {
        node.style.transitionDelay = `${i * 90}ms`;
        node.classList.add("reveal-in");
      });
      deep.forEach((node, i) => {
        node.style.transitionDelay = `${250 + i * 60}ms`;
        node.classList.add("reveal3d-in");
      });
    };

    if (prefersReducedMotion()) {
      flat.forEach((n) => n.classList.add("reveal-in"));
      deep.forEach((n) => n.classList.add("reveal3d-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealAll();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.18 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}
