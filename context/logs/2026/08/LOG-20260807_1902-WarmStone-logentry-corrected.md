---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260807_1902-WarmStone-logentry-corrected
  created: '2026-08-07T19:02:50+00:00'
spec:
  event_type: logentry.corrected
  timestamp: '2026-08-07T19:02:50+00:00'
  summary: Recorded append-only ID correction for LOG-20260722_0815-OpenAsh-workitem-transitioned
  actor: codex
  subject: LOG-20260722_0815-OpenAsh-workitem-transitioned
  subject_kind: LogEntry
  details:
    corrects: LOG-20260722_0815-OpenAsh-workitem-transitioned
    correction: The original immutable LogEntry ID contains blocked process vocabulary.
      The original entry remains canonical historical evidence; this replacement audit
      event has a newly generated compliant ID.
    migration: MIG-20260807_1902-CordialPearl-record-append-only-corrections-for-historical
---
