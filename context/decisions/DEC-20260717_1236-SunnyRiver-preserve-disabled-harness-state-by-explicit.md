---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260717_1236-SunnyRiver-preserve-disabled-harness-state-by-explicit
  created: '2026-07-17T12:36:45+00:00'
spec:
  title: Preserve disabled harness state by explicit owner decision
  state: accepted
  decision: Disabled AI-harness state is preserved unless the owner explicitly authorizes
    deletion. The disabled Claude state in this workspace is preserved.
  rationale: Retaining state avoids destructive cleanup and keeps a disabled harness
    available for future re-enablement.
  alternatives:
  - option: Purge disabled harness state automatically
    rejected_because: Destructive cleanup must require explicit owner authorization.
  consequences: pk-doctor should report an actionable informational reminder until
    a preserve decision is recorded, then report the retained state as non-actionable
    information.
  decided_at: '2026-07-17T12:36:45+00:00'
---
