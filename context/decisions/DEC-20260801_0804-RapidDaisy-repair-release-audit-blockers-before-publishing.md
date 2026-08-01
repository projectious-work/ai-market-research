---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260801_0804-RapidDaisy-repair-release-audit-blockers-before-publishing
  created: '2026-08-01T08:04:52+00:00'
spec:
  title: Repair release-audit blockers before publishing v0.4.0
  state: accepted
  decision: Repair the mandatory audit blockers, including dependency-lock hygiene
    and release-audit environment consistency, then continue publishing v0.4.0.
  context: Phase 5 failed on missing Node lockfile findings and stale release-semver
    references in the clean baseline. The user explicitly approved expanding scope
    to repair these blockers.
  rationale: The release-audit-clean gate is blocking and cannot be bypassed while
    errors remain.
  consequences: The release includes narrowly scoped audit remediation where required;
    unrelated processkit sync changes remain excluded.
  deciders:
  - ACTOR-user
  related_workitems:
  - BACK-20260801_0734-NobleFinch-run-release-audit
  - BACK-20260801_0734-CheerfulDaisy-release-august-model-market-refresh
  decided_at: '2026-08-01T08:04:52+00:00'
---
