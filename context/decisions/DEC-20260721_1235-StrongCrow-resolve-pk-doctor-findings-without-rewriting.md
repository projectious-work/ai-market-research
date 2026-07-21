---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260721_1235-StrongCrow-resolve-pk-doctor-findings-without-rewriting
  created: '2026-07-21T12:35:55+00:00'
spec:
  title: Resolve pk-doctor findings without rewriting immutable history
  state: accepted
  decision: Extend the LogEntry schema with the legitimate role_slot.created, role_slot.filled,
    and role_slot.closed event types; preserve append-only LogEntries and terminal
    Migration history; normalize active RoleSlot Binding identifiers through an auditable
    data-fix; retain project-specific command adapters as the canonical AGENTS source;
    and allowlist only the intentionally public project email plus the documented
    synthetic example address.
  context: The full pk-doctor remediation found legitimate schema omissions alongside
    mixed-policy diagnostics affecting active Bindings, a terminal rejected Migration,
    project-specific AGENTS commands, and intentionally public or synthetic email
    examples.
  rationale: This clears real integrity defects while avoiding destructive rewrites
    of append-only logs and immutable applied/rejected migrations. It also preserves
    correct project-local build and test commands instead of replacing them with upstream
    template commands.
  alternatives:
  - option: Rewrite all historical logs and terminal migrations
    reason_rejected: Violates append-only and immutable-history contracts.
  - option: Replace project build commands with upstream template commands
    reason_rejected: Would make repository command guidance incorrect.
  consequences: Schema and Binding changes require tracked migrations and reindexing.
    Historical terminal Migration IDs remain unchanged, so storage diagnostics must
    treat them as immutable history rather than active filename drift. Public/synthetic
    email detections are suppressed narrowly through the supported allowlist.
  decided_at: '2026-07-21T12:35:55+00:00'
---
