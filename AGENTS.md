# AGENTS.md

<!-- pk-managed:pk-compliance-contract-v2 BEGIN -->
<!-- pk-compliance-contract v2 BEGIN -->
<!-- pk-compliance v2 -->

## processkit Compliance Contract

<!-- BEGIN HOOK -->

### processkit per-turn checklist

- On session start, call `acknowledge_contract(version="v2")` once
  before any write-side processkit tool call.
- Before any sub-agent / `Task` dispatch or write-side MCP call
  (`create_*`, `transition_*`, `link_*`, `record_*`, `open_*`),
  call `route_task(task_description)` and use its recommendations.
- On any domain-relevant request, consult `skill-finder` (or call
  `find_skill(task_description)`) before acting.
- Do not hand-edit files under `context/` — use MCP tools.
- Do not browse `context/` with `ls` or `grep` — use `index-management`.
- Do not edit `context/templates/` (read-only upstream mirror).
- Full positive actions and prohibitions: see
  `context/skills/processkit/skill-gate/assets/compliance-contract.md`.

<!-- END HOOK -->

## On session start

- Call `acknowledge_contract(version="v2")` once before any write-side
  processkit tool call. This unblocks the skill-gate for the session.
- Treat each new domain-relevant request as a routing checkpoint (see
  *Tool routing*).

## Sub-agent dispatch

- Call `route_task(task_description)` before any sub-agent / `Task` /
  `Agent` dispatch; read `recommended_team_member_slug` and
  `recommended_model_class` from the response.
- Pass the recommended TeamMember slug as the sub-agent's identity where
  the harness supports it, and pick the cheapest model in the recommended
  class (Haiku < Sonnet < Opus).
- Bare-model sub-agent dispatch without a prior `route_task` call is a
  compliance miss.

## Tool routing

- Consult `skill-finder` (or call `find_skill(task_description)`) before
  acting whenever there is even a 1% chance a processkit skill applies.
- Call `route_task(task_description)` before any `create_*`,
  `transition_*`, `link_*`, `record_*`, or `open_*` tool call.
- Read entities through `index-management` (`query_entities`,
  `get_entity`, `search_entities`) when looking up entity content.

## Entity writes

- Write entities through MCP tools so schema validation, state-machine
  enforcement, and event-log auto-entry all run.
- Create the WorkItem, DecisionRecord, Note, or Artifact in the same
  turn you decide on it — deferred entity creation is lost.
- Log an event after any state change that an MCP write did not already
  produce automatically.

## Decisions

- Call `record_decision` in the same turn a cross-cutting recommendation
  is accepted.
