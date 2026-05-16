---
apiVersion: processkit.projectious.work/v2
kind: WorkItem
metadata:
  id: BACK-20260515_1937-StrongShore-decide-deployment-target-for-dashboard
  created: '2026-05-15T19:37:59+00:00'
spec:
  title: Decide deployment target for dist/dashboard.html
  state: backlog
  type: task
  priority: medium
  assignee: TEAMMEMBER-cora
  description: |
    Resolves the open question from DEC-20260515_1930-EagerFalcon. Evaluate candidate deployment targets and pick one. Candidates and tradeoffs are documented in the DEC.

    Inputs needed from Bernhard before deciding:
    - Single-user only, or share with anyone?
    - Mobile access required?
    - Anything sensitive in the dashboard now or anticipated? (Currently: nothing PII/credential-bearing.)
    - Comfortable with always-on infra inside the dev container vs. an external host?

    Output: a follow-up DEC that supersedes/refines DEC-20260515_1930-EagerFalcon, plus an implementation WorkItem assigned to Kai.
  scope: SCOPE-20260515_1929-SwiftPearl-ai-market-research-tool
---
