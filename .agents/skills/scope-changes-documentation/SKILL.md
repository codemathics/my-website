---
name: scope-changes-documentation
description: Use when committing, pushing, or opening a PR and you need a clear scope statement of what changed and what did not. Write concise change docs for commits and PR bodies.
---

# Scope Changes Documentation

use this skill when documenting a change set before commit, push, or PR creation.

## goals

- make the scope obvious in one short read
- separate intentional changes from out-of-scope work
- give reviewers a verification path

## what to capture

1. **intent** - why this change exists in one sentence
2. **in scope** - files/areas touched and the behavior change
3. **out of scope** - nearby things you deliberately did not change
4. **verification** - commands run, UI paths clicked, or evidence captured
5. **risks** - anything a reviewer should watch (migrations, visual regressions, feature flags)

## format for PR bodies

write in lowercase. no em dashes. keep it short:

```text
## intent
<one sentence>

## changes
- <bullet>
- <bullet>

## out of scope
- <bullet>

## verify
- <command or click path>
```

## format for commit messages

- subject: lowercase, imperative, focused on the user-visible or system-visible change
- body (optional): 1-3 lines on why, plus verify note if non-obvious
- one logical change per commit when practical

## rules

- do not claim files changed that are not in the diff
- do not hide drive-by edits; either revert them or list them under changes
- if the diff is larger than the stated intent, stop and split or rewrite the scope
- when used with a push, also follow `/shipping-discipline` for voice and release judgment

## done checklist

- [ ] intent matches the diff
- [ ] in-scope bullets map to real files/behaviors
- [ ] out-of-scope is explicit when temptation to expand existed
- [ ] verify steps are concrete
- [ ] text is lowercase with no em dashes
