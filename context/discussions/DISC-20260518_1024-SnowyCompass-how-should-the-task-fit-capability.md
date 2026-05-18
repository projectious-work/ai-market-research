---
apiVersion: processkit.projectious.work/v2
kind: Discussion
metadata:
  id: DISC-20260518_1024-SnowyCompass-how-should-the-task-fit-capability
  created: '2026-05-18T10:24:49+00:00'
  updated: '2026-05-18T10:38:35+00:00'
spec:
  question: 'How should the task-fit / capability section of the dashboard be restructured:
    which 5–7 capability categories, what does each level mean, and how do we render
    this as a weighted radar chart with a user-selectable focus axis?'
  state: resolved
  opened_at: '2026-05-18T10:24:49+00:00'
  participants:
  - TEAMMEMBER-thrifty-otter
  - TEAMMEMBER-cora
  - TEAMMEMBER-sage
  - TEAMMEMBER-kai
  - TEAMMEMBER-atlas
  closed_at: '2026-05-18T10:38:35+00:00'
---

## Background

The current task-fit table on the **04 Strategy** tab has two real problems
(as flagged by the project owner, 2026-05-18):

1. The composite quality % shown on the **01 Models** tab is useful as
   an at-a-glance number, but it's a single benchmark-derived value
   (SWE-Pro ratio) that can't answer "is it good at *architecture*?"
   versus "is it good at *coding*?" Both collapse to one number.
2. The task-fit table's 10-row capability list is too coding-focused,
   has inconsistent abstraction levels (mixing *what* a capability is
   with *how autonomous* the work is), and at ~10 rows is unsuitable
   for a radar-chart visualisation. Empirically, radar charts work best
   at 5–7 axes; 6 is the sweet spot.

This discussion lands on (a) a 6-axis capability taxonomy, (b) a
1–5 level rubric per axis, (c) a radar-chart design for the dashboard,
and (d) a weighted-composite scoring formula with a user-selectable
focus axis.

---

## Critical review of the owner's 8-category list

| # | Owner's category | Verdict | Reason |
|---|---|---|---|
| 1 | Coding | **keep — anchor** | Primary use case. Need to deconflict levels (see below). |
| 2 | Architectural Tasks | **keep — separate axis** | Distinct skill: system thinking, trade-offs, design. Not just "harder coding". |
| 3 | Project Management & Planning | **drop** | Thin slice for AI-model selection; most users don't pick a model for PM. Folds partly into Architectural (long-horizon planning) and partly into Communication. |
| 4 | Security & Supply Chain | **drop as standalone, surface as a coding-level boost** | Narrow specialisation. Mythos / Cyber variants are the few models that excel; better treated as a per-model tag than a universal axis. |
| 5 | Multi-Modality | **keep** | Genuinely orthogonal — image/audio/video understanding + generation. |
| 6 | Research & Development | **rename + keep** | Becomes "Knowledge & Research" — domain depth, synthesis, frontier awareness. |
| 7 | Data Management | **fold into Coding + Research** | Most data work is either pipeline code (Coding) or analysis/synthesis (Research). |
| 8 | Text (documentation/explanation/diagramming) | **rename + keep** | Becomes "Communication & Docs" — writing, code-review prose, explainers, diagrams. |

The owner's coding levels also mixed concerns: level 5 ("overnight
runs, agentic loops, tasks you don't supervise") isn't a coding
*difficulty* — it's an **autonomy** mode that applies to any axis.
Separating that out lets us have a clean 6th axis.

---

## Counter-proposal: 6 capability categories

| # | Category | The high-level question it answers |
|---|---|---|
| 1 | **Coding** | "Can it implement, debug, refactor production code?" |
| 2 | **Reasoning & Architecture** | "Can it design systems, reason about trade-offs, do hard logic/math, plan multi-step?" |
| 3 | **Knowledge & Research** | "Does it have depth, can it synthesise across domains, distinguish consensus from frontier?" |
| 4 | **Communication & Docs** | "Can it explain to humans — write, review, diagram, document?" |
| 5 | **Multimodal** | "Can it see, hear, and produce non-text artefacts?" |
| 6 | **Agentic Autonomy** | "Can it run unsupervised over long horizons, recover from errors, use tools well?" |

