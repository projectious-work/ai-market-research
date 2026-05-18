---
apiVersion: processkit.projectious.work/v2
kind: Artifact
metadata:
  id: ART-20260518_0557-CheerfulTrout-ai-market-research-release-process
  created: '2026-05-18T05:57:08+00:00'
spec:
  name: release-process-v1
  kind: spec
  version: 1.0.0
  owner: TEAMMEMBER-cora
  tags:
  - release
  - process
  - gates
  - definition
  produced_at: '2026-05-18T05:57:08+00:00'
---

Canonical 10-phase release process for ai-market-research: scope → data refresh → citations audit → privacy sweep → build+smoke → pk-doctor+release-audit → docs → release notes → cut release → post-verify. Each phase gated. Loaded by agents on "make a patch/minor/major release" requests.

---

# AI Market Research — Release Process v1

This is the canonical release process. Any agent receiving a "make a
patch/minor/major release" request **must** load this Artifact, create a
new process-instance WorkItem with one step per phase, walk the phases
in order, and `evaluate_gate` after each. `src/scripts/release.sh` is
not invoked until phase 8.

| # | Phase | Gate ID | Owner | Kind |
|---|---|---|---|---|
| 0 | Scope + version decision | `release-scope-decided` | project owner | manual |
| 1 | Market data refresh | `release-data-refreshed` | sage | manual |
| 2 | Sources & citations audit | `release-citations-valid` | sage | hybrid |
| 3 | Security & data privacy sweep | `release-privacy-clean` | cora | hybrid |
| 4 | Build + UI smoke test | `release-build-smoke-ok` | kai | hybrid |
| 5 | pk-doctor + pk-release-audit | `release-audit-clean` | cora | automated |
| 6 | Documentation update | `release-docs-current` | kai | manual |
| 7 | Release notes assembly | `release-notes-drafted` | cora | manual |
| 8 | Cut release (release.sh) | `release-cut` | kai | automated |
| 9 | Post-release verification | `release-post-verified` | cora | hybrid |

## Phase-by-phase

### 0 — Scope + version decision · `release-scope-decided`
Decide and write one short paragraph: what's in this release, and which
bump (patch / minor / major)? Heuristic:
- **patch** = data refresh, bug fix, content edit, footer change
- **minor** = new tab/section, new data shape, new chart kind
- **major** = breaking template or data-schema change

The decision lands in the process-instance WorkItem body. No DEC unless
the scope decision itself is cross-cutting.

### 1 — Market data refresh · `release-data-refreshed`
Run the daily briefing (`bash src/scripts/run-briefing.sh`) or invoke
sage manually. Confirm:
- `data/market-state.json` reflects current state
- `data/archive/YYYY-MM-DD.json` snapshot exists for the prior state
- `data.changelog[0]` describes what changed

For a release that intentionally ships no data change (e.g. tooling fix,
disclaimer text update), waive with reason `"no data change in this
release"`.

### 2 — Sources & citations audit · `release-citations-valid`
Run the citation validator (the `validator_command` recorded on the gate
entity) plus a manual check:
- Every `cite: [n,n]` in data references an `n` present in
  `data.sources`
- Any vendor/product new since last release is added to
  `data.provider_sources`, `data.section_sources`, `data.sources`
- `src/sources.md` is still aligned with `data.sources` at category level

### 3 — Security & data privacy sweep · `release-privacy-clean`
Two-stage:

- **3a · deterministic grep** across delivered surface (`src/`, `data/`,
  `dist/`, `.claude/agents/`, root docs) against
  `src/scripts/release/privacy-markers.txt` (gitignored, per-maintainer
  literal + generic patterns). Must produce zero hits.
- **3b · probabilistic AI review.** The script prepares a review-input
  package at `dist/release-evidence/phase3-ai-review-input.md`
  containing the delivered-surface diff since the previous tag plus the
  current high-signal source files. The agent walking the release reads
  the package, performs a privacy review using its own intelligence
  (provider-independent — any LLM in any harness), and writes a
  `PASS`/`FAIL` verdict to `dist/release-evidence/phase3-ai-verdict.txt`.
  Phase 3 only passes when both 3a and 3b are green.

Also during phase 3: check git history if anything sensitive was
committed and force-push / orphan-reset the `gh-pages` branch if needed;
confirm no new third-party content was pulled in without attribution.

### 4 — Build + UI smoke test · `release-build-smoke-ok`
`bash src/scripts/release-check.sh` exits 0. Then a human (or sub-agent)
opens `dist/dashboard.html` in a browser and clicks every tab to confirm
no JS errors and filter controls still respond. Capture browser-console
output as evidence on first failure.

### 5 — pk-doctor + pk-release-audit · `release-audit-clean`
Run both:
- `run_pk_doctor()` → exit 0 (or all WARN dispositioned)
- `run_pk_release_audit()` → exit 0

Any actionable INFO must be resolved or explicitly waived.

### 6 — Documentation update · `release-docs-current`
README.md (and any future `docs/` pages once any exist) reflects the
release's content changes. Specifically:
- "What it tracks" list still accurate (sections added/removed)
- Command examples still work
- Badges still resolve
- Architecture pointers (DEC IDs) still current

