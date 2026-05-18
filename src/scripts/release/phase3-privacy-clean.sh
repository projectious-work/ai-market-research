#!/usr/bin/env bash
# Phase 3 — Security & data privacy sweep (gate: release-privacy-clean)
#
# Two-stage sweep:
#   3a. DETERMINISTIC — grep delivered surface against
#       src/scripts/release/privacy-markers.txt (extended regex).
#   3b. PROBABILISTIC — prepare a review-input package and require an
#       AI agent (or human reviewer) to write a PASS/FAIL verdict.
#       Provider-independent: the script does not call any specific
#       LLM. An agent walking the release flow reads the prepared
#       package, performs the review using whatever intelligence it
#       has, and writes the verdict file.
#
# Gate passes only when both 3a and 3b pass.
#
# Env knobs:
#   RELEASE_SKIP_AI=1            run only 3a (escape hatch for tooling-
#                                only patches with no content change)
set -eo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

MARKERS_FILE="src/scripts/release/privacy-markers.txt"
SEARCH_PATHS=(src data dist .claude/agents README.md AGENTS.md CLAUDE.md LICENSE)
EV_DIR="$(ensure_evidence_dir)"
VERDICT_FILE="$EV_DIR/phase3-ai-verdict.txt"
REVIEW_PKG="$EV_DIR/phase3-ai-review-input.md"

# ── 3a. deterministic grep ──────────────────────────────────────────
echo "── 3a · deterministic grep ──"
if [ ! -f "$MARKERS_FILE" ]; then
  log_warn "no $MARKERS_FILE — copy privacy-markers.txt.template and add markers"
  log_warn "deterministic sweep skipped; gate not asserting cleanliness this run"
else
  patterns=$(grep -vE '^\s*$|^\s*#' "$MARKERS_FILE" | paste -sd '|' -)
  if [ -z "$patterns" ]; then
    log_warn "markers file is empty — no patterns to check"
  else
    existing=()
    for p in "${SEARCH_PATHS[@]}"; do [ -e "$p" ] && existing+=("$p"); done
    set +e
    # Exclude the release tooling dir and the per-phase evidence dir
    # from the search — both contain self-matching content (the
    # markers file itself, AI-review packages, prior hit reports). The
    # release/ dir is build/process tooling, not delivered content;
    # release-evidence/ is gitignored output from previous runs.
    hits=$(grep -riIE --color=never \
      --exclude-dir=release \
      --exclude-dir=release-evidence \
      "$patterns" "${existing[@]}" 2>/dev/null)
    set -e
    if [ -n "$hits" ]; then
      EV="$EV_DIR/phase3-privacy-hits.txt"
      echo "$hits" > "$EV"
      count=$(echo "$hits" | wc -l)
      log_fail "$count personal-data hit(s) across delivered surface — see $EV"
      echo "$hits" | head -10 | sed 's/^/         /'
      [ "$count" -gt 10 ] && echo "         (+$((count - 10)) more in evidence file)"
      exit 1
    fi
    n_patterns=$(echo "$patterns" | tr '|' '\n' | wc -l)
    log_ok "0 grep hits across ${#existing[@]} paths for $n_patterns marker(s)"
  fi
fi

# ── 3b. probabilistic AI review ─────────────────────────────────────
echo ""
echo "── 3b · probabilistic AI review ──"

if [ "${RELEASE_SKIP_AI:-0}" = "1" ]; then
  log_warn "RELEASE_SKIP_AI=1 → skipping probabilistic review"
  log_warn "use only for tooling-only patches with verifiably no content change"
  exit 0
fi

LAST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || echo "")"
CUR_SHA="$(git rev-parse --short HEAD)"

