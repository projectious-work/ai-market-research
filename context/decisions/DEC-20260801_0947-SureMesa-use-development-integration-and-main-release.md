---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260801_0947-SureMesa-use-development-integration-and-main-release
  created: '2026-08-01T09:47:42+00:00'
spec:
  title: Use development integration and main release branches
  state: accepted
  decision: Use development as the integration branch. Merge short-lived feature,
    fix, docs, refactor, and chore branches into development by pull request and squash
    merge. Merge development into main by release pull request and merge commit; cut
    version tags and deploy from main. Merge main back into development after each
    release and after emergency production fixes.
  context: The project needs a simple, durable GitHub workflow after retiring development-v2.0.
    The existing release process cuts tags and deploys from main.
  rationale: A protected development branch keeps incomplete work off the published
    branch while short-lived branches keep individual changes reviewable. Releasing
    from main preserves the repository's existing gated tag-and-deploy contract.
  alternatives:
  - option: Commit features directly to main
    rejected_because: Would mix integration work with published releases and bypass
      the requested review flow.
  - option: Keep a permanent version-specific development branch
    rejected_because: Adds lifecycle overhead without a concurrent maintained version
      line.
  - option: Tag development directly
    rejected_because: Conflicts with the project release process, which validates
      and publishes from main.
  consequences: Feature pull requests target development; release pull requests target
    main. Both long-lived branches require protection against direct pushes, force
    pushes, and deletion. Emergency fixes branch from main and are merged back into
    development after release.
  deciders:
  - ACTOR-user
  decided_at: '2026-08-01T09:47:42+00:00'
---
