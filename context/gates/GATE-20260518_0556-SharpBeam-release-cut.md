---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0556-SharpBeam-release-cut
  created: '2026-05-18T05:56:11+00:00'
spec:
  name: release-cut
  description: 'Phase 8 — cut the release: release.sh X.Y.Z completed end-to-end (tag
    + push + deploy + gh release)'
  kind: automated
  validator: 'bash src/scripts/release.sh X.Y.Z --notes "..." completed without error:
    tag X.Y.Z exists locally and on origin, gh-pages was updated, and the GitHub Release
    was created with the dashboard-vX.Y.Z.html asset.'
  blocking: true
  evidence_required: true
  validator_command: bash src/scripts/release.sh
---
