---
apiVersion: processkit.projectious.work/v2
kind: Migration
metadata:
  id: MIG-20260517_1336-DeepRabbit-add-role-slot-event-types
  created: '2026-05-17T13:36:00+00:00'
  updated: '2026-05-17T13:41:01+00:00'
spec:
  source: processkit
  kind: schema-extension
  state: applied
  generated_by: user
  generated_at: '2026-05-17T13:36:00+00:00'
  apply_mode: one-shot
  source_api_version: processkit.projectious.work/v2
  target_api_version: processkit.projectious.work/v2
  source_processkit_version: v0.26.14
  target_processkit_version: v0.26.14
  summary: Extend LogEntry.known_event_types with 3 role_slot lifecycle events (role_slot.created,
    role_slot.filled, role_slot.closed)
  affected_files:
  - path: context/schemas/logentry.yaml
    classification: changed-locally-only
  related_decisions:
  - DEC-20260517_1337-AstuteLynx-extend-logentry-known-event-types-with
  started_at: '2026-05-17T13:41:01+00:00'
  applied_at: '2026-05-17T13:41:01+00:00'
  progress_notes:
  - timestamp: '2026-05-17T13:41:01+00:00'
    actor: mcp
    note: 'Applied: appended role_slot.{created,filled,closed} to context/schemas/logentry.yaml
      known_event_types. Schema cache reloaded. Resolves 16 pk-doctor schema_vocabulary
      ERRORs.'
---

# Migration MIG-20260517_1336-DeepRabbit-add-role-slot-event-types

## Background

`team-manager` MCP emits `role_slot.created`, `role_slot.filled`, and
`role_slot.closed` LogEntry events when RoleSlot entities transition, but the
LogEntry Schema's `known_event_types` list shipped without declarations for
these three event types. `pk-doctor schema_vocabulary` surfaces this as 16
ERRORs across the role-slot setup activity logs from 2026-05-16.

## Change

Append three entries to `spec.known_event_types` in
`context/schemas/logentry.yaml`, alphabetically grouped with the existing
`role.*` entries:

```yaml
- role_slot.created
- role_slot.filled
- role_slot.closed
```

No other fields change. The events themselves are valid append-only entries
authored by the canonical team-manager MCP — only the schema's allow-list
needed extension.

## Rollback

Remove the three lines from `known_event_types` to revert. The existing
LogEntry files remain intact (append-only); reverting only re-introduces the
16 schema_vocabulary ERRORs.

## Verification

After apply: re-run `pk-doctor` and confirm `schema_vocabulary` returns 0
ERRORs. See related DEC-20260517_1337-AstuteLynx for context, rationale, and
alternatives considered.
