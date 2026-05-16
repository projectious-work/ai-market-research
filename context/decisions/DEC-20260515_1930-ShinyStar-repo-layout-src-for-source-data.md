---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260515_1930-ShinyStar-repo-layout-src-for-source-data
  created: '2026-05-15T19:30:11+00:00'
spec:
  title: 'Repo layout: src/ for source, data/ for state, dist/ for build output'
  state: accepted
  decision: 'Vendor the briefing-package-v9 prototype into this repo with a three-way
    split: `src/` holds source code (HTML template, prompt, sources, build script),
    `data/` holds canonical market state (`data/market-state.json` plus a daily archive
    under `data/archive/`), `dist/` holds the composed `dashboard.html` artifact.
    The single-file prototype is no longer the source of truth; the build composes
    it from template + data.'
  context: Briefing-package-v9 ships `dashboard.html` with JSON embedded in a `<script
    id=\"market-data\">` block. The daily prompt instructs Claude to edit only that
    block. This worked for the prototype but couples data drift to HTML drift, and
    makes diffs noisy.
  rationale: 'User explicitly directed this layout. Separating source from data makes
    the team''s responsibilities legible: researcher writes `data/`, engineer writes
    `src/` and orchestrates the build. Single-file prototype mixes all concerns and
    forces every JSON edit to also touch HTML — a known failure mode for the daily
    run. Archive lives next to data so a single git revert restores both pointer and
    snapshot.'
  alternatives:
  - option: Keep the single-file prototype as-is
    tradeoffs: Zero refactor cost, but every data update touches dashboard.html; HTML
      edits during a research run risk corrupting the artifact; diffs are unreadable.
  - option: Sibling repo (per original handover)
    tradeoffs: Cleaner separation between processkit infra and the tool, but cross-repo
      entity references and a second git remote. User declined.
  - option: Files at repo root
    tradeoffs: Simplest paths but mixes processkit scaffolding with tool artifacts;
      no clear ownership boundary for the team.
  consequences: |
    - `src/dashboard.template.html` becomes the structural source of truth; the embedded `<script id=\"market-data\">` will hold `__MARKET_DATA__` until build time.
    - `data/market-state.json` becomes the daily editable surface for Sage (researcher).
    - `dist/dashboard.html` is a build output; gitignored or committed (TBD in a follow-up DEC on deployment).
    - `data/archive/YYYY-MM-DD.json` replaces `archive/YYYY-MM-DD.html` from the prototype (data-only archives are ~10× smaller).
    - Deployment story is deferred to a follow-up decision.
  deciders:
  - TEAMMEMBER-thrifty-otter
  decided_at: '2026-05-15T19:30:11+00:00'
---
