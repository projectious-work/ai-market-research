---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260517_1337-AstuteLynx-extend-logentry-known-event-types-with
  created: '2026-05-17T13:37:02+00:00'
spec:
  title: Extend LogEntry.known_event_types with role_slot lifecycle events
  state: accepted
  decision: Add `role_slot.created`, `role_slot.filled`, `role_slot.closed` to the
    LogEntry schema's `known_event_types` list via a schema-extension Migration.
  context: team-manager MCP emits `role_slot.created/filled/closed` events when RoleSlot
    entities transition, but `context/schemas/logentry.yaml` was never extended to
    declare these event types. pk-doctor surfaces this as 16 schema_vocabulary ERRORs
    across logs from 2026-05-16 (role-slot setup activity). Upstream processkit ships
    LogEntry schema with `role.created`/`role.updated` but no role_slot variants.
  rationale: 'Extension is the canonical fix per pk-doctor''s suggested_fix and per
    migration-management skill''s data-fix-migrations guidance: "If a legacy value
    should become current vocabulary, ship an explicit schema migration that adds
    it to the authoritative known_* field." The events are real and correct; the schema
    is just missing declarations. Data-fix relabeling would be lossy (no canonical
    equivalent for role_slot transitions).'
  alternatives:
  - option: Data-fix migration that relabels role_slot.* events to role.updated
    rejected_because: lossy — role_slot lifecycle is distinct from role definition
      updates; conflates two domains
  - option: Wait for upstream processkit to extend the schema
    rejected_because: no ETA; team-manager already emits these events in this project,
      so we own the local schema reconciliation now
  - option: Accept errors as known exceptions
    rejected_because: 16 ERRORs block exit_code=0; pk-doctor explicitly recommends
      either data-fix or schema migration
  consequences: Local LogEntry schema diverges from upstream processkit until upstream
    picks up the same extension. This is consistent with how schema-extension migrations
    are intended to work (see MIG-LOCK-20260515T190900 precedent). Future `aibox apply`
    may attempt to overwrite — if so, this Migration entity documents why the extension
    exists.
  decided_at: '2026-05-17T13:37:02+00:00'
---
