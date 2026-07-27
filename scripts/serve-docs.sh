#!/usr/bin/env bash
# Serve the Hugo/Docsy documentation site locally, with a freshly built
# report embedded at /report/.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_BASE_URL="${DOCS_BASE_URL:-http://localhost:1313/}"

command -v hugo >/dev/null 2>&1 || {
  echo "Hugo extended is required: https://gohugo.io/installation/" >&2
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "Node.js and npm are required for Docsy assets." >&2
  exit 1
}

if [[ ! -f "${ROOT_DIR}/themes/docsy/theme.toml" ]]; then
  git -C "${ROOT_DIR}" submodule update --init --recursive themes/docsy
fi
if [[ ! -d "${ROOT_DIR}/node_modules" ]]; then
  if [[ -f "${ROOT_DIR}/package-lock.json" ]]; then
    npm --prefix "${ROOT_DIR}" ci
  else
    npm --prefix "${ROOT_DIR}" install --no-package-lock
  fi
fi

echo "[1/2] building report (dist/dashboard.html)"
bash "${ROOT_DIR}/src/scripts/build.sh"
mkdir -p "${ROOT_DIR}/static/report"
cp "${ROOT_DIR}/dist/dashboard.html" "${ROOT_DIR}/static/report/dashboard.html"

echo "[2/2] serving Hugo site at ${DOCS_BASE_URL}"
cd "${ROOT_DIR}"
hugo server --buildDrafts --disableFastRender --baseURL "${DOCS_BASE_URL}" "$@"
