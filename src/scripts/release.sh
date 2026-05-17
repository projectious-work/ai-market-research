#!/usr/bin/env bash
# Orchestrate a release end-to-end from this container:
#   1. release-check   (validate JSON, rebuild, sanity-check artifact)
#   2. tag             (annotated semver tag on current main HEAD)
#   3. push            (commits + tag to origin)
#   4. deploy          (push dist/ to gh-pages, ensure Pages enabled)
#   5. gh release      (create GitHub Release with dashboard-vX.Y.Z.html asset)
#
# Usage:
#   src/scripts/release.sh <version>           # e.g. 0.2.0  (leading 'v' optional)
#   src/scripts/release.sh <version> --notes "free-form notes"
#   src/scripts/release.sh <version> --dry-run # print steps, don't mutate
#
# Pre-conditions:
#   - On main, clean working tree, up-to-date with origin/main.
#   - Tag does not already exist locally or on remote.
#
# See DEC-20260517_1455-DeftLynx for the deploy architecture.
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

VERSION=""
NOTES=""
DRY_RUN=0

while [ $# -gt 0 ]; do
  case "$1" in
    --notes) NOTES="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    -*) echo "unknown flag: $1" >&2; exit 2 ;;
    *)
      if [ -z "$VERSION" ]; then VERSION="$1"; shift
      else echo "unexpected positional arg: $1" >&2; exit 2; fi
      ;;
  esac
done

if [ -z "$VERSION" ]; then
  echo "usage: $(basename "$0") <version> [--notes \"...\"] [--dry-run]" >&2
  exit 2
fi

# Normalize version: accept "0.2.0" or "v0.2.0", emit both forms.
VERSION="${VERSION#v}"
if ! echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+([-.+][A-Za-z0-9.-]+)?$'; then
  echo "fatal: '$VERSION' is not a valid semver" >&2
  exit 1
fi
TAG="v$VERSION"

run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    echo "DRY-RUN: $*"
  else
    "$@"
  fi
}

# ─── Pre-conditions ─────────────────────────────────────────────────────
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "fatal: must release from 'main' (current: $CURRENT_BRANCH)" >&2
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "fatal: working tree not clean — commit or stash first" >&2
  git status --short >&2
  exit 1
fi

git fetch --quiet origin
LOCAL="$(git rev-parse HEAD)"
REMOTE_MAIN="$(git rev-parse origin/main)"
if [ "$LOCAL" != "$REMOTE_MAIN" ]; then
  echo "fatal: local main is not in sync with origin/main" >&2
  echo "  local:  $LOCAL" >&2
  echo "  remote: $REMOTE_MAIN" >&2
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "fatal: tag $TAG already exists locally" >&2
  exit 1
fi
if git ls-remote --tags origin "refs/tags/$TAG" | grep -q "$TAG"; then
  echo "fatal: tag $TAG already exists on origin" >&2
  exit 1
fi

echo "releasing $TAG from $(git rev-parse --short HEAD)"
[ "$DRY_RUN" -eq 1 ] && echo "(dry-run — no mutations will occur)"

# ─── 1. release-check ───────────────────────────────────────────────────
echo ""
echo "═══ 1/5 release-check ═══"
run bash "$REPO_ROOT/src/scripts/release-check.sh"

# ─── 2. tag ─────────────────────────────────────────────────────────────
echo ""
echo "═══ 2/5 tag $TAG ═══"
TAG_MESSAGE="Release $TAG"
[ -n "$NOTES" ] && TAG_MESSAGE="$TAG_MESSAGE"$'\n\n'"$NOTES"
# Annotated tags need a committer identity. Use git config when set;
# fall back to the project's noreply identity so the script works in
# fresh containers without touching global git config.
TAG_NAME="$(git config user.name 2>/dev/null || echo "projectious")"
TAG_EMAIL="$(git config user.email 2>/dev/null || echo "projectious@users.noreply.github.com")"
run git -c "user.name=$TAG_NAME" -c "user.email=$TAG_EMAIL" tag -a "$TAG" -m "$TAG_MESSAGE"

# ─── 3. push ────────────────────────────────────────────────────────────
echo ""
echo "═══ 3/5 push main + $TAG to origin ═══"
# Authenticate via gh's token so this works in containers without a
# global git credential helper.
GH_TOKEN_VAL="$(gh auth token 2>/dev/null || true)"
if [ -z "$GH_TOKEN_VAL" ]; then
  echo "fatal: gh auth token unavailable; run 'gh auth login' first" >&2
  exit 1
fi
REMOTE_URL="$(git remote get-url origin)"
REPO_SLUG="$(echo "$REMOTE_URL" | sed -E 's#(.*github\.com[:/])([^/]+/[^/.]+)(\.git)?$#\2#')"
AUTH_URL="https://x-access-token:${GH_TOKEN_VAL}@github.com/${REPO_SLUG}.git"
run git push "$AUTH_URL" main
run git push "$AUTH_URL" "$TAG"

# ─── 4. deploy ──────────────────────────────────────────────────────────
echo ""
echo "═══ 4/5 deploy to GitHub Pages ═══"
DEPLOY_MSG="deploy: $TAG ($(git rev-parse --short HEAD))"
run bash "$REPO_ROOT/src/scripts/deploy.sh" --skip-build --message "$DEPLOY_MSG"

# ─── 5. GitHub release ──────────────────────────────────────────────────
echo ""
echo "═══ 5/5 publish GitHub Release ═══"
ASSET="/tmp/dashboard-$TAG.html"
run cp "$REPO_ROOT/dist/dashboard.html" "$ASSET"

REL_NOTES="$NOTES"
if [ -z "$REL_NOTES" ]; then
  REL_NOTES="Release $TAG — dashboard built from $(git rev-parse --short HEAD)."
fi

run gh release create "$TAG" \
  --title "$TAG" \
  --notes "$REL_NOTES" \
  "$ASSET#dashboard-$TAG.html"

[ "$DRY_RUN" -eq 0 ] && rm -f "$ASSET"

echo ""
echo "release ok: $TAG"
gh release view "$TAG" --json url --jq '.url' 2>/dev/null || true
