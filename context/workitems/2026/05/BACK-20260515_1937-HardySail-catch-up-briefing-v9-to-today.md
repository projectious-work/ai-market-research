---
apiVersion: processkit.projectious.work/v2
kind: WorkItem
metadata:
  id: BACK-20260515_1937-HardySail-catch-up-briefing-v9-to-today
  created: '2026-05-15T19:37:53+00:00'
  updated: '2026-05-16T10:02:50+00:00'
spec:
  title: 'Catch-up briefing run: v9 (2026-05-12) → 2026-05-15, with explicit gpt-5.3-codex-spark
    burn-matrix population'
  state: in-progress
  type: task
  priority: high
  assignee: TEAMMEMBER-sage
  description: |
    Refresh `data/market-state.json` from the 2026-05-12 v9 baseline to the current date (2026-05-15) via the standard briefing-prompt procedure.

    **Explicit user-flagged requirement**: populate the **quota cross-burn matrix row for `gpt-5.3-codex-spark`** which currently has no values in the tool. Compute per the methodology in `src/dashboard-context.md`:

    - The model is OpenAI gpt-5.3-codex-spark — ultra-fast Codex coding model for bounded agent side tasks (R:4 E:4 S:5 B:3 L:4 G:2, 128k context, active).
    - Use the formula: medium cell = (api_in × 0.3 + api_out × 0.7) / (5 × 0.3 + 30 × 0.7), grounded in GPT-5.5 medium = 1.00× unit anchor.
    - Then scale: minimal ≈ 0.45×, low ≈ 0.65×, high ≈ 1.7×, xhigh ≈ 2.7× of medium.
    - If OpenAI hasn't published current pricing for codex-spark specifically, cite the price you used and flag the source confidence.

    After adding the row, re-evaluate `data.strategy.task_fit.rows[]` against this new entry (the description says "ultra-fast Codex coding model for bounded agent side tasks" — likely a strong pick for OpenAI rows on cheap-fast tasks).

    Execute via `bash src/scripts/run-briefing.sh` once the scheduler trigger is verified, or manually with the same script. The runner archives `data/market-state.json` to `data/archive/2026-05-15.json`, invokes `claude -p` against `src/briefing-prompt.md` (Sage's prompt), validates JSON, runs the build, and commits.

    End-state acceptance:
    - [ ] `data/market-state.json` advances `meta.generated_at` to 2026-05-15.
    - [ ] `data.quota_burn_matrix.openai_matrix` has a `gpt-5.3-codex-spark` row populated.
    - [ ] Changelog has a 2026-05-15 entry referencing the codex-spark addition.
    - [ ] Run summary cites 5–10 sources used.
    - [ ] `dist/dashboard.html` rebuilt successfully (build script exits 0).
  scope: SCOPE-20260515_1929-SwiftPearl-ai-market-research-tool
  started_at: '2026-05-16T10:02:50+00:00'
---

## Transition note (2026-05-16T10:02:50+00:00)

Started as the required market-data refresh input for the v0.1.0 release. Explicit attention remains on GPT-5.3 Codex Spark quota burn matrix detail.
