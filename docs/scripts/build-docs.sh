#!/usr/bin/env bash
# Build the Hugo documentation site.
set -euo pipefail

DOCS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
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
  echo "Node.js and npm are required for the theme assets." >&2
  exit 1
}
command -v go >/dev/null 2>&1 || {
  echo "Go is required to resolve the pinned Hugo theme module." >&2
  exit 1
}
command -v python3 >/dev/null 2>&1 || {
  echo "python3 is required to generate release metadata." >&2
  exit 1
}

if [[ ! -x "${DOCS_DIR}/node_modules/.bin/tailwindcss" ||
      ! -d "${DOCS_DIR}/node_modules/@tabler/icons" ]]; then
  # Prefer the lockfile so theme dependencies remain reproducible.
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

echo "[3/3] building Hugo site"
cd "${DOCS_DIR}"
hugo --gc --minify --cleanDestinationDir --baseURL "${DOCS_BASE_URL}" \
  "${BUILD_ARGS[@]}"

# GitHub Pages must serve Hugo's prebuilt output without Jekyll processing.
: > "${BUILD_DIR}/.nojekyll"
