---
apiVersion: processkit.projectious.work/v2
kind: Migration
metadata:
  id: MIG-20260721_1236-HappyRobin-declare-canonical-roleslot-lifecycle-event-types
  created: '2026-07-21T12:36:58+00:00'
  updated: '2026-07-21T13:28:25+00:00'
spec:
  source: local-project
  kind: schema-extension
  state: applied
  generated_by: migration-management.draft_migration
  generated_at: '2026-07-21T12:36:58+00:00'
  summary: Declare canonical RoleSlot lifecycle event types
  affected_files:
  - path: context/schemas/src/compositions/logentry.yaml
    classification: changed-locally-only
  - path: context/schemas/_generated/logentry.yaml
    classification: changed-locally-only
  - path: context/schemas/logentry.yaml
    classification: changed-locally-only
  affected_groups: []
  plan: ''
  progress_notes:
  - timestamp: '2026-07-21T13:28:25+00:00'
    actor: mcp
    note: Added three canonical RoleSlot lifecycle event types, regenerated the LogEntry
      schema, reloaded caches, and verified pk-doctor schema vocabulary is clean.
  source_api_version: processkit.projectious.work/v2
  source_processkit_version: 2.0.0-alpha.1
  target_api_version: processkit.projectious.work/v2
  target_processkit_version: 2.0.0-alpha.1
  apply_mode: one-shot
  related_decisions:
  - DEC-20260721_1235-StrongCrow-resolve-pk-doctor-findings-without-rewriting
  started_at: '2026-07-21T12:37:04+00:00'
  applied_at: '2026-07-21T13:28:25+00:00'
---

## Plan

1. Dry-run the three-value vocabulary extension against the composed LogEntry schema.
2. Add role_slot.created, role_slot.filled, and role_slot.closed to the authoritative source and compatibility schema.
3. Regenerate the committed LogEntry schema output and confirm only the declared vocabulary changes.
4. Reload schema caches, run schema-vocabulary checks, and apply this Migration.

## Rollback

Remove only the three added values, regenerate the output, reload caches, and record a correcting Migration. Existing append-only logs are never edited.
