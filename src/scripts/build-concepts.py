#!/usr/bin/env python3
"""Build independent website concepts from shared report content."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "src" / "concepts"
OUTPUT = ROOT / "dist" / "concepts"
MARKET = ROOT / "data" / "market-state.json"
ROSTER = ROOT / "data" / "model-roster-v2.json"

CONCEPTS = {
    "signal-room": (
        "Signal room",
        "A live market operations surface",
        "A compact masthead and continuous workspace put current signals and "
        "actions first, followed by the complete analytical record.",
    ),
    "comparison-studio": (
        "Comparison studio",
        "A research workbench",
        "Persistent controls and comparison-first ordering support repeated "
        "model, configuration, cost, and tooling analysis.",
    ),
    "field-guide": (
        "Field guide",
        "A living technical reference",
        "A chaptered, readable publication treats the content as a maintained "
        "reference rather than a conventional dashboard.",
    ),
    "decision-paths": (
        "Decision paths",
        "A task-led decision system",
        "Five explicit paths reorganize the evidence around choosing a model, "
        "controlling cost, selecting agents, deploying, and monitoring.",
    ),
}


def main() -> int:
    market = json.loads(MARKET.read_text(encoding="utf-8"))
    roster = json.loads(ROSTER.read_text(encoding="utf-8"))
    market_payload = json.dumps(
        market, ensure_ascii=False, separators=(",", ":")
    )
    roster_payload = json.dumps(
        roster, ensure_ascii=False, separators=(",", ":")
    )
    component_css = (SOURCE / "content.css").read_text(encoding="utf-8")
    report_js = (SOURCE / "report-content.js").read_text(encoding="utf-8")
    OUTPUT.mkdir(parents=True, exist_ok=True)

    links = []
    for slug, (title, subtitle, description) in CONCEPTS.items():
        template = (SOURCE / f"{slug}.template.html").read_text(
            encoding="utf-8"
        )
        output = (template
                  .replace("__CONTENT_CSS__", component_css)
                  .replace("__REPORT_JS__", report_js)
                  .replace("__MARKET_DATA__", market_payload)
                  .replace("__MODEL_ROSTER__", roster_payload))
        target = OUTPUT / f"{slug}.html"
        target.write_text(output, encoding="utf-8")
        links.append((title, subtitle, description, target.name))

    items = "".join(
        f'<a href="{filename}"><strong>{title}</strong><span>{subtitle}</span>'
        f'<p>{description}</p></a>'
        for title, subtitle, description, filename in links
    )
    index = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI market research · from-scratch concepts</title><style>
:root{{--paper:#f5f4f2;--surface:#fff;--ink:#18202a;--midnight:#1d3352;
--slate:#546a82;--line:#e0ded9;--orange:#e05232}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);
font:16px 'Source Sans 3','Segoe UI',Arial,sans-serif}}
main{{max-width:1060px;margin:auto;padding:64px 24px}}.brand{{color:var(--midnight);
font-weight:700}}h1{{max-width:760px;margin:48px 0 12px;color:var(--midnight);
font:700 32px 'Plus Jakarta Sans','Segoe UI',Arial,sans-serif}}
.lead{{max-width:720px;color:var(--slate);line-height:1.55}}
nav{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;
margin-top:34px}}a{{padding:22px;border:1px solid var(--line);border-top:3px solid
var(--orange);background:var(--surface);color:var(--midnight);text-decoration:none}}
a strong,a span{{display:block}}a strong{{font-size:18px}}a span{{margin-top:5px;
color:var(--orange);font-size:12px;font-weight:700}}a p{{margin:10px 0 0;
color:var(--slate);font-size:14px;line-height:1.45}}
@media(max-width:680px){{nav{{grid-template-columns:1fr}}main{{padding:40px 18px}}}}
</style></head><body><main><div class="brand">projectious.work</div>
<h1>AI market research · from-scratch website concepts</h1>
<p class="lead">Four independent information architectures built from the
report topics alone. They share content data and brand tokens, not page
structure, navigation, or composition.</p><nav>{items}</nav></main></body></html>"""
    (OUTPUT / "index.html").write_text(index, encoding="utf-8")
    print(f"built {len(CONCEPTS)} concepts in {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
