---
apiVersion: processkit.projectious.work/v2
kind: Note
metadata:
  id: NOTE-20260606_1728-SharpComet-normalize-timestamped-role-slot-fill-bindings
  created: '2026-06-06T17:28:27+00:00'
spec:
  title: Normalize timestamped role-slot-fill Bindings
  body: |
    B3 + B8 from 2026-06-06 pk-resume health audit.

    4 Binding files use timestamp+wordpair naming and need rename to canonical deterministic policy:
    - BIND-20260516_0934-AlertAnchor-role-slot-fill.md
    - BIND-20260516_0934-FluentStar-role-slot-fill.md
    - BIND-20260516_0934-KindSummit-role-slot-fill.md
    - BIND-20260516_0934-MindfulSage-role-slot-fill.md

    Deferred because: no MCP tool exists for authoring data-fix Migrations in derived projects (filed upstream as issue #81). Cannot resolve without either (a) upstream shipping a `draft_migration` MCP tool, or (b) hand-authoring the Migration MD (off-contract for entity writes).

    Resume when issue #81 ships or upstream provides guidance on derived-project data-fix Migration authoring.
  type: fleeting
  state: captured
  review_due: '2026-06-13'
  tags:
  - pk-doctor
  - deferred
  - upstream-blocked
  source: pk-resume 2026-06-06
  inbox:
    status: captured
    injection_mode: ambient
    captured_at: '2026-06-06T17:28:27+00:00'
---

B3 + B8 from 2026-06-06 pk-resume health audit.

4 Binding files use timestamp+wordpair naming and need rename to canonical deterministic policy:
- BIND-20260516_0934-AlertAnchor-role-slot-fill.md
- BIND-20260516_0934-FluentStar-role-slot-fill.md
- BIND-20260516_0934-KindSummit-role-slot-fill.md
- BIND-20260516_0934-MindfulSage-role-slot-fill.md

Deferred because: no MCP tool exists for authoring data-fix Migrations in derived projects (filed upstream as issue #81). Cannot resolve without either (a) upstream shipping a `draft_migration` MCP tool, or (b) hand-authoring the Migration MD (off-contract for entity writes).

Resume when issue #81 ships or upstream provides guidance on derived-project data-fix Migration authoring.
