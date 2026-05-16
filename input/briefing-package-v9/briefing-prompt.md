# Daily AI Market Briefing — Update Prompt

You are running as an automated daily briefing job. Your task: update `dashboard.html` with the current state of the AI market across four investigation aspects (models, harnesses, self-hosting, strategy), based on web research.

## Procedure

### Step 1 — Read current state

1. Read `dashboard.html` and extract the JSON inside `<script id="market-data" type="application/json">`. This is yesterday's snapshot.
2. Read `CLAUDE.md` for user profile and tracked dimensions.
3. Read `sources.md` for canonical URLs to check.

### Step 2 — Research

Check the following in this order. Skip any that returned no news in the last 7 days based on prior runs noted in changelog.

**Frontier model news** — search for: "Anthropic Claude release", "OpenAI GPT release", "Gemini release", "Mistral release", "Grok release", "DeepSeek release", "MiniMax release". Look for: new model versions, price changes, context window changes, benchmark updates (especially SWE-bench Pro). The full OpenAI GPT family is tracked (5.5, 5.5 Pro, 5.4, 5.4 Mini, 5.4 Nano, 5.3-Codex, 5.3-Codex-Spark, 5.2 + Codex variants in legacy).

**Quota burn cross-matrix** — when any model price changes or a new reasoning model is released, update `data.quota_burn_matrix.openai_matrix` (or anthropic/google sub-tables). The baseline stays at GPT-5.5 medium = 1.00× for continuity. New OpenAI model: compute medium cell from API pricing as `(api_in × 0.3 + api_out × 0.7) / (5 × 0.3 + 30 × 0.7)`, then scale: minimal ≈ 0.45×, low ≈ 0.65×, high ≈ 1.7×, xhigh ≈ 2.7× of the medium cell. If OpenAI publishes official credit-per-Mtok rates, replace the estimate with grounded numbers.

**Task-fit recommendations** — after updating the model roster and matrix, reconsider `data.strategy.task_fit.rows[]`. For each row × provider, ask: given the current roster, what's the best single pick from {provider}'s models for this task? Update the recommendation if the answer changed. Move displaced picks to `runner_up_per_provider`. Don't dump every model into runners-up — keep it to 1-3 genuine alternates that were close calls. If a new model is released, every task-fit row's recommendations should be reconsidered against it.

**Subscription / policy** — check Anthropic, OpenAI, Google official blogs. Look for: tier price changes, new tiers, ToS changes around automation, OAuth/API access changes.

**Harness landscape** — check GitHub for star counts, recent releases of: Claude Code, OpenCode, Codex CLI, Gemini CLI, Aider, Cline, Roo Code, Cursor, Windsurf, Goose, OMO. Look for: new features, new harness launches, deprecations.

**Open-weight models** — search for: "open weight model release", "Gemma release", "Qwen release", "Llama release", "DeepSeek release". Check Hugging Face trending. Look for: new open releases, new quantizations, benchmark updates, license changes.

**Hardware / Vast.ai pricing** — quick check on A6000 spot pricing trends, new MacBook Pro releases.

Cap research to 30 minutes of tool calls. Quality over quantity.

### Step 3 — Update JSON data

For each item changed:

1. Update the relevant entry in the JSON.
2. Append an entry to `changelog[]` with date, tag (`model` / `harness` / `policy` / `local`), and one-line text. Keep changelog at most 15 entries (drop oldest).
3. If a metric in `headline_stats[]` shifted, update its `value` AND its `delta` field.
4. If a tracked metric in `trends[]` shifted, append today's value to its `history[]` array (cap history at 12 months).
5. If a strategic recommendation needs revising in `strategy.current_recommendation` or `strategy.alternatives`, update accordingly.
6. Always update `meta.generated_at` to today's ISO timestamp.

### Step 4 — Refresh executive summaries

For each section in `executive_summary` (models / harnesses / self_hosting / strategy), rewrite the prose to reflect the current state. Keep each to ~150 words, present-tense, factual. Lead with the most important shift if any.

### Step 5 — Refresh action items

Update `actions[]` (3–5 items). Each should be a *specific, takeable action* this week — not generic advice. If yesterday's action was completed (e.g., a model already evaluated), drop it. If a new development creates a new action, add it.

### Step 6 — Write outputs

1. Write the updated JSON back into `dashboard.html` between the `<script id="market-data">` tags. **Do not change anything else in the HTML file** — preserve all CSS, HTML structure, and JavaScript exactly as-is.
2. Copy the previous version of `dashboard.html` to `archive/YYYY-MM-DD.html` (using yesterday's date — i.e., the snapshot you started from).
3. Commit with message: `Daily briefing YYYY-MM-DD: {one-line summary of biggest change}`.

## Constraints

- **Do not invent data.** If you can't verify a number from a current source, leave the existing value and note it in your run summary.
- **Web search is required** — do not rely on training data for prices, benchmarks, or release dates.
- **Cite sources in your run summary** at the end (5–10 URLs you used).
- **If nothing material changed**, that's a valid outcome. Update `meta.generated_at`, append `{"date":"YYYY-MM-DD","tag":"policy","text":"No material changes since prior briefing."}` to changelog (only if there are no other entries today), and exit.
- **Preserve JSON structure exactly.** All keys must remain. New optional keys are fine; removed required keys break the dashboard.
- **No prose in dashboard.html outside the JSON block** — the HTML/CSS/JS is fixed.

## Output

End your run with a 5-line summary:
```
Briefing complete · YYYY-MM-DD
Models: {N changed, names}
Harnesses: {N changed, names}
Local: {N changed, names}
Sources: {N URLs used, comma-separated}
```
