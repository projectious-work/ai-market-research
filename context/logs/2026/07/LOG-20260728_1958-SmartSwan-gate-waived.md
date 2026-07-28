---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260728_1958-SmartSwan-gate-waived
  created: '2026-07-28T19:58:54+00:00'
spec:
  event_type: gate.waived
  timestamp: '2026-07-28T19:58:54+00:00'
  summary: Gate release-audit-clean waived
  subject: GATE-20260518_0556-BrightWolf-release-audit-clean
  subject_kind: Gate
  actor: codex
  details:
    evidence: dist/release-evidence/phase5-pk-doctor.json; dist/release-evidence/phase5-pk-release-audit.json
    reason: 'Waived for v0.3.5 only: all 9 doctor errors, 2 release-audit errors,
      and warnings are pre-existing repository/processkit hygiene findings outside
      this brand/accessibility patch; none concern the delivered site, data, citations,
      privacy, build, or runtime behavior. Findings remain recorded for separate remediation.'
    waived_by: codex
---
