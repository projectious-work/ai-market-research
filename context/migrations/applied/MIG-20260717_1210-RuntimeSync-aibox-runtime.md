---
apiVersion: processkit.projectious.work/v1
kind: Migration
metadata:
  id: MIG-20260717_1210-RuntimeSync-aibox-runtime
  created: 2026-07-17 12:10:31+00:00
  updated: '2026-07-17T12:19:41+00:00'
spec:
  source: aibox-runtime-home
  source_url: aibox://runtime-home
  from_version: 0.27.2
  to_version: 0.27.5
  state: applied
  generated_by: aibox apply
  generated_at: 2026-07-17 12:10:31+00:00
  summary: 0 changed upstream, 0 conflicts, 1 new, 1 removed (2 groups affected)
  affected_groups:
  - runtime-claude
  - runtime-git
  affected_files:
  - path: .claude/keybindings.json
    classification: removed-upstream
  - path: .config/git/aibox-github.inc
    classification: new-upstream
  started_at: '2026-07-17T12:19:41+00:00'
  applied_at: '2026-07-17T12:19:41+00:00'
  progress_notes:
  - timestamp: '2026-07-17T12:19:41+00:00'
    actor: mcp
    note: 'Applied unambiguous aibox runtime synchronization: no conflicts or locally
      changed files.'
---

# Migration MIG-20260717_1210-RuntimeSync-aibox-runtime

Managed `.aibox-home/` runtime changes from `0.27.2` to `0.27.5`.

0 changed upstream, 0 conflicts, 1 new, 1 removed (2 groups affected)

## Counts

- unchanged: 41
- changed-locally-only: 0
- changed-upstream-only: 0
- conflict: 0
- new-upstream: 1
- removed-upstream: 1

- removed-upstream-stale: 0

## Changes by group

### runtime-claude

**removed-upstream**

- `.aibox-home/.claude/keybindings.json` -> `.aibox-home/.claude/keybindings.json`

### runtime-git

**new-upstream**

- `.aibox-home/.config/git/aibox-github.inc` -> `.aibox-home/.config/git/aibox-github.inc`
