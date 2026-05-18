# AI Market Briefing — Project Context

## What this repo is

A self-updating intelligence dashboard tracking the AI model and
tooling landscape, focused on the kinds of decisions an AI
infrastructure–oriented developer actually has to make. A local cron
job invokes `claude -p` daily against `briefing-prompt.md` to update
`dashboard.html`.

## Reader profile

The dashboard targets a technically sophisticated developer with an AI
infrastructure focus. Maintain the briefing as if writing for that
audience — keep numbers precise, lead with the trustworthy benchmarks,
and never assume the reader hasn't already noticed an inconsistency.

- Primary interactive coding tool: **Claude Max 5×** ($100/mo) class
  subscription.
- Self-hosted GPU reference setup: **2× A6000 (96 GB VRAM total)** on
  Vast.ai (Docker-based, no upfront capex). Use this as the "what fits
  on consumer-grade cloud GPU" anchor when discussing self-hosted
  models.
- Comparison context: dual-subscription scenarios (e.g. Claude Max +
  OpenAI Pro) and Apple Silicon laptops (M4 Pro 64 GB, M5 Max 128 GB,
  Air 32 GB) for local inference.
- Runtime environment: Claude Code in Docker dev containers (host-side
  cron is not available from inside the container — see the runner /
  schedule notes below).
- Focus area: agentic multi-model systems and rigorous benchmark
  interpretation; if a vendor's number looks too clean, surface the
  qualification rather than the headline.

## Investigation aspects tracked

1. **Frontier models** — subscriptions, API pricing, benchmarks (esp. SWE-bench Pro), quota burn vs Opus 4.7, context windows, automated agent ToS. Full OpenAI GPT family tracked: 5.5, 5.5 Pro, 5.4, 5.4 Mini, 5.4 Nano, 5.3-Codex, 5.3-Codex-Spark, 5.2, plus legacy Codex variants behind a filter.
2. **Quota burn cross-matrix** — sub-section of Models tab. Model × reasoning-effort matrix for OpenAI (`/effort` levels), Anthropic (extended thinking), Google (thinking budgets). Baseline = GPT-5.5 medium = 1.00×. Tracks `data.quota_burn_matrix` in JSON.
3. **Agent harnesses** — Claude Code, OpenCode, Codex CLI, Gemini CLI, Aider, Cline, Roo Code, Cursor, Windsurf, Goose, OMO, OpenClaw, CCR, Hermes
4. **Self-hosting** — Vast.ai cloud GPU configs, MacBook configs (M4 Pro 64GB, M5 Max 128GB, Air 32GB), open-weight models (Gemma 4, Qwen 3, Llama 3.1, MiniMax M2.5, DeepSeek V3.2), quantization formats, frameworks (llama.cpp, vLLM, Ollama, MLX)
5. **Strategy** — derived recommendations spanning the above

## Reference model

Default reference for quality % comparisons: **Opus 4.7** (switchable in UI to Sonnet 4.6, GPT-5.4, Haiku 4.5, etc.).

## Key principles to preserve in updates

- **SWE-bench Verified is contaminated** (~80–89% scores). SWE-bench Pro is the trustworthy benchmark. Always show both, but lead with Pro.
- **Subscriptions beat API for power users** because cache reads are flat-rate. Don't drop this point.
- **Memory bandwidth is the bottleneck** on Apple Silicon, not compute.
- **MoE models** (active vs total params) deliver better quality-per-VRAM than dense.
- **`claude -p` is first-party** — subscription-eligible, not API-only.
- **Anthropic OAuth blocked third-party harnesses on April 4, 2026** — affected: OpenCode, Goose, Cline, Roo Code with OAuth. API key still works.
- **Jurisdiction matters** — track US / EU / China per model, surface in UI.
- **Codex pricing migrated to token-based on April 2, 2026** — burn matrix ratios derive from API list pricing, not per-message averages. Update accordingly when prices shift.
- **Reasoning tokens count as output** — that's why high/xhigh effort burns so much (output is ~6× input price).

## Burn matrix maintenance

When models change, update both `data.models` AND `data.quota_burn_matrix`:

- New OpenAI or Anthropic model → add row with effort-level multipliers (low/medium/high/xhigh; Anthropic adds max). Compute `medium` cell as `(api_in × 0.3 + api_out × 0.7) / (5 × 0.3 + 30 × 0.7)` to ground it in API pricing relative to the unit anchor (gpt-5.5 medium = 1.00). Then scale: low ≈ 0.4×medium, high ≈ 1.7×medium, xhigh ≈ 2.7×medium, max ≈ 5×medium (Anthropic only).
- New Google model → add to `google_matrix` with `off / low / medium / high` budget tiers.
- **Effort vocabulary is shared between OpenAI and Anthropic**: low/medium/high/xhigh. Anthropic Opus 4.7 also has 'max' (~5× medium, ~2× xhigh). Sonnet 4.6 has low/medium/high/max but no xhigh. Haiku 4.5 has no effort control.
- Anthropic's old API (`thinking: {type: "enabled", budget_tokens: N}`) is **deprecated since Opus 4.6**. Adaptive thinking via effort is the current model. Don't model the old budget_tokens API anywhere.

