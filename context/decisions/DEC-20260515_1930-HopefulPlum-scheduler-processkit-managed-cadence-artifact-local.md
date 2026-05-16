---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260515_1930-HopefulPlum-scheduler-processkit-managed-cadence-artifact-local
  created: '2026-05-15T19:30:41+00:00'
spec:
  title: 'Scheduler: processkit-managed cadence Artifact + local in-container execution'
  state: accepted
  decision: The daily-briefing cadence is declared as a processkit Artifact (`schedule-spec`)
    that the team owns; physical execution is a local runner script (`src/scripts/run-briefing.sh`)
    invoked by a host-side cron / systemd timer or, when this dev container is the
    host, an in-container scheduler. GitHub Actions cron is explicitly rejected to
    avoid paid CI minutes. The processkit `/schedule` remote-agent skill (billed)
    is also rejected for the same reason. All daily runs use `claude -p` inside the
    user's Max 5× subscription — no extra cost.
  context: Max 5× subscription includes `claude -p` first-party usage; Opus is rate-limited
    but Sonnet/Haiku have generous headroom. The dev container is the user's primary
    work surface, but it does not run continuously — deployment of the scheduler is
    an open item.
  rationale: User picked \"processkit-native scheduled remote agent\" AND \"all local,
    no costs.\" These are not literally the same option; the reconciliation is to
    keep the *semantic owner* of the schedule inside processkit (a team-readable Artifact
    records the cron expression, jurisdictional notes, and history) while the *physical
    trigger* fires inside the dev container via cheap OS-level scheduling. Daily runs
    charge against the Max 5× subscription quota, not metered API or CI minutes.
  alternatives:
  - option: GitHub Actions cron (per prototype)
    tradeoffs: Free for public repos but the user prefers private; ~300 min/mo for
      private free tier (within budget) but explicitly rejected on cost grounds.
  - option: processkit /schedule remote agent
    tradeoffs: Cleanest provenance — the schedule is a processkit entity with its
      own MCP — but executions run on Anthropic's cloud and are billed separately
      from Max 5×.
  - option: CronCreate (this Claude session only)
    tradeoffs: In-memory session-scoped scheduler, dies when REPL exits; 7-day cap.
      Good for ad-hoc, not production.
  consequences: |
    - A `data/schedule-spec.yaml` (or equivalent) Artifact records the cron expression and history.
    - A `src/scripts/run-briefing.sh` runner reads the schedule, archives current state, invokes `claude -p`, validates JSON, commits, and pushes.
    - The trigger mechanism (host cron, in-container systemd timer, or always-on supervisor) is documented but not implemented in this turn — captured as a WorkItem.
    - Sage's invocation is local: `claude -p --model claude-sonnet-4-6 ...` against the prompt. No API key needed if subscription is active.
    - Catch-up run uses the same runner, manually invoked.
  deciders:
  - TEAMMEMBER-thrifty-otter
  decided_at: '2026-05-15T19:30:41+00:00'
---
