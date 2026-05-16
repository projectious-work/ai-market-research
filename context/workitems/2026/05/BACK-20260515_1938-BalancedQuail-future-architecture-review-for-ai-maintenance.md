---
apiVersion: processkit.projectious.work/v2
kind: WorkItem
metadata:
  id: BACK-20260515_1938-BalancedQuail-future-architecture-review-for-ai-maintenance
  created: '2026-05-15T19:38:15+00:00'
spec:
  title: 'Future-architecture review: is the current stack right for an AI-maintained
    tool?'
  state: backlog
  type: epic
  priority: low
  assignee: TEAMMEMBER-cora
  description: |
    Bernhard flagged on 2026-05-15: "Later we can discuss, if the tool uses the right architecture stack, given that I would like to keep AI agents the maintaining entities."

    Deferred until the team has 1–2 weeks of daily runs under its belt and we can see where the prototype's single-file HTML approach actually pinches. Likely review topics:

    - Does the dashboard need to be a single HTML file, or would a small static site (multi-page, asset-split) reduce LLM token cost on edits?
    - Is the JSON schema large/nested enough that a relational model (SQLite + a renderer) would beat in-place JSON edits for the daily refresh?
    - Could the prompt be reduced if we generated dashboard text from structured data via templating, rather than embedding prose in the JSON?
    - Should the build pipeline support partial updates (research one section at a time) for incremental robustness?
    - Is the `claude -p` invocation the right shape, or should we move to an agent SDK harness?

    Acceptance: a Discussion entity capturing the trade-offs, followed by a DEC that either ratifies the current stack or schedules a migration.
  scope: SCOPE-20260515_1929-SwiftPearl-ai-market-research-tool
---
