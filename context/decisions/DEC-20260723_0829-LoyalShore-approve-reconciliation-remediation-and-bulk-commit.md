---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260723_0829-LoyalShore-approve-reconciliation-remediation-and-bulk-commit
  created: '2026-07-23T08:29:24+00:00'
spec:
  title: Approve reconciliation remediation and bulk commit
  state: accepted
  decision: Apply the pending Processkit and runtime migrations; archive the historical
    root-level migration briefing; normalize the legacy migration filename; accept
    OpenAsh as immutable historical data; bulk-commit and push the existing worktree;
    and diagnose GitHub CLI access before issue/PR reconciliation.
  context: User approved the blocked implementation steps reported by /pk-reconcile
    on 2026-07-23.
  rationale: The user explicitly authorized the migrations, cleanup, filename normalization,
    historical-log disposition, and bulk commit/push.
  alternatives:
  - option: Defer all remediation
    reason: Would leave the reconciliation queue blocked.
  consequences: Repository and processkit context will change through their managed
    tools; existing worktree changes will be committed and pushed.
  decided_at: '2026-07-23T08:29:24+00:00'
---
