#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
EXPECTED_EMAIL="info@projectious.work"
ACTUAL_EMAIL="$(git -C "$REPO_ROOT" config --local --get user.email || true)"

if [ "$ACTUAL_EMAIL" != "$EXPECTED_EMAIL" ]; then
  echo "fatal: repository-local Git email must be $EXPECTED_EMAIL" >&2
  echo "configure it with:" >&2
  echo "  git config --local user.email $EXPECTED_EMAIL" >&2
  exit 1
fi

echo "canonical Git email ok"