If absolutely nothing user-facing changed, waive with reason `"no
doc-relevant change in this release"`.

**License safeguard.** Phase 6 also asserts:
- The license name in `README.md`'s License section matches `LICENSE`'s
  first line (e.g. README says `MIT License`, LICENSE starts with `MIT
  License`).
- README's License section contains the phrase `historical commits and
  tags` (the retroactive coverage clause).

The note's HTML-comment marker is `<!-- pk-release-license-note -->`.
This safeguard prevents the README and LICENSE from drifting out of
sync and prevents accidental deletion of the retroactive coverage
statement.

### 7 — Release notes assembly · `release-notes-drafted`
3–7 lines of prose for the GitHub Release body, plus the `--notes`
string for `release.sh`. Derive from:
- `data.changelog[0..N]` entries since the previous tag
- `git log <prev-tag>..HEAD --oneline`

Lead with what changed for the **reader of the live dashboard**, not
what changed in the repo plumbing.

### 8 — Cut release · `release-cut`
```sh
bash src/scripts/release.sh <X.Y.Z> --notes "<notes from phase 7>"
```
This runs: release-check → tag → push (main + tag) → deploy (gh-pages)
→ `gh release create` with the following assets:
- `dashboard-vX.Y.Z.html` — the self-contained dashboard artifact
- `LICENSE` — the license file, attached so consumers downloading the
  dashboard also receive the licence terms

GitHub additionally auto-generates a source-tarball (`.tar.gz`) and
zip (`.zip`) for the tag, both of which include `LICENSE` because it
sits at the repo root.

Pre-condition: clean working tree on `main`, local == origin/main.

### 9 — Post-release verification · `release-post-verified`
- `curl -sI https://projectious-work.github.io/ai-market-research/`
  returns HTTP 200
- Served HTML carries the new version stamp
- Grep for personal-name markers in served HTML → 0
- Append a `release.published` LogEntry summarising tag, commit, URL

## Waiving a gate

Each gate is `blocking: true`. To skip with reason, use
`evaluate_gate(id=..., outcome="waived", reason="...")`. Common
acceptable waivers:
- Data refresh skipped for a tooling-only patch
- Docs gate skipped when nothing user-facing changed
- Privacy gate accelerated when the diff is a one-line fix

Never waive `release-build-smoke-ok`, `release-audit-clean`,
`release-cut`, or `release-post-verified`.

## How agents instantiate a release

1. Read this Artifact (`get_artifact`) to load the 10 phases + gate IDs.
2. `create_process_instance(title="Release X.Y.Z", process_definition_artifact="ART-…", steps=["scope", "data-refresh", …])` — produces a WorkItem epic with one child step per phase.
3. For each phase: run `bash src/scripts/release.sh --phase N` (or `--from A --to B` for a range). On exit 0, call `evaluate_gate(id=<gate-id>, outcome="passed", evidence="dist/release-evidence/…")` and transition the corresponding child WorkItem to `done`. On non-zero exit, evaluate as `failed` and stop.
4. After phase 9, transition the epic to `done` and log `release.published`.

## Runnable scripts (canonical run path)

The validator commands recorded on the individual Gate entities are
illustrative; the canonical run path is the orchestrator at
`src/scripts/release.sh` plus the per-phase scripts at
`src/scripts/release/phaseN-*.sh`. These are pure
bash/python3/git/gh/curl — no MCP coupling, so the gates can be
evaluated from any harness (or none).

| # | Phase script | Phase env honoured |
|---|---|---|
| 0 | `phase0-scope.sh` | `VERSION`, `SCOPE_NOTE` |
| 1 | `phase1-data-refresh.sh` | `RELEASE_NO_DATA_CHANGE=1` waives |
| 2 | `phase2-citations-valid.sh` | — |
| 3 | `phase3-privacy-clean.sh` | reads `src/scripts/release/privacy-markers.txt` (gitignored) |
| 4 | `phase4-build-smoke.sh` | `RELEASE_AUTO_CONFIRM=1` (non-interactive only) |
| 5 | `phase5-audit-clean.sh` | — |
| 6 | `phase6-docs-current.sh` | `RELEASE_NO_DOC_CHANGE=1` waives |
| 7 | `phase7-notes-drafted.sh` | `VERSION`, optionally `NOTES` |
| 8 | `phase8-cut.sh` | `VERSION`, `NOTES` |
| 9 | `phase9-post-verified.sh` | `RELEASE_SITE_URL` override; reads markers file |

Common orchestrator invocations:

```sh
src/scripts/release.sh --list                       # list phases
src/scripts/release.sh --phase 3                    # privacy sweep only
src/scripts/release.sh --from 2 --to 5              # citations → audit
VERSION=0.2.3 NOTES="…" src/scripts/release.sh --all 0.2.3 --notes "…"
```

Evidence files land under `dist/release-evidence/` (gitignored). Pass
their paths as the `evidence` parameter when calling `evaluate_gate`.
