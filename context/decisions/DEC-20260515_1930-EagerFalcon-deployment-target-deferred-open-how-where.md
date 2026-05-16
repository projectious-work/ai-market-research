---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260515_1930-EagerFalcon-deployment-target-deferred-open-how-where
  created: '2026-05-15T19:30:53+00:00'
spec:
  title: 'Deployment target deferred (open: how/where to view dist/dashboard.html)'
  state: accepted
  decision: 'Deployment of `dist/dashboard.html` beyond local browser-open is deferred
    to a follow-up decision. For the v1 cutover, viewing the dashboard means opening
    the local file in a browser inside or outside the dev container. Candidates to
    evaluate in a follow-up: GitHub Pages (free, push-based), a self-hosted static
    container (nginx, served on the user''s network), a sync-to-iCloud/Dropbox flow
    for cross-device access, or a Tailscale-private bucket.'
  context: Prototype assumed GitHub Pages, but the GH Actions rejection has already
    broken that assumption. Local-only is workable while the team is being shaken
    down.
  rationale: User explicitly flagged this as the open question (\"how and where do
    we deploy it\"). The right answer depends on access patterns (single-user, mobile
    bookmark, share with colleagues) and on whether the dashboard contains anything
    sensitive (it currently does not). Deciding deployment now risks locking in an
    option that doesn't match later usage.
  alternatives:
  - option: GitHub Pages
    tradeoffs: Free, no infra, but requires the dist artifact to be committed and
      pushed; needs public repo or a paid Pages plan for private.
  - option: Self-hosted nginx container
    tradeoffs: Full control, no external dependency, but needs a host running 24/7
      and a TLS story.
  - option: Cloud sync (iCloud/Dropbox)
    tradeoffs: Zero infra; cross-device works; but no auth model and history is sync-controlled.
  - option: Tailscale private bucket
    tradeoffs: Private by default, works across devices, but adds a Tailscale dependency
      to every viewer.
  consequences: |
    - WorkItem created to drive the follow-up decision.
    - For now, the build script writes `dist/dashboard.html` and stops there.
    - The catch-up run will produce a viewable local artifact today regardless of deployment target.
  deciders:
  - TEAMMEMBER-thrifty-otter
  decided_at: '2026-05-15T19:30:53+00:00'
---
