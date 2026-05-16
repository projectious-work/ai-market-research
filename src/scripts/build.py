#!/usr/bin/env python3
"""Compose dist/dashboard.html = src/dashboard.template.html + data/market-state.json.

Reads the template, validates the JSON, substitutes the single
`__MARKET_DATA__` placeholder, and writes the artifact. Fails loudly on:
  - missing or malformed JSON
  - placeholder count != 1
  - empty result

Idempotent. Re-running produces the same bytes when inputs are unchanged.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "src" / "dashboard.template.html"
DATA = ROOT / "data" / "market-state.json"
OUTPUT = ROOT / "dist" / "dashboard.html"
PLACEHOLDER = "__MARKET_DATA__"


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
    count = template.count(PLACEHOLDER)
    if count != 1:
        sys.exit(f"template must contain exactly 1 {PLACEHOLDER}, found {count}")

    minified = json.dumps(parsed, ensure_ascii=False, separators=(",", ":"))
    output = template.replace(PLACEHOLDER, minified)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(output, encoding="utf-8")

    print(f"built {OUTPUT.relative_to(ROOT)} ({OUTPUT.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
