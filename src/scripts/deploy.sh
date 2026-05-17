#!/usr/bin/env bash
# Deploy dist/dashboard.html to GitHub Pages from this container.
#
# Pipeline:
#   1. Rebuild dist/dashboard.html (idempotent).
#   2. Stage a Pages payload (index.html + dashboard.html + .nojekyll).
#   3. Push the payload as a single commit on the `gh-pages` orphan branch.
#   4. Ensure Pages is enabled (branch: gh-pages, path: /) — idempotent.
#   5. Print the live URL.
#
# No GitHub Actions, no extra dependencies (git + gh + python3 + bash).
# See DEC-20260517_1455-DeftLynx for the architecture choice.
#
# Usage:
#   src/scripts/deploy.sh                      # deploy current dist/
#   src/scripts/deploy.sh --message "..."      # custom commit message
#   src/scripts/deploy.sh --skip-build         # use existing dist/ as-is
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

PAGES_BRANCH="gh-pages"
REMOTE="origin"
WORKTREE_DIR=".git/gh-pages-worktree"
COMMIT_MESSAGE=""
SKIP_BUILD=0

while [ $# -gt 0 ]; do
  case "$1" in
    --message) COMMIT_MESSAGE="$2"; shift 2 ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    -h|--help)
      sed -n '2,18p' "$0"; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

# ─── Preflight ──────────────────────────────────────────────────────────
command -v gh >/dev/null || { echo "fatal: gh CLI not installed" >&2; exit 1; }
command -v git >/dev/null || { echo "fatal: git not installed" >&2; exit 1; }

REMOTE_URL="$(git remote get-url "$REMOTE" 2>/dev/null || true)"
if [ -z "$REMOTE_URL" ]; then
  echo "fatal: remote '$REMOTE' not configured" >&2
  exit 1
fi

# Parse owner/repo from remote URL (https or ssh).
REPO_SLUG="$(echo "$REMOTE_URL" | sed -E 's#(.*github\.com[:/])([^/]+/[^/.]+)(\.git)?$#\2#')"
if [ -z "$REPO_SLUG" ] || ! echo "$REPO_SLUG" | grep -q "/"; then
  echo "fatal: could not parse owner/repo from remote URL: $REMOTE_URL" >&2
  exit 1
fi
OWNER="${REPO_SLUG%%/*}"
REPO="${REPO_SLUG##*/}"

# ─── 1. Build ───────────────────────────────────────────────────────────
if [ "$SKIP_BUILD" -eq 0 ]; then
  echo "[1/5] building dist/dashboard.html"
  bash "$REPO_ROOT/src/scripts/build.sh"
else
  echo "[1/5] skipping build (--skip-build)"
fi

if [ ! -s "$REPO_ROOT/dist/dashboard.html" ]; then
  echo "fatal: dist/dashboard.html missing or empty" >&2
  exit 1
fi
if grep -q "__MARKET_DATA__" "$REPO_ROOT/dist/dashboard.html"; then
  echo "fatal: build output still contains __MARKET_DATA__ placeholder" >&2
  exit 1
fi

# ─── 2. Worktree on gh-pages ───────────────────────────────────────────
echo "[2/5] preparing worktree at $WORKTREE_DIR for branch $PAGES_BRANCH"

# Fetch remote branch state if it exists.
git fetch --quiet "$REMOTE" "$PAGES_BRANCH" 2>/dev/null || true

# Clean any stale worktree.
if [ -d "$WORKTREE_DIR" ]; then
  git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"
fi
# Clean any stale prunable worktree entries.
git worktree prune

if git show-ref --verify --quiet "refs/remotes/$REMOTE/$PAGES_BRANCH"; then
  # Branch exists upstream — check it out into the worktree.
  git worktree add "$WORKTREE_DIR" "$REMOTE/$PAGES_BRANCH"
  ( cd "$WORKTREE_DIR" && git checkout -B "$PAGES_BRANCH" "$REMOTE/$PAGES_BRANCH" )
else
  # First-time deploy — create an orphan branch in the worktree.
  git worktree add --no-checkout "$WORKTREE_DIR" HEAD
  (
    cd "$WORKTREE_DIR"
    git checkout --orphan "$PAGES_BRANCH"
    git rm -rf --quiet . 2>/dev/null || true
  )
fi

