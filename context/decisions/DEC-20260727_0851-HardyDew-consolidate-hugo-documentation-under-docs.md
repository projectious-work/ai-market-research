---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260727_0851-HardyDew-consolidate-hugo-documentation-under-docs
  created: '2026-07-27T08:51:34+00:00'
spec:
  title: Consolidate Hugo documentation under docs
  state: accepted
  decision: Move all Hugo/Docsy site inputs under docs/ and delete the obsolete docs
    pointer files plus stale aibox upgrade notes.
  rationale: The user accepted the documented cleanup recommendation. A single documentation
    root removes split ownership and stale operational guidance.
  consequences: Build, deployment, release, README, contribution, security, and documentation
    references must use the new docs/ paths. The report builder remains under src/
    as an explicit dependency.
  decided_at: '2026-07-27T08:51:34+00:00'
---