## Unit anchor vs displayed reference (v1.2.1+)

The burn matrix uses two distinct concepts that the daily briefing job MUST keep distinct:

1. **Unit anchor (stored values)** — every cell in `openai_matrix`, `anthropic_matrix`, `google_matrix` stores an absolute burn value anchored to `gpt-5.5 medium = 1.00`. This anchor NEVER changes — it's the unit of storage. If GPT-5.5 is replaced as the SWE-Pro leader, the unit anchor still stays at "gpt-5.5 medium" so daily archives remain numerically comparable across time.

2. **Displayed reference (UI dropdown)** — the user picks a reference model in the top-right dropdown. At render time, every displayed burn ratio is computed as `stored_value / reference_model_unit`. This is purely a display transform — the JSON values don't change.

**What this means for the briefing job:**
- When updating burn values, always compute them against gpt-5.5 medium = 1.00, not against whatever reference happens to be selected in the UI.
- Never try to "rebase" the matrix to a new anchor. The whole point of separating unit anchor from displayed reference is that the daily archives stay comparable.
- Avoid hardcoded text like "0.5× of GPT-5.5 medium" in row notes — when the user picks a different reference, that text becomes stale. Instead, use neutral framing like "fixed-rate model" or "deprecated for new work."

## Efficiency leaders panel (v1.2.0+)

The Models tab includes an Efficiency Leaders panel below the burn matrix. It auto-derives top 10 cross-provider model+effort combinations from the matrix and the effort_quality_factors. The daily briefing job does not need to maintain this panel directly — it updates automatically whenever burn values, model SWE-Pro scores, or effort_quality_factors change.

- `data.quota_burn_matrix.effort_quality_factors` stores the assumed quality multipliers per effort level. Defaults: minimal=0.65, low=0.80, medium=0.92, high=0.98, xhigh=1.00, max=1.00. Adjust if community measurements change (kentgigger, productcompass, mindstudio are the sources). A change here propagates through every quality % in the dashboard and re-ranks the leaders panel.
- Quality % per cell = `(model_swe_pro / reference_swe_pro × effort_quality_factor) × 100`.
- Efficiency score = `displayed_burn ÷ (quality / 100)`, where displayed_burn is post-reference-division.

## Task-fit recommendations (v1.3.0+)

The Strategy tab includes a Task-fit Recommendations table: 10 task types × 4 providers (Anthropic / OpenAI / Google / Self-hosted), one pick per cell with runner-ups surfaced on click.

`data.strategy.task_fit.rows[]` — each row has `task`, `description`, `recommendations` (keyed by provider), and `runner_up_per_provider` (keyed by provider). Each recommendation has `model_id`, `effort`, and `rationale`. The burn × ratio shown in each cell is derived from the burn matrix at render time, so it follows the reference dropdown automatically.

**Maintenance principle**: when refreshing daily, the briefing job reconsiders the full roster for each row × provider combination. Picks shift as models improve, prices drop, or new releases arrive. The roster is the *pool* the briefing chooses from; the table shows the *picks*. Runners-up document what was considered but not picked.

- If a new model is released, add it to `data.models` and then reconsider every task-fit row's recommendations against it.
- If a recommended model is deprecated or removed, find every task-fit cell that references it and pick a replacement from the roster.
- Empty cells (e.g. "self_hosted: not recommended for hard debugging") are intentional — they say "no model in this category meets the bar for this task." If a new open-weight model changes that, flip the cell.
- Effort levels in recommendations should be defensible: minimal/low for trivial tasks, medium for normal work, high/xhigh for hard tasks, max only for autonomy. Don't recommend xhigh for "tiny edits" — that's a quality signal that something is off.

## Capability radar — 6-axis rubric (v0.3.0+)

The **04 Strategy** tab carries a capability radar chart for the
chosen models versus the reference. Each model gets six 1-5 ratings
in `data.models[].capability_levels`. **Sage rates each new frontier
or fast model on these 6 axes during the daily briefing** using the
rubric below. Ratings should cite a primary source where possible
(the citations gate in the release process expects this).

The schema lives at `data.capabilities`:
- `axes`: ordered list of 6 axis definitions (key + label + short)
- `level_labels`: short name per level per axis (rendered in the UI)
- `focus_presets`: weight vectors for one-click focus boosting
  (`Balanced` + one per axis at weight 2.0)
- `methodology`: short prose summary (full rubric is in this file)

