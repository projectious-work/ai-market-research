# ai-market-research

[![Latest release](https://img.shields.io/github/v/release/projectious-work/ai-market-research?label=release&color=blue)](https://github.com/projectious-work/ai-market-research/releases/latest)
[![Live site](https://img.shields.io/badge/live-projectious--work.github.io-success)](https://projectious-work.github.io/ai-market-research/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A static intelligence report tracking the AI model and tooling landscape,
focused on the decisions an AI infrastructure-oriented developer actually
has to make: which models and configurations to use, which subscriptions to
hold, which agent harness to run, and what to self-host.

**Live dashboard:** <https://projectious-work.github.io/ai-market-research/>
**Latest release:** <https://github.com/projectious-work/ai-market-research/releases/latest>
([v0.3.1](https://github.com/projectious-work/ai-market-research/releases/tag/v0.3.1))

---

## What it tracks

1. **Current model roster** — a concise view of Anthropic, OpenAI, Google,
   xAI, Meta, Mistral, Cursor, and major Chinese labs. The default view shows
   representative models rather than every sibling release.
2. **Model configurations** — provider-native reasoning controls such as
   effort, thinking levels, token budgets, modes, and speed variants. Claude
   Fable 5 is the default reference for the v2 report.
3. **Speed evidence** — time to first token, output throughput, and end-to-end
   task latency are treated as separate dimensions. Vendor claims and unknown
   values are labelled instead of being presented as comparable measurements.
4. **Quota burn cross-matrix** — the existing model by reasoning-effort cost
   analysis remains available while the v2 configuration schema is evaluated.
5. **Agent harnesses** — Claude Code, OpenCode, Codex CLI, Gemini CLI,
   Aider, Cline, Roo Code, Cursor, Windsurf, Goose, OMO, OpenClaw, CCR,
   Hermes.
6. **Self-hosting** — Vast.ai cloud-GPU configs, MacBook configs (M4 Pro
   64 GB, M5 Max 128 GB, Air 32 GB), open-weight models (Gemma 4, Qwen 3,
   Llama 3.1, MiniMax M2.5, DeepSeek V3.2), quantization formats,
   frameworks (llama.cpp, vLLM, Ollama, MLX).
7. **Strategy** — derived recommendations spanning the above.

## How it's built

- `data/market-state.json` — canonical JSON state (the truth).
- `data/model-roster-v2.json` — sourced v2 roster, inclusion policy,
  configuration controls, and speed methodology used by all prototypes.
- `src/dashboard.template.html` — single self-contained HTML scaffold
  with a `__MARKET_DATA__` placeholder.
- `src/prototypes/v2.template.html` — shared brand-aligned prototype renderer.
- `src/scripts/build.py` — substitutes the JSON into the template,
  producing `dist/dashboard.html`.
- `src/scripts/build-prototypes.py` — produces four design-review reports in
  `dist/prototypes/` from the same v2 roster.

The outputs are self-contained static HTML files. There is no JavaScript
framework, package-manager build chain, or runtime CDN dependency.

## Quickstart

Requires `python3`, `bash`, `git`, and (for deploys) the `gh` CLI.

```sh
# Build the dashboard
bash src/scripts/build.sh

# Validate JSON + rebuild + sanity-check the artifact
bash src/scripts/release-check.sh

# Open the current report
xdg-open dist/dashboard.html

# Review the four v2 design directions
xdg-open dist/prototypes/index.html
```

## Deploy

GitHub Pages, fed from the `gh-pages` branch via a local script (no GitHub
Actions). Architecture: [DEC-20260517_1455-DeftLynx](context/decisions/DEC-20260517_1455-DeftLynx-v0-2-0-deployment-local-deploy.md).

```sh
bash src/scripts/deploy.sh
```

The script builds, stages `dist/` as the Pages payload, pushes via
`git worktree` to `gh-pages`, and idempotently enables Pages on first run.
Authentication uses `gh auth token`, so no global git credential helper
is required.

## Release

Releases follow the repository's phased release process. Start with the
process definition referenced in `AGENTS.md`; the release orchestrator can
then run individual phases or a validated full sequence:

```sh
bash src/scripts/release.sh --list
bash src/scripts/release.sh --phase 0
```

Do not cut a version directly before the release gates have been evaluated.

## Repository layout

```
.
├── data/              # market-state.json + daily archives
├── src/
│   ├── dashboard.template.html
│   ├── prototypes/v2.template.html
│   ├── dashboard-context.md   # project profile + tracked dimensions
│   ├── sources.md             # canonical URLs the briefing checks
│   ├── briefing-prompt.md     # the agent prompt that refreshes data/
│   └── scripts/{build,release-check,deploy,release}.sh
├── dist/              # built dashboard.html (gitignored output)
├── context/           # processkit project context (decisions, logs, …)
├── AGENTS.md          # provider-neutral agent instructions
└── LICENSE
```

## Contributing

This is a personal-research tool maintained for one user's decision-making
context, but the code is MIT-licensed — fork it freely if the structure is
useful as a template for your own market-watching dashboards.

## License

Unless otherwise noted, the copyright holder grants the
[**MIT License**](LICENSE) for **all versions of this repository,
including historical commits and tags**. The full license text is in
[LICENSE](LICENSE). © 2026 projectious.

<!-- pk-release-license-note -->
<!-- This block is verified during the release process (phase 6,
     release-docs-current). The license name above must match
     LICENSE's first line; the phrase "historical commits and tags"
     must be present. Keep both intact when editing this section. -->
