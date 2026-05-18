---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0556-QuickBloom-release-post-verified
  created: '2026-05-18T05:56:16+00:00'
spec:
  name: release-post-verified
  description: 'Phase 9 — post-release verification: live URL serves the new version,
    no personal-data regression'
  kind: hybrid
  validator: curl -sI https://projectious-work.github.io/ai-market-research/ returns
    HTTP 200; the served HTML carries the new version stamp; sweep for personal-name
    markers in the served HTML returns 0 hits. A release.published LogEntry is appended
    summarising what shipped and where.
  blocking: true
  evidence_required: true
  validator_command: curl -sf -o /tmp/page.html https://projectious-work.github.io/ai-market-research/
    && grep -q "v0\\." /tmp/page.html && ! grep -qE "personal-name-marker-here" /tmp/page.html
---