The accepted DecisionRecord for this section is
`DEC-20260518_1038-PolishedOak-6-axis-capability-taxonomy-weighted-radar`.

### Composite formula

```
composite(model, weights) = Σ (weight[axis] × level[axis]) / Σ (weight[axis] × 5)
```

Result is 0.0–1.0 (displayed as 0–100 %). The dashboard shows both
absolute composite and ratio-to-reference. Missing axis values
(`null`) are excluded from both numerator and denominator so partial
ratings still render a partial polygon.

### Per-axis rubric (level 1 = none/basic, level 5 = frontier)

**1. Coding** — implement, debug, refactor production code.
| Level | Name | Means |
|---|---|---|
| 1 | Snippet | Single-file syntax fixes, regex replacements, formatting, docstrings, import sorting |
| 2 | Standard | Single-function implementation, straightforward bug fixes, simple feature additions, boilerplate tests + fixtures |
| 3 | Cross-file | Features spanning 3-10 files, cross-file context, parameterised test suites, mocking, mid-debug |
| 4 | Hard | Race conditions, performance bottlenecks, refactors with long-term implications, deep debugging in unfamiliar code |
| 5 | Frontier | Novel algorithms, framework-level design + implementation, large-repo modernisation, codebase-scale rewrites |

Anchor benchmarks: SWE-bench Pro (preferred), SWE-bench Verified
(qualified — contaminated), LiveCodeBench. Cite the exact benchmark
value supporting the rating.

**2. Reasoning & Architecture** — design systems, hard logic, math, multi-step planning.
| Level | Name | Means |
|---|---|---|
| 1 | Apply known | Single-step reasoning, well-known templates, basic if/else |
| 2 | Multi-step | Trade-off awareness within one domain, applies patterns to new contexts, single-service design |
| 3 | Cross-cutting | Multi-service architecture, names alternatives with tradeoffs, plans across hours |
| 4 | Novel system | Distributed/concurrent reasoning, performance modelling, plans across days/weeks |
| 5 | Research-grade | Proves correctness, designs novel paradigms, cross-domain synthesis, identifies open problems |

Anchor benchmarks: AIME, hard-reasoning evals, public system-design
evaluations.

**3. Knowledge & Research** — depth, synthesis, frontier awareness.
| Level | Name | Means |
|---|---|---|
| 1 | Recall | Well-known facts, common APIs, standard library knowledge |
| 2 | Contextual | Accurate citation when sources provided, summarises a corpus correctly |
| 3 | Cross-domain | Distinguishes consensus from controversy, identifies tradeoffs from training, names primary sources |
| 4 | Frontier | Current state-of-art across multiple domains, synthesises novel positions, calibrated uncertainty |
| 5 | Original | Identifies open problems, generates novel insights, research-grade literature review |

Anchor benchmarks: MMLU-Pro, GPQA, model-card knowledge-cutoff
claims, community-validated SOTA awareness on specific topics.

**4. Communication & Docs** — write, explain, diagram, code-review prose for humans.
| Level | Name | Means |
|---|---|---|
| 1 | Grammatical | Comprehensible, no syntax errors |
| 2 | Structured | Audience-appropriate tone, code comments explain WHY not WHAT, basic READMEs |
| 3 | Tutorial | Multi-audience adaptation, prose builds mental models, diagrams in text form |
| 4 | Editorial | Technical writing that survives editing, pedagogical pacing, explains tradeoffs |
| 5 | Publishable | Generative explanations, original framings, would pass a serious editor |

Anchor: human-pref prose-evaluation rounds (LMArena, custom A/B tests
on technical writing), structural quality on long-form output.

**5. Multimodal** — see, hear, produce non-text artefacts.
| Level | Name | Means |
|---|---|---|
| 1 | Text only | No image/audio/video input or output |
| 2 | Image-in | Describes screenshots, reads alt-text-style content |
| 3 | Image reasoning | Interprets diagrams, charts, UI mocks, code-from-screenshot |
| 4 | Video/audio | Multi-image / video / audio understanding (sequence reasoning, transcription) |
| 5 | Cross-modal gen | Produces images, diagrams, audio, or video from text |

Anchor: model-card declared modality support; published benchmark
performance on image/document QA.

**6. Agentic** — model-side coherence and calibration *with harness held constant*.
The harness contribution (loop infrastructure, tool catalog, memory,
sandbox, subagents) is scored separately on the **02 Harnesses** tab.

| Level | Name | Means |
|---|---|---|
| 1 | Single-turn | Holds goal only within one response; no tool use |
| 2 | Tool calls | Reliable tool selection + arg formatting + result parsing |
| 3 | Plan coherence | Maintains goal across ~10 turns without drift; light self-correction |
| 4 | Self-correcting | Notices own errors, asks vs. ploughs on, refuses ambiguous-but-risky paths |
| 5 | Long-horizon | Sustains goal across 100+ turns, calibrated stopping, refusal hygiene under context accumulation |

