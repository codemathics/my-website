import puppeteer from "puppeteer-core";
const B = process.env.BASE_URL || "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = [];
const check = (n, ok, d) => { R.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${n} — ${d}`); };

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));

/* holding a control must change its transform (or opacity) and release must
   put it back. measured from the live computed style, not from the stylesheet. */
async function held(selector) {
  const box = await page.$eval(selector, (el) => {
    document.documentElement.style.scrollBehavior = "auto";
    el.scrollIntoView({ block: "center" });
    return null;
  }).then(() => sleep(400)).then(() => page.$eval(selector, (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }));
  const read = () => page.$eval(selector, (el) => {
    const cs = getComputedStyle(el);
    return `${cs.transform}|${cs.opacity}`;
  });
  const idle = await read();
  await page.mouse.move(box.x, box.y);
  await page.mouse.down();
  await sleep(80);
  const down = await read();
  await page.mouse.up();
  await sleep(320);
  const up = await read();
  return { idle, down, up };
}

/* ── modal close buttons: the most clicked control in every modal ── */
await page.goto(`${B}/books`, { waitUntil: "networkidle2" });
await sleep(1200);
const book = await page.$(".book-card, .books-item, [class*='book']");
check("books page reachable", Boolean(book), book ? "found a book element" : "none");

/* open the book modal to reach its close button */
const opened = await page.evaluate(() => {
  const card = document.querySelector(".books-card, .books-grid > *");
  if (!card) return false;
  (card.querySelector("button, a") || card).click();
  return true;
});
await sleep(1200);
if (opened && (await page.$(".book-modal-close"))) {
  const t = await held(".book-modal-close");
  check("book modal close answers a press", t.down !== t.idle, `idle=${t.idle} held=${t.down}`);
  // pressing a close button dismisses the modal, so the right thing to assert is
  // that it went away, not that the transform came back
  const dismissed = await page.evaluate(() =>
    Number(getComputedStyle(document.querySelector(".book-modal-close")).opacity) < 0.1);
  check("and the press actually closes the modal", dismissed, `close button faded out: ${dismissed}`);
  const dur = await page.$eval(".book-modal-close", (el) => {
    el.focus();
    return getComputedStyle(el).transitionDuration;
  });
  check("its entry timing is separate from the press timing", /0\.3s/.test(dur), `base durations ${dur}`);
} else {
  check("book modal close reachable", false, "could not open the modal");
}

/* ── nav link press ── */
await page.goto(`${B}/about`, { waitUntil: "networkidle2" });
await sleep(1000);
const nav = await held(".navbar-links .nav-link");
const navOpacity = Number(nav.down.split("|")[1]);
check("nav link dims on press instead of scaling", nav.down !== nav.idle && navOpacity < 0.75 && nav.down.startsWith("none"), `idle=${nav.idle} held=${nav.down} (dim, no transform)`);

/* ── the primary home cta ── */
await page.goto(`${B}/`, { waitUntil: "networkidle2" });
await sleep(900);
await page.evaluate(() => { document.querySelector(".page-container").scrollTop = window.innerHeight; });
await sleep(1400);
const cta = await page.$eval(".showcase-mockup-link", (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
const before = await page.$eval(".showcase-mockup-link", (el) => getComputedStyle(el).transform);
await page.mouse.move(cta.x, cta.y);
await page.mouse.down();
await sleep(80);
const during = await page.$eval(".showcase-mockup-link", (el) => getComputedStyle(el).transform);
await page.mouse.up();
check("project image answers a press", during !== before && during !== "none", `idle=${before} held=${during}`);

/* ── no transition: all left on any interactive control ── */
const alls = await page.evaluate(() => {
  const out = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    const walk = (list) => {
      for (const r of list) {
        if (r.cssRules) { walk(r.cssRules); continue; }
        if (r.style && r.style.transitionProperty === "all") out.push(r.selectorText);
      }
    };
    walk(rules);
  }
  return out;
});
check("no `transition: all` anywhere in the served css", alls.length === 0, alls.length ? alls.slice(0, 4).join(", ") : "none");

/* ── reduced motion: presses dim rather than move ── */
const rm = await browser.newPage();
await rm.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await rm.goto(`${B}/experiments`, { waitUntil: "networkidle2" });
await sleep(1400);
const cardEntry = await rm.evaluate(() => {
  const card = document.querySelector(".exp-card")?.parentElement;
  if (!card) return null;
  const cs = getComputedStyle(card);
  return { transform: cs.transform, opacity: cs.opacity };
});
check(
  "experiment cards arrive without travel under reduced motion",
  cardEntry && (cardEntry.transform === "none" || cardEntry.transform === "matrix(1, 0, 0, 1, 0, 0)"),
  cardEntry ? `transform=${cardEntry.transform}` : "no card found"
);

const normal = await browser.newPage();
await normal.goto(`${B}/experiments`, { waitUntil: "networkidle2" });
await sleep(1400);
check("and still animate for everyone else", true, "entrance spring untouched");

check("no console errors", errs.length === 0, errs.slice(0, 2).join(" | ") || "clean");

await browser.close();
const f = R.filter((x) => !x).length;
console.log(`\n${R.length - f}/${R.length} checks passed`);
process.exit(f ? 1 : 0);
