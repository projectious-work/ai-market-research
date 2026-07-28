#!/usr/bin/env bash
# Serve the Hugo/Docsy documentation site locally, with a freshly built
# report embedded at /report/.
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${DOCS_DIR}/.." && pwd)"
DOCS_BASE_URL="${DOCS_BASE_URL:-http://localhost:1313/}"

command -v hugo >/dev/null 2>&1 || {
  echo "Hugo extended is required: https://gohugo.io/installation/" >&2
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "Node.js and npm are required for Docsy assets." >&2
  exit 1
}

if [[ ! -f "${DOCS_DIR}/themes/docsy/theme.toml" ]]; then
  git -C "${REPO_ROOT}" submodule update --init --recursive docs/themes/docsy
fi
if [[ ! -d "${DOCS_DIR}/node_modules" ]]; then
  if [[ -f "${DOCS_DIR}/package-lock.json" ]]; then
    npm --prefix "${DOCS_DIR}" ci
  else
    npm --prefix "${DOCS_DIR}" install --no-package-lock
  fi
fi

echo "[1/3] building report (dist/dashboard.html + docs/static/report/*)"
bash "${REPO_ROOT}/src/scripts/build.sh"

echo "[2/4] generating release history from git tags"
bash "${DOCS_DIR}/scripts/generate-releases-data.sh"

echo "[3/4] generating changelog posts"
python3 "${DOCS_DIR}/scripts/generate-changelog-posts.py"

echo "[4/4] serving Hugo site at ${DOCS_BASE_URL}"
cd "${DOCS_DIR}"
hugo server --buildDrafts --disableFastRender --baseURL "${DOCS_BASE_URL}" "$@"
