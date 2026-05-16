---
apiVersion: processkit.projectious.work/v2
kind: WorkItem
metadata:
  id: BACK-20260516_0956-HappyPond-coordinate-prototype-refresh-release
  created: '2026-05-16T09:56:03+00:00'
spec:
  title: Coordinate prototype refresh release
  state: backlog
  type: sep-handoff
  priority: high
  description: Owner request to coordinate a data refresh plus a first tagged release
    from the current prototype state.
  scope: SCOPE-20260515_1929-SwiftPearl-ai-market-research-tool
  source_actor: TEAMMEMBER-thrifty-otter
  target: TEAMMEMBER-cora
  handoff_payload:
    objective: Organize a market research refresh and ship a v0.1.0 release of the
      tool from the current prototype baseline.
    tracking_workitem: BACK-20260516_0955-GoldenFalcon-coordinate-market-data-refresh-and-v0
    team_mode:
      shared_harness:
      - TEAMMEMBER-cora
      - TEAMMEMBER-kai
      - TEAMMEMBER-sage
      architect_lane: TEAMMEMBER-atlas via written handover documents only
    requirements:
    - Refresh the market research data before release.
    - Ensure GPT-5.3 Codex Spark gets more detailed data in the quota cross-burn matrix;
      the current prototype has missing data points there.
    - Use Sage for research/data refresh, Kai for implementation/build/release mechanics,
      and Atlas only for written architecture consultation when needed.
    - Keep the release scoped to the current prototype state rather than expanding
      into unrelated refactors.
    existing_inputs:
    - BACK-20260515_1937-HardySail-catch-up-briefing-v9-to-today
    deliverables:
    - Updated market data set
    - Release-ready prototype state
    - v0.1.0 release cut with notes appropriate to the current state of the tool
---
