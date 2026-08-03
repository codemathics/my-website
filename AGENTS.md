# AGENTS.md

## Cursor Cloud specific instructions

This repo contains a single runnable app: a Next.js 16 (App Router, React 19, TypeScript) personal portfolio in `my-website/`. There is no backend, database, or Docker; media is served from external CDNs (Cloudinary / Cloudflare R2). The repo root only holds docs, Cursor MCP config, and agent skills.

### Running / building / linting

All commands run from `my-website/` (scripts are defined in `my-website/package.json`):

- Dev server: `npm run dev` (Next.js dev, Turbopack, http://localhost:3000). This is the only service needed to test almost all functionality end to end.
- Build / prod: `npm run build` then `npm run start`.
- Lint: `npm run lint`.
- Tests: none are configured (no test runner or test files).

### Non-obvious caveats

- `npm run lint` currently crashes with `TypeError: Converting circular structure to JSON` inside `@eslint/eslintrc`. Cause: `eslint-config-next@16` ships flat configs, but `eslint.config.mjs` loads them through `FlatCompat.extends("next/core-web-vitals", "next/typescript")`, which is incompatible. This is a pre-existing repo config issue, not an environment/setup problem — fixing it requires editing `eslint.config.mjs` to import the flat configs directly (out of scope for env setup).
- `my-website/.npmrc` sets `legacy-peer-deps=true`; keep installing with plain `npm install` so peer-dependency resolution keeps working.
- The AI chat widget (`/api/chat`, GPT-4o via the Vercel AI SDK) needs `OPENAI_API_KEY` in the environment. It is unset by default, so the chat feature will not work end to end without it; the rest of the site works fine without any secrets.
- Some project case studies (e.g. `/projects/coderabbit`) intentionally render a "Case study in progress" modal — that is expected content, not an error.
- Optional integrations (Google Analytics, Microsoft Clarity, custom reel video URL) are gated behind env vars (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`, `PROJECT_VIDEO_URL` / `NEXT_PUBLIC_PROJECT_VIDEO_URL`) and silently no-op when unset.