This is 6 axes, each a distinct decision question, each separately
ratable, and each renderable on a radar.

The owner's "Code review", "Documentation", "Testing" sub-bullets
under Coding split cleanly across this set:
- **Code review prose** → Communication & Docs
- **Documentation / explainers / tutorials** → Communication & Docs
- **Testing scaffolds / fixtures / parameterised suites** → Coding
  (a coding sub-skill, included in levels)

---

## Per-category level rubric (1 = none/basic, 5 = frontier)

### 1. Coding
- **1 — Snippet:** single-file syntax fixes, regex replacements, formatting, docstrings, import sorting, copy-paste from docs
- **2 — Standard:** single-function implementation, straightforward bug fixes, simple feature additions, boilerplate tests + fixtures
- **3 — Cross-file:** features spanning 3–10 files, requires cross-file context, parameterised test suites, mocking
- **4 — Hard:** race conditions, performance bottlenecks, refactors with long-term implications, deep debugging in unfamiliar codebases
- **5 — Frontier:** novel algorithms, framework-level design implementation, large-repo modernisation, codebase-scale rewrites

### 2. Reasoning & Architecture
- **1 — Apply known patterns:** single-step reasoning, follows well-known templates, basic if/else logic
- **2 — Multi-step in-domain:** trade-off awareness within a single domain, applies patterns to new contexts, single-service design
- **3 — Cross-cutting design:** multi-service architecture, names concrete alternatives with tradeoffs, long-horizon planning over hours
- **4 — Novel system design:** distributed/concurrent reasoning, performance modelling, plans over days/weeks
- **5 — Research-grade:** proves correctness, designs novel paradigms, cross-domain synthesis, identifies open problems

### 3. Knowledge & Research
- **1 — Recall:** well-known facts, common APIs, standard library knowledge
- **2 — Contextual synthesis:** accurate citation when sources are provided, summarises a given corpus correctly
- **3 — Cross-domain depth:** distinguishes consensus from controversy, identifies tradeoffs from training, names primary sources
- **4 — Frontier awareness:** current state-of-art across multiple domains, synthesises novel positions, calibrated uncertainty
- **5 — Original analysis:** identifies open problems, generates novel insights, research-grade literature review

### 4. Communication & Docs
- **1 — Grammatical:** comprehensible output, no syntax errors
- **2 — Structured:** audience-appropriate tone, code comments that explain WHY not WHAT, basic READMEs
- **3 — Tutorial-quality:** multi-audience adaptation, prose explanations build mental models, diagrams in text form
- **4 — Editorial:** technical writing that survives editing, pedagogical pacing, explains tradeoffs as well as choices
- **5 — Publishable:** generative explanations, original framings, would pass a serious editor

### 5. Multimodal
- **1 — Text only:** no image/audio/video input or output
- **2 — Image understanding:** describes screenshots, reads alt-text-style content from images
- **3 — Image reasoning:** interprets diagrams, charts, UI mocks, code-from-screenshot tasks
- **4 — Multi-image / video / audio understanding:** reasons about a sequence, transcribes audio, watches a clip
- **5 — Cross-modal generation:** produces images, diagrams, audio, or video from text

### 6. Agentic Autonomy
- **1 — Single-turn:** Q&A only, no tool use
- **2 — Simple tools:** one-shot retrieval/search/calc, structured outputs
- **3 — Multi-step:** orchestrates several tools, basic error recovery, plan → execute → revise
- **4 — Long-horizon loops:** sustains a goal across many turns, recovers from unfamiliar failures, knows when to ask
- **5 — Overnight runs:** can be left alone for hours/days, handles unexpected branches, halts safely on ambiguity

The 5-point scale is intentional: granular enough to differentiate
Sonnet from Opus, coarse enough that Sage can rate every model in
the daily briefing without false precision.

---

## Radar chart implementation

### Where to use it

**Primary: 04 Strategy.** Replace the current task-fit table (or
add the radar above it; table-as-detail under the chart). Show:
- One radar per recommended-stack model, overlaid with the selected
  reference model in a contrasting colour
- 6 axes, scale 0–5, with the user's weighting visualised as axis
  emphasis (heavier-weighted axes get a longer tick mark or a thicker
  axis line)
- A computed composite score in the centre of each chart

