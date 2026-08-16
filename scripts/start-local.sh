#!/usr/bin/env bash
# start the site locally, from any state.
#
# handles the three things that usually go wrong: a checkout sitting on an old
# branch, dependencies that predate the newest package.json, and a .next cache
# built before the last pull. safe to run repeatedly.
#
#   ./scripts/start-local.sh          # update, install if needed, start dev
#   ./scripts/start-local.sh --check  # do everything except start the server

set -euo pipefail

CHECK_ONLY=false
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=true

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$REPO_ROOT/my-website"
cd "$REPO_ROOT"

say() { printf "\n\033[1m%s\033[0m\n" "$1"; }

say "1/4  syncing with main"
CURRENT="$(git rev-parse --abbrev-ref HEAD)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "  uncommitted changes present, leaving the branch alone ($CURRENT)"
else
  if [[ "$CURRENT" != "main" ]]; then
    echo "  switching from $CURRENT to main"
    git checkout main
  fi
  git pull --ff-only origin main
fi
echo "  now at $(git log --oneline -1)"

say "2/4  checking the app is complete"
MISSING=false
for path in \
  "$APP_DIR/src/lib/sound/engine.ts" \
  "$APP_DIR/src/lib/sound/scroll-sonifier.ts" \
  "$APP_DIR/src/components/SoundToggle.tsx" \
  "$APP_DIR/src/components/SoundDock.tsx"
do
  if [[ -f "$path" ]]; then
    echo "  ok       ${path#"$REPO_ROOT/"}"
  else
    echo "  MISSING  ${path#"$REPO_ROOT/"}"
    MISSING=true
  fi
done
if $MISSING; then
  echo
  echo "  files are missing, which means the pull did not land. check that this is"
  echo "  the right clone: $(git remote get-url origin 2>/dev/null || echo 'no origin')"
  exit 1
fi

say "3/4  dependencies"
cd "$APP_DIR"
# node_modules older than package.json means a dependency was added since the
# last install, which is the usual cause of a module-not-found on boot
if [[ ! -d node_modules ]] || [[ package.json -nt node_modules ]]; then
  echo "  installing"
  npm install
else
  echo "  up to date"
fi

# a cache built before the pull serves the old css and the old components
if [[ -d .next ]]; then
  echo "  clearing the .next cache"
  rm -rf .next
fi

if $CHECK_ONLY; then
  say "4/4  check only, not starting the server"
  echo "  everything is in place. drop --check to start it."
  exit 0
fi

say "4/4  starting the dev server on http://localhost:3000"
cat <<'NOTE'

  where to find the sound control:
    home        far left of the projects section, above the tick column. it is
                deliberately invisible on the hero, and desktop width only.
    every else  bottom right, directly above the chat bubble.

  it ripples grey while sound is off. click it once, and that same click is also
  the gesture browsers require before any audio is allowed to start.

NOTE
exec npm run dev
