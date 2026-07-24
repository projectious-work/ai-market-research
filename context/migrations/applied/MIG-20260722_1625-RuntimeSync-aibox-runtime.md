---
apiVersion: processkit.projectious.work/v1
kind: Migration
metadata:
  id: MIG-20260722_1625-RuntimeSync-aibox-runtime
  created: 2026-07-22 16:25:17+00:00
  updated: '2026-07-23T08:30:14+00:00'
spec:
  source: aibox-runtime-home
  source_url: aibox://runtime-home
  from_version: 0.28.2
  to_version: 0.28.4
  state: applied
  generated_by: aibox apply
  generated_at: 2026-07-22 16:25:17+00:00
  summary: 0 changed upstream, 0 conflicts, 1 new, 0 removed (1 groups affected)
  affected_groups:
  - runtime-lazygit
  affected_files:
  - path: .config/lazygit/config.yml
    classification: new-upstream
  started_at: '2026-07-23T08:30:14+00:00'
  applied_at: '2026-07-23T08:30:14+00:00'
  progress_notes:
  - timestamp: '2026-07-23T08:30:14+00:00'
    actor: mcp
    note: Applied with user approval during project reconciliation on 2026-07-23.
---

# Migration MIG-20260722_1625-RuntimeSync-aibox-runtime

Managed `.aibox-home/` runtime changes from `0.28.2` to `0.28.4`.

0 changed upstream, 0 conflicts, 1 new, 0 removed (1 groups affected)

## Counts

- unchanged: 42
- changed-locally-only: 0
- changed-upstream-only: 0
- conflict: 0
- new-upstream: 1
- removed-upstream: 0

- removed-upstream-stale: 0

## Changes by group

### runtime-lazygit

**new-upstream**

- `.aibox-home/.config/lazygit/config.yml` -> `.aibox-home/.config/lazygit/config.yml`
