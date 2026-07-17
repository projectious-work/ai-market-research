#!/usr/bin/env python3
"""Build the four v2 design prototypes from one roster and template."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "src" / "prototypes" / "v2.template.html"
ROSTER = ROOT / "data" / "model-roster-v2.json"
OUTPUT = ROOT / "dist" / "prototypes"

DESIGNS = {
    "research-console": (
        "console", "1", "Research console",
        "A decision brief with a dense operational model table",
        "A quiet operating view for recurring market decisions.",
    ),
    "model-ledger": (
        "ledger", "2", "Model ledger",
        "A provider-grouped ledger for roster auditing",
        "Provider bands make coverage, gaps, and licensing easier to audit.",
    ),
    "decision-matrix": (
        "matrix", "3", "Decision matrix",
        "Task-first comparison at the configuration level",
        "Start with the job, latency tolerance, and exact reasoning level.",
    ),
    "evidence-notebook": (
        "notebook", "4", "Evidence notebook",
        "A readable report with compact evidence tables",
        "A publication-oriented structure for reading, printing, and review.",
    ),
}


def main() -> int:
    raw = json.loads(ROSTER.read_text(encoding="utf-8"))
    payload = json.dumps(raw, ensure_ascii=False, separators=(",", ":"))
    template = TEMPLATE.read_text(encoding="utf-8")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    links = []
    for slug, (mode, number, title, heading, lede) in DESIGNS.items():
        html = (template
                .replace("__MODEL_ROSTER__", payload)
                .replace("__PROTOTYPE_MODE__", mode)
                .replace("__PROTOTYPE_NUMBER__", number)
                .replace("__PROTOTYPE_TITLE__", title)
                .replace("__PROTOTYPE_HEADING__", heading)
                .replace("__PROTOTYPE_LEDE__", lede))
        target = OUTPUT / f"{slug}.html"
        target.write_text(html, encoding="utf-8")
        links.append((title, target.name, heading))

    cards = "".join(
        f'<a href="{file}"><strong>{title}</strong><span>{heading}</span></a>'
        for title, file, heading in links
    )
    index = f"""<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI market research v2 prototypes</title><style>
body{{margin:0;background:#f5f4f2;color:#18202a;font:16px 'Source Sans 3',Arial,sans-serif}}
main{{max-width:980px;margin:auto;padding:56px 24px}}h1{{color:#1d3352;font-size:30px}}
p{{color:#546a82;max-width:680px;line-height:1.5}}
nav{{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:30px}}
a{{padding:20px;background:#fff;border:1px solid #e0ded9;
border-left:3px solid #e05232;color:#1d3352;text-decoration:none}}
a span{{display:block;margin-top:7px;color:#546a82;font-size:14px}}
@media(max-width:650px){{nav{{grid-template-columns:1fr}}}}
</style><main><h1>AI market research · v2 design review</h1>
<p>Four information-architecture directions using the same researched model
roster and projectious.work brand system.</p><nav>{cards}</nav></main></html>"""
    (OUTPUT / "index.html").write_text(index, encoding="utf-8")
    print(f"built {len(DESIGNS)} prototypes in {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
