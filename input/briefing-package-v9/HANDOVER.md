# Handover — AI Market Briefing

This package is a self-updating intelligence dashboard. You take it from here, drop it into a GitHub repo, configure one secret, and it runs daily forever.

## What you have

| File | Purpose |
|---|---|
| `dashboard.html` | The artifact. Single self-contained HTML file with embedded JSON. Open in any browser. |
| `briefing-prompt.md` | What Claude executes during each daily run. |
| `CLAUDE.md` | Project context (your profile, what to track, principles). |
| `sources.md` | Canonical URLs for the daily research. |
| `.github/workflows/daily-briefing.yml` | The cron schedule (06:00 UTC daily). |
| `scripts/run-briefing.sh` | Wrapper script the action executes. |
| `archive/` | Daily snapshots accumulate here. |
| `HANDOVER.md` | This file. |

## Setup — 10 minutes

### 1. Create the GitHub repo

```bash
# In this folder
git init
git add .
git commit -m "Initial briefing setup"
gh repo create ai-market-briefing --public --source=. --push
```

Public repo = unlimited Actions minutes. If you prefer private, you have 2,000 free minutes/month — plenty for a 10-min daily run (≈300 min/month).

### 2. Get an Anthropic API key

- Go to https://console.anthropic.com/settings/keys
- Create a new key, name it `github-actions-briefing`
- **Set a monthly spending cap at $30** in Plan & Billing → Cost limits. This is your safety net against runaway loops.
- Copy the key (starts with `sk-ant-…`).

### 3. Add the key as a GitHub secret

```bash
gh secret set ANTHROPIC_API_KEY
# Paste the key when prompted
```

Or via UI: Repo → Settings → Secrets and variables → Actions → New repository secret. Name: `ANTHROPIC_API_KEY`. Value: your key.

### 4. Test it manually

```bash
gh workflow run daily-briefing.yml
gh run watch
```

Or via UI: Actions tab → Daily AI Market Briefing → Run workflow.

The first run takes ~5–10 minutes. When it completes, `git pull` to see the updated `dashboard.html` and the new `archive/YYYY-MM-DD.html`.

### 5. (Optional) Host the dashboard on GitHub Pages

So you can bookmark it instead of pulling the repo:

- Repo Settings → Pages → Source: Deploy from branch → `main` / `/ (root)`
- Wait ~1 minute
- Visit `https://<your-username>.github.io/ai-market-briefing/dashboard.html`

Now the dashboard auto-updates daily and is one bookmark away. Mobile-friendly, no auth, no infrastructure.

## How the daily flow works

```
06:00 UTC daily
       │
       ▼
GitHub Actions triggers
       │
       ▼
Fresh Ubuntu runner spins up
       │
       ▼
Checkout repo · install Claude Code CLI
       │
       ▼
scripts/run-briefing.sh:
   - copies dashboard.html → archive/<yesterday>.html
   - runs `claude -p "$(cat briefing-prompt.md)"`
   - Claude reads current state from dashboard.html
   - searches the web for changes
   - updates the JSON inside dashboard.html
   - writes summary to .last-run-summary
       │
       ▼
Commit changes with summary as message · push
       │
       ▼
GitHub Pages auto-rebuilds (if enabled)
       │
       ▼
You read the dashboard with morning coffee
```

## Cost estimate

Per run: ~5–10 web searches + ~1 fetch + ~5k tokens output + ~30k tokens input from reading dashboard.html. Roughly:

- Input: 30k × $0.000015 = $0.45 (with cache: ~$0.05)
- Output: 5k × $0.000075 = $0.38
- Web search: ~10 × $0.01 = $0.10

**~$0.50–1.50 per run × 30 days = $15–45/month.** The $30 cap protects against runaway scenarios. Reduce by switching the prompt to use Sonnet 4.6 instead of Opus 4.7 if you want — change `briefing-prompt.md` to specify the model, or add `ANTHROPIC_MODEL=claude-sonnet-4-6` to the workflow env.

## Switching to Sonnet for cheaper runs

Edit `.github/workflows/daily-briefing.yml`, in the "Run daily briefing" step:

```yaml
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  ANTHROPIC_MODEL: claude-sonnet-4-6  # or whatever the current Sonnet model string is
```

This drops cost to roughly $5–10/month.

## Rolling back

Every run commits, so rollback is `git revert <commit>` or `git checkout <previous-commit> -- dashboard.html`. Daily archives in `archive/` are an additional safety net.

## Editing the dashboard manually

You can edit `dashboard.html` directly in any text editor. The JSON lives inside `<script id="market-data" type="application/json">…</script>`. The next daily run will use your edits as the new baseline.

If you want to change the **HTML/CSS/JS structure** (e.g., add a new tab, restyle), edit those parts of the file. The briefing prompt instructs Claude to only touch the JSON block.

## Troubleshooting

**Action fails with auth error** — Check the `ANTHROPIC_API_KEY` secret is set correctly.

**Action runs but no changes** — Check `.last-run-summary` in the workflow logs. Claude may have correctly found nothing changed, or there may be a research issue.

