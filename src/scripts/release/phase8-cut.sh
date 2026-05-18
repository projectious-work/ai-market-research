#!/usr/bin/env bash
# Phase 8 — Cut release (gate: release-cut)
#
# Runs release-check.sh again as a safety net, creates the annotated
# tag, pushes main + tag, runs deploy.sh, and creates the GitHub Release
# with the dashboard asset attached.
#
# Expects: VERSION (semver, with or without leading 'v'); NOTES optional.
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

VERSION="${VERSION:-}"
NOTES="${NOTES:-}"
[ -n "$VERSION" ] || { log_fail "VERSION not set"; exit 2; }
VERSION="${VERSION#v}"
TAG="v$VERSION"

if ! echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+([-.+][A-Za-z0-9.-]+)?$'; then
  log_fail "'$VERSION' is not a valid semver"; exit 1
fi

# Pre-conditions
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$CURRENT_BRANCH" = "main" ] || { log_fail "must release from main (current: $CURRENT_BRANCH)"; exit 1; }
[ -z "$(git status --porcelain)" ] || { log_fail "working tree not clean"; git status --short >&2; exit 1; }

git fetch --quiet origin
LOCAL="$(git rev-parse HEAD)"
REMOTE_MAIN="$(git rev-parse origin/main)"
[ "$LOCAL" = "$REMOTE_MAIN" ] || { log_fail "local main not in sync with origin/main"; exit 1; }

git rev-parse "$TAG" >/dev/null 2>&1 && { log_fail "tag $TAG already exists locally"; exit 1; } || true
git ls-remote --tags origin "refs/tags/$TAG" | grep -q "$TAG" && { log_fail "tag $TAG already exists on origin"; exit 1; } || true

log_info "releasing $TAG from $(git rev-parse --short HEAD)"

# 1. release-check (safety net — earlier phase already passed it, but
#    rebuilding here means the artifact in dist/ matches what we tag)
bash "$REPO_ROOT/src/scripts/release-check.sh"

# 2. tag
TAG_MESSAGE="Release $TAG"
[ -n "$NOTES" ] && TAG_MESSAGE="$TAG_MESSAGE"$'\n\n'"$NOTES"
TAG_NAME="$(git config user.name 2>/dev/null || echo "projectious")"
TAG_EMAIL="$(git config user.email 2>/dev/null || echo "projectious@users.noreply.github.com")"
git -c "user.name=$TAG_NAME" -c "user.email=$TAG_EMAIL" tag -a "$TAG" -m "$TAG_MESSAGE"

# 3. push main + tag
GH_TOKEN_VAL="$(gh auth token 2>/dev/null || true)"
[ -n "$GH_TOKEN_VAL" ] || { log_fail "gh auth token unavailable"; exit 1; }
REMOTE_URL="$(git remote get-url origin)"
REPO_SLUG="$(echo "$REMOTE_URL" | sed -E 's#(.*github\.com[:/])([^/]+/[^/.]+)(\.git)?$#\2#')"
AUTH_URL="https://x-access-token:${GH_TOKEN_VAL}@github.com/${REPO_SLUG}.git"
git push "$AUTH_URL" main
git push "$AUTH_URL" "$TAG"

# 4. deploy
DEPLOY_MSG="deploy: $TAG ($(git rev-parse --short HEAD))"
bash "$REPO_ROOT/src/scripts/deploy.sh" --message "$DEPLOY_MSG"

# 5. GitHub Release
ASSET="/tmp/dashboard-$TAG.html"
cp "$REPO_ROOT/dist/dashboard.html" "$ASSET"
REL_NOTES="${NOTES:-Release $TAG — dashboard built from $(git rev-parse --short HEAD).}"
gh release create "$TAG" --title "$TAG" --notes "$REL_NOTES" "$ASSET#dashboard-$TAG.html"
rm -f "$ASSET"

log_ok "release $TAG cut: $(gh release view "$TAG" --json url --jq '.url' 2>/dev/null || echo "$TAG")"
