---
apiVersion: processkit.projectious.work/v2
kind: Migration
metadata:
  id: MIG-20260721_1236-DaringRaven-normalize-active-roleslot-binding-identifiers
  created: '2026-07-21T12:36:58+00:00'
  updated: '2026-07-21T13:28:25+00:00'
spec:
  source: local-project
  kind: data-fix
  state: applied
  generated_by: migration-management.draft_migration
  generated_at: '2026-07-21T12:36:58+00:00'
  summary: Normalize active RoleSlot Binding identifiers
  affected_files:
  - path: context/bindings/BIND-20260516_0934-AlertAnchor-role-slot-fill.md
    classification: changed-locally-only
  - path: context/bindings/BIND-20260516_0934-FluentStar-role-slot-fill.md
    classification: changed-locally-only
  - path: context/bindings/BIND-20260516_0934-KindSummit-role-slot-fill.md
    classification: changed-locally-only
  - path: context/bindings/BIND-20260516_0934-MindfulSage-role-slot-fill.md
    classification: changed-locally-only
  affected_groups: []
  plan: ''
  progress_notes:
  - timestamp: '2026-07-21T13:28:25+00:00'
    actor: mcp
    note: Renamed four active RoleSlot Bindings to deterministic IDs, emitted entity.renamed
      audit mappings, reindexed with zero parse errors, and verified binding/storage
      checks are clean.
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

1. Dry-run the four explicit old-to-new identifier mappings and confirm target IDs are unused.
2. Rename each active Binding file and metadata.id to a deterministic semantic ID while leaving its relationship spec unchanged.
3. Emit entity.renamed audit events mapping every old ID to its new ID; do not rewrite append-only historical logs.
4. Reindex, verify RoleSlot resolution, run Binding schema/storage checks, and apply this Migration.

## Rollback

Reverse the four filename and metadata.id mappings, reindex, and emit correcting entity.renamed events. Historical LogEntries remain untouched in both directions.