**Dashboard renders blank** — Open browser DevTools console. If you see "Unexpected token" in the JSON parse, a daily run produced malformed JSON. Roll back: `git checkout HEAD~1 -- dashboard.html`.

**Costs higher than expected** — Check Anthropic console → Usage. Confirm the $30 cap is set. Consider switching to Sonnet (above).

**Stale data** — The action only runs at 06:00 UTC. Trigger manually: `gh workflow run daily-briefing.yml`.

## Customisation hooks

- **Tracked items** — Edit `CLAUDE.md` (project context) and `sources.md` (URLs). The briefing prompt reads both.
- **Schedule** — Edit the `cron` line in `.github/workflows/daily-briefing.yml`. Cron syntax: `minute hour day-of-month month day-of-week`. `0 6 * * 1-5` would skip weekends.
- **Reference model default** — Edit `meta.reference_default` in the JSON inside `dashboard.html`. Or just use the dropdown in the UI per session.
- **What gets refreshed** — Edit `briefing-prompt.md`. Add or remove sections in "Step 2 — Research".

## Where this came from

This dashboard consolidates four prior chat investigations:

1. AI provider comparison (April–May 2026, conversation `f5ae3bca`)
2. Self-hosting LLMs / hardware × model fit (April 2026, conversation `5d841782`)
3. Multi-agent harness landscape (May 2026, conversation `b550582e`)
4. Agent harnesses comparison matrix (May 2026, conversation `97a8b2e8`)

The seeded data in `dashboard.html` reflects the synthesised state from those conversations as of 2026-05-08, with v1.1 adding the full OpenAI GPT family (5.5, 5.5 Pro, 5.4, 5.4 Mini, 5.4 Nano, 5.3-Codex, 5.3-Codex-Spark, 5.2, plus legacy Codex variants) and a Quota Burn Cross-Matrix section in the Models tab. Subsequent daily runs evolve it from there.

## Version history

- **v9** (2026-05-12) — Cache hit/miss modeling. Per-model `cache_discount` field captures provider cache pricing: Anthropic 10% (90% off), OpenAI 25% on 5.5 / 10% on 5.4 family, DeepSeek V4-Pro 0.83% (99.2% off — most aggressive in industry), DeepSeek V4-Flash 2%, MiniMax 52%, Mistral & Grok 100% (no published cache pricing). Workload presets in masthead control: Cold (0%) / Mixed (40%) / Warm (70%) / Hot (90%) cache hit rate. Burn matrix, Efficiency Leaders, and Task-fit Recommendations all honor the selected workload. Caveat on contested Anthropic subscription quota behavior (issue #24147) flagged in methodology notes.
- **v8** (2026-05-12) — Quality & burn matrix validation sweep. Effort quality factors refined against external benchmarks (Hex measurement, ArtificialAnalysis, ampcode, stet.sh): low=0.85, medium=0.94, max=1.02. Anthropic burn multipliers raised to match thinking-token budgets (high=5k tok, xhigh=10k, max=20k per DataCamp). OpenAI xhigh raised to 3.5× medium (per nxcode + OpenAI guidance). Sonnet 4.6 max raised to 3.5× (per ArtificialAnalysis: AA Intelligence Index cost). Added Mythos Preview row to Anthropic matrix. Methodology notes now cite primary sources and explicitly flag that quality-vs-effort is not strictly monotonic per task.
- **v7** (2026-05-12) — Market sweep. Critical Opus 4.7 pricing correction ($5/$25, not $15/$75) and SWE-Pro update to 64.3%. Added Anthropic Mythos Preview, GPT-5.5 Instant, GPT-5.5-Cyber. Self-hosting roster overhauled: DeepSeek V4-Pro, Qwen 3.6 Plus, Llama 4 Scout/Maverick, Kimi K2.6, GLM 5.1, Mistral Small 4. Added cybersecurity task-fit row.
- **v6** (2026-05-08) — Strategy tab adds Task-fit Recommendations: 10 task types × 4 providers with one pick per cell + click-to-reveal runners-up. Burn × follows reference dropdown.
- **v5** (2026-05-08) — Burn baseline now follows the reference dropdown. Switching reference (e.g. Opus 4.7 → Haiku 4.5) recomputes every displayed burn × ratio. Stored values stay anchored to gpt-5.5 medium for cross-time archive comparability.
- **v4** (2026-05-08) — Burn matrix cells redesigned with E2 encoding (numbers + stacked burn/quality bars). Added Efficiency Leaders panel: top 10 cross-provider model+effort combinations ranked by burn-per-quality-point.
- **v3** (2026-05-08) — Corrected Anthropic burn matrix: Claude Code uses adaptive thinking via `/effort` (low/medium/high/xhigh/max), not legacy `budget_tokens`. Effort vocabulary now shared with OpenAI, plus Anthropic's `max`.
- **v2** (2026-05-08) — Added full GPT family (20 models), Quota Burn Cross-Matrix (model × effort), legacy tier filter, GPT-5.5/5.5 Pro, corrected Opus 4.7 release date.
- **v1** (2026-05-07) — Initial five-tab structure, 11 frontier models, harnesses, self-hosting, strategy.

