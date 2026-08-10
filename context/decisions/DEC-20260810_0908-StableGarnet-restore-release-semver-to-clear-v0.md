---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260810_0908-StableGarnet-restore-release-semver-to-clear-v0
  created: '2026-08-10T09:08:41+00:00'
spec:
  title: Restore release-semver to clear v0.4.1 audit blocker
  state: accepted
  decision: Restore the deleted release-semver skill before continuing the v0.4.1
    release.
  context: The release audit reports dangling dependencies from changelog and git-branching
    after release-semver was deleted in the all-changes preparation commit.
  rationale: Restoration preserves existing dependency contracts and is narrower than
    rewriting two consuming skills during a release.
  alternatives:
  - option: Remove references from consuming skills
    pros:
    - Avoids restoring the deleted skill
    cons:
    - Changes two skill contracts during a release and may remove intended functionality.
  consequences: The release branch will gain a focused restoration commit and the
    audit can be rerun.
  related_workitems:
  - BACK-20260808_1933-RobustRabbit-release-v0-4-1
  decided_at: '2026-08-10T09:08:41+00:00'
---
