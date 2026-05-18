#!/usr/bin/env bash
# Phase 0 — Scope + version decision (gate: release-scope-decided)
#
# Records what's in this release and which bump (patch/minor/major).
# In an interactive run, prompts the user; in a non-interactive run,
# reads $VERSION and $SCOPE_NOTE from the environment.
#
# Evidence: dist/release-evidence/phase0-scope-<VERSION>.md
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

VERSION="${VERSION:-}"
SCOPE_NOTE="${SCOPE_NOTE:-}"

if [ -z "$VERSION" ]; then
  if is_interactive; then
    read -r -p "  Version (e.g. 0.2.3): " VERSION
  else
    log_fail "VERSION not set (env var) and run is non-interactive"
    exit 2
  fi
fi
# Normalise: accept v0.2.3 or 0.2.3.
VERSION="${VERSION#v}"
if ! echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+([-.+][A-Za-z0-9.-]+)?$'; then
  log_fail "'$VERSION' is not a valid semver"
  exit 1
fi

if [ -z "$SCOPE_NOTE" ]; then
  if is_interactive; then
    echo "  Scope note (one short paragraph; what's in this release?):"
    echo "  (end with a blank line)"
    SCOPE_NOTE=""
    while IFS= read -r line; do
      [ -z "$line" ] && break
      SCOPE_NOTE="${SCOPE_NOTE}${line}\n"
    done
  else
    log_warn "SCOPE_NOTE not set; recording empty scope note"
  fi
fi

# Classify bump.
LAST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")"
LAST_VER="${LAST_TAG#v}"
last_major="${LAST_VER%%.*}"; rem="${LAST_VER#*.}"; last_minor="${rem%%.*}"; last_patch="${rem#*.}"
new_major="${VERSION%%.*}"; rem="${VERSION#*.}"; new_minor="${rem%%.*}"; new_patch="${rem#*.}"
if   [ "$new_major" != "$last_major" ]; then BUMP="major"
elif [ "$new_minor" != "$last_minor" ]; then BUMP="minor"
elif [ "$new_patch" != "$last_patch" ]; then BUMP="patch"
else BUMP="reuse"; fi

EV_DIR="$(ensure_evidence_dir)"
EV="$EV_DIR/phase0-scope-v${VERSION}.md"
{
  echo "# Release scope — v$VERSION ($BUMP from $LAST_TAG)"
  echo ""
  echo "**Decided at:** $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "**Previous tag:** $LAST_TAG"
  echo "**Bump:** $BUMP"
  echo ""
  echo "## Scope"
  echo ""
  printf '%b' "$SCOPE_NOTE"
} > "$EV"

if [ "$BUMP" = "reuse" ]; then
  log_fail "version $VERSION is the same as $LAST_TAG"
  exit 1
fi

log_ok "scope recorded: v$VERSION ($BUMP from $LAST_TAG) → $EV"
echo "$VERSION" > "$EV_DIR/CURRENT_VERSION"
