---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260606_1722-RefinedDew-context-archive-created
  created: '2026-06-06T17:22:52+00:00'
spec:
  event_type: context_archive.created
  timestamp: '2026-06-06T17:22:52+00:00'
  summary: Archived 4 context entities into ARCHIVE-20260606_172251-migration-applied
  subject: ARCHIVE-20260606_172251-migration-applied
  subject_kind: Archive
  actor: processkit-context-archiving
  details:
    archive_path: context/archives/2026/06/ARCHIVE-20260606_172251-migration-applied.tar.gz
    manifest_path: context/archives/2026/06/ARCHIVE-20260606_172251-migration-applied.json
    entity_ids:
    - MIG-20260517_1336-DeepRabbit-add-role-slot-event-types
    - MIG-RUNTIME-20260517T114447
    - MIG-RUNTIME-DRIFT-20260515T191051
    - MIG-LOCK-20260515T190900
---
