import { $, el, sleep } from "./utils.js";

const SESSION_KEY = "myrasfy.booted";

const LOGO = [
  " __  __ ",
  "|  \\/  |",
  "| |\\/| |",
  "| |  | |",
  "|_|  |_|",
].join("\n");

const INFO = [
  ["OS", "Arch Linux x86_64"],
  ["Host", "myrasfy.sh"],
  ["Kernel", "6.x-hardened"],
  ["Packages", "docker, k8s, terraform (+27)"],
  ["Shell", "zsh"],
  ["Terminal", "you're in it"],
  ["CPU", "Tea"],
  ["Memory", "plenty of YAML"],
  ["Role", "DevOps Engineer"],
];

const BLOCKS = [
  "#2a2a2e",
  "#3a3a40",
  "#55555b",
  "#7d7d83",
  "#b8b8bc",
  "#d4d4d6",
  "#ededee",
  "#ffffff",
];

function buildFetch() {
  const wrap = el("div", { class: "fetch" });
  const logo = el("div", { class: "fetch__logo", text: LOGO });
  const info = el("div", { class: "fetch__info" });

  const rows = [
    `<span class="row"><span class="fetch__head">visitor@myrasfy.sh</span></span>`,
    `<span class="row"><span class="fetch__rule">${"-".repeat(18)}</span></span>`,
    ...INFO.map(
      ([k, v]) =>
        `<span class="row"><span class="fetch__key">${k}</span><span class="fetch__val">${v}</span></span>`,
    ),
  ];
  info.innerHTML = rows.join("");

  const blocks = el("div", { class: "fetch__blocks" });
  blocks.innerHTML = BLOCKS.map((c) => `<i style="background:${c}"></i>`).join(
    "",
  );
  info.append(blocks);

  wrap.append(logo, info);
  return wrap;
}

export async function runBoot({ reduced = false, onDone = () => {} } = {}) {
  const boot = $("#boot");
  const body = document.body;

  const finish = () => {
    body.classList.add("booted");
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch (_) {}
    onDone();
  };

  let seen = false;
  try {
    seen = sessionStorage.getItem(SESSION_KEY) === "1";
  } catch (_) {}
  if (!boot || reduced || seen) {
    if (boot) boot.setAttribute("hidden", "");
    finish();
    return;
  }

  const term = $(".term__body", boot);
  term.innerHTML = "";

  const prompt = el("div", { class: "term__prompt" });
  prompt.innerHTML =
    `<span class="term__user">visitor@myrasfy.sh</span>` +
    `<span class="term__path"> ~</span> $ ` +
    `<span class="term__cmd"></span>` +
    `<span class="caret"></span>`;
  term.append(prompt);

  const cmdEl = $(".term__cmd", prompt);
  const caret = $(".caret", prompt);

  let skipped = false;
  const skip = () => {
    skipped = true;
  };
  const onKey = () => skip();
  const onClick = () => skip();
  document.addEventListener("keydown", onKey);
  document.addEventListener("click", onClick);
  const cleanup = () => {
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("click", onClick);
  };

  const wait = async (ms) => {
    const tick = 30;
    for (let t = 0; t < ms && !skipped; t += tick) await sleep(tick);
  };

  await wait(1700);

  const cmd = "fastfetch";
  for (const ch of cmd) {
    if (skipped) break;
    cmdEl.textContent += ch;
    await wait(85);
  }
  if (skipped) cmdEl.textContent = cmd;

  await wait(380);

  caret.remove();
  const fetchEl = buildFetch();
  term.append(fetchEl);
  requestAnimationFrame(() => fetchEl.classList.add("show"));

  await wait(1500);

  cleanup();
  boot.classList.add("done");
  await sleep(skipped ? 140 : 560);
  boot.setAttribute("hidden", "");
  finish();
}
