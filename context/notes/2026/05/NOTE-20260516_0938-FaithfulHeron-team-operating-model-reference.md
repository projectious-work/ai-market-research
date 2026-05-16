---
apiVersion: processkit.projectious.work/v2
kind: Note
metadata:
  id: NOTE-20260516_0938-FaithfulHeron-team-operating-model-reference
  created: '2026-05-16T09:38:00+00:00'
spec:
  title: AI Market Research team operating model
  body: |
    Shared harness team:
    - Cora (`ROLE-product-manager`, senior), Kai (`ROLE-software-engineer`, senior), and Sage (`ROLE-research-scientist`, senior) operate together in one active implementation harness.
    - The shared harness may be Codex or Claude Code depending on the current working surface.

    Reviewed model guidance:
    - Kai primary: `claude-sonnet-4.6` at `medium`; escalate to `high` for difficult implementation/debugging. Kai secondary: `gpt-5.3-codex-spark` at `low` for bounded mechanical coding passes.
    - Sage primary: `claude-sonnet-4.6` at `medium`. Sage secondary: `gpt-5-pro-5.4` at `high` only for expensive deep counter-analysis and conflict adjudication. Note: the requested "GPT-5.4" maps to the available model id `gpt-5-pro-5.4` in this roster.
    - Cora primary: `claude-sonnet-4.6` at `medium`. Cora secondary: `gpt-5.5` at `medium`, escalating to `high` for major roadmap or architecture-review synthesis.

    Architect operating rule:
    - Atlas (`ROLE-solutions-architect`, principal consultant) operates in Claude Code only.
    - The normal interface to Atlas is a written handover document containing question, context, constraints, and desired output.
    - Atlas returns architecture, plans, review notes, or ADR-style tradeoff analysis as written handback documents.
    - Atlas is not the day-to-day implementation harness; architecture work returns to the shared harness after handback.

    Governance review:
    - Anthropic models remain the default operational choice where possible because this roster scores them materially higher on governance than the requested OpenAI alternates.
    - OpenAI models stay as secondary or review models where they add speed or cross-provider challenge value.
  type: reference
  state: captured
  review_due: '2026-05-23'
  tags:
  - team
  - routing
  - harness
  - architecture
  source: user decision 2026-05-16
---

Shared harness team:
- Cora (`ROLE-product-manager`, senior), Kai (`ROLE-software-engineer`, senior), and Sage (`ROLE-research-scientist`, senior) operate together in one active implementation harness.
- The shared harness may be Codex or Claude Code depending on the current working surface.

Reviewed model guidance:
- Kai primary: `claude-sonnet-4.6` at `medium`; escalate to `high` for difficult implementation/debugging. Kai secondary: `gpt-5.3-codex-spark` at `low` for bounded mechanical coding passes.
- Sage primary: `claude-sonnet-4.6` at `medium`. Sage secondary: `gpt-5-pro-5.4` at `high` only for expensive deep counter-analysis and conflict adjudication. Note: the requested "GPT-5.4" maps to the available model id `gpt-5-pro-5.4` in this roster.
- Cora primary: `claude-sonnet-4.6` at `medium`. Cora secondary: `gpt-5.5` at `medium`, escalating to `high` for major roadmap or architecture-review synthesis.

Architect operating rule:
- Atlas (`ROLE-solutions-architect`, principal consultant) operates in Claude Code only.
- The normal interface to Atlas is a written handover document containing question, context, constraints, and desired output.
- Atlas returns architecture, plans, review notes, or ADR-style tradeoff analysis as written handback documents.
- Atlas is not the day-to-day implementation harness; architecture work returns to the shared harness after handback.

Governance review:
- Anthropic models remain the default operational choice where possible because this roster scores them materially higher on governance than the requested OpenAI alternates.
- OpenAI models stay as secondary or review models where they add speed or cross-provider challenge value.
