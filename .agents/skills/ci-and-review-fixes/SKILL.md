---
name: ci-and-review-fixes
description: Use when CI is red, a PR has review comments, or the user asks to fix checks, bot findings, or reviewer feedback. Triage failures, fix the real causes, and reply to review threads with evidence.
---

# CI and Review Fixes

use this skill when fixing failing checks or responding to review feedback on a branch or PR.

## goals

- get CI green for real, not by weakening gates
- address or refute every actionable review finding
- keep the diff scoped to the failure class you are fixing

## triage order

1. identify the failing job, test, lint, typecheck, or review thread
2. reproduce locally (or via the same command CI runs) before editing
3. decide: real bug, flaky test, env gap, or false positive
4. fix the cause; only then re-run the relevant check

## fixing CI

- prefer the exact CI command from the workflow or package scripts
- fix the class of failure when siblings exist (same lint rule, same broken import pattern)
- do not delete or skip tests to silence a failure unless the user explicitly asks
- do not use `--no-verify` or disable required checks
- if a failure needs secrets or services you cannot reach, say what is blocked and what you verified instead

## fixing review comments

- treat findings as inputs, not orders
- verify blocker claims before changing code
- when you fix something: say what changed and where
- when you disagree: refute with evidence in the thread, do not silently ignore
- resolve only after the reply is posted (when you have permission to resolve)

## shipping voice

when this work ends in a commit or PR update, also follow `/shipping-discipline`:

- lowercase PR title and body
- no em dashes or en dashes
- state what failed, what you fixed, and how you verified

## done checklist

- [ ] failing check reproduced or clearly explained if blocked
- [ ] fix addresses root cause
- [ ] relevant checks re-run and passing (or blocked reason recorded)
- [ ] each review thread replied to with fix or refutation
- [ ] no unrelated refactors mixed in
