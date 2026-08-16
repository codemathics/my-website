import puppeteer from "puppeteer-core";
const B = process.env.BASE_URL || "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = [];
const check = (n, ok, d) => { R.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${n} — ${d}`); };

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1708, height: 971 },
});
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));

/* ── every pressable control answers a press ── */
await page.goto(`${B}/projects/blockradar`, { waitUntil: "networkidle2" });
await sleep(1200);

const pressed = async (selector) => {
  // scroll first, then measure: `html` has scroll-behavior: smooth, so a rect
  // read in the same tick as scrollIntoView is the pre-scroll position
  await page.$eval(selector, (el) => {
    // kill smooth scrolling first: chrome's smooth scroll runs longer than the
    // wait for long distances, so the element keeps moving after we measure it
    document.documentElement.style.scrollBehavior = "auto";
    el.scrollIntoView({ block: "center" });
  });
  await sleep(500);
  const box = await page.$eval(selector, (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  const before = await page.$eval(selector, (el) => getComputedStyle(el).transform);
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await sleep(90);
  const during = await page.$eval(selector, (el) => getComputedStyle(el).transform);
  await page.mouse.up();
  await sleep(250);
  const after = await page.$eval(selector, (el) => getComputedStyle(el).transform);
  return { before, during, after };
};

for (const [sel, label] of [
  [".cs-carousel-dot", "carousel dot"],
  [".sound-dock-button", "sound dock button"],
]) {
  const t = await pressed(sel);
  check(
    `${label} answers a press`,
    t.during !== t.before && t.during !== "none",
    `idle=${t.before} held=${t.during}`
  );
  check(`${label} releases back`, t.after === t.before, `back to ${t.after}`);
}

/* ── the dot cue fires on the press, not the release ── */
await page.evaluateOnNewDocument(() => {
  window.__cues = [];
  const C = window.AudioContext;
  for (const m of ["createBufferSource", "createOscillator"]) {
    const orig = C.prototype[m];
    C.prototype[m] = function (...a) { window.__cues.push(performance.now()); return orig.apply(this, a); };
  }
});
await page.goto(`${B}/projects/blockradar`, { waitUntil: "networkidle2" });
await sleep(1000);
await page.mouse.click(60, 700);   // unlock audio
await sleep(500);
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
  document.querySelector(".cs-carousel")?.scrollIntoView({ block: "center" });
});
await sleep(700);
const dots = await page.$$eval(".cs-carousel-dot", (els) =>
  els.map((el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })
);
await page.evaluate(() => { window.__cues = []; window.__down = 0; });
await page.mouse.move(dots[2].x, dots[2].y);
await page.evaluate(() => { window.__down = performance.now(); });
await page.mouse.down();
await sleep(140);
const onPress = await page.evaluate(() => window.__cues.length);
await page.mouse.up();
await sleep(400);
check("dot cue lands on pointer-down", onPress > 0, `${onPress} voices before the release`);

/* ── the rail tick is composited, not laid out ── */
await page.goto(`${B}/`, { waitUntil: "networkidle2" });
await sleep(900);
await page.evaluate(() => { document.querySelector(".page-container").scrollTop = window.innerHeight; });
await sleep(1400);
const line = await page.$eval(".showcase-nav-line", (el) => {
  const cs = getComputedStyle(el);
  return { transition: cs.transitionProperty, width: cs.width };
});
check(
  "rail tick animates transform, not width",
  /transform/.test(line.transition) && !/width/.test(line.transition),
  `transitions: ${line.transition}`
);

const ticks = await page.$$eval(".showcase-nav-item", (els) =>
  els.map((el) => { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })
);
await page.mouse.move(ticks[3].x, ticks[3].y);
await sleep(400);
const hovered = await page.$eval(".showcase-nav-item:nth-child(4) .showcase-nav-line", (el) => ({
  t: getComputedStyle(el).transform,
  w: getComputedStyle(el).width,
}));
check(
  "hover scales the tick instead of resizing it",
  /matrix\(1\.6/.test(hovered.t) && hovered.w === "16px",
  `transform=${hovered.t}, width still ${hovered.w}`
);

/* ── durations are inside the ui budget ── */
const budget = await page.evaluate(() => {
  const read = (sel, prop) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const names = cs.transitionProperty.split(", ");
    const times = cs.transitionDuration.split(", ");
    const i = names.indexOf(prop);
    return i >= 0 ? parseFloat(times[i]) * 1000 : Math.max(...times.map((t) => parseFloat(t) * 1000));
  };
  return {
    bar: read(".sound-toggle-bar", "transform"),
    label: read(".sound-toggle-label", "opacity"),
    tick: read(".showcase-nav-line", "transform"),
    dockEntrance: parseFloat(getComputedStyle(document.querySelector(".page-container")).transitionDuration) || 0,
  };
});
check("sound bars within budget", budget.bar > 0 && budget.bar <= 300, `${budget.bar}ms`);
check("label reveal within the tooltip band", budget.label > 0 && budget.label <= 200, `${budget.label}ms`);
check("rail tick within the hover band", budget.tick > 0 && budget.tick <= 250, `${budget.tick}ms`);

/* ── reduced motion actually calms things down ── */
const rm = await browser.newPage();
await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await rm.goto(`${B}/`, { waitUntil: "networkidle2" });
await sleep(1400);
const calm = await rm.evaluate(() => {
  const names = [...document.querySelectorAll("*")]
    .filter((el) => getComputedStyle(el).animationIterationCount === "infinite")
    .map((el) => getComputedStyle(el).animationName)
    .filter((n) => n && n !== "none");
  const pseudo = [".chat-bubble"].map((s) => {
    const el = document.querySelector(s);
    return el ? getComputedStyle(el, "::before").animationName : "none";
  });
  return { looping: [...new Set(names)], pseudo };
});
check(
  "no decorative loops left running under reduced motion",
  calm.looping.length === 0 && calm.pseudo.every((p) => p === "none"),
  calm.looping.length ? `still running: ${calm.looping.join(", ")}` : "all quiet"
);

const normal = await browser.newPage();
await normal.goto(`${B}/`, { waitUntil: "networkidle2" });
await sleep(1400);
const loud = await normal.evaluate(() => {
  const names = [...document.querySelectorAll("*")]
    .filter((el) => getComputedStyle(el).animationIterationCount === "infinite")
    .map((el) => getComputedStyle(el).animationName)
    .filter((n) => n && n !== "none");
  return [...new Set(names)];
});
const heroUnderRm = await rm.evaluate(() => {
  const el = document.querySelector(".hero-section");
  const cs = getComputedStyle(el);
  return { name: cs.animationName, duration: cs.animationDuration };
});
check(
  "hero still arrives, by fading rather than scaling",
  heroUnderRm.name === "reducedFadeIn",
  `animation=${heroUnderRm.name} over ${heroUnderRm.duration}`
);

check(
  "and they still run for everyone else",
  loud.length > 0,
  `${loud.length} loops active: ${loud.slice(0, 4).join(", ")}`
);

/* reduced motion keeps a press readable without moving it */
await rm.goto(`${B}/projects/blockradar`, { waitUntil: "networkidle2" });
await sleep(900);
const rmPress = await rm.evaluate(() => {
  const el = document.querySelector(".cs-carousel-dot");
  const rules = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } });
  return rules.some((r) => r.conditionText?.includes("reduced-motion") &&
    [...(r.cssRules || [])].some((x) => x.selectorText?.includes(":active") && x.style.opacity));
});
check("reduced motion swaps press travel for a dim", rmPress, "opacity press feedback present");

check("no console errors", errs.length === 0, errs.slice(0, 2).join(" | ") || "clean");

await browser.close();
const f = R.filter((x) => !x).length;
console.log(`\n${R.length - f}/${R.length} checks passed`);
process.exit(f ? 1 : 0);
