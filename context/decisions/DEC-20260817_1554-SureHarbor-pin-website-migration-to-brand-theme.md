---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260817_1554-SureHarbor-pin-website-migration-to-brand-theme
  created: '2026-08-17T15:54:43+00:00'
spec:
  title: Pin website migration to brand-theme-hugo-vanilla v0.3.3
  state: accepted
  decision: Use brand-theme-hugo-vanilla@v0.3.3 as the final approved implementation
    baseline for replacing the current Hugo Docsy site.
  context: The website migration was intentionally held until the user confirmed the
    final approved upstream theme release.
  rationale: The user explicitly confirmed v0.3.3; pinning the exact release makes
    the migration reproducible and establishes the authoritative native component/API
    baseline.
  consequences: Implementation may begin locally. Theme APIs are preferred over local
    HTML/CSS workarounds; any unavoidable gaps must be ledgered and reported upstream
    after validation.
  decided_at: '2026-08-17T15:54:43+00:00'
---
