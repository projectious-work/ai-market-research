---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260807_1901-RoyalVale-resolve-doctor-findings-for-retired-skill
  created: '2026-08-07T19:01:30+00:00'
spec:
  title: Resolve doctor findings for retired skill, lockfiles, and historical IDs
  state: accepted
  decision: Remove stale release-semver dependencies, generate Docsy Node lockfiles,
    and repair the three historical LogEntry ID violations through an append-only
    data-fix.
  context: pk-doctor reported four errors and four warnings. The release-semver skill
    is intentionally deleted in the current worktree; Docsy is a pinned submodule;
    LogEntry history is append-only.
  rationale: The user selected this remediation path after pk-doctor identified the
    dangling references, missing lockfiles, and blocked ID vocabulary.
  consequences: Skill metadata will stop declaring the retired dependency. Lockfiles
    will be added in the Docsy working tree. Log corrections will be represented as
    new audit events rather than mutation of existing historical entries.
  decided_at: '2026-08-07T19:01:30+00:00'
---
