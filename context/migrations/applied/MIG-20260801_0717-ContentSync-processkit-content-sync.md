---
apiVersion: processkit.projectious.work/v1
kind: Migration
metadata:
  id: MIG-20260801_0717-ContentSync-processkit-content-sync
  created: 2026-08-01 07:17:23+00:00
  updated: '2026-08-01T10:46:49+00:00'
spec:
  source: processkit
  source_url: https://github.com/projectious-work/processkit.git
  from_version: v0.28.4
  to_version: v0.28.5
  state: applied
  generated_by: aibox apply
  generated_at: 2026-08-01 07:17:23+00:00
  summary: 0 changed upstream, 1 conflicts, 0 new, 0 removed, 0 stale-removed (1 groups
    affected)
  affected_groups:
  - AGENTS
  affected_files:
  - path: AGENTS.md
    classification: conflict
  started_at: '2026-08-01T10:46:49+00:00'
  applied_at: '2026-08-01T10:46:49+00:00'
  progress_notes:
  - timestamp: '2026-08-01T10:46:49+00:00'
    actor: mcp
    note: Verified the sole AGENTS.md conflict against the v0.28.5 template. The managed
      compliance content is already equivalent; applied as a no-content-change state
      transition.
---

# Migration MIG-20260801_0717-ContentSync-processkit-content-sync

From `v0.28.4` to `v0.28.5` (source: `https://github.com/projectious-work/processkit.git`).

0 changed upstream, 1 conflicts, 0 new, 0 removed, 0 stale-removed (1 groups affected)

## Counts

- unchanged: 721
- changed-locally-only: 0
- changed-upstream-only: 0
- conflict: 1
- new-upstream: 0
- removed-upstream: 0
- removed-upstream-stale: 0

## Changes by group

### AGENTS

**conflict**

- `AGENTS.md` → `AGENTS.md`
