#!/usr/bin/env bash
# copy project agent skills into the user-global Cursor skills dir so they
# are available for this cloud VM session (idempotent).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${ROOT}/.agents/skills"
DEST_CURSOR="${HOME}/.cursor/skills"
DEST_AGENTS="${HOME}/.agents/skills"

if [[ ! -d "${SRC}" ]]; then
  echo "install-skills: no skills at ${SRC}, skipping"
  exit 0
fi

mkdir -p "${DEST_CURSOR}" "${DEST_AGENTS}"

for skill_dir in "${SRC}"/*; do
  [[ -d "${skill_dir}" ]] || continue
  name="$(basename "${skill_dir}")"
  rm -rf "${DEST_CURSOR:?}/${name}" "${DEST_AGENTS:?}/${name}"
  cp -R "${skill_dir}" "${DEST_CURSOR}/${name}"
  cp -R "${skill_dir}" "${DEST_AGENTS}/${name}"
  echo "install-skills: installed ${name}"
done

# refresh public agentation package if network is available (best effort)
if command -v npx >/dev/null 2>&1; then
  npx -y skills add benjitaylor/agentation -g -a cursor --copy -y >/dev/null 2>&1 || true
fi

echo "install-skills: done -> ${DEST_CURSOR}"
ls -1 "${DEST_CURSOR}"
