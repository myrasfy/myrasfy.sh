import { $, sleep, prefersReducedMotion } from "./utils.js";
import { ROLES } from "./data.js";

export async function startTyping({ reduced = prefersReducedMotion() } = {}) {
  const txt = $(".hero__role .txt");
  const cur = $(".hero__role .cur");
  if (!txt || !cur) return;

  if (reduced) {
    txt.textContent = ROLES[0]?.text ?? "";
    cur.classList.add("idle");
    return;
  }

  const type = async (str) => {
    cur.classList.remove("idle");
    for (const ch of str) {
      txt.textContent += ch;
      await sleep(55 + Math.random() * 45);
    }
  };

  const erase = async () => {
    cur.classList.remove("idle");
    while (txt.textContent.length) {
      txt.textContent = txt.textContent.slice(0, -1);
      await sleep(26 + Math.random() * 18);
    }
  };

  await sleep(450);

  let i = 0;
  while (true) {
    const role = ROLES[i % ROLES.length];
    await type(role.text);
    cur.classList.add("idle");
    await sleep(role.hold ?? 3000);
    await erase();
    cur.classList.add("idle");
    await sleep(180);
    i++;
  }
}
