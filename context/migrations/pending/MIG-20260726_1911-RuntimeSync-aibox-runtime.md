---
apiVersion: processkit.projectious.work/v1
kind: Migration
metadata:
  id: MIG-20260726_1911-RuntimeSync-aibox-runtime
  created: 2026-07-26T19:11:00Z
spec:
  source: aibox-runtime-home
  source_url: "aibox://runtime-home"
  from_version: 0.28.12
  to_version: 0.28.14
  state: pending
  generated_by: aibox apply
  generated_at: 2026-07-26T19:11:00Z
  summary: 0 changed upstream, 0 conflicts, 1 new, 0 removed (1 groups affected)
  affected_groups:
    - runtime-claude
  affected_files:
    - { path: .claude/keybindings.json, classification: new-upstream }
---

# Migration MIG-20260726_1911-RuntimeSync-aibox-runtime

Managed `.aibox-home/` runtime changes from `0.28.12` to `0.28.14`.

0 changed upstream, 0 conflicts, 1 new, 0 removed (1 groups affected)

## Counts

- unchanged: 43
- changed-locally-only: 0
- changed-upstream-only: 0
- conflict: 0
- new-upstream: 1
- removed-upstream: 0

- removed-upstream-stale: 0

## Changes by group

### runtime-claude

**new-upstream**

- `.aibox-home/.claude/keybindings.json` -> `.aibox-home/.claude/keybindings.json`

