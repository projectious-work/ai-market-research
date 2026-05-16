---
apiVersion: processkit.projectious.work/v2
kind: Artifact
metadata:
  id: ART-20260515_1937-LucidBridge-daily-briefing-cadence-spec-for-sage
  created: '2026-05-15T19:37:32+00:00'
spec:
  name: Daily Briefing Cadence Spec
  kind: spec
  location: data/schedule-spec.yaml
  format: yaml
  version: '1'
  owner: TEAMMEMBER-kai
  produced_by: TEAMMEMBER-kai
  tags:
  - schedule
  - cadence
  - daily-briefing
  - local-execution
  - subscription-eligible
  produced_at: '2026-05-15T19:37:32+00:00'
---

Team-owned schedule for the AI Market Research Tool. Cron `17 6 * * *` UTC. Runner: `src/scripts/run-briefing.sh` (invokes `claude -p` against `src/briefing-prompt.md`). Default model: claude-sonnet-4-6. The Artifact is the semantic owner; the YAML at the linked location is the readable spec; the actual cron trigger lives outside this repo (host cron or systemd timer).
