---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260717_1245-WarmShell-apply-doctor-remediation-while-retaining-project
  created: '2026-07-17T12:45:53+00:00'
  updated: '2026-07-17T12:45:57+00:00'
spec:
  title: Apply doctor remediation while retaining project command adapters
  state: accepted
  decision: Archive the approved historical migration artifacts, normalize mixed filename
    policies through migrations, regenerate MCP metadata and preauth, and retain this
    repository's project-specific AGENTS.md command adapters as an explicit exception
    to the generic template.
  rationale: The owner approved all operational remediations and explicitly chose
    to preserve correct project commands rather than replace them with generic processkit
    defaults.
  consequences: Historical data remains available in archives; Binding and Migration
    references must be updated atomically; generated MCP metadata will reflect current
    shipped servers; the commands block remains project-specific.
  decided_at: '2026-07-17T12:45:57+00:00'
---
