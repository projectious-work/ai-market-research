---
apiVersion: processkit.projectious.work/v2
kind: LogEntry
metadata:
  id: LOG-20260519_1141-RobustStone-session-handover
  created: '2026-05-19T11:41:01+00:00'
spec:
  event_type: session.handover
  timestamp: '2026-05-19T11:41:01+00:00'
  summary: 'Major session: pk-doctor cleanup; 5 releases shipped (v0.1→v0.3.1); release
    process formalized (DEC + Artifact + 10 Gates + 10-phase orchestrator scripts);
    privacy + license safeguards added; capability radar (6-axis) designed, implemented,
    and iterated. Ends with v0.4.0 visual review pending in dist/dashboard.html (uncommitted
    Option D scale: rubric 1-50 + visual cap 60 + effort-boost band 51-60). Hand off:
    review dist/dashboard.html on 04 Strategy + 01 Models tabs, then "cut a minor
    release" to ship v0.4.0.'
  actor: TEAMMEMBER-thrifty-otter
  subject: SCOPE-20260515_1929-SwiftPearl-ai-market-research-tool
  subject_kind: Scope
  details:
    current_state: Working tree has 2 uncommitted files (data/market-state.json +
      src/dashboard.template.html) carrying the full v0.4.0 capability-radar refinements
      — Option D scale system (rubric ceiling 50, visual cap 60, emphasized 50 ring
      as 'current frontier', effort-boost band 51-60 in red), unclamped polygon rendering,
      fixed reference (always at ceiling, never effort-scaled), tooltip with labels-back-on
      + % vs ref column + boost-vertex hint, per-axis effort_sensitivity coefficients,
      fine-tuned capability_levels for top 9 frontier models on 1-50 scale, radar_effort_factors
      anchored at medium=1.00, full rubric explanations moved to 04 Strategy legend
      (was in 01 Models), 01 reference markers made consistent (cyan-dashed everywhere).
    releases_shipped:
    - v0.1.0 (baseline)
    - v0.2.0 (deploy to GH Pages)
    - v0.2.1 (Sources tab + cite numbers + license/disclaimer footer)
    - v0.2.2 (privacy sweep + license safeguards)
    - v0.2.3 (formal 10-phase release-process scaffolding shipped)
    - v0.3.0 (capability radar v1)
    - v0.3.1 (radar render fix + editorial design)
    released_tag: v0.3.1
    live_site: https://projectious-work.github.io/ai-market-research/
    git:
      branch: main
      head_sha: 25fc329
      behind_remote: false
      uncommitted_files:
      - data/market-state.json
      - src/dashboard.template.html
    open_threads:
      v0_4_0_pending: 'User reviewed Option D in dist/dashboard.html; next session
        should confirm visual review and walk the 10-phase release for v0.4.0 (minor
        — schema changed: scale block, radar_effort_factors, effort_sensitivity per
        axis, capability_levels rescaled 1-5→1-50).'
      stale_workitems: 'Three in-progress WorkItems from earliest sessions never closed:
        BACK-20260516_0955-GoldenFalcon (v0.1.0 coord epic), BACK-20260516_1002-SunnyTide
        (prep v0.1.0 RC), BACK-20260515_1937-HardySail (catch-up briefing v9). v0.1.0
        has long since shipped — these should be transitioned to done.'
      upstream_processkit_bugs_to_file:
      - create_process_instance MCP tool accepts process_definition_artifact parameter
        but doesn't write the field into the resulting WorkItem (fixed pre-emptively
        via sed each time)
      - phase 6 docs check (phase6-docs-current.sh) doesn't inspect src/dashboard-context.md
        which changes substantially per release — add to DOC_PATHS
      - phase 9 post-verify can race GitHub Pages CDN propagation (caught v0.2.3 and
        v0.3.1; could add optional retry-with-delay)
      - ScopeDecidedSlug constraint of create_process_instance is finicky — rejects
        1-3-word slug_summary; needs documented 4-6-word constraint or wider acceptance
    decisions_recorded_this_session:
    - DEC-20260517_1337-AstuteLynx — extend LogEntry schema with role_slot event types
    - 'DEC-20260517_1455-DeftLynx — v0.2.0 deployment: local deploy.sh + gh-pages
      branch source'
    - DEC-20260518_0554-DaringCoral — 10-phase release process (Option B Process+Gates)
    - DEC-20260518_1038-PolishedOak — 6-axis capability taxonomy + weighted radar
      chart
    discussions_resolved:
    - DISC-20260518_1024-SnowyCompass — task-fit capability redesign (resolved into
      DEC-PolishedOak)
    infrastructure_now_in_place:
      release_process: ART-20260518_0557-CheerfulTrout — canonical 10-phase release
        definition
      release_gates: 10 Gate entities (release-scope-decided … release-post-verified)
      release_scripts: src/scripts/release.sh orchestrator + src/scripts/release/phase{0..9}-*.sh
        + _lib.sh + privacy-markers.txt.template (markers file is gitignored)
      privacy_markers_local: src/scripts/release/privacy-markers.txt configured with
        maintainer identity + generic city/phone patterns; gitignored; verified 3
        times via git check-ignore
      license_safeguard: README has retroactive copyright/license note; phase 6 verifies
        on every release; phase 8 attaches LICENSE alongside dashboard-vX.Y.Z.html
        on GH releases
    lessons_encoded_this_session:
    - set -u in phase scripts conflicts with harness shell snapshot's $ZSH_VERSION
      reference — switched all phase scripts to set -eo pipefail
    - grep '\\-' inside [] is parsed as a range in strict-mode subshells; hyphens
      must go at start of character class
    - uv run emits 'Installed N packages' to stderr — phase5-audit-clean must capture
      stdout only to avoid corrupting JSON parse
    - Pages CDN can lag the deploy — phase 9 catches this; release.sh dropped --skip-build
      so the deploy rebuilds with the new tag
    - tag identity issue — release.sh now uses git config user.email with fallback
      to noreply alias
    - AGENTS.md license section needs the literal phrase 'historical commits and tags'
      for phase 6 safeguard to pass
    next_recommended_action: Open dist/dashboard.html locally, visit 04 Strategy and
      01 Models tabs. On 04, verify the legend block reads correctly (full axis labels
      visible — no clipping; 50 ring emphasized amber; rubric table includes the new
      51-60 boost-band footer). On 01, hover Opus 4.7's medium cell with Opus 4.7
      as reference (polygons should overlap exactly), then hover the same row's max
      cell (Coding/Reasoning vertices should extend visibly past the 50 ring into
      the boost band with red blips). When satisfied, say 'cut a minor release' to
      trigger the 10-phase walk for v0.4.0.
    open_processkit_workitem_for_followup_tooling: 'Worth creating a v0.4.1+ WorkItem
      to file the upstream bugs against processkit: (a) create_process_instance not
      writing process_definition_artifact, (b) phase6 docs-paths gap, (c) phase9 Pages-CDN
      race.'
---
