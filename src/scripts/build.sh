#!/usr/bin/env bash
# Thin wrapper around build.py — composes dist/dashboard.html from template + data.
# Kept as a shell entry point so the runner and humans can call the same thing.
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/build.py" "$@"
python3 "$SCRIPT_DIR/build-designs.py"
