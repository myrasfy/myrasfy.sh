import { $, $$, rafThrottle, prefersReducedMotion } from "./utils.js";

export function initNav() {
  const nav = $("#nav");
  const links = $$(".nav__link");
  const dots = $$(".dots-nav a");
  const pill = $(".nav__pill");
  const toggle = $(".nav__toggle");
  const panels = $$(".panel");
  if (!panels.length) return;

  const reduced = prefersReducedMotion();

  const findLink = (id) => links.find((l) => l.dataset.target === id) || null;

  const positionPill = (link) => {
    if (!pill) return;
    if (!link || getComputedStyle(pill).display === "none") {
      pill.style.opacity = "0";
      return;
    }
    pill.style.opacity = "1";
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.transform = `translateX(${link.offsetLeft}px)`;
  };

  let current = "";
  const setActive = (id) => {
    if (id === current) return;
    current = id;
    let active = null;
    links.forEach((l) => {
      const on = l.dataset.target === id;
      l.classList.toggle("active", on);
      if (on) active = l;
    });
    dots.forEach((d) => d.classList.toggle("active", d.dataset.target === id));
    positionPill(active);
  };

  const computeActive = () => {
    const center = window.innerHeight / 2;
    let id = panels[0].id;
    for (const p of panels) {
      const r = p.getBoundingClientRect();
      if (r.top <= center && r.bottom >= center) id = p.id;
    }
    setActive(id);
  };

  const targetTop = (target) => {
    let top = 0;
    for (const p of panels) {
      if (p === target) break;
      top += p.offsetHeight;
    }
    return top;
  };

  let raf = null;
  let cleanupScroll = null;
  const stopScrollAnim = () => {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    if (cleanupScroll) {
      cleanupScroll();
      cleanupScroll = null;
    }
  };
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const smoothScrollTo = (toY) => {
    stopScrollAnim();
    const fromY = window.scrollY;
    const dist = toY - fromY;
    if (reduced || Math.abs(dist) < 2) {
      window.scrollTo(0, toY);
      return;
    }
    const dur = Math.min(900, Math.max(350, Math.abs(dist) * 0.45));
    const t0 = performance.now();

    let aborted = false;
    const abort = () => {
      aborted = true;
    };
    const onKeyAbort = (e) => {
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(e.key)
      )
        abort();
    };
    window.addEventListener("wheel", abort, { passive: true });
    window.addEventListener("touchstart", abort, { passive: true });
    window.addEventListener("keydown", onKeyAbort);
    cleanupScroll = () => {
      window.removeEventListener("wheel", abort);
      window.removeEventListener("touchstart", abort);
      window.removeEventListener("keydown", onKeyAbort);
    };

    const tick = (now) => {
      if (aborted) {
        stopScrollAnim();
        return;
      }
      const p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, fromY + dist * easeInOutCubic(p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else stopScrollAnim();
    };
    raf = requestAnimationFrame(tick);
  };

  const go = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    history.replaceState(null, "", `#${id}`);
    smoothScrollTo(targetTop(target));
  };

  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded", "false");
  };

  const bindNav = (items) =>
    items.forEach((a) =>
      a.addEventListener("click", (e) => {
        const id = a.dataset.target;
        if (!id) return;
        e.preventDefault();
        closeMenu();
        go(id);
      }),
    );
  bindNav(links);
  bindNav(dots);

  if (toggle && nav) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target))
        closeMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  window.addEventListener("scroll", rafThrottle(computeActive), {
    passive: true,
  });
  window.addEventListener(
    "resize",
    rafThrottle(() => {
      computeActive();
      positionPill(findLink(current));
    }),
    { passive: true },
  );

  computeActive();
  window.addEventListener("load", () => positionPill(findLink(current)));
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => positionPill(findLink(current)));
  }
}
