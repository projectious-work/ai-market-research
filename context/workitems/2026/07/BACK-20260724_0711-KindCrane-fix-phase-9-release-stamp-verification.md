---
apiVersion: processkit.projectious.work/v2
kind: WorkItem
metadata:
  id: BACK-20260724_0711-KindCrane-fix-phase-9-release-stamp-verification
  created: '2026-07-24T07:11:46+00:00'
spec:
  title: Fix phase-9 release stamp verification
  state: backlog
  type: bug
  priority: medium
  assignee: TEAMMEMBER-cora
  description: Phase 9 currently extracts the first `releases/tag/vX.Y.Z` URL anywhere
    in served HTML. Report source links can precede the header, causing a false propagation
    warning. Parse the explicit header/footer release anchor or its visible `release
    vX.Y.Z` label, then add a regression fixture/test.
  scope: SCOPE-20260515_1929-SwiftPearl-ai-market-research-tool
---
