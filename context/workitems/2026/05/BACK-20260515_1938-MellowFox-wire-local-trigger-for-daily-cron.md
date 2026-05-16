---
apiVersion: processkit.projectious.work/v2
kind: WorkItem
metadata:
  id: BACK-20260515_1938-MellowFox-wire-local-trigger-for-daily-cron
  created: '2026-05-15T19:38:06+00:00'
spec:
  title: Wire the local trigger for the daily-briefing cron
  state: backlog
  type: task
  priority: high
  assignee: TEAMMEMBER-kai
  description: |
    The cadence Artifact ART-20260515_1937-LucidBridge declares `17 6 * * *` UTC. The semantic schedule is owned by processkit; the **trigger mechanism** is still unimplemented. Three candidate hosts are listed in `data/schedule-spec.yaml`:

    1. **In-container cron** — install cron in the dev image, schedule the runner. Requires container to be running at the trigger time. Simplest.
    2. **Host cron `docker exec`** — host machine's cron / systemd-user-timer execs into the container daily. Container can be ephemeral. Setup outside the repo.
    3. **Always-on supervisor** — a python apscheduler or supervisord process inside the container watching the spec file.

    Pick one, implement it, document the setup steps in `src/scripts/install-trigger.sh` or `src/INSTALL.md`. Verify the trigger fires once end-to-end before closing.
  scope: SCOPE-20260515_1929-SwiftPearl-ai-market-research-tool
---
