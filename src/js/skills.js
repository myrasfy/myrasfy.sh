import { $, el } from "./utils.js";
import { SKILLS } from "./data.js";

const pad = (n) => String(n).padStart(2, "0");

export function renderSkills() {
  const grid = $(".skills__grid");
  if (!grid) return;
  grid.innerHTML = "";

  SKILLS.forEach((group, gi) => {
    const card = el("div", { class: "skill-card reveal", style: `--i:${gi}` }, [
      el("div", { class: "skill-card__top" }, [
        el("h3", { class: "skill-card__title", text: group.category }),
        el("span", {
          class: "skill-card__count",
          text: pad(group.tools.length),
        }),
      ]),
    ]);

    const tools = el("div", { class: "skill-card__tools" });
    group.tools.forEach((tool) => {
      tools.append(
        el("div", { class: "tool" }, [
          el("span", {
            class: "tool__icon",
            "aria-hidden": "true",
            style: `--icon:url("/public/assets/icons/${tool.icon}.svg")`,
          }),
          el("span", { class: "tool__name", text: tool.name }),
        ]),
      );
    });

    card.append(tools);
    grid.append(card);
  });
}
