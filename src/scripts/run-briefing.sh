#!/usr/bin/env bash
# Daily-briefing runner. Owned by Kai (software-engineer); invoked by:
#   - a host-side cron / systemd timer that calls `docker exec` into this container, OR
#   - a human running `src/scripts/run-briefing.sh` for an ad-hoc refresh, OR
#   - eventually, a processkit-managed dispatcher.
#
# Flow (in repo root):
#   1. Compute today's date (UTC) and "yesterday" archive label.
#   2. Snapshot the current data/market-state.json to data/archive/<today>.json
#      BEFORE Sage runs (so any failure leaves the prior state recoverable).
#   3. Invoke `claude -p "$(cat src/briefing-prompt.md)"` so Sage refreshes the JSON.
#      Defaults to Sonnet 4.6 unless CLAUDE_MODEL overrides.
#   4. Validate that data/market-state.json parses.
#   5. Run the build script to rebuild dist/dashboard.html.
#   6. git add + commit with a summary line. Push is opt-in (RUN_BRIEFING_PUSH=1).
#
# Safety: any failure exits non-zero before mutating git, and the archived
# snapshot ensures yesterday's state is recoverable via git or directly.
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

CLAUDE_BIN="${CLAUDE_BIN:-claude}"
CLAUDE_MODEL="${CLAUDE_MODEL:-claude-sonnet-4-6}"
TODAY_UTC="$(date -u +%Y-%m-%d)"
ARCHIVE_PATH="data/archive/${TODAY_UTC}.json"
LOG_PATH=".briefing/last-run.log"
SUMMARY_PATH=".briefing/last-run-summary"

mkdir -p "$(dirname "$ARCHIVE_PATH")" "$(dirname "$LOG_PATH")"

if [ ! -f data/market-state.json ]; then
  echo "fatal: data/market-state.json missing — refusing to run" >&2
  exit 2
fi

# Step 2: archive the snapshot we're about to mutate.
cp -p data/market-state.json "$ARCHIVE_PATH"
echo "archived → $ARCHIVE_PATH"

# Step 3: hand off to Sage. The prompt file describes the work in full.
if ! command -v "$CLAUDE_BIN" >/dev/null 2>&1; then
  echo "fatal: \`$CLAUDE_BIN\` not on PATH; cannot invoke research-scientist" >&2
  exit 3
fi

echo "invoking $CLAUDE_BIN (model=$CLAUDE_MODEL) — output streamed to $LOG_PATH"
set +e
"$CLAUDE_BIN" -p \
  --model "$CLAUDE_MODEL" \
  --append-system-prompt "You are Sage, the research-scientist TeamMember (TEAMMEMBER-sage). Read src/briefing-prompt.md and execute it end-to-end. End your run with the 5-line summary specified there." \
  "$(cat src/briefing-prompt.md)" \
  2>&1 | tee "$LOG_PATH"
RC=${PIPESTATUS[0]}
set -e

if [ "$RC" -ne 0 ]; then
  echo "fatal: claude exited $RC — JSON likely partially updated; archive at $ARCHIVE_PATH" >&2
  exit "$RC"
fi

# Step 4: validate the JSON Sage produced.
python3 -m json.tool data/market-state.json > /dev/null

# Step 5: rebuild dist/.
bash src/scripts/build.sh

# Step 6: commit. Subject line carries the date plus a short summary from the log tail.
SUMMARY="$(tail -n 5 "$LOG_PATH" | head -n 1 | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
if [ -z "$SUMMARY" ]; then
  SUMMARY="daily briefing run"
fi
mkdir -p "$(dirname "$SUMMARY_PATH")"
echo "$SUMMARY" > "$SUMMARY_PATH"

git add data/ dist/ "$LOG_PATH" "$SUMMARY_PATH" 2>/dev/null || true
if git diff --cached --quiet; then
  echo "no changes to commit"
else
  git commit -m "Daily briefing ${TODAY_UTC}: ${SUMMARY}"
  if [ "${RUN_BRIEFING_PUSH:-0}" = "1" ]; then
    git push
  fi
fi

echo "ok — ${TODAY_UTC}"
