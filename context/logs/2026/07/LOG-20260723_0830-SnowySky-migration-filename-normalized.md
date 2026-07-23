---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260723_0830-SnowySky-migration-filename-normalized
  created: '2026-07-23T08:30:45+00:00'
spec:
  event_type: migration.filename-normalized
  timestamp: '2026-07-23T08:30:45+00:00'
  summary: 'Migration ID normalized: ''MIG-DISABLED-HARNESS-STATE'' → ''MIG-20260717_1210-FaithfulSun'''
  subject: MIG-20260717_1210-FaithfulSun
  subject_kind: Migration
  actor: processkit-migration-management
  details:
    old_id: MIG-DISABLED-HARNESS-STATE
    new_id: MIG-20260717_1210-FaithfulSun
    updated_references:
    - context/migrations/INDEX.md
    preserved_history:
    - context/logs/2026/07/LOG-20260717_1241-FaithfulSun-migration-rejected.md
---
