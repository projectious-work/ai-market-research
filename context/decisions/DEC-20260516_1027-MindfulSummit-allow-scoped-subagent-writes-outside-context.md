---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260516_1027-MindfulSummit-allow-scoped-subagent-writes-outside-context
  created: '2026-05-16T10:27:48+00:00'
spec:
  title: Allow scoped subagent writes outside context while keeping processkit writes
    on the main session
  state: accepted
  decision: Subagents may make scoped code and documentation edits outside `context/`
    when assigned a clear ownership boundary, but processkit entity mutations, `context/`
    changes, and shared git state changes remain on the main session until harness-level
    TeamMember auto-launch and subagent MCP lifecycle support are in place.
  context: The project previously restricted subagents to read-only work. The user
    requested that the team be allowed to make write changes and explicitly authorized
    relaxing `AGENTS.md`. Current processkit code still hard-disables `subagent_mcp_supported`,
    only exports concrete TeamMember adapters for Claude Code, and treats Codex/Aider/OpenCode
    as launch-conform rather than live TeamMember runtimes.
  rationale: 'This change enables the engineer/researcher/PM team to contribute real
    implementation work now without bypassing the current safeguards around processkit
    entity integrity and shared repository state. It matches the current technical
    boundary in processkit: code-file edits are feasible through harness subagents,
    while safe autonomous entity mutation and persistent TeamMember launch are not
    yet implemented.'
  alternatives:
  - option: Keep subagents read-only
    description: Preserves maximum safety but fails the user's requirement for write-capable
      team execution.
  - option: Allow unrestricted subagent writes including context and git
    description: Would create avoidable integrity risk because processkit MCP lifecycle
      and shared-state coordination are not ready for that mode.
  consequences: Subagents can now implement scoped non-context changes in their assigned
    areas. The main session must continue to own context mutations, workitem/decision
    state changes, and git operations. A processkit product gap remains for true TeamMember
    auto-launch and write-capable harness adapters.
  deciders:
  - TEAMMEMBER-thrifty-otter
  - TEAMMEMBER-cora
  related_workitems:
  - BACK-20260516_0955-GoldenFalcon-coordinate-market-data-refresh-and-v0
  - BACK-20260515_1937-HardySail-catch-up-briefing-v9-to-today
  - BACK-20260516_1002-SunnyTide-prepare-v0-1-0-release-candidate
  decided_at: '2026-05-16T10:27:48+00:00'
---
