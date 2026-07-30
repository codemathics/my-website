---
name: shipping-discipline
description: Use when committing, pushing, opening, or updating a PR. Enforces the user's shipping voice and release judgment: lowercase shipping text, no em dashes, and careful done-criteria before merge.
---

# Shipping Discipline

Use this skill whenever you are about to commit, push, open a PR, or update a PR.

## Voice rules (always)

these apply to PR titles, PR bodies, and any shipping-facing summary text you write for the user:

1. **small cases only.** write in lowercase. do not title-case PR titles or section headers in PR bodies.
2. **no em dashes.** never use `—` (em dash), `–` (en dash), or unicode minus as punctuation. rewrite with commas, periods, colons, parentheses, or plain hyphens in compound words only when needed.
3. prefer short, plain sentences over polished marketing copy.

## Before you push or open a PR

- wait for an explicit go-ahead if the user has asked you not to push yet.
- confirm the change is exercised through its real entry point, not only by unit tests or build success.
- for UI work: run the app and capture evidence (screenshot or clear repro notes).
- keep the PR focused. do not mix unrelated refactors into a shipping PR.

## PR text checklist

before submitting or updating a PR description:

- [ ] title is all lowercase
- [ ] body is all lowercase
- [ ] no em dashes / en dashes anywhere in title or body
- [ ] body states what changed, why, and how it was verified
- [ ] no co-author noise or filler the user did not ask for

## Review / CI findings

- treat review and CI findings as inputs, not orders.
- verify blocker claims before changing code.
- refute false positives with evidence in the PR thread.
- fix the class of bug when a real finding has siblings nearby.

## Do not

- invent extra process the user did not ask for
- force-push history rewrites unless the user explicitly allows it
- skip hooks (`--no-verify`)
- declare "done" from green CI alone when the change is user-facing