- When the last five user messages contain explicit decision language
  (approved / decided / ship it / let's go / ok / yes / confirmed),
  either call `record_decision` in the same turn or call
  `skip_decision_record(reason=...)` to acknowledge the skip.

## Prohibitions

- Do not hand-edit files under `context/` to create or mutate entities
  (use MCP tools).
- Do not browse `context/` with `ls`, `grep`, or raw filesystem walks
  (use `index-management`).
- Do not edit any file under `context/templates/` (read-only upstream
  mirror used as a diff baseline).
- Do not hand-edit the generated harness MCP config — edit the
  per-skill `mcp-config.json` and let the installer re-merge.

## Preferred MCP entry points by task type

| Task type | Preferred MCP entry point |
|-----------|--------------------------|
| Read a single entity by ID | `get_entity(id=...)` or kind-specific `get_workitem` / `get_decision` / `get_team_member` |
| Read an entity by filesystem path | `get_entity_by_path(path=...)` |
| List entities across kinds | `list_entities(kind?, state?, limit?)` |
| Search entities by text | `search_entities(text)` or `hybrid_search_entities(text)` |
| Create / mutate an entity | `create_*` / `transition_*` / `record_*` / `open_*` tools (always route_task first) |
| Run the aggregator health check | `run_pk_doctor(check?, fix?)` |
| Run the pre-release validation sweep | `run_pk_release_audit(tree?)` |
| Dispatch a sub-agent | `route_task(task_description=...)` first → then `Agent` or `Task` with recommended model |

## Read is OK for non-entity files

The Read tool is **blocked** on canonical entity files (paths matching
`context/{workitems,decisions,artifacts,team-members,scopes,gates,actors,
roles,bindings}/*.md`). A PreToolUse hook enforces this at runtime.

Read is **allowed** (no hook block) for:
- Skill source code under `context/skills/<skill>/` — scripts, SKILL.md,
  configs, assets are all readable directly.
- Schema definitions under `context/schemas/` (reading is fine; writes
  require a Migration + DEC).
- Log entries under `context/logs/` (append-only, safe to scan).
- Applied migrations under `context/migrations/applied/`.
- TeamMember sub-files: `persona.md`, `card.json`, and everything under
  `knowledge/`, `journal/`, `skills/`, `relations/`, `lessons/`,
  `private/`, `working/`.
- Any file outside `context/` entirely (docs/, src/, README.md, etc.).
<!-- pk-compliance-contract v2 END -->
<!-- pk-managed:pk-compliance-contract-v2 END -->

## About & session start

processkit is a versioned, provider-neutral library of process
primitives, skills, and MCP servers consumed by aibox and dogfooded
here. Run `pk-resume` before acting. Provider-specific files
(`CLAUDE.md`, `CODEX.md`, `.cursor/rules`) are thin pointers — edit
**this** file.

## Skill guards (if/then)

- Editing/creating a file under `context/` → call `find_skill`; never
  hand-edit entity YAML.
- Creating or transitioning any entity (WorkItem, Decision, Note,
  Artifact, Discussion, Scope, Gate, Binding) → use the relevant
  `*-management` MCP tool.
- Pending migration under `context/migrations/pending/` → use
  `migration-management` MCP; don't move files by hand.
- Cross-cutting recommendation accepted → `record_decision` or
  `skip_decision_record(reason=...)` same turn.
- Authoring/reviewing a skill → `skill-builder` / `skill-reviewer`.
- Status briefing / standup / wrap-up → `status-briefing` /
  `standup-context` / `session-handover`.
- Retro / retrospective / post-release review / post-mortem →
  `retrospective` skill (`/pk-retro`).
- Any domain-specific task (PRD, audit, research ingest, discussion,
  backlog add) → `find_skill` first; see the six mandatory skill-check
  classes in `skill-gate/SKILL.md`.
- Otherwise → browse `context/skills/INDEX.md` before falling back to
  general knowledge.
- Schema-invalid LogEntry repair → prefer
  `pk-doctor --fix=schema_filename --yes` (narrow, known-safe patches
  like inserting `actor: system` for pre-TeamMember logs). Direct
  hand-edit of a schema-invalid entry is permitted as an escape
  hatch; commit with a clear reference. LogEntries remain
  append-only for the normal write path.

## Before sub-agent dispatch

Call `route_task(task_description)` before any `Task` / `Agent` /
sub-agent dispatch and read the new fields from the response:

- `recommended_team_member_slug` — the active TeamMember whose
  `default_role` matches the routed group's preferred role. Pass it as
  the sub-agent's identity (Claude Code: `subagent_type` or model
  param; other harnesses: their equivalent). When `None`, no
  TeamMember binding resolves — fall back to an ephemeral
  `(role, seniority)` dispatch.
- `recommended_model_class` — `"fast"` or `"deep"`. Pick the cheapest
  concrete model in the class (Haiku < Sonnet < Opus) before
  dispatching; bare-model dispatch that ignores this hint inherits the
  parent session's model and breaks the team-dispatch token-efficiency
  strategy.

This section is the long form of the sub-agent-dispatch clause in
`context/skills/processkit/skill-gate/assets/compliance-contract.md`.
The `pk-doctor` `team_member_exports` check warns when an active
TeamMember has no Claude sub-agent export under `.claude/agents/`.

## Sub-agent delegation

Harness `Agent`-tool sub-agents inherit the main session's permission
policy but run ephemerally — any unallowed tool call errors
immediately rather than prompting. Delegate read-only work freely to
sub-agents (Read, search Bash, MCP `query_*` / `get_*` / `search_*` /
`list_*`).

