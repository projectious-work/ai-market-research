---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260825_0905-OpenTiger-context-archive-created
  created: '2026-08-25T09:05:59+00:00'
spec:
  event_type: context_archive.created
  timestamp: '2026-08-25T09:05:59+00:00'
  summary: Archived 2 context entities into ARCHIVE-20260825_090556-migration-applied
  subject: ARCHIVE-20260825_090556-migration-applied
  subject_kind: Archive
  actor: processkit-context-archiving
  details:
    archive_path: context/archives/2026/08/ARCHIVE-20260825_090556-migration-applied.tar.gz
    manifest_path: context/archives/2026/08/ARCHIVE-20260825_090556-migration-applied.json
    entity_ids:
    - MIG-20260722_1625-ContentSync-processkit-content-sync
    - MIG-20260722_1625-RuntimeSync-aibox-runtime
---
