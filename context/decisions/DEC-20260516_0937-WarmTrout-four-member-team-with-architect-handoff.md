---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260516_0937-WarmTrout-four-member-team-with-architect-handoff
  created: '2026-05-16T09:37:23+00:00'
  updated: '2026-05-16T09:37:49+00:00'
spec:
  title: Four-member team with architect handoff workflow
  state: accepted
  decision: 'The AI Market Research Tool team is revised to four explicit roles: Cora
    as project manager, Kai as software engineer, Sage as researcher, and Atlas as
    architect consultant. Cora, Kai, and Sage work together in one shared implementation
    harness, which may be Codex or Claude Code depending on the active runtime. Atlas
    works in Claude Code only and is engaged through written handover documents, returning
    architecture, plans, and review notes as written handbacks.'
  context: The previous team state had broken TeamMember role references, inconsistent
    roster and decision surfaces, and incomplete memory-tree scaffolding. The requested
    revision also asked for explicit model guidance and a clear separation between
    day-to-day implementation and architecture review.
  rationale: Using canonical catalog roles resolves the TeamMember schema errors.
    Keeping the implementation triad in one shared harness reduces handoff overhead
    for daily work. Treating the architect as a consultant formalizes the separate
    Claude Code architecture lane and matches the requested document-based interaction
    pattern. The model guidance remains Anthropic-first for operational work because
    governance and price-value are stronger there, while OpenAI models are retained
    where they add speed or useful independent challenge.
  alternatives:
  - option: Keep the prior three-member team
    tradeoffs: Leaves the architecture lane implicit and does not satisfy the requested
      operating model.
  - option: Put the architect inside the shared implementation harness
    tradeoffs: Blurs the boundary between implementation and architecture review and
      weakens the requested handover discipline.
  - option: Make OpenAI the primary default for all roles
    tradeoffs: Would satisfy provider uniformity in Codex, but the current roster
      shows weaker governance and in some cases worse price-value than Anthropic for
      these roles.
  consequences: |
    - `cora`, `kai`, `sage`, and `atlas` now have explicit canonical role assignments.
    - Four canonical RoleSlots exist under the AI Market Research Tool scope and are filled.
    - `cora` is the active interlocutor for the project scope.
    - The exact requested "GPT-5.4" is represented by roster model id `gpt-5-pro-5.4`, and it is intentionally kept secondary because it is legacy and costly.
    - Architecture requests should now be packaged as written handovers to Atlas rather than folded into the implementation harness.
  deciders:
  - TEAMMEMBER-thrifty-otter
  decided_at: '2026-05-16T09:37:23+00:00'
  supersedes: DEC-20260515_1930-SleekQuail-lean-3-member-maintaining-team-cora
---
