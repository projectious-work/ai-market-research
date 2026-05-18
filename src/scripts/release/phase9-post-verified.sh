#!/usr/bin/env bash
# Phase 9 — Post-release verification (gate: release-post-verified)
#
# Curl the live URL, confirm 200, confirm a version stamp is present,
# and sweep the served HTML for personal-data markers.
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

URL="${RELEASE_SITE_URL:-https://projectious-work.github.io/ai-market-research/}"
VERSION="${VERSION:-}"

log_info "GET $URL"
http=$(curl -sI -o /dev/null -w '%{http_code}' "$URL" || echo "000")
[ "$http" = "200" ] || { log_fail "$URL returned HTTP $http"; exit 1; }
log_ok "HTTP 200"

body=$(curl -sf "$URL")
EV_DIR="$(ensure_evidence_dir)"
echo "$body" > "$EV_DIR/phase9-served.html"

# Look for the release-tag link the header injects, not arbitrary vN.N.N
# strings (the data has internal feature-version annotations like v1.3.0+
# in section descriptions, which are not what we're verifying here).
stamp=$(echo "$body" | grep -oE 'releases/tag/v[0-9]+\.[0-9]+\.[0-9]+' \
  | sed 's#releases/tag/##' | head -1 || true)
[ -n "$stamp" ] || { log_fail "no release-tag link in served HTML"; exit 1; }
log_ok "header release link: $stamp"
if [ -n "$VERSION" ] && [ "${stamp#v}" != "$VERSION" ]; then
  log_warn "served version $stamp ≠ expected v$VERSION (Pages may still be propagating)"
fi

MARKERS_FILE="src/scripts/release/privacy-markers.txt"
if [ -f "$MARKERS_FILE" ]; then
  patterns=$(grep -vE '^\s*$|^\s*#' "$MARKERS_FILE" | paste -sd '|' -)
  if [ -n "$patterns" ]; then
    if echo "$body" | grep -qiE "$patterns"; then
      log_fail "personal-data marker found in served HTML"
      exit 1
    fi
    log_ok "0 personal-data markers in served HTML"
  fi
else
  log_warn "no $MARKERS_FILE — served-HTML privacy sweep skipped"
fi
