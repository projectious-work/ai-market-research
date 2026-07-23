---
apiVersion: processkit.projectious.work/v2
kind: WorkItem
metadata:
  id: BACK-20260722_0739-SleekPine-google-market-dashboard-release
  created: '2026-07-22T07:39:03+00:00'
  updated: '2026-07-22T08:16:02+00:00'
spec:
  title: Release v0.3.2 — Google market refresh
  state: done
  type: process-instance
  priority: high
  description: Patch release updating the dashboard with Gemini 3.6 Flash, Gemini
    3.5 Flash-Lite, related Google market signals, refreshed metrics, and a visible
    22 July 2026 release stamp.
  process_definition_artifact: ART-20260518_0557-CheerfulTrout-ai-market-research-release-process
  children:
  - BACK-20260722_0739-BriskAtlas-phase-0-decide-release-scope-and
  - BACK-20260722_0739-HappyButter-phase-1-validate-market-data-refresh
  - BACK-20260722_0739-HonestCompass-phase-2-validate-citations
  - BACK-20260722_0739-ArtfulOasis-phase-3-privacy-sweep
  - BACK-20260722_0739-VividMaple-phase-4-build-and-visual-smoke
  - BACK-20260722_0739-WildBlossom-phase-5-processkit-and-release-audit
  - BACK-20260722_0739-BalancedIvy-phase-6-confirm-documentation-current
  - BACK-20260722_0739-StrongPine-phase-7-draft-release-notes
  - BACK-20260722_0739-TallFox-phase-8-cut-push-deploy-and
  - BACK-20260722_0739-QuietMeadow-phase-9-verify-live-github-pages
  started_at: '2026-07-22T07:39:15+00:00'
  completed_at: '2026-07-22T08:16:02+00:00'
---

## Transition note (2026-07-22T07:39:15+00:00)

Starting the canonical 10-phase patch-release workflow for v0.3.2.


## Transition note (2026-07-22T08:16:02+00:00)

All ten blocking release gates passed.


## Transition note (2026-07-22T08:16:02+00:00)

v0.3.2 published and verified on GitHub Pages.
