import { prefersReducedMotion } from "./utils.js";
import { runBoot } from "./boot.js";
import { startTyping } from "./typing.js";
import { initNav } from "./nav.js";
import { initReveal } from "./reveal.js";
import { renderSkills } from "./skills.js";
import { initProjects } from "./projects.js";

function init() {
  const reduced = prefersReducedMotion();

  renderSkills();
  initProjects();
  initNav();

  runBoot({
    reduced,
    onDone: () => {
      initReveal();
      startTyping({ reduced });
    },
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