# Generate to a temp file first; only replace the canonical package
# when content actually differs. This keeps the verdict valid across
# re-runs that don't change the inputs.
TMP_PKG="$(mktemp)"
trap 'rm -f "$TMP_PKG"' EXIT
{
  echo "# Phase 3b — Privacy AI Review Input"
  echo ""
  echo "**Task.** Review the diffs below for any kind of personal data that"
  echo "could identify an individual or organization — names, emails, phone"
  echo "numbers, postal addresses, geographic locations, employer or client"
  echo "mentions, subscription identifiers, account names, IP addresses,"
  echo "hostnames, device IDs, anything that a regex check could plausibly"
  echo "miss. The deterministic grep (phase 3a) already passed; your job"
  echo "is the probabilistic catch — find what regex wouldn't."
  echo ""
  echo "Apply the maintainer's intent for this project:"
  echo "- 'projectious' (handle) and 'info@projectious.work' (email) are"
  echo "  the **official public identity**; they are NOT leaks."
  echo "- The container user 'aibox' / paths like '/home/aibox/' are"
  echo "  generic runtime, not personal."
  echo "- Hardware setups described in generic terms (\"2× A6000 96 GB\","
  echo "  \"M4 Pro 64 GB\") are reference configs, not personal — flag"
  echo "  only if framed as the owner's specific setup."
  echo ""
  echo "**Output.** Write your verdict to:"
  echo ""
  echo "    $VERDICT_FILE"
  echo ""
  echo "The first line MUST be exactly one of:"
  echo "- \`PASS\` — followed by a one-line rationale on the next line"
  echo "- \`FAIL\` — followed by a numbered list of findings"
  echo ""
  echo "## Repo metadata"
  echo ""
  echo "- Previous tag: ${LAST_TAG:-(none)}"
  echo "- Current commit: $CUR_SHA"
  # NOTE: timestamp deliberately omitted so the package's content is
  # deterministic for a given (tag, HEAD) pair — otherwise re-runs
  # would always look "changed" to the differ below.
  echo ""
  echo "## Delivered-surface diff since ${LAST_TAG:-(no prior tag)}"
  echo ""
  echo '```diff'
  if [ -n "$LAST_TAG" ]; then
    git diff "$LAST_TAG"..HEAD -- "${SEARCH_PATHS[@]}" 2>/dev/null || true
  else
    git log -p -1 -- "${SEARCH_PATHS[@]}" 2>/dev/null || true
  fi
  echo '```'
  echo ""
  echo "## Current delivered-surface content (high-signal files)"
  echo ""
  for f in README.md AGENTS.md src/dashboard-context.md src/briefing-prompt.md; do
    [ -f "$f" ] || continue
    echo "### $f"
    echo ""
    echo '```'
    cat "$f"
    echo '```'
    echo ""
  done
} > "$TMP_PKG"

if [ ! -f "$REVIEW_PKG" ] || ! cmp -s "$TMP_PKG" "$REVIEW_PKG"; then
  mv "$TMP_PKG" "$REVIEW_PKG"
  log_info "review package (re)generated → $REVIEW_PKG ($(wc -l < "$REVIEW_PKG") lines, $(wc -c < "$REVIEW_PKG") bytes)"
else
  log_info "review package unchanged → $REVIEW_PKG ($(wc -l < "$REVIEW_PKG") lines, $(wc -c < "$REVIEW_PKG") bytes)"
fi
trap - EXIT

if [ ! -f "$VERDICT_FILE" ]; then
  log_fail "no AI verdict file at $VERDICT_FILE"
  log_info ""
  log_info "Next step (agent or human reviewer):"
  log_info "  1. Read $REVIEW_PKG"
  log_info "  2. Decide: any new privacy concern in the changes?"
  log_info "  3. Write your verdict to $VERDICT_FILE"
  log_info "     (first line: PASS or FAIL; details below)"
  log_info "  4. Re-run: bash src/scripts/release.sh --phase 3"
  exit 1
fi

# Verify verdict freshness — must be newer than the review package, or
# the agent is reading stale input.
if [ "$VERDICT_FILE" -ot "$REVIEW_PKG" ]; then
  log_fail "verdict file is older than the review package — stale review"
  log_fail "delete $VERDICT_FILE and re-run after the agent re-reviews"
  exit 1
fi

first_line="$(head -1 "$VERDICT_FILE" | tr -d '[:space:]' | tr '[:lower:]' '[:upper:]')"
case "$first_line" in
  PASS)
    log_ok "AI verdict: PASS ($(sed -n '2p' "$VERDICT_FILE" | head -c 100))"
    ;;
  FAIL)
    log_fail "AI verdict: FAIL"
    echo "$(tail -n +2 "$VERDICT_FILE")" | sed 's/^/         /' | head -20
    exit 1
    ;;
  *)
    log_fail "verdict file's first line is '$first_line' — must be PASS or FAIL"
    exit 1
    ;;
esac
