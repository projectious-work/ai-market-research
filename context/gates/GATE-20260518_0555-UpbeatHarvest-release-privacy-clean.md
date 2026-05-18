---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0555-UpbeatHarvest-release-privacy-clean
  created: '2026-05-18T05:55:53+00:00'
spec:
  name: release-privacy-clean
  description: 'Phase 3 — security & data privacy sweep: no personal data in delivered
    code or built artifact'
  kind: hybrid
  validator: Grep sweep across delivered surface (src/, data/, dist/, .claude/agents/,
    root docs) shows zero hits for known personal markers (the owner's first/last
    name). A short narrative confirms no new privacy concerns introduced. For comprehensive
    sweeps, the maintainer reviews the audit summary; for routine patches, the grep
    is sufficient.
  blocking: true
  evidence_required: true
  validator_command: '! grep -riIE "personal-name-marker-here" src/ data/ dist/ .claude/agents/
    README.md AGENTS.md CLAUDE.md LICENSE 2>/dev/null'
---
