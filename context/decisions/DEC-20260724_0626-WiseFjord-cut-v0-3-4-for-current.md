---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260724_0626-WiseFjord-cut-v0-3-4-for-current
  created: '2026-07-24T06:26:34+00:00'
spec:
  title: Cut v0.3.4 for current AI market research refresh
  state: accepted
  decision: Publish a patch release, v0.3.4, containing current market-research sources,
    the Gemini Managed Agents update, and benchmark provenance clarification.
  context: User requested live research, report refresh, and deployment on 2026-07-24.
    The prior release is v0.3.3.
  rationale: The changes refresh report content and citations without changing the
    website's public interface or data schema.
  alternatives:
  - option: Minor release
    reason: Not warranted because no backward-compatible feature or schema change
      is introduced.
  consequences: A release process instance will validate, publish, and deploy v0.3.4.
  decided_at: '2026-07-24T06:26:34+00:00'
---
