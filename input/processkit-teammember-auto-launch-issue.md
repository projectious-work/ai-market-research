## Summary

processkit can model a team cleanly, route tasks to a recommended
TeamMember, export Claude subagent adapters, and track work state.
What it cannot do today is turn "give this work to Cora" into a live
agent launch.

That gap is visible in normal use:

1. assign/transition WorkItems to `TEAMMEMBER-cora`, `kai`, `sage`
2. set `cora` as the active interlocutor
3. export Claude adapters where available
4. ask the harness to start the team

Result: processkit updates identity and task state, but no live
TeamMember runtime is launched. The user reasonably expects "assign work
to Cora" to start Cora.

## Current behavior

Relevant code paths:

- harness capability mode reports only:
  - `primary-agent` for Claude
  - `launch-conform` for Claude/Codex/Gemini/Aider/Continue/Cursor/OpenCode/Hermes
  - `identity-only` otherwise
  - `subagent_mcp_supported` is hard-coded `False`
  - `context/skills/processkit/team-manager/mcp/server.py:323-348`
- concrete TeamMember export exists only for Claude Code:
  - `export_claude_subagent(...)`
  - `export_claude_subagents(...)`
  - `context/skills/processkit/team-manager/mcp/server.py:2107-2152`
- runtime access classification already knows about:
  - native harness providers: Claude, Codex, Gemini
  - multi-provider harnesses: Aider, Continue, Cursor, OpenCode, Hermes
  - `context/skills/processkit/model-recommender/scripts/resolver.py:280-290`

In practice this means:

- TeamMember identity exists
- routing can recommend `recommended_team_member_slug`
- work can be assigned and transitioned
- Claude subagent files can be generated
- but there is no processkit action that dispatches a live TeamMember
  runtime in any harness

## Problem statement

processkit currently has strong modeling for team state and weak
execution semantics.

The missing layer is a dispatch contract that bridges:

- TeamMember identity
- routing result (`recommended_team_member_slug`,
  `recommended_model_class`)
- harness capabilities
- launch-time model/provider selection
- optional write scope / tool policy

Without that bridge, the "team" is mostly metadata plus exports.

## Expected behavior

When a user or higher-level process says "give this work to Cora",
processkit should be able to:

1. resolve the intended TeamMember
2. resolve the recommended model class and concrete candidate
3. inspect harness capability
4. launch or queue a live agent session for that TeamMember
5. return runtime status that is distinct from task state

Suggested API surface:

- `launch_team_member(...)`
- `launch_workitem_assignee(...)`
- `get_team_member_runtime(...)`
- `list_team_member_runtimes(...)`
- `stop_team_member_runtime(...)`

At minimum, the launch response should include:

- `team_member_id`
- `harness`
- `provider`
- `model`
- `effort`
- `runtime_state` (`queued|starting|running|failed|stopped`)
- `workitem_id` if launched from work
- `write_scope`
- `can_write_context`
- `can_use_mcp`
- `runtime_handle` or equivalent opaque session id

## Harness expectations

### Claude Code

This is the closest existing path because `.claude/agents/<slug>.md`
already exists.

Expected support:

- launch from TeamMember identity directly
- optionally refresh/export adapter before launch
- support handoff-based architect flow
- eventually allow MCP in subagents once lifecycle is stable

### Codex

Codex is already recognized as a native OpenAI harness/provider path,
but there is no TeamMember launch/export equivalent today.

Expected support:

- launch a TeamMember with resolved OpenAI candidate
- expose TeamMember identity in the spawned agent instructions
- support scoped write work outside `context/`
- report runtime status back to processkit

### Aider

Aider is multi-provider and launch-conform today.

Expected support:

- map TeamMember routing result into launch flags / config
- optionally constrain provider/model to the resolved candidate
- support scoped repo writes
- report runtime start/failure/status back to processkit

### OpenCode

OpenCode has the same product gap as Aider here.

Expected support:

- TeamMember-aware launch
- resolved provider/model handoff
- scoped write support
- runtime status reporting

## Write policy

This request is not for unrestricted autonomous mutation.

A practical first version is:

- allow scoped code/docs writes outside `context/`
- keep processkit entity writes on the main session
- keep shared git state changes on the main session unless explicitly
  elevated
- make write scope explicit in launch metadata

That gives users real team execution now without pretending subagent MCP
lifecycle is already solved.

## Why this matters

Today there is a mismatch between what the product model suggests and
what the runtime actually does:

- users define a team
- users assign work to named members
- users set an active interlocutor
- users reasonably expect the named agent to start

Instead, they only get task state changes unless the outer harness is
manually orchestrated.

That is a core UX gap.

## Acceptance criteria

- a processkit caller can launch a TeamMember directly from a task or
  workitem
- runtime state is tracked separately from entity/workitem state
- Claude Code has a supported TeamMember launch path
- Codex has a supported TeamMember launch path
- Aider has a supported TeamMember launch path
- OpenCode has a supported TeamMember launch path
- launch metadata includes resolved provider/model/effort and write
  scope
- write-capable launches can be limited to non-`context/` project files
- processkit clearly reports when a harness can only do identity,
  launch-conform, or full live TeamMember runtime

## Notes

In the current repo, I had to patch local `AGENTS.md` to allow scoped
subagent writes outside `context/` while still keeping processkit entity
writes on the main session. That local policy change works around the
absence of a first-class processkit runtime contract; it does not solve
the upstream product gap.
