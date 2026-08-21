#!/usr/bin/env python3
"""Generate theme-native release notes from the Signal Room data changelog.

data/market-state.json's `changelog` array is the single source of truth
for "what changed and when" (model additions, benchmark refreshes, fixes).
Rather than maintaining a separate hand-written news feed, this generates
one change-log entry per item so the site gets a proper dated, tagged,
RSS-syndicated release-history section. Regenerated on every build --
never hand-edit the output.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "market-state.json"
OUT_DIR = ROOT / "docs" / "content" / "changelog"

TAG_LABELS = {
    "model": "Model roster",
    "benchmark": "Benchmarks",
    "fix": "Fix",
    "policy": "Policy",
    "local": "Self-hosting",
    "harness": "Agent harnesses",
}


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:60].rstrip("-") or "update"


def title_from(text: str) -> str:
    first_sentence = re.split(r"(?<=[.!?])\s", text.strip(), maxsplit=1)[0]
    title = first_sentence.strip().rstrip(".")
    if len(title) > 90:
        title = title[:87].rsplit(" ", 1)[0].rstrip(" ([{-:;,") + "..."
    return title


def yaml_str(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'


def main() -> int:
    if not DATA.exists():
        sys.exit(f"missing data: {DATA}")
    changelog = json.loads(DATA.read_text(encoding="utf-8"))["changelog"]

    if OUT_DIR.exists():
        for existing in OUT_DIR.glob("*/*.md"):
            existing.unlink()
        for year_dir in OUT_DIR.glob("*"):
            if year_dir.is_dir() and not any(year_dir.iterdir()):
                year_dir.rmdir()

    count = 0
    for entry in changelog:
        date = entry["date"]
        tag = entry.get("tag", "update")
        text = entry["text"]
        year = date.split("-")[0]
        title = title_from(text)
        slug = f"{date}-{slugify(title)}"
        post_dir = OUT_DIR / year
        post_dir.mkdir(parents=True, exist_ok=True)

        front_matter = (
            "---\n"
            f"title: {yaml_str(title)}\n"
            f"linkTitle: {yaml_str(title)}\n"
            f"date: {date}\n"
            f"tags: [{tag}]\n"
            "---\n\n"
        )
        badge = TAG_LABELS.get(tag, tag.title())
        body = f"**{badge}** · {text}\n"
        (post_dir / f"{slug}.md").write_text(front_matter + body, encoding="utf-8")
        count += 1

    print(f"generated {count} changelog posts under {OUT_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
