#!/usr/bin/env bash
# Build the Hugo/Docsy documentation site, embedding a freshly built report.
#
# The Signal Room section (00 Now on the landing page, 01-05 under /report/)
# is not an iframe: ../src/scripts/build.py splits the same template used for
# dist/dashboard.html into docs/static/report/{report.css,report.js} (shared)
# and docs/static/report/sections/*.html (one per tab panel), which Hugo
# injects directly via the report-section shortcode. That build runs first.
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${DOCS_DIR}/.." && pwd)"
DOCS_BASE_URL="${DOCS_BASE_URL:-https://projectious-work.github.io/ai-market-research/}"
BUILD_DIR="${DOCS_DIR}/public"

BUILD_ARGS=("$@")
for ((i = 0; i < ${#BUILD_ARGS[@]}; i++)); do
  case "${BUILD_ARGS[i]}" in
    --destination)
      if ((i + 1 >= ${#BUILD_ARGS[@]})); then
        echo "--destination requires a value." >&2
        exit 1
      fi
      BUILD_DIR="${BUILD_ARGS[i + 1]}"
      ;;
    --destination=*)
      BUILD_DIR="${BUILD_ARGS[i]#--destination=}"
      ;;
  esac
done

if [[ "${BUILD_DIR}" != /* ]]; then
  BUILD_DIR="${DOCS_DIR}/${BUILD_DIR}"
fi

command -v hugo >/dev/null 2>&1 || {
  echo "Hugo extended is required: https://gohugo.io/installation/" >&2
  exit 1
}
command -v npm >/dev/null 2>&1 || {
  echo "Node.js and npm are required for Docsy assets." >&2
  exit 1
}
command -v python3 >/dev/null 2>&1 || {
  echo "python3 is required to build the report." >&2
  exit 1
}

if [[ ! -f "${DOCS_DIR}/themes/docsy/theme.toml" ]]; then
  git -C "${REPO_ROOT}" submodule update --init --recursive docs/themes/docsy
fi

if [[ ! -d "${DOCS_DIR}/node_modules" ]]; then
  # Prefer the lockfile so Docsy's transitive dependencies are pinned too;
  # package.json only pins the direct ones.
  if [[ -f "${DOCS_DIR}/package-lock.json" ]]; then
    npm --prefix "${DOCS_DIR}" ci
  else
    npm --prefix "${DOCS_DIR}" install --no-package-lock
  fi
fi

echo "[1/3] building report (dist/dashboard.html + docs/static/report/*)"
bash "${REPO_ROOT}/src/scripts/build.sh"
if grep -q '__MARKET_DATA__' "${REPO_ROOT}/dist/dashboard.html"; then
  echo "fatal: dashboard still contains the data placeholder" >&2
  exit 1
fi

echo "[2/4] generating release history from git tags"
bash "${DOCS_DIR}/scripts/generate-releases-data.sh"

echo "[3/4] generating changelog posts"
python3 "${DOCS_DIR}/scripts/generate-changelog-posts.py"

echo "[4/4] building Hugo site"
cd "${DOCS_DIR}"
hugo --gc --minify --cleanDestinationDir --baseURL "${DOCS_BASE_URL}" \
  "${BUILD_ARGS[@]}"

# GitHub Pages must serve Hugo's prebuilt output without Jekyll processing.
: > "${BUILD_DIR}/.nojekyll"
