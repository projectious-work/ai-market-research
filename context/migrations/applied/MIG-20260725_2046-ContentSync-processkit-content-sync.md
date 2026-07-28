---
apiVersion: processkit.projectious.work/v1
kind: Migration
metadata:
  id: MIG-20260725_2046-ContentSync-processkit-content-sync
  created: 2026-07-25 20:46:52+00:00
  updated: '2026-07-28T19:02:49+00:00'
spec:
  source: processkit
  source_url: https://github.com/projectious-work/processkit.git
  from_version: v0.28.1
  to_version: v0.28.4
  state: applied
  generated_by: aibox apply
  generated_at: 2026-07-25 20:46:52+00:00
  summary: 0 changed upstream, 0 conflicts, 9 new, 0 removed, 0 stale-removed (2 groups
    affected)
  affected_groups:
  - AGENTS
  - context/artifacts
  affected_files:
  - path: AGENTS.md
    classification: changed-locally-only
  - path: context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-6-flash.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-7-max.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-8-max-preview.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-google-gemini-3-6-flash.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-minimax-minimax-m3.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-moonshot-kimi-k3.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-openai-gpt-5-3-codex-spark.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-subquadratic-subq-1-1-small.md
    classification: new-upstream
  - path: context/artifacts/ART-20260503_1424-ModelSpec-xiaomi-mimo-7b.md
    classification: new-upstream
  started_at: '2026-07-28T19:02:49+00:00'
  applied_at: '2026-07-28T19:02:49+00:00'
  progress_notes:
  - timestamp: '2026-07-28T19:02:49+00:00'
    actor: mcp
    note: Applied during pk-resume session-start reconciliation; migration reports
      no conflicts and only upstream additions.
---

# Migration MIG-20260725_2046-ContentSync-processkit-content-sync

From `v0.28.1` to `v0.28.4` (source: `https://github.com/projectious-work/processkit.git`).

0 changed upstream, 0 conflicts, 9 new, 0 removed, 0 stale-removed (2 groups affected)

## Counts

- unchanged: 712
- changed-locally-only: 1
- changed-upstream-only: 0
- conflict: 0
- new-upstream: 9
- removed-upstream: 0
- removed-upstream-stale: 0

## Changes by group

### AGENTS

**changed-locally-only**

- `AGENTS.md` → `AGENTS.md`

### context/artifacts

**new-upstream**

- `context/artifacts/ART-20260503_1424-ModelSpec-subquadratic-subq-1-1-small.md` → `context/artifacts/ART-20260503_1424-ModelSpec-subquadratic-subq-1-1-small.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-7-max.md` → `context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-7-max.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-6-flash.md` → `context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-6-flash.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-moonshot-kimi-k3.md` → `context/artifacts/ART-20260503_1424-ModelSpec-moonshot-kimi-k3.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-minimax-minimax-m3.md` → `context/artifacts/ART-20260503_1424-ModelSpec-minimax-minimax-m3.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-xiaomi-mimo-7b.md` → `context/artifacts/ART-20260503_1424-ModelSpec-xiaomi-mimo-7b.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-google-gemini-3-6-flash.md` → `context/artifacts/ART-20260503_1424-ModelSpec-google-gemini-3-6-flash.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-openai-gpt-5-3-codex-spark.md` → `context/artifacts/ART-20260503_1424-ModelSpec-openai-gpt-5-3-codex-spark.md`
- `context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-8-max-preview.md` → `context/artifacts/ART-20260503_1424-ModelSpec-alibaba-qwen3-8-max-preview.md`