Sub-agents may also make **scoped code and docs edits outside
`context/`** when the main session assigns a clear file/module owner and
the task does not require processkit entity mutations. Allowed
sub-agent writes in that mode are `Write`, `Edit`, `apply_patch`, and
new directories/files under the assigned non-`context/` scope. The main
session remains responsible for reviewing and integrating those changes.

Keep processkit mutations on the main session: MCP `create_*` /
`transition_*` / `record_*` / `link_*` / `open_*` / `log_event`,
changes under `context/`, and `git` mutations that alter shared repo
state. A sub-agent permission block is not a cue to broaden the
allowlist blindly; either narrow the assignment or move the blocked
mutation back to main. If MCP servers crash, hang, or fail to exit
under sub-agents, disable sub-agent MCP use for the session and route
all processkit writes through the main session until the gateway
lifecycle is stable.

## Setup

```sh
bash src/scripts/build.sh           # build dist/dashboard.html
bash src/scripts/release-check.sh   # validate + rebuild + sanity check
bash src/scripts/deploy.sh          # push dist/ to GitHub Pages (gh-pages branch)
bash src/scripts/release.sh 0.2.0   # release-check → tag → push → deploy → gh release
```

Site lives at <https://projectious-work.github.io/ai-market-research/>.
Deploy uses `git worktree` against a `gh-pages` branch — no GitHub Actions
workflow. See `DEC-20260517_1455-DeftLynx` for the architecture.

<!-- pk-managed:pk-commands BEGIN -->
<!-- pk-commands BEGIN -->
<!--
build: "bash src/scripts/build.sh"
test: "bash src/scripts/release-check.sh"
lint: ""
fmt: ""
typecheck: ""
-->
<!-- pk-commands END -->
<!-- pk-managed:pk-commands END -->

## Code style & PRs

Hard-wrap Markdown/Python/YAML at 80 cols (exempt: tables, URLs,
frontmatter, code fences). Conventional Commits; never `--no-verify`.
`src/` ships to consumers, `context/` is local — never mix. Preferences
live in per-skill `context/skills/<name>/config/settings.toml`. PRs:
link WorkItem ID, squash-merge, green tests before merge.

## Team

51-role catalog under `context/roles/`, with **pure-ordinal seniority**
(`junior → specialist → expert → senior → principal`). Persistent
identities live as **TeamMembers** under `context/team-members/<slug>/`
(directory tree: persona + A2A card + tiered memory). Ad-hoc
invocations are ephemeral `(role, seniority)` dispatches resolved via
`model-recommender.resolve_model` against `model-assignment` bindings.
Role and TeamMember defaults bind to provider-neutral
`Artifact(kind=model-profile)` entities; concrete
`Artifact(kind=model-spec)` candidates are selected after runtime access
gates. Model-spec filenames may encode provider/model names; model
profiles, actors, roles, and team-member identities must not.
If `team-manager.get_active_interlocutor` returns a configured
TeamMember, show that identity at session start. When available, also
show `team-manager.get_interlocutor_runtime_binding` output: resolved
model, observed harness model/effort, and any mismatch. Otherwise state
that the current speaker is an ephemeral harness agent.

Charters: `DEC-20260422_0233-SpryTulip` (team-member model + memory),
`DEC-20260422_0234-BraveFalcon` (role catalog + seniority),
`DEC-20260422_0234-LoyalComet` (model artifacts + binding routing),
`DEC-20260503_1829-LoyalComet` (provider-neutral model profiles).
See [`context/team/roster.md`](context/team/roster.md) and
[`context/skills/processkit/team-manager/SKILL.md`](context/skills/processkit/team-manager/SKILL.md).

## Project-specific notes

- Required MCP servers: `index-management`, `id-management`,
  `workitem-management`, `discussion-management`, `decision-record`,
  `event-log`, `skill-finder`, `task-router`.
- Never edit `.devcontainer/Dockerfile`; use `Dockerfile.local`.
- `apiVersion` locked through v1.x; `v2` requires a full migration.
- `_find_lib()` uses cwd; smoke tests `os.chdir()` before invoking servers.

## Release process

When the user asks for "a patch / minor / major release" (or anything
synonymous — "ship it", "tag a release", "cut v0.X.Y"), **do not run
`src/scripts/release.sh` directly**. Load and follow the canonical
release process instead.

