#!/usr/bin/env bash
# Build and publish the dashboard from a local checkout to GitHub Pages.
#
# This repository intentionally uses branch-based Pages. The script does not
# create or invoke GitHub Actions; it publishes a static payload to gh-pages.
#
# Usage:
#   bash src/scripts/deploy.sh
#   bash src/scripts/deploy.sh --message "deploy: refresh market report"
#   bash src/scripts/deploy.sh --skip-build
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

PAGES_BRANCH="gh-pages"
REMOTE="origin"
WORKTREE_DIR="$REPO_ROOT/.git/gh-pages-worktree"
SCREENSHOT="$REPO_ROOT/docs/assets/signal-room-start.png"
COMMIT_MESSAGE=""
SKIP_BUILD=0
WORKTREE_READY=0

usage() {
  sed -n '2,10p' "$0"
}

cleanup() {
  if [ "$WORKTREE_READY" -eq 1 ]; then
    git worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 || true
  fi
  git worktree prune >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

while [ $# -gt 0 ]; do
  case "$1" in
    --message)
      if [ $# -lt 2 ] || [ -z "$2" ]; then
        echo "fatal: --message requires a value" >&2
        exit 2
      fi
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "fatal: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

for command in gh git python3; do
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
if [ -z "$REMOTE_URL" ]; then
  echo "fatal: remote '$REMOTE' is not configured" >&2
  exit 1
fi

# Accept GitHub HTTPS and SSH remotes, with an optional .git suffix.
REPO_SLUG="$(printf '%s\n' "$REMOTE_URL" | sed -nE \
  's#^(https://github\.com/|git@github\.com:)([^/]+/[^/]+)$#\2#p')"
REPO_SLUG="${REPO_SLUG%.git}"
if [ -z "$REPO_SLUG" ]; then
  echo "fatal: could not parse a GitHub owner/repository from $REMOTE_URL" >&2
  exit 1
fi
OWNER="${REPO_SLUG%%/*}"
REPO="${REPO_SLUG##*/}"

if [ "$SKIP_BUILD" -eq 0 ]; then
  echo "[1/6] building dashboard"
  bash "$REPO_ROOT/src/scripts/build.sh"
else
  echo "[1/6] using existing build (--skip-build)"
fi

if [ ! -s "$REPO_ROOT/dist/dashboard.html" ]; then
  echo "fatal: dist/dashboard.html is missing or empty" >&2
  exit 1
fi
if grep -q '__MARKET_DATA__' "$REPO_ROOT/dist/dashboard.html"; then
  echo "fatal: dashboard still contains the data placeholder" >&2
  exit 1
fi

echo "[2/6] preparing $PAGES_BRANCH worktree"
git fetch --quiet "$REMOTE" "$PAGES_BRANCH" 2>/dev/null || true

if [ -d "$WORKTREE_DIR" ]; then
  git worktree remove --force "$WORKTREE_DIR" >/dev/null 2>&1 ||
    rm -rf "$WORKTREE_DIR"
fi
git worktree prune

if git show-ref --verify --quiet "refs/remotes/$REMOTE/$PAGES_BRANCH"; then
  git worktree add --quiet --detach "$WORKTREE_DIR" \
    "$REMOTE/$PAGES_BRANCH"
  WORKTREE_READY=1
  git -C "$WORKTREE_DIR" checkout --quiet -B "$PAGES_BRANCH" \
    "$REMOTE/$PAGES_BRANCH"
else
  git worktree add --quiet --no-checkout "$WORKTREE_DIR" HEAD
  WORKTREE_READY=1
  git -C "$WORKTREE_DIR" checkout --quiet --orphan "$PAGES_BRANCH"
  git -C "$WORKTREE_DIR" rm -rf --quiet . 2>/dev/null || true
fi

echo "[3/6] staging static Pages payload"
find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name .git \
  -exec rm -rf {} +
cp "$REPO_ROOT/dist/dashboard.html" "$WORKTREE_DIR/index.html"
cp "$REPO_ROOT/dist/dashboard.html" "$WORKTREE_DIR/dashboard.html"
touch "$WORKTREE_DIR/.nojekyll"

if [ -s "$SCREENSHOT" ]; then
  mkdir -p "$WORKTREE_DIR/assets"
  cp "$SCREENSHOT" "$WORKTREE_DIR/assets/signal-room-start.png"
  echo "      included assets/signal-room-start.png"
else
  echo "      note: tracked screenshot not present; publishing dashboard only"
fi

if [ -z "$COMMIT_MESSAGE" ]; then
  SOURCE_SHA="$(git rev-parse --short HEAD)"
  COMMIT_MESSAGE="deploy: dashboard from $SOURCE_SHA"
fi

git -C "$WORKTREE_DIR" add -A
if git -C "$WORKTREE_DIR" diff --staged --quiet; then
  NEEDS_PUSH=0
  echo "[4/6] payload is unchanged"
else
  DEPLOY_EMAIL="$(git config user.email 2>/dev/null || true)"
  if [ -z "$DEPLOY_EMAIL" ]; then
    GH_LOGIN="$(gh api user --jq .login)"
    DEPLOY_EMAIL="${GH_LOGIN}@users.noreply.github.com"
    echo "      using GitHub noreply identity for $GH_LOGIN"
  fi
  git -C "$WORKTREE_DIR" \
    -c user.name="ai-market-research deploy" \
    -c user.email="$DEPLOY_EMAIL" \
    commit --quiet -m "$COMMIT_MESSAGE"
  NEEDS_PUSH=1
fi

if [ "$NEEDS_PUSH" -eq 1 ]; then
  echo "[4/6] pushing $PAGES_BRANCH to $REMOTE"
  git -C "$WORKTREE_DIR" push --quiet "$REMOTE" "$PAGES_BRANCH"
else
  echo "[4/6] push skipped"
fi

echo "[5/6] enforcing branch-based Pages configuration"
PAGES_ENDPOINT="repos/$OWNER/$REPO/pages"
if ! PAGES_JSON="$(gh api "$PAGES_ENDPOINT" 2>/dev/null)"; then
  echo "      enabling Pages from $PAGES_BRANCH:/"
  printf '%s' \
    '{"build_type":"legacy","source":{"branch":"gh-pages","path":"/"}}' |
    gh api --method POST "$PAGES_ENDPOINT" --input - >/dev/null
  PAGES_JSON="$(gh api "$PAGES_ENDPOINT")"
fi

read -r CURRENT_BRANCH CURRENT_PATH BUILD_TYPE HTTPS_ENFORCED SITE_URL <<EOF
$(printf '%s' "$PAGES_JSON" | python3 -c '
import json, sys
d = json.load(sys.stdin)
s = d.get("source") or {}
print(s.get("branch", ""), s.get("path", ""), d.get("build_type", ""),
      str(d.get("https_enforced", False)).lower(), d.get("html_url", ""))
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

echo "[6/6] verifying Pages configuration"
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
echo "site:       $SITE_URL"
echo "source:     $PAGES_BRANCH:/"
echo "screenshot: ${SITE_URL%/}/assets/signal-room-start.png"
