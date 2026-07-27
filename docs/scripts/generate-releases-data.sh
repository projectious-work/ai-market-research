#!/usr/bin/env bash
# Generate docs/data/releases.json from real git tags, so the Releases/
# Revisions menu lists actual semver releases instead of a hand-maintained
# list. Run before the Hugo build (scripts/build-docs.sh does this).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${ROOT_DIR}/.." && pwd)"
OUT="${ROOT_DIR}/data/releases.json"
REPO_URL="https://github.com/projectious-work/ai-market-research"

mkdir -p "$(dirname "${OUT}")"

TAGS="$(git -C "${REPO_ROOT}" tag --list 'v[0-9]*.[0-9]*.[0-9]*' --sort=-v:refname)"

{
  echo "["
  first=1
  while IFS= read -r tag; do
    [ -n "${tag}" ] || continue
    date="$(git -C "${REPO_ROOT}" log -1 --format=%aI "${tag}" 2>/dev/null || echo "")"
    if [ "${first}" -eq 0 ]; then echo ","; fi
    first=0
    printf '  {"tag": %s, "url": %s, "date": %s}' \
      "$(printf '%s' "${tag}" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')" \
      "$(printf '%s/releases/tag/%s' "${REPO_URL}" "${tag}" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')" \
      "$(printf '%s' "${date}" | python3 -c 'import json,sys;print(json.dumps(sys.stdin.read()))')"
  done <<< "${TAGS}"
  echo ""
  echo "]"
} > "${OUT}"

COUNT="$(printf '%s\n' "${TAGS}" | grep -c . || true)"
echo "wrote ${OUT} (${COUNT} tags)"