**Secondary use in 01 Models — recommend not yet.** The cross burn
matrix is model × effort cost; layering a radar there would clutter.
Better: add a small radar to the *selected reference model* card
(below the dropdown) so the user always sees what reference they're
comparing against.

### Rendering tradeoff

Pure SVG, no chart library. The dashboard is a single self-contained
HTML — adding D3 or Chart.js breaks that. ~60 lines of JS draw 6
axes + the radar polygon + an overlay polygon, fully responsive.

### Data shape (additions to `data/market-state.json`)

```json
"capabilities": {
  "axes": ["coding", "reasoning", "knowledge", "comms", "multimodal", "agentic"],
  "level_labels": {
    "coding":     {"1": "Snippet", "2": "Standard", "3": "Cross-file", "4": "Hard", "5": "Frontier"},
    "reasoning":  {"1": "Apply known", "2": "Multi-step", "3": "Cross-cutting", "4": "Novel system", "5": "Research-grade"},
    ...
  }
},
"models": [
  {
    "id": "opus-4.7",
    "capability_levels": {
      "coding": 5, "reasoning": 5, "knowledge": 5,
      "comms": 5, "multimodal": 3, "agentic": 4
    },
    ...
  }
]
```

### Composite score formula (weighted)

```
composite(model, weights) =
  Σ (weight[axis] × level[axis])  /  Σ (weight[axis] × 5)
```

Default weights = `{coding: 1, reasoning: 1, knowledge: 1, comms: 1, multimodal: 1, agentic: 1}` (equal). Returns 0–1 (display ×100 as %).

**User focus mechanism.** A "Focus" dropdown (or chip row) above the
radar: `Balanced | Coding-focused | Reasoning-focused | …`. Picking
"Coding-focused" sets `weights = {coding: 2.0, others: 1.0}`; picking
"Balanced" returns to 1s. Renders both the composite and the radar
emphasis. Cheap, no slider math, one click.

**Relative-to-reference variant.** The 01 Models tab already lets the
user pick a reference model. Same idea here: the composite can be
shown as either absolute (out of 100%) or *relative to reference*
(`composite(model) / composite(reference)`). I'd offer both — absolute
in the radar centre, relative in the table row beside it.

---

## Data-collection burden (the honest cost)

Adding 6 capability levels to every model means **23 models × 6 axes
= 138 ratings**. Sage's daily briefing now has a new responsibility:
rate each model on this rubric. Two mitigations:

1. **Start with the top frontier models (~10).** Open-weight legacy
   stays at `null` (renders as a dashed/partial polygon on the radar)
   until back-filled.
2. **Document the rubric in `src/dashboard-context.md`** so each
   briefing run reproduces the same calibration. Without that, every
   refresh re-rates from scratch and the ratings drift.

The rubric also makes radar values fall under the **citations gate**
(phase 2 of the release process) — each rating should ideally cite
a benchmark or a primary source (e.g. SWE-Pro for Coding, AIME for
Reasoning, system-card claims for Multimodal). That keeps the radar
from being pure vibes.

---

## Open questions for the owner

1. **Drop Communication & Docs?** It overlaps slightly with Knowledge
   & Research output. Dropping it gives us a tighter 5-axis radar.
   Tradeoff: loses the "is it good at writing technical docs" axis
   which actually does separate models (Opus > Sonnet on prose).
2. **Surface Security/Cyber as a model tag?** Same approach the data
   already uses for jurisdiction — a small badge on the model card
   rather than a full axis. Lets the few cyber-specialised models
   (Mythos, GPT-5.5-Cyber) stand out without forcing every model to
   have a "security" rating.
3. **Focus dropdown granularity.** Offer 6 presets (one per axis) plus
   "Balanced", or also a "Custom" mode with sliders? Sliders give
   power, presets give clarity.
