#!/usr/bin/env python3
"""Build four complete report-design alternatives from canonical data."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "src" / "designs" / "report-designs.template.html"
DATA = ROOT / "data" / "market-state.json"
ROSTER = ROOT / "data" / "model-roster-v2.json"
OUTPUT = ROOT / "dist" / "designs"

DESIGNS = {
    "decision-journey": (
        "1",
        "Decision journey",
        "Decide, compare, operate",
        "A decision-first report",
        "The report starts with tasks and recommendations, then exposes the "
        "model, cost, tooling, deployment, and evidence behind them.",
    ),
    "market-map": (
        "2",
        "Market map",
        "Broad market navigation",
        "A market-first reference",
        "A horizontal product navigation opens with the market landscape, "
        "then moves through economics, tooling, deployment, and decisions.",
    ),
    "workbench": (
        "3",
        "Analyst workbench",
        "Comparison with context",
        "A comparison-first workspace",
        "Models and task fit lead the page while a persistent context panel "
        "keeps the reference, workload, and current actions visible.",
    ),
    "living-brief": (
        "4",
        "Living brief",
        "Readable research document",
        "A briefing-first research document",
        "A restrained document outline leads from the current position to "
        "recommendations, supporting comparisons, implementation, and sources.",
    ),
}


def main() -> int:
    market = json.loads(DATA.read_text(encoding="utf-8"))
    roster = json.loads(ROSTER.read_text(encoding="utf-8"))
    payload = json.dumps(market, ensure_ascii=False, separators=(",", ":"))
    roster_payload = json.dumps(
        roster, ensure_ascii=False, separators=(",", ":")
    )
    template = TEMPLATE.read_text(encoding="utf-8")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    links = []
    for slug, values in DESIGNS.items():
        number, title, short, heading, lede = values
        html = (template
                .replace("__MARKET_DATA__", payload)
                .replace("__MODEL_ROSTER__", roster_payload)
                .replace("__DESIGN_MODE__", slug)
                .replace("__DESIGN_NUMBER__", number)
                .replace("__DESIGN_TITLE__", title)
                .replace("__DESIGN_SHORT__", short)
                .replace("__DESIGN_HEADING__", heading)
                .replace("__DESIGN_LEDE__", lede))
        target = OUTPUT / f"{slug}.html"
        target.write_text(html, encoding="utf-8")
        links.append((number, title, target.name, heading, lede))

    cards = "".join(
        f'<a href="{filename}"><span>{number}</span><strong>{title}</strong>'
        f'<small>{heading}. {lede}</small></a>'
        for number, title, filename, heading, lede in links
    )
    index = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI market research design alternatives</title><style>
:root{{--paper:#f5f4f2;--surface:#fff;--ink:#18202a;--midnight:#1d3352;
--slate:#546a82;--line:#e0ded9;--orange:#e05232}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--paper);color:var(--ink);
font:16px 'Source Sans 3','Segoe UI',Arial,sans-serif}}
main{{max-width:1040px;margin:auto;padding:56px 24px}}.brand{{color:var(--midnight);
font-weight:700}}h1{{max-width:720px;margin:42px 0 10px;color:var(--midnight);
font-size:30px;letter-spacing:0}}p{{max-width:720px;color:var(--slate);line-height:1.55}}
nav{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;
margin-top:30px}}a{{display:grid;grid-template-columns:28px 1fr;gap:8px;padding:20px;
border:1px solid var(--line);border-left:3px solid var(--orange);
background:var(--surface);color:var(--midnight);text-decoration:none}}
a span{{grid-row:1/3;color:var(--orange);font-family:monospace}}a strong{{font-size:17px}}
a small{{color:var(--slate);line-height:1.45}}@media(max-width:680px){{nav{{grid-template-columns:1fr}}}}
</style></head><body><main><div class="brand">projectious.work</div>
<h1>AI market research · design alternatives</h1><p>Four complete report
structures using the same canonical data. Every original content section is
present; the alternatives differ in navigation, hierarchy, and reading order.</p>
<nav>{cards}</nav></main></body></html>"""
    (OUTPUT / "index.html").write_text(index, encoding="utf-8")
    print(f"built {len(DESIGNS)} complete designs in {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
