---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260518_1038-PolishedOak-6-axis-capability-taxonomy-weighted-radar
  created: '2026-05-18T10:38:35+00:00'
spec:
  title: 6-axis capability taxonomy + weighted radar chart for task-fit, replacing
    single-number quality % on 04 Strategy
  state: accepted
  decision: 'Replace the existing single-number quality % (a SWE-Pro ratio) on the
    04 Strategy tab with a **6-axis capability radar chart** plus a weighted composite
    score with a user-selectable focus preset. The 6 axes are: (1) Coding, (2) Reasoning
    & Architecture, (3) Knowledge & Research, (4) Communication & Docs, (5) Multimodal,
    (6) Agentic. Each axis is rated 1–5 per a fixed rubric (stored in src/dashboard-context.md
    and surfaced in data.capabilities.level_labels). The radar is rendered as pure
    SVG (no chart-library dependency, ~60 lines of JS, fits the self-contained-HTML
    constraint). The current task-fit table is **augmented**, not replaced, because
    the table and radar answer different questions ("which model for this task" vs.
    "which model for me overall"). Security/cyber capability is surfaced as a per-model
    tag, not a 7th axis.'
  context: 'DISC-20260518_1024-SnowyCompass-how-should-the-task-fit-capability captured
    the analysis: the owner identified two problems with the existing task-fit section
    — (1) the single quality % can''t answer "good at coding vs. architecture" because
    it collapses to one SWE-Pro number, (2) the existing 10-row capability list mixes
    abstraction levels and is too coding-focused for a radar visualisation (sweet
    spot 5–7 axes, ideally 6). Turn 1 of the Discussion landed the 6 axes; Turn 2
    reframed axis 6 from "Agentic Autonomy" → "Agentic" (model-side coherence/calibration
    only) after the owner flagged that the original framing double-counted with the
    harness contribution already scored on the 02 Harnesses tab. All four Turn-1 open
    questions were answered per the recommended path: keep Comms & Docs (don''t drop
    to 5 axes); surface Security as a per-model tag, not an axis; focus mechanism
    = single-click presets (not sliders); radar augments the task-fit table, doesn''t
    replace it.'
  rationale: 'The single quality % is the right shape for the 01 Models table (a fast
    at-a-glance ranking) but the wrong shape for strategic fit (the 04 Strategy decision
    is multi-dimensional). 6 axes is the radar-chart sweet spot — 5 loses an axis
    users specifically asked for (Comms & Docs separates Opus from Sonnet on prose),
    7+ becomes visually noisy. Reframing the Agentic axis to be model-side only (plan
    coherence, tool-call quality, self-correction, calibrated stopping, refusal hygiene)
    keeps the abstraction clean: the 02 Harnesses tab already scores the infrastructure
    side (MCP / Skills / Hooks / Subagents / Memory / Sandbox) and re-rating that
    here would double-count. Per-model security tag rather than an axis: only 2–3
    models excel (Mythos, GPT-5.5-Cyber); forcing every model to carry a "security"
    rating produces noise on a dimension most users don''t decide on. Pure-SVG radar
    respects the project''s self-contained-HTML constraint; adding D3/Chart.js would
    break it. Composite formula `Σ(weight×level) / Σ(weight×5)` keeps the math simple
    and lets the focus preset trivially boost one axis to weight 2 while keeping others
    at 1.'
  alternatives:
  - option: Keep 8 axes from owner's original list
    rejected_because: Too many axes for a radar (visual noise past ~7); mixes abstraction
      levels (Coding-level-5 was actually an autonomy mode); Project Management and
      Data Management overlapped with other axes.
  - option: Drop Comms & Docs to land at 5 axes
    rejected_because: Comms & Docs genuinely separates Opus > Sonnet on prose; useful
      axis for the writing/documentation work the owner sometimes does.
  - option: Keep Agentic Autonomy as harness+model combined
    rejected_because: Double-counts the harness scoring already on the 02 Harnesses
      tab; produces ratings that drift based on harness assumption rather than model
      property.
  - option: Replace the task-fit table entirely with the radar
    rejected_because: The table answers 'which model for this task' (10 task types
      × 4 providers); the radar answers 'which model for me overall'. Different questions,
      both useful, low cost to keep both.
  - option: Per-axis weight sliders instead of presets
    rejected_because: Slider math is fiddly; 6 presets (Balanced + one per axis) cover
      the common cases with one click. Sliders can be added later as a 'Custom' mode
      if needed.
  - option: Use D3.js / Chart.js for the radar
    rejected_because: Breaks the self-contained-HTML constraint. Pure SVG ≈ 60 lines
      of JS, zero new dependencies.
  - option: Add a 7th 'Security & Supply Chain' axis
    rejected_because: Only 2-3 models excel (Mythos, GPT-5.5-Cyber); a per-model tag/badge
      surfaces this without forcing every model to carry a noise rating.
  consequences: '**Data shape.** A `capabilities` block joins data/market-state.json
    with the 6 axis names and per-axis level labels; each model gains a `capability_levels`
    block (6 integer values 1–5, or null for unrated). Requires a schema migration.
    Sage''s daily briefing gains a new responsibility — rate each frontier model on
    the 6 axes against the published rubric. **Briefing rubric goes in src/dashboard-context.md**
    so the rating calibration is reproducible across runs (and falls under the phase-2
    citations gate). **Initial back-fill scope: top ~10 frontier models.** Open-weight
    legacy stays null until back-filled; the radar renders partial polygons for null
    axes. **Effective autonomy is model_agentic_level × harness_infrastructure_quality.**
    v0.3.0 splits the concern; v0.4.0 may layer a ''stack composite'' on top once
    the split is proven. **Composite is shown both absolute (0–100% of theoretical
    max) and relative to the reference model** (matching the 01 Models pattern). **Focus
    presets**: Balanced + one preset per axis (e.g. Coding-focused = coding weight
    2.0, others 1.0). **Ships as v0.3.0** (minor — new section, new data shape) following
    the 10-phase release process. **Existing v0.2.x composite (SWE-Pro ratio) stays
    on the 01 Models tab unchanged** — radar adds capacity, doesn''t break the existing
    fast-ranking view.'
  deciders:
  - TEAMMEMBER-thrifty-otter
  - TEAMMEMBER-cora
  decided_at: '2026-05-18T10:38:35+00:00'
---
