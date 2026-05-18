---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260518_1536-FineFern-release-published
  created: '2026-05-18T15:36:17+00:00'
spec:
  event_type: release.published
  timestamp: '2026-05-18T15:36:17+00:00'
  summary: 'Released v0.3.0 via canonical 10-phase process: all 10 gates passed (no
    waivers, unlike v0.2.3). Capability radar shipped. Live: https://projectious-work.github.io/ai-market-research/
    · Release: https://github.com/projectious-work/ai-market-research/releases/tag/v0.3.0'
  actor: TEAMMEMBER-thrifty-otter
  subject: BACK-20260518_1437-CleverFox-release-v0-3-0
  subject_kind: WorkItem
  details:
    version: v0.3.0
    bump: minor
    tag_url: https://github.com/projectious-work/ai-market-research/releases/tag/v0.3.0
    site_url: https://projectious-work.github.io/ai-market-research/
    previous_tag: v0.2.3
    feature: 6-axis capability radar (DEC-PolishedOak)
    gates_passed: 10
    gates_waived: 0
    process_instance: BACK-20260518_1437-CleverFox
    process_definition_artifact: ART-20260518_0557-CheerfulTrout
    lessons: upstream create_process_instance still doesn't write process_definition_artifact
      (pre-emptive sed fix applied); phase 6 docs check doesn't inspect src/dashboard-context.md
      (tooling follow-up)
---