Anchor: tau-bench, SWE-bench Pro (uses a fixed agent harness), agent-loop
transcripts from a Claude-Code-class harness baseline. **Always cite
the harness used** — same model in different harnesses gets different
observed autonomy.

### Calibration anchors (frozen, 2026-05-18)

- **Coding 5** = Opus 4.7 (64.3% SWE-Pro), GPT-5.5 Pro (~58.6%), DeepSeek V4-Pro (~55%)
- **Reasoning 5** = Mythos Preview, GPT-5.5 Pro, Opus 4.7
- **Multimodal 5** = Gemini 3.1 Pro (only model currently rated 5 — video + cross-modal gen)
- **Agentic 5** = Opus 4.7 (only model currently rated 5)
- **Comms 5** = Opus 4.7
- **Knowledge 5** = GPT-5.5, GPT-5.5 Pro, Gemini 3.1 Pro, Mythos, Opus 4.7

If a new model exceeds one of these anchors on the relevant benchmark,
bump the anchor: that model gets the 5, the displaced anchor drops to 4
on that axis. Cite the bump in the changelog.

### When ratings are unknown

Use `null` for unrated axes. The radar renders partial polygons; the
composite formula skips null axes from both numerator and denominator
(so a model rated only on 4 of 6 axes still gets a fair composite
out of its rated dimensions). Tier-2 models (legacy) stay null until
back-filled.

## File map (post v9 refactor, 2026-05-15)

```
.
├── src/
│   ├── briefing-prompt.md         # Instructions Sage follows daily
│   ├── dashboard-context.md       # This file (the prototype's CLAUDE.md, renamed)
│   ├── sources.md                 # URLs to check during research
│   ├── dashboard.template.html    # HTML scaffold; contains __MARKET_DATA__ placeholder
│   └── scripts/
│       ├── build.sh / build.py    # Compose dist/dashboard.html from template + data
│       ├── run-briefing.sh        # Daily runner: archive → claude -p → build → commit
│       └── split_prototype.py     # One-shot: split v9 prototype into template + data (historical)
├── data/
│   ├── market-state.json          # Canonical JSON state — Sage edits this
│   └── archive/
│       └── YYYY-MM-DD.json        # Daily snapshots (data only; ~85 KB each)
├── dist/
│   └── dashboard.html             # Build output — viewable artifact
├── context/                       # processkit entities (Scope, Roles, TeamMembers, DECs)
└── input/briefing-package-v9/     # Historical prototype, untouched after split
```

## Operational notes

- **Build step**: `bash src/scripts/build.sh` composes `dist/dashboard.html` from `src/dashboard.template.html` + `data/market-state.json`. The template carries the single placeholder `__MARKET_DATA__`; the build minifies JSON before substitution.
- **Daily runner**: `bash src/scripts/run-briefing.sh` archives the current snapshot, invokes `claude -p` against `src/briefing-prompt.md` (default model: Sonnet 4.6), validates JSON, rebuilds, and commits. Pushes only when `RUN_BRIEFING_PUSH=1`.
- **Daily run target time**: ~10 minutes of research; subscription-eligible via `claude -p`.
- **Failure safety**: any failure exits non-zero before the git commit. The pre-run archive snapshot ensures yesterday's state is recoverable.
- **No GitHub Actions**: the prototype's `.github/workflows/daily-briefing.yml` is intentionally absent — the schedule is local, owned by a processkit Artifact, and triggered by host-side cron / systemd. See DEC-20260515_1930-HopefulPlum.

## Team (processkit-managed maintainers)

- **Sage** (`TEAMMEMBER-sage`, research-scientist/senior, default
  Sonnet 4.6) — daily refresh, JSON updates, executive summaries.
- **Kai** (`TEAMMEMBER-kai`, software-engineer/senior, default Sonnet
  4.6 / Codex Spark for bounded coding passes) — template, build
  script, runner, archive plumbing, schedule artifact.
- **Cora** (`TEAMMEMBER-cora`, product-manager/senior, default Sonnet
  4.6 / GPT-5.5 for review) — cadence, prioritisation, weekly review.
- **Project owner** (human, principal) — strategic direction and
  deployment decisions. Cora escalates to the owner; the owner's
  identity is intentionally not named in this public source file.

## Update cadence

- **Daily**: model/policy/harness deltas, changelog append, executive
  summary refresh. Owned by Sage.
- **Weekly** (manual review): trends, headline stats sanity check,
  strategy recalibration. Owned by Cora.
- **On major release** (e.g., new frontier model): manual review of
  `executive_summary` and `strategy.current_recommendation`. Cora
  escalates to the project owner.
