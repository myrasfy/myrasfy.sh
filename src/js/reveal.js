import { $$, prefersReducedMotion } from "./utils.js";

export function initReveal() {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    $$(".reveal").forEach((node) => node.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        $$(".reveal", entry.target).forEach((node) => node.classList.add("in"));
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.15 },
  );

  $$(".panel").forEach((panel) => io.observe(panel));
}
