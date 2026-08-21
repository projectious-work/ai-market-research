#!/usr/bin/env bash
# Serve the Hugo documentation site locally.
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_BASE_URL="${DOCS_BASE_URL:-http://localhost:1320/}"

command -v hugo >/dev/null 2>&1 || {
  echo "Hugo extended is required: https://gohugo.io/installation/" >&2
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "Node.js and npm are required for the theme assets." >&2
  exit 1
}
command -v go >/dev/null 2>&1 || {
  echo "Go is required to resolve the pinned Hugo theme module." >&2
  exit 1
}

if [[ ! -x "${DOCS_DIR}/node_modules/.bin/tailwindcss" ||
      ! -d "${DOCS_DIR}/node_modules/@tabler/icons" ]]; then
  if [[ -f "${DOCS_DIR}/package-lock.json" ]]; then
    npm --prefix "${DOCS_DIR}" ci
  else
    npm --prefix "${DOCS_DIR}" install --no-package-lock
  fi
fi

echo "[1/3] generating release history from git tags"
bash "${DOCS_DIR}/scripts/generate-releases-data.sh"

echo "[2/3] generating changelog posts"
python3 "${DOCS_DIR}/scripts/generate-changelog-posts.py"

echo "[3/3] serving Hugo site at ${DOCS_BASE_URL}"
cd "${DOCS_DIR}"
hugo server --buildDrafts --disableFastRender --baseURL "${DOCS_BASE_URL}" \
  --bind 0.0.0.0 --port 1320 "$@"
