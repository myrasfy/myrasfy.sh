import {
  $,
  $$,
  el,
  clamp,
  rafThrottle,
  prefersReducedMotion,
} from "./utils.js";
import { PROJECTS } from "./data.js";

const GH =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>';

const perFor = (w) =>
  w <= 520 ? 1 : w <= 720 ? 2 : w <= 940 ? 3 : w <= 1180 ? 4 : 5;

function linkEl(href, svg, label) {
  return el("a", {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    html: `${svg}<span>${label}</span>`,
  });
}

function card(p) {
  const thumb = el("div", { class: "project__thumb" }, [
    el("img", {
      src: p.image,
      alt: p.title,
      loading: "lazy",
      decoding: "async",
    }),
  ]);

  const body = el("div", { class: "project__body" }, [
    el("h3", { class: "project__title", text: p.title }),
    el("p", { class: "project__desc", text: p.desc }),
    el(
      "div",
      { class: "project__tags" },
      (p.tags || []).map((t) => el("span", { text: `#${t}` })),
    ),
  ]);

  if (p.repo) {
    body.append(
      el("div", { class: "project__links" }, [linkEl(p.repo, GH, "Code")]),
    );
  }

  return el("li", { class: "project" }, [thumb, body]);
}

export function initProjects() {
  const root = $("#projects");
  const track = $(".carousel__track");
  const dotsWrap = $(".carousel__dots");
  const viewport = $(".carousel__viewport");
  if (!root || !track) return;

  const reduced = prefersReducedMotion();

  track.innerHTML = "";
  PROJECTS.forEach((p) => track.append(card(p)));

  let per = perFor(window.innerWidth);
  let index = 0;
  let step = 0;
  let maxIndex = 0;

  const setPer = () => {
    const fromCss = parseFloat(
      getComputedStyle(root).getPropertyValue("--per"),
    );
    per =
      Number.isFinite(fromCss) && fromCss > 0
        ? fromCss
        : perFor(window.innerWidth);
  };

  const measure = () => {
    const first = track.querySelector(".project");
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || "16") || 16;
    step = first ? first.getBoundingClientRect().width + gap : 0;
    maxIndex = Math.max(0, PROJECTS.length - per);
    index = clamp(index, 0, maxIndex);
  };

  const apply = (animate) => {
    track.classList.toggle("animate", !!animate && !reduced);
    track.style.transform = `translateX(${-index * step}px)`;
  };

  const syncDots = () => {
    if (!dotsWrap) return;
    $$("button", dotsWrap).forEach((b, i) =>
      b.classList.toggle("active", i === index),
    );
  };

  const goTo = (i, animate = true) => {
    index = clamp(i, 0, maxIndex);
    apply(animate);
    syncDots();
  };
  const next = () => goTo(index >= maxIndex ? 0 : index + 1);
  const prev = () => goTo(index <= 0 ? maxIndex : index - 1);

  const renderDots = () => {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    for (let i = 0; i <= maxIndex; i++) {
      dotsWrap.append(
        el("button", {
          class: i === index ? "active" : "",
          "aria-label": `Go to project group ${i + 1}`,
          onclick: () => goTo(i),
        }),
      );
    }
  };

  const controls = $(".carousel__controls", root);
  const syncControls = () => {
    const single = maxIndex <= 0;
    controls?.toggleAttribute("hidden", single);
    dotsWrap?.toggleAttribute("hidden", single);
  };

  $$(".carousel__btn", root).forEach((btn) =>
    btn.addEventListener("click", () => {
      btn.dataset.dir === "prev" ? prev() : next();
    }),
  );

  if (viewport) {
    viewport.tabIndex = 0;
    viewport.setAttribute("role", "group");
    viewport.setAttribute("aria-label", "Projects carousel");
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });
  }

  let dragging = false;
  let didDrag = false;
  let startX = 0;
  let baseTx = 0;
  let moved = 0;
  const DRAG_THRESHOLD = 10;

  const onDown = (e) => {
    if (e.button != null && e.button !== 0) return;
    dragging = true;
    didDrag = false;
    moved = 0;
    startX = e.clientX;
    baseTx = -index * step;
    track.classList.remove("animate");
  };
  const onMove = (e) => {
    if (!dragging) return;
    moved = e.clientX - startX;
    if (Math.abs(moved) > DRAG_THRESHOLD) {
      didDrag = true;
      track.classList.add("dragging");
    }
    if (didDrag) track.style.transform = `translateX(${baseTx + moved}px)`;
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("dragging");

    if (!didDrag) return;

    const dist = Math.abs(moved);
    if (step > 0 && dist > step * 0.2) {
      const dir = moved < 0 ? 1 : -1;
      goTo(index + dir * Math.ceil(dist / step));
    } else {
      apply(true);
    }

    const block = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      track.removeEventListener("click", block, true);
    };
    track.addEventListener("click", block, true);
    setTimeout(() => track.removeEventListener("click", block, true), 0);
  };

  track.addEventListener("dragstart", (e) => e.preventDefault());
  track.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  window.addEventListener(
    "resize",
    rafThrottle(() => {
      setPer();
      measure();
      renderDots();
      syncControls();
      apply(false);
    }),
    { passive: true },
  );

  setPer();
  requestAnimationFrame(() => {
    measure();
    renderDots();
    syncControls();
    apply(false);
  });
  window.addEventListener("load", () => {
    measure();
    apply(false);
  });
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      measure();
      apply(false);
    });
  }
}
