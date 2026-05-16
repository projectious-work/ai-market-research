#!/usr/bin/env python3
"""One-shot: split briefing-package-v9/dashboard.html into template + data.

Reads the prototype dashboard, extracts the JSON from
<script id="market-data" type="application/json"> ... </script>, writes the
JSON to data/market-state.json (pretty-printed for diff-friendliness), and
writes the dashboard scaffold to src/dashboard.template.html with the JSON
replaced by the literal token __MARKET_DATA__.

Idempotent: re-running re-derives both files from the prototype baseline.
After v1 is live, this script is historical; daily updates edit market-state.json
and the build script composes dist/dashboard.html.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROTOTYPE = ROOT / "input" / "briefing-package-v9" / "dashboard.html"
TEMPLATE_OUT = ROOT / "src" / "dashboard.template.html"
DATA_OUT = ROOT / "data" / "market-state.json"
ARCHIVE_OUT = ROOT / "data" / "archive" / "2026-05-12.json"

SCRIPT_OPEN = '<script id="market-data" type="application/json">'
SCRIPT_CLOSE = "</script>"
PLACEHOLDER = "__MARKET_DATA__"


def main() -> int:
    if not PROTOTYPE.exists():
        sys.exit(f"Prototype not found: {PROTOTYPE}")

    html = PROTOTYPE.read_text(encoding="utf-8")

    start = html.find(SCRIPT_OPEN)
    if start < 0:
        sys.exit("Could not locate market-data <script> open tag")
    body_start = start + len(SCRIPT_OPEN)
    end = html.find(SCRIPT_CLOSE, body_start)
    if end < 0:
        sys.exit("Could not locate matching </script> close tag")

    raw_json = html[body_start:end].strip()
    try:
        parsed = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        sys.exit(f"Embedded JSON failed to parse: {exc}")

    DATA_OUT.parent.mkdir(parents=True, exist_ok=True)
    DATA_OUT.write_text(json.dumps(parsed, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    ARCHIVE_OUT.parent.mkdir(parents=True, exist_ok=True)
    ARCHIVE_OUT.write_text(json.dumps(parsed, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    template_html = html[:body_start] + "\n" + PLACEHOLDER + "\n" + html[end:]
    TEMPLATE_OUT.parent.mkdir(parents=True, exist_ok=True)
    TEMPLATE_OUT.write_text(template_html, encoding="utf-8")

    placeholders = template_html.count(PLACEHOLDER)
    if placeholders != 1:
        sys.exit(f"Template should contain exactly 1 placeholder, found {placeholders}")

    print(f"wrote {DATA_OUT.relative_to(ROOT)}  ({DATA_OUT.stat().st_size:,} bytes)")
    print(f"wrote {ARCHIVE_OUT.relative_to(ROOT)}  (historical baseline)")
    print(f"wrote {TEMPLATE_OUT.relative_to(ROOT)} ({TEMPLATE_OUT.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
