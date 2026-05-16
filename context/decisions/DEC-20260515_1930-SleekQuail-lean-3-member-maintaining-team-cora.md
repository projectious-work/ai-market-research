---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260515_1930-SleekQuail-lean-3-member-maintaining-team-cora
  created: '2026-05-15T19:30:25+00:00'
  updated: '2026-05-16T09:37:49+00:00'
spec:
  title: 'Lean 3-member maintaining team: Cora (PM) + Sage (research) + Kai (engineering)'
  state: superseded
  decision: 'The AI Market Research Tool is maintained by three TeamMembers: Cora
    (existing, product-manager/senior) sets cadence and prioritises; Sage (new, briefing-researcher/senior)
    runs the daily research + JSON update + executive summaries; Kai (new, briefing-engineer/senior)
    owns the template, build pipeline, scheduler, and archive plumbing. Roles `briefing-researcher`
    and `briefing-engineer` are scoped to this project. No further hires until pain
    is observed.'
  context: User is on Anthropic Max 5×. Opus is rate-limited; Sonnet is the workhorse;
    Haiku is cheap. Token efficiency drove the decision to combine roles.
  rationale: 'A five-member split (Researcher/Editor/Frontend/DevOps/PM) was the comfortable
    choice for separation-of-concerns, but the user explicitly chose lean. Two combined
    roles map cleanly to the actual work surfaces in the prototype: research-+-write
    (single editorial voice; daily) and engineering-+-ops (template/build/cron/archives;
    episodic). Fewer handoffs, less context-passing overhead, faster iteration.'
  alternatives:
  - option: Full 5-member team
    tradeoffs: Cleaner ownership but more dispatch overhead; an Editor that only edits
      prose is wasteful when Sage already writes the summary; a separate DevOps when
      builds and cron live in the same scripts is overhead.
  - option: Single briefing-maintainer agent
    tradeoffs: Mirrors the prototype's `claude -p` shape exactly. Easy to start but
      every concern collapses into one persona; hard to evolve.
  consequences: |
    - Sage runs daily and writes data + summaries + changelog.
    - Kai is invoked for template/build/cron/archive changes, infrequent.
    - Cora reviews weekly and escalates to Bernhard on strategic shifts.
    - Default model bindings (informational, until role-binding artifacts land): Sage → Sonnet 4.6; Kai → Sonnet 4.6 with Haiku 4.5 for mechanical ops; Cora → Opus 4.7 (reserved for strategic review only, sparingly).
  deciders:
  - TEAMMEMBER-thrifty-otter
  decided_at: '2026-05-15T19:30:25+00:00'
  superseded_by: DEC-20260516_0937-WarmTrout-four-member-team-with-architect-handoff
---