# ─── 3. Stage payload ───────────────────────────────────────────────────
echo "[3/5] staging Pages payload"
# Wipe everything but .git in the worktree, then copy fresh artifacts.
find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
cp "$REPO_ROOT/dist/dashboard.html" "$WORKTREE_DIR/index.html"
cp "$REPO_ROOT/dist/dashboard.html" "$WORKTREE_DIR/dashboard.html"
touch "$WORKTREE_DIR/.nojekyll"

# Default commit message embeds the source main-branch commit SHA.
if [ -z "$COMMIT_MESSAGE" ]; then
  MAIN_SHA="$(git rev-parse --short HEAD)"
  COMMIT_MESSAGE="deploy: dashboard from $MAIN_SHA"
fi

(
  cd "$WORKTREE_DIR"
  git add -A
  if git diff --staged --quiet; then
    echo "[3/5] no changes vs current gh-pages tip; skipping commit + push"
    NO_CHANGES=1
  else
    git -c user.name="ai-market-research deploy" \
        -c user.email="deploy@ai-market-research.local" \
        commit --quiet -m "$COMMIT_MESSAGE"
    NO_CHANGES=0
  fi
  echo "${NO_CHANGES:-0}" > "$REPO_ROOT/.git/.deploy-no-changes"
)

NO_CHANGES="$(cat "$REPO_ROOT/.git/.deploy-no-changes")"
rm -f "$REPO_ROOT/.git/.deploy-no-changes"

# ─── 4. Push ────────────────────────────────────────────────────────────
if [ "$NO_CHANGES" -eq 0 ]; then
  echo "[4/5] pushing $PAGES_BRANCH to $REMOTE"
  # Use gh's auth token for HTTPS push so the script works in containers
  # that don't have a configured git credential helper.
  GH_TOKEN_VAL="$(gh auth token 2>/dev/null || true)"
  if [ -z "$GH_TOKEN_VAL" ]; then
    echo "fatal: gh auth token unavailable; run 'gh auth login' first" >&2
    exit 1
  fi
  AUTH_URL="https://x-access-token:${GH_TOKEN_VAL}@github.com/${OWNER}/${REPO}.git"
  (
    cd "$WORKTREE_DIR"
    git push --quiet --force-with-lease "$AUTH_URL" "$PAGES_BRANCH"
  )
else
  echo "[4/5] skipping push (no changes)"
fi

# Tidy up — don't leave a worktree dangling between deploys.
git worktree remove --force "$WORKTREE_DIR" 2>/dev/null || rm -rf "$WORKTREE_DIR"

# ─── 5. Ensure Pages is enabled ─────────────────────────────────────────
echo "[5/5] ensuring GitHub Pages is enabled (branch=$PAGES_BRANCH, path=/)"
PAGES_JSON="$(gh api -H "Accept: application/vnd.github+json" \
  "repos/$OWNER/$REPO/pages" 2>/dev/null || true)"

needs_enable=0
needs_update=0
if [ -z "$PAGES_JSON" ]; then
  needs_enable=1
else
  CURRENT_BRANCH="$(printf '%s' "$PAGES_JSON" | python3 -c \
    "import json,sys; d=json.load(sys.stdin); print(d.get('source',{}).get('branch',''))" 2>/dev/null || echo "")"
  if [ -z "$CURRENT_BRANCH" ]; then
    needs_enable=1
  elif [ "$CURRENT_BRANCH" != "$PAGES_BRANCH" ]; then
    needs_update=1
  fi
fi

# gh's -f flag flattens "source[branch]" wrong; use JSON input instead.
PAGES_BODY='{"source":{"branch":"'"$PAGES_BRANCH"'","path":"/"}}'

if [ "$needs_enable" -eq 1 ]; then
  echo "      Pages not enabled — enabling now"
  printf '%s' "$PAGES_BODY" | gh api --method POST \
    -H "Accept: application/vnd.github+json" \
    "repos/$OWNER/$REPO/pages" --input - >/dev/null 2>&1 || true
elif [ "$needs_update" -eq 1 ]; then
  echo "      Pages source mismatch (got '$CURRENT_BRANCH', want '$PAGES_BRANCH') — updating"
  printf '%s' "$PAGES_BODY" | gh api --method PUT \
    -H "Accept: application/vnd.github+json" \
    "repos/$OWNER/$REPO/pages" --input - >/dev/null 2>&1 || true
fi

SITE_URL="$(gh api "repos/$OWNER/$REPO/pages" --jq '.html_url' 2>/dev/null \
  || echo "https://$OWNER.github.io/$REPO/")"
echo ""
echo "deploy ok"
echo "site:   $SITE_URL"
echo "branch: $PAGES_BRANCH"
