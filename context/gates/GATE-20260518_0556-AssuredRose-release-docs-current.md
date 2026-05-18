---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0556-AssuredRose-release-docs-current
  created: '2026-05-18T05:56:04+00:00'
spec:
  name: release-docs-current
  description: 'Phase 6 — documentation update: README and any other shipped docs
    reflect the release''s content'
  kind: manual
  validator: README.md (and any future docs/ pages, once any exist) accurately reflects
    what this release added/changed/removed. Section headings, command examples, screenshots,
    badges, and the "what it tracks" list are still correct. If nothing user-facing
    changed, the gate can be waived with reason "no doc-relevant change in this release".
  blocking: true
  evidence_required: false
---
