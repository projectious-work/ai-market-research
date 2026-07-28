#!/usr/bin/env python3
"""Compose the self-contained dashboard from template and canonical JSON.

Reads the template, validates the JSON, substitutes two placeholders, and
writes the artifact. Fails loudly on:
  - missing or malformed JSON
  - placeholder count != 1
  - empty result

Placeholders:
  __MARKET_DATA__   — the minified market-state.json blob
  __APP_VERSION__   — latest release tag, or "dev" when no tag exists.
  __BUILD_ID__      — short commit SHA for the exact deployed source.

Idempotent. Re-running produces the same bytes when inputs and the git tag
are unchanged.

Besides dist/dashboard.html (the monolithic, self-contained artifact used
for direct/offline viewing and as the GitHub release asset), this also
splits the same template into the pieces the Hugo/Docsy site embeds
natively per Signal Room page instead of iframing the whole file:
  docs/static/report/report.css              — the <style> block, shared
  docs/static/report/report.js                — the <script> block, shared
  docs/static/report/sections/<slug>.html      — one per tab panel, each with
                                                  its own embedded market-data
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "src" / "dashboard.template.html"
DATA = ROOT / "data" / "market-state.json"
REPORT_METRICS = ROOT / "data" / "report-metrics.json"
MODEL_ROSTER = ROOT / "data" / "model-roster-v2.json"
OUTPUT = ROOT / "dist" / "dashboard.html"
DATA_PLACEHOLDER = "__MARKET_DATA__"
VERSION_PLACEHOLDER = "__APP_VERSION__"
BUILD_PLACEHOLDER = "__BUILD_ID__"

REPORT_STATIC_DIR = ROOT / "docs" / "static" / "report"
SECTIONS_DIR = REPORT_STATIC_DIR / "sections"

# tab-panel id (in the template) -> Signal Room section slug (in the Hugo site)
SECTION_SLUGS = [
    ("dashboard", "00-now"),
    ("models", "01-market-economics"),
    ("harnesses", "02-tools"),
    ("self-hosting", "03-infrastructure"),
    ("strategy", "04-decisions"),
    ("sources", "05-evidence"),
]


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


def build_id() -> str:
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--short=8", "HEAD"],
            cwd=ROOT,
            stderr=subprocess.DEVNULL,
        ).decode().strip()
        return out or "unknown"
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "unknown"


def extract_between(template: str, start_marker: str, end_marker: str) -> str:
    start = template.index(start_marker) + len(start_marker)
    end = template.index(end_marker, start)
    return template[start:end].strip() + "\n"


REPORT_SCOPE_CLASS = "sr-report-scope"


def scope_css(css: str, scope_selector: str) -> str:
    """Rewrite report.css so every rule only applies inside `scope_selector`.

    The monolithic dist/dashboard.html owns the whole document (html, body,
    bare `a`/`table`/`th` selectors, a `:root` theme, etc.) by design. When
    the same stylesheet is loaded on a Hugo page instead, those bare/root
    rules leak onto the entire site -- Docsy's own navbar font size, page
    overflow behavior, and colors all get silently overridden. This makes
    every top-level rule descend from `scope_selector` instead, and folds
    `html`/`body`/`:root` rules onto the scope element itself so its own
    background/font/reset still applies to the embedded fragment's subtree.

    Only handles the shapes this stylesheet actually uses: plain rules,
    `@media`/`@supports` (recursed into), and other at-rules (`@font-face`,
    `@keyframes`, `@import`) left untouched since their internals aren't
    selector lists. Not a general CSS parser.
    """
    out = []
    i = 0
    n = len(css)
    while i < n:
        brace_pos = css.find("{", i)
        if brace_pos == -1:
            out.append(css[i:])
            break
        header = css[i:brace_pos]
        depth = 1
        j = brace_pos + 1
        while depth > 0 and j < n:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1
        body = css[brace_pos + 1:j - 1]
        header_stripped = header.strip()

        if header_stripped.startswith(("@media", "@supports")):
            out.append(f"{header}{{{scope_css(body, scope_selector)}}}")
        elif header_stripped.startswith("@"):
            out.append(f"{header}{{{body}}}")
        else:
            new_selectors = []
            for sel in header.split(","):
                sel = sel.strip()
                if not sel:
                    continue
                if sel in ("html", "body", ":root"):
                    new_selectors.append(scope_selector)
                else:
                    new_selectors.append(f"{scope_selector} {sel}")
            out.append(f"{', '.join(new_selectors)} {{{body}}}")
        i = j
    return "".join(out)


def extract_section_html(template: str, tab_id: str) -> str:
    pattern = re.compile(
        r'<section class="tab-panel(?: active)?" id="tab-' + re.escape(tab_id) + r'">.*?</section>',
        re.DOTALL,
    )
    match = pattern.search(template)
    if not match:
        sys.exit(f"template section tab-{tab_id} not found")
    return match.group(0)


def write_report_fragments(template: str, minified_data: str) -> None:
    css = extract_between(template, "<style>\n", "\n</style>")
    js = extract_between(template, "<!-- ===== JAVASCRIPT ===== -->\n<script>\n", "\n</script>\n\n</body>")
    scoped_css = scope_css(css, f".{REPORT_SCOPE_CLASS}")

    REPORT_STATIC_DIR.mkdir(parents=True, exist_ok=True)
    (REPORT_STATIC_DIR / "report.css").write_text(scoped_css, encoding="utf-8")
    (REPORT_STATIC_DIR / "report.js").write_text(js, encoding="utf-8")

    SECTIONS_DIR.mkdir(parents=True, exist_ok=True)
    for tab_id, slug in SECTION_SLUGS:
        section_html = extract_section_html(template, tab_id)
        fragment = (
            f'<div class="{REPORT_SCOPE_CLASS}">\n'
            f'<script id="market-data" type="application/json">{minified_data}</script>\n'
            f"{section_html}\n"
            f"</div>\n"
        )
        (SECTIONS_DIR / f"{slug}.html").write_text(fragment, encoding="utf-8")

    print(f"built {len(SECTION_SLUGS)} report section fragments "
          f"under {SECTIONS_DIR.relative_to(ROOT)}")


def main() -> int:
    if not TEMPLATE.exists():
        sys.exit(f"missing template: {TEMPLATE}")
    if not DATA.exists():
        sys.exit(f"missing data: {DATA}")
    if not REPORT_METRICS.exists():
        sys.exit(f"missing data: {REPORT_METRICS}")
    if not MODEL_ROSTER.exists():
        sys.exit(f"missing data: {MODEL_ROSTER}")

    raw = DATA.read_text(encoding="utf-8")
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        sys.exit(f"market-state.json invalid: {exc}")

    try:
        report_metrics = json.loads(REPORT_METRICS.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        sys.exit(f"report-metrics.json invalid: {exc}")
    parsed["report_metrics"] = report_metrics

    try:
        model_roster = json.loads(MODEL_ROSTER.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        sys.exit(f"model-roster-v2.json invalid: {exc}")
    parsed["model_roster"] = model_roster

    template = TEMPLATE.read_text(encoding="utf-8")
    if template.count(DATA_PLACEHOLDER) != 1:
        sys.exit(f"template must contain exactly 1 {DATA_PLACEHOLDER}, "
                 f"found {template.count(DATA_PLACEHOLDER)}")
    if template.count(VERSION_PLACEHOLDER) < 1:
        sys.exit(f"template must contain at least 1 {VERSION_PLACEHOLDER}")
    if template.count(BUILD_PLACEHOLDER) < 1:
        sys.exit(f"template must contain at least 1 {BUILD_PLACEHOLDER}")

    minified = json.dumps(parsed, ensure_ascii=False, separators=(",", ":"))
    version = latest_tag()
    commit = build_id()

    output = template.replace(DATA_PLACEHOLDER, minified) \
                     .replace(VERSION_PLACEHOLDER, version) \
                     .replace(BUILD_PLACEHOLDER, commit)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(output, encoding="utf-8")

    print(f"built {OUTPUT.relative_to(ROOT)} "
          f"({OUTPUT.stat().st_size:,} bytes, "
          f"release={version}, build={commit})")

    write_report_fragments(template, minified)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