- **Definition (read this first):**
  `ART-20260518_0557-CheerfulTrout-ai-market-research-release-process`
  — `context/artifacts/ART-20260518_0557-CheerfulTrout-ai-market-research-release-process.md`
- **Architecture decision:**
  `DEC-20260518_0554-DaringCoral-10-phase-release-process-with-per`
- **Pattern:** Option B — process-definition Artifact + per-phase Gate
  entities. Each release becomes a `process_instance` WorkItem epic
  with one child step per phase. `release.sh` only runs in phase 8
  (`release-cut`), after the prior gates have passed or been
  explicitly waived.

The 10 phases and their Gate entities (kebab-case names; resolve to
full IDs via `list_gates` or `get_entity`):

0. `release-scope-decided` — patch/minor/major + scope
1. `release-data-refreshed` — market data + archive snapshot (sage)
2. `release-citations-valid` — every `cite:` reference resolves (sage)
3. `release-privacy-clean` — personal-data sweep (cora)
4. `release-build-smoke-ok` — `release-check.sh` + visual smoke (kai)
5. `release-audit-clean` — `run_pk_doctor` + `run_pk_release_audit` (cora)
6. `release-docs-current` — README and any docs updated (kai)
7. `release-notes-drafted` — the `--notes` string for `release.sh` (cora)
8. `release-cut` — `release.sh X.Y.Z --notes "..."` (kai)
9. `release-post-verified` — HTTP 200, version stamp, no name leaks (cora)

**Runnable artifacts (provider-independent, pure bash/python/git/gh/curl):**

- `src/scripts/release.sh` — orchestrator. `--list | --phase N | --from
  A --to B | --all <version> --notes "..."`. No MCP coupling.
- `src/scripts/release/phaseN-*.sh` — one script per phase, runnable
  standalone (e.g. `bash src/scripts/release/phase3-privacy-clean.sh`).
- `src/scripts/release/privacy-markers.txt` (gitignored; copy from
  `.template`) — regex list consumed by phases 3 and 9.
- `dist/release-evidence/` (gitignored) — per-phase evidence files
  (draft notes, doctor JSON, served HTML, etc.).

**Agent workflow per release request:**

1. `get_artifact(id="ART-20260518_0557-CheerfulTrout-...")` — load the
   canonical 10-phase spec.
2. `create_process_instance(...)` — produces a WorkItem epic with one
   child step per phase.
3. For each phase: run `bash src/scripts/release.sh --phase N` (or
   `--from … --to …` for a range). On exit 0, call
   `evaluate_gate(id=<gate-id>, outcome="passed", evidence=<path to
   dist/release-evidence/…>)` and transition the child step to `done`.
   On non-zero exit, evaluate the gate as `failed` and stop.
4. After phase 9: transition the epic to `done` and log a
   `release.published` event.

Gates with `blocking: true` (all 10) cannot be skipped silently — use
`evaluate_gate(outcome="waived", reason="...")` when intentional. The
Artifact body lists which gates may be waived and which never may. Some
phase scripts honour env-var waivers for common cases:
`RELEASE_NO_DATA_CHANGE=1` (phase 1), `RELEASE_NO_DOC_CHANGE=1` (phase
6).

## MCP config manifest

`context/.processkit-mcp-manifest.json` records a sha256 per
`context/skills/*/*/mcp/mcp-config.json` plus an `aggregate_sha256` over
all of them. It is regenerated at release time by
`scripts/generate-mcp-manifest.py` and mirrored into
`src/context/` so consumers receive it in the release tarball.
Downstream installers (notably `aibox sync`) are expected to compare the
aggregate hash against their last-merged state and re-merge `.mcp.json`
when they differ — independently of whether the processkit version
changed. Without this signal, per-skill MCP-config edits made within a
release cycle never reach derived projects until the next version bump.
Tracking issue: [projectious-work/aibox#54](https://github.com/projectious-work/aibox/issues/54).
The `mcp_config_drift` pk-doctor check validates the manifest locally.

---

<sub>Scaffolded by processkit `v0.18.1` on `2026-04-17`. Re-rendered on each installer sync.</sub>
