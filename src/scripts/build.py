#!/usr/bin/env python3
"""Compose dist/dashboard.html = src/dashboard.template.html + data/market-state.json.

Reads the template, validates the JSON, substitutes two placeholders, and
writes the artifact. Fails loudly on:
  - missing or malformed JSON
  - placeholder count != 1
  - empty result

Placeholders:
  __MARKET_DATA__   — the minified market-state.json blob
  __APP_VERSION__   — `git describe --tags --abbrev=0` (latest tag), or
                      "dev" when no tag exists. Read once at build time.

Idempotent. Re-running produces the same bytes when inputs and the git tag
are unchanged.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "src" / "dashboard.template.html"
DATA = ROOT / "data" / "market-state.json"
OUTPUT = ROOT / "dist" / "dashboard.html"
DATA_PLACEHOLDER = "__MARKET_DATA__"
VERSION_PLACEHOLDER = "__APP_VERSION__"


def latest_tag() -> str:
    try:
        out = subprocess.check_output(
            ["git", "describe", "--tags", "--abbrev=0"],
            cwd=ROOT,
            stderr=subprocess.DEVNULL,
        ).decode().strip()
        return out or "dev"
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "dev"


def main() -> int:
    if not TEMPLATE.exists():
        sys.exit(f"missing template: {TEMPLATE}")
    if not DATA.exists():
        sys.exit(f"missing data: {DATA}")

    raw = DATA.read_text(encoding="utf-8")
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        sys.exit(f"market-state.json invalid: {exc}")

    template = TEMPLATE.read_text(encoding="utf-8")
    if template.count(DATA_PLACEHOLDER) != 1:
        sys.exit(f"template must contain exactly 1 {DATA_PLACEHOLDER}, "
                 f"found {template.count(DATA_PLACEHOLDER)}")
    if template.count(VERSION_PLACEHOLDER) < 1:
        sys.exit(f"template must contain at least 1 {VERSION_PLACEHOLDER}")

    minified = json.dumps(parsed, ensure_ascii=False, separators=(",", ":"))
    version = latest_tag()

    output = template.replace(DATA_PLACEHOLDER, minified) \
                     .replace(VERSION_PLACEHOLDER, version)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(output, encoding="utf-8")

    print(f"built {OUTPUT.relative_to(ROOT)} "
          f"({OUTPUT.stat().st_size:,} bytes, version={version})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
