#!/usr/bin/env bash
# Build the Hugo site with the pinned projectious.work brand theme and publish
# it to GitHub Pages from a local checkout.
#
# This repository intentionally uses branch-based Pages. This script does not
# create or invoke GitHub Actions; it publishes the static `docs/public/` build to
# the `gh-pages` branch via a temporary git worktree, never force-pushing.
#
# Usage:
#   bash docs/scripts/deploy-docs.sh
#   DOCS_VERSION=v0.4.0 bash docs/scripts/deploy-docs.sh
#   bash docs/scripts/deploy-docs.sh --message "deploy: refresh signal room"
#   bash docs/scripts/deploy-docs.sh --skip-build
set -euo pipefail

DOCS_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "${DOCS_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

PAGES_BRANCH="gh-pages"
REMOTE="origin"
BUILD_DIR="${DOCS_DIR}/public"
DOCS_BASE_URL="${DOCS_BASE_URL:-https://projectious-work.github.io/ai-market-research/}"
DOCS_VERSION="${DOCS_VERSION:-main}"
COMMIT_MESSAGE=""
SKIP_BUILD=0
WORKTREE_DIR="$(mktemp -d)"

if [[ ! "${DOCS_VERSION}" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "fatal: DOCS_VERSION may contain only letters, numbers, dots, underscores, or hyphens" >&2
  exit 2
fi

if [[ "${DOCS_VERSION}" != "main" &&
      "${DOCS_BASE_URL}" == "https://projectious-work.github.io/ai-market-research/" ]]; then
  DOCS_BASE_URL="${DOCS_BASE_URL}${DOCS_VERSION}/"
fi

if [[ "${DOCS_VERSION}" == "main" ]]; then
  PUBLISH_DIR=""
  BUILD_DIR="${DOCS_DIR}/public"
else
  PUBLISH_DIR="${DOCS_VERSION}"
  BUILD_DIR="${DOCS_DIR}/public/${DOCS_VERSION}"
fi

cleanup() {
  git -C "${REPO_ROOT}" worktree remove --force "${WORKTREE_DIR}" >/dev/null 2>&1 || true
  rmdir "${WORKTREE_DIR}" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

while [ $# -gt 0 ]; do
  case "$1" in
    --message)
      [ $# -ge 2 ] && [ -n "$2" ] || { echo "fatal: --message requires a value" >&2; exit 2; }
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo "fatal: unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

for command in gh git; do
  command -v "$command" >/dev/null || {
    echo "fatal: required command not found: $command" >&2
    exit 1
  }
done

# Actions workflows are intentionally unsupported for this project. Refuse to
# deploy if one is introduced, since a push could otherwise trigger it.
if [ -d .github/workflows ] &&
   find .github/workflows -type f -print -quit | grep -q .; then
  echo "fatal: .github/workflows contains a file; Pages must remain manual" >&2
  exit 1
fi

gh auth status --hostname github.com >/dev/null

REMOTE_URL="$(git remote get-url "$REMOTE" 2>/dev/null || true)"
[ -n "$REMOTE_URL" ] || { echo "fatal: remote '$REMOTE' is not configured" >&2; exit 1; }
REPO_SLUG="$(printf '%s\n' "$REMOTE_URL" | sed -nE \
  's#^(https://github\.com/|git@github\.com:)([^/]+/[^/]+)$#\2#p')"
REPO_SLUG="${REPO_SLUG%.git}"
[ -n "$REPO_SLUG" ] || { echo "fatal: could not parse a GitHub owner/repository from $REMOTE_URL" >&2; exit 1; }
OWNER="${REPO_SLUG%%/*}"
REPO="${REPO_SLUG##*/}"

if [ "$SKIP_BUILD" -eq 0 ]; then
  echo "[1/6] building Hugo site (embeds a freshly built report)"
  if [[ "${DOCS_VERSION}" == "main" ]]; then
    DOCS_BASE_URL="${DOCS_BASE_URL}" \
      bash "${DOCS_DIR}/scripts/build-docs.sh" --destination "${BUILD_DIR}"
  else
    DOCS_BASE_URL="${DOCS_BASE_URL}" \
    HUGO_PARAMS_VERSION="${DOCS_VERSION}" \
    HUGO_PARAMS_ARCHIVE=true \
    HUGO_PARAMS_LATEST="https://projectious-work.github.io/ai-market-research/" \
      bash "${DOCS_DIR}/scripts/build-docs.sh" --destination "${BUILD_DIR}"
  fi
else
  echo "[1/6] using existing build (--skip-build)"
fi

[ -s "${BUILD_DIR}/index.html" ] || { echo "fatal: ${BUILD_DIR}/index.html is missing or empty" >&2; exit 1; }
[ -s "${BUILD_DIR}/dashboard/index.html" ] || { echo "fatal: ${BUILD_DIR}/dashboard/index.html is missing or empty" >&2; exit 1; }
[ -s "${BUILD_DIR}/docs/index.html" ] || { echo "fatal: ${BUILD_DIR}/docs/index.html is missing or empty" >&2; exit 1; }
[ -s "${BUILD_DIR}/changelog/index.html" ] || { echo "fatal: ${BUILD_DIR}/changelog/index.html is missing or empty" >&2; exit 1; }

echo "[2/6] preparing ${PAGES_BRANCH} worktree"
git fetch --quiet "$REMOTE" "$PAGES_BRANCH" 2>/dev/null || true

if git show-ref --verify --quiet "refs/remotes/$REMOTE/$PAGES_BRANCH"; then
  git worktree add --quiet --detach "$WORKTREE_DIR" "$REMOTE/$PAGES_BRANCH"
  git -C "$WORKTREE_DIR" checkout --quiet -B "$PAGES_BRANCH" "$REMOTE/$PAGES_BRANCH"
else
  git worktree add --quiet --no-checkout "$WORKTREE_DIR" HEAD
  git -C "$WORKTREE_DIR" checkout --quiet --orphan "$PAGES_BRANCH"
  git -C "$WORKTREE_DIR" rm -rf --quiet . 2>/dev/null || true
fi

echo "[3/6] staging Hugo build as the Pages payload"
if [[ -z "${PUBLISH_DIR}" ]]; then
  find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
  cp -R "${BUILD_DIR}/." "$WORKTREE_DIR/"
else
  VERSION_DIR="${WORKTREE_DIR}/${PUBLISH_DIR}"
  mkdir -p "${VERSION_DIR}"
  find "$VERSION_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf {} +
  cp -R "${BUILD_DIR}/." "$VERSION_DIR/"
fi
: > "$WORKTREE_DIR/.nojekyll"

if [ -z "$COMMIT_MESSAGE" ]; then
  SOURCE_SHA="$(git rev-parse --short HEAD)"
  COMMIT_MESSAGE="deploy: docs site from $SOURCE_SHA"
fi

git -C "$WORKTREE_DIR" add -A
if git -C "$WORKTREE_DIR" diff --staged --quiet; then
  NEEDS_PUSH=0
  echo "[4/6] payload is unchanged"
else
  DEPLOY_EMAIL="$(git config user.email 2>/dev/null || true)"
  [ -n "$DEPLOY_EMAIL" ] || DEPLOY_EMAIL="info@projectious.work"
  git -C "$WORKTREE_DIR" \
    -c user.name="ai-market-research deploy" \
    -c user.email="$DEPLOY_EMAIL" \
    commit --quiet -m "$COMMIT_MESSAGE"
  NEEDS_PUSH=1
fi

if [ "$NEEDS_PUSH" -eq 1 ]; then
  echo "[5/6] pushing $PAGES_BRANCH to $REMOTE"
  git -C "$WORKTREE_DIR" push --quiet "$REMOTE" "$PAGES_BRANCH"
else
  echo "[5/6] push skipped"
fi

echo "[6/6] enforcing branch-based Pages configuration"
PAGES_ENDPOINT="repos/$OWNER/$REPO/pages"
if ! PAGES_JSON="$(gh api "$PAGES_ENDPOINT" 2>/dev/null)"; then
  echo "      enabling Pages from $PAGES_BRANCH:/"
  printf '%s' \
    '{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}' |
    gh api --method POST "$PAGES_ENDPOINT" --input - >/dev/null
  PAGES_JSON="$(gh api "$PAGES_ENDPOINT")"
fi

read -r CURRENT_BRANCH CURRENT_PATH BUILD_TYPE HTTPS_ENFORCED <<EOF
$(printf '%s' "$PAGES_JSON" | python3 -c '
import json, sys
d = json.load(sys.stdin)
s = d.get("source") or {}
print(s.get("branch", ""), s.get("path", ""), d.get("build_type", ""),
      str(d.get("https_enforced", False)).lower())
')
EOF

if [ "$CURRENT_BRANCH" != "$PAGES_BRANCH" ] || [ "$CURRENT_PATH" != "/" ] ||
   [ "$BUILD_TYPE" != "legacy" ] || [ "$HTTPS_ENFORCED" != "true" ]; then
  echo "      updating Pages to manual $PAGES_BRANCH:/ deployment with HTTPS"
  printf '%s' \
    '{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"},"https_enforced":true}' |
    gh api --method PUT "$PAGES_ENDPOINT" --input - >/dev/null
  PAGES_JSON="$(gh api "$PAGES_ENDPOINT")"
fi

printf '%s' "$PAGES_JSON" | python3 -c '
import json, sys
d = json.load(sys.stdin)
s = d.get("source") or {}
errors = []
if s.get("branch") != "gh-pages" or s.get("path") != "/":
    errors.append("source must be gh-pages:/")
if d.get("build_type") != "legacy":
    errors.append("build_type must be legacy (branch deploy), not workflow")
if not d.get("https_enforced"):
    errors.append("HTTPS must be enforced")
if not str(d.get("html_url", "")).startswith("https://"):
    errors.append("Pages URL must use HTTPS")
if errors:
    raise SystemExit("fatal: " + "; ".join(errors))
'

SITE_URL="$(printf '%s' "$PAGES_JSON" | python3 -c \
  'import json,sys; print(json.load(sys.stdin)["html_url"])')"
echo
echo "deploy ok"
echo "site:   $SITE_URL"
echo "dashboard: ${SITE_URL%/}/dashboard/"
echo "source: $PAGES_BRANCH:/"
