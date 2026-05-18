---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0555-TenderTide-release-scope-decided
  created: '2026-05-18T05:55:37+00:00'
spec:
  name: release-scope-decided
  description: Phase 0 — release type (patch/minor/major) and scope are decided and
    recorded
  kind: manual
  validator: A short note (in the process-instance WorkItem body) names the proposed
    version bump and what's in scope. Patch = content + bug-fix; minor = new tab/section/data
    shape; major = breaking template or data-schema change. The decision can be made
    informally but must be written before any other phase runs.
  blocking: true
  evidence_required: false
---
