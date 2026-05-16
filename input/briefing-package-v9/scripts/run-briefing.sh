#!/usr/bin/env bash
# Daily briefing runner — invoked by GitHub Actions
set -euo pipefail

TODAY=$(date -u +%Y-%m-%d)
YESTERDAY=$(date -u -d "yesterday" +%Y-%m-%d 2>/dev/null || date -u -v-1d +%Y-%m-%d)

echo "▸ Briefing run for $TODAY"
echo "▸ Archiving previous dashboard as archive/$YESTERDAY.html"
mkdir -p archive
if [[ -f dashboard.html ]]; then
  cp dashboard.html "archive/$YESTERDAY.html"
fi

echo "▸ Invoking Claude Code"
# --dangerously-skip-permissions = no interactive approval prompts (we're in a CI env)
# Output captured to .last-run-summary for the commit message
claude -p \
  --dangerously-skip-permissions \
  "$(cat briefing-prompt.md)" \
  > .last-run-summary 2>&1 || {
    echo "❌ Claude run failed — see .last-run-summary"
    cat .last-run-summary
    exit 1
  }

echo "▸ Run summary:"
tail -n 10 .last-run-summary

echo "▸ Done."