4. **Replace or augment the task-fit table?** The current table
   recommends *specific models per task per provider*. The radar
   answers a different question ("which model fits my profile
   overall"). Both could coexist — the table for "which model for
   this task", the radar for "which model for me, weighted to my
   priorities".

Once those land, the implementation order would be:
1. Schema additions to `data/market-state.json` + rubric in
   `dashboard-context.md` (this discussion → DEC → schema migration)
2. Sage back-fills the top 10 frontier models in the next briefing
3. Kai implements the SVG radar + composite formula + focus selector
4. Ships as a minor release (`v0.3.0`) — new tab/section is a
   minor-bump per the release-process scope rubric

This Discussion stays `active` while we converge; transitions to
`resolved` once we accept (or modify) the 6-axis taxonomy and level
rubric. The accepted shape will be recorded as a DecisionRecord, and
the schema change will go through a Migration as usual.

---

## Turn 2 — How much of "Agentic Autonomy" is model vs. harness?

**Owner's challenge (2026-05-18):** "How much of 'Agentic Autonomy'
is actually the model and how much is the harness driving the model?"

### Verdict

**Mostly harness, with a meaningful model-side residual that the
original axis was double-counting.**

#### What's really the harness (drop from the model axis)

- Loop infrastructure: resume, checkpoint, retry
- Tool catalog and sandbox boundaries
- Memory and context compaction (CLAUDE.md / AGENTS.md handling)
- Multi-agent orchestration (subagents, hooks, skills)
- Error scaffolding — what happens on a failed tool call
- OS interaction surface (file edits, terminal)

These are already scored on the **02 Harnesses** tab via the MCP /
Skills / Hooks / Subagents / Memory / Sandbox columns. Putting them
on the model radar would double-count.

#### What's genuinely model-side and worth rating

Holding the harness constant, models still differ on:

- **Plan coherence** — holding a goal across N turns without drift
- **Tool-call quality** — picking the right tool, formatting args
  correctly, parsing returns sensibly
- **Self-correction** — noticing own errors vs. compounding them
- **Calibrated stopping** — knowing when to ask vs. ploughing on,
  refusing ambiguous-but-risky paths
- **Refusal hygiene under long context** — not getting jailbroken by
  accumulated context

### Decision: rename + reframe axis 6

The 6th radar axis becomes **"Agentic"** (short label) — the model's
contribution to autonomous use, harness held constant. New levels:

| Level | Name | Meaning (model-side, harness constant) |
|---|---|---|
| 1 | Single-turn coherent | Holds goal only within one response |
| 2 | Reliable tool calls | Picks tools accurately, formats args correctly, parses results sensibly |
| 3 | Multi-step plan coherence | Maintains goal across ~10 turns without drift; light self-correction |
| 4 | Self-correcting + calibrated | Notices own errors, asks vs. ploughs on, refuses ambiguous-but-risky paths |
| 5 | Long-horizon coherent | Sustains goal across 100+ turns, calibrated stopping, refusal hygiene under context accumulation |

### Implications

1. **Effective autonomy = model's Agentic level × harness
   infrastructure quality.** Level-5 model + single-turn-only harness
   ≈ level 1 in practice. Level-2 model + top-tier harness is capped
   by the model.
2. **Future "stack composite"** combining model radar × harness
   scoring would give the true "what can I run overnight" answer.
   v0.4.0 territory; v0.3.0 just cleanly splits the concern.
3. **Briefing rubric implication for Sage.** Rate Agentic by reading
   agent-loop transcripts and benchmark rounds that hold harness
   constant (SWE-Pro style), not marketing copy. Each rating cites
   the harness used as evidence — keeps the phase-2 citations gate
   honest.

### Locked-in 6 axes (owner approved 2026-05-18)

After Turn 1 owner approval + Turn 2 axis-6 rename:

1. **Coding**
2. **Reasoning & Architecture**
3. **Knowledge & Research**
4. **Communication & Docs**
5. **Multimodal**
6. **Agentic** (renamed from "Agentic Autonomy")

The 4 Turn-1 open questions were all answered per Claude's
recommendation:
- Keep Comms & Docs (don't drop to 5 axes)
- Surface Security as a per-model tag, not an axis
- Focus mechanism: presets (one click)
- Radar augments the task-fit table, doesn't replace it

### Next steps

- Convert this Discussion into a DecisionRecord once axis-6 framing is
  acknowledged.
- Schema migration adds `capabilities` block to data and
  `capability_levels` to each model.
- Rubric goes into `src/dashboard-context.md` for Sage to follow.
- Sage back-fills the top 10 frontier models in the next briefing
  (rating Agentic against a Claude-Code-class harness baseline).
- Kai implements SVG radar + composite formula + focus selector.
- Ships as `v0.3.0` (minor — new section/data shape).
