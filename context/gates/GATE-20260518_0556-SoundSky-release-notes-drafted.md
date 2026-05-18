---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0556-SoundSky-release-notes-drafted
  created: '2026-05-18T05:56:08+00:00'
spec:
  name: release-notes-drafted
  description: 'Phase 7 — release notes assembled: human-readable summary ready to
    pass as `release.sh --notes`'
  kind: manual
  validator: A 3-7 line release-notes blurb is drafted, derived from data.changelog
    deltas + git log since the previous tag. Lead with what changed for the reader
    of the live dashboard, not what changed in the repo plumbing.
  blocking: true
  evidence_required: false
---
