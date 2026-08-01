---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260801_0801-IdealSummit-gate-failed
  created: '2026-08-01T08:01:51+00:00'
spec:
  event_type: gate.failed
  timestamp: '2026-08-01T08:01:51+00:00'
  summary: Gate release-audit-clean failed
  subject: GATE-20260518_0556-BrightWolf-release-audit-clean
  subject_kind: Gate
  actor: codex
  details:
    evidence: /tmp/ai-market-research-v0.4.0/dist/release-evidence/phase5-pk-doctor.json
      and phase5-pk-release-audit.json
    reason: 'pk-doctor reports blocking pre-existing errors: stale release-semver
      skill references in the committed baseline and missing Node lockfiles; current
      synced context reports three missing-lockfile errors including Docsy submodule
      manifests.'
---
