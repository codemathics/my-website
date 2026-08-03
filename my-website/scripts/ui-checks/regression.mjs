import puppeteer from "puppeteer-core";
const B = process.env.BASE_URL || "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = [];
const check = (n, ok, d) => { R.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${n} — ${d}`); };

const instrument = () => {
  window.__voices = [];
  const C = window.AudioContext;
  for (const m of ["createBufferSource", "createOscillator"]) {
    const orig = C.prototype[m];
    C.prototype[m] = function (...a) { window.__voices.push(performance.now()); return orig.apply(this, a); };
  }
  window.AudioContext = new Proxy(C, { construct(t, a) { const c = new t(...a); window.__ctx = c; return c; } });
};

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1708, height: 971 },
});
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));
page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
await page.evaluateOnNewDocument(instrument);

const toRail = async (reload = false) => {
  if (reload) await page.reload({ waitUntil: "networkidle2" });
  else await page.goto(`${B}/`, { waitUntil: "networkidle2" });
  await sleep(800);
  await page.evaluate(() => { document.querySelector(".page-container").scrollTop = window.innerHeight; });
  await sleep(1300);
};

const state = () => page.evaluate(() => {
  const el = document.querySelector(".showcase-nav-sound");
  return {
    pressed: el.getAttribute("aria-pressed"),
    ripple: getComputedStyle(el.querySelector(".sound-toggle-bar")).animationName,
    stored: localStorage.getItem("soundEnabled"),
    ctx: window.__ctx ? window.__ctx.state : "none",
    voices: window.__voices.length,
  };
});

/* a human press: down, a beat, up */
const press = async (selector) => {
  const b = await page.$eval(selector, (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(b.x, b.y);
  await page.mouse.down();
  await sleep(115);
  await page.mouse.up();
  await sleep(700);
};

await toRail();
let s = await state();
check("first visit ripples and is not lit", s.pressed === "false" && s.ripple === "soundWaveIdle", `pressed=${s.pressed} ripple=${s.ripple}`);

await press(".showcase-nav-sound");
s = await state();
check("one human press turns sound on", s.pressed === "true" && s.stored === "on", `pressed=${s.pressed} stored=${s.stored}`);
check("context is running and it made a sound", s.ctx === "running" && s.voices > 0, `ctx=${s.ctx}, ${s.voices} voices`);
check("ripple stops once sound is live", s.ripple === "none", `ripple=${s.ripple}`);

await toRail(true);
s = await state();
check("the choice survives a refresh", s.pressed === "true" && s.ripple === "none", `pressed=${s.pressed} ripple=${s.ripple}`);

/* scrolling still ticks, still rate limited */
await page.mouse.move(700, 500);
await page.mouse.down(); await sleep(50); await page.mouse.up();
await sleep(300);
await page.evaluate(() => { window.__voices = []; });
await page.mouse.move(720, 500);
for (let i = 0; i < 26; i += 1) { await page.mouse.wheel({ deltaY: Math.max(1, Math.round(40 * Math.exp(-i / 9))) }); await sleep(12); }
await sleep(500);
const v = await page.evaluate(() => window.__voices);
const gaps = v.slice(1).map((t, i) => t - v[i]);
check("a trackpad flick still emits a run of detents", v.length >= 4, `${v.length} voices`);
check("still rate limited", gaps.length === 0 || Math.min(...gaps) >= 30, `min gap ${gaps.length ? Math.min(...gaps).toFixed(0) : "n/a"}ms`);

/* programmatic scroll stays silent */
await page.evaluate(() => { window.__voices = []; });
await page.evaluate(() => { document.querySelector(".page-container").scrollTop = 0; });
await sleep(900);
check("programmatic scroll is silent", (await page.evaluate(() => window.__voices.length)) === 0, "0 voices");

/* the rail press cue now fires on pointer-down */
await toRail();
await page.evaluate(() => { window.__voices = []; });
const ticks = await page.$$eval(".showcase-nav-item", (els) =>
  els.map((el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })
);
await page.mouse.move(ticks[4].x, ticks[4].y);
await sleep(350);
const beforePress = await page.evaluate(() => window.__voices.length);
await page.mouse.down();
await sleep(120);
const duringPress = await page.evaluate(() => window.__voices.length);
await page.mouse.up();
await sleep(900);
check("rail press cue lands before the release", duringPress > beforePress, `${duringPress - beforePress} voices while held`);
check("and the jump still happens", (await page.evaluate(() => [...document.querySelectorAll(".showcase-nav-item")].findIndex((e) => e.classList.contains("is-active")))) === 4, "project 5 active");

/* muting: silent, and the loop comes back */
await press(".showcase-nav-sound");
s = await state();
check("pressing again mutes and the loop returns", s.pressed === "false" && s.stored === "off" && s.ripple === "soundWaveIdle", `pressed=${s.pressed} ripple=${s.ripple}`);
await page.evaluate(() => { window.__voices = []; });
await page.mouse.move(720, 500);
for (let i = 0; i < 14; i += 1) { await page.mouse.wheel({ deltaY: 26 }); await sleep(14); }
await sleep(400);
check("muted means silent", (await page.evaluate(() => window.__voices.length)) === 0, "0 voices");

/* one control per context */
for (const [w, name] of [[1708, "desktop"], [900, "tablet"], [430, "phone"]]) {
  await page.setViewport({ width: w, height: 900 });
  await page.goto(`${B}/books`, { waitUntil: "networkidle2" });
  await sleep(800);
  const n = await page.evaluate(() => {
    const vis = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().width > 0;
    const row = document.querySelector(".navbar-dropdown .sound-toggle-row");
    return {
      dock: vis(document.querySelector(".sound-dock")),
      row: !!row && getComputedStyle(row).display !== "none",
      navbar: !!document.querySelector(".navbar-links .sound-toggle"),
    };
  });
  const count = [n.dock, n.row, n.navbar].filter(Boolean).length;
  check(`exactly one control at ${name}`, count === 1, `dock=${n.dock} menuRow=${n.row} navbar=${n.navbar}`);
}

check("no console errors", errs.length === 0, errs.slice(0, 2).join(" | ") || "clean");

await browser.close();
const f = R.filter((x) => !x).length;
console.log(`\n${R.length - f}/${R.length} checks passed`);
process.exit(f ? 1 : 0);
