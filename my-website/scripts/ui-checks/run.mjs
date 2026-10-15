#!/usr/bin/env node
/* run the ui checks against any running copy of the site.
 *
 *   npm run check:ui                                   # http://localhost:3000
 *   BASE_URL=https://codemathics.design npm run check:ui
 *   BASE_URL=https://<preview>.vercel.app npm run check:ui
 *
 * these drive a real browser and assert on live computed styles and on what the
 * audio graph actually schedules, so they catch things a build cannot: a press
 * that never lands, a cue that fires on release instead of on press, an
 * animation still looping under prefers-reduced-motion.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/* chrome ships in a different place on every os, and puppeteer-core does not
   bundle one, so find whichever is already installed. */
const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("could not find chrome. set CHROME_PATH to its binary and retry.");
  process.exit(1);
}

const base = process.env.BASE_URL || "http://localhost:3000";

try {
  const res = await fetch(base, { redirect: "manual" });
  if (res.status >= 300 && res.status < 400 && /vercel\.com\/(login|sso)/.test(res.headers.get("location") || "")) {
    console.error(
      `${base} is a protected vercel preview and redirects to a login, so a\n` +
      `headless browser cannot reach it. open it in your own browser instead, or\n` +
      `set a protection bypass token on the deployment.`
    );
    process.exit(1);
  }
} catch {
  console.error(`nothing is answering at ${base}. start the site first:\n  ./scripts/start-local.sh`);
  process.exit(1);
}

const SUITES = [
  ["regression", "sound lifecycle, scroll detents, one control per context"],
  ["press-check", "press feedback on every control, no `transition: all`"],
  ["motion-check", "durations, gpu-only properties, reduced motion"],
];

console.log(`\nchecking ${base}`);
console.log(`browser  ${chrome}\n`);

let failed = 0;
for (const [name, blurb] of SUITES) {
  console.log(`\x1b[1m${name}\x1b[0m  ${blurb}`);
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [join(here, `${name}.mjs`)], {
      stdio: "inherit",
      env: { ...process.env, BASE_URL: base, CHROME_PATH: chrome },
    });
    child.on("close", resolve);
  });
  if (code !== 0) failed += 1;
  console.log();
}

if (failed) {
  console.error(`\x1b[31m${failed} of ${SUITES.length} suites failed\x1b[0m`);
  process.exit(1);
}
console.log(`\x1b[32mall ${SUITES.length} suites passed\x1b[0m`);
