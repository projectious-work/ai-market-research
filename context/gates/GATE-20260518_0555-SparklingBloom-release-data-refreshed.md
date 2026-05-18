---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0555-SparklingBloom-release-data-refreshed
  created: '2026-05-18T05:55:41+00:00'
spec:
  name: release-data-refreshed
  description: 'Phase 1 — market data refresh: data/market-state.json reflects current
    state; an archive snapshot exists for the prior state'
  kind: manual
  validator: 'Sage (or the maintainer manually) has run a briefing pass: data/market-state.json
    updated, data/archive/YYYY-MM-DD.json snapshot written, no agentic-only stub fields
    left. For patch releases that don''t refresh data, the gate can be waived with
    reason "no data change in this release".'
  blocking: true
  evidence_required: true
  validator_command: bash src/scripts/run-briefing.sh
---
