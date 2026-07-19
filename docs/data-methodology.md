# Report data methodology

The dashboard has three canonical data inputs:

- `data/market-state.json` preserves the original report schema and backward
  compatibility.
- `data/model-roster-v2.json` contains the curated provider roster, model
  configuration levels, availability, pricing labels, and speed evidence.
- `data/report-metrics.json` contains normalized metrics, chart encodings,
  current economics, hardware fit, and decision-support data.

The build validates all three files and merges the latter two under
`marketData.model_roster` and `marketData.report_metrics`. Do not fetch data
at runtime: GitHub Pages remains a single, manually rebuilt static artifact.

## Evidence classes

Every speed or hardware value should be one of:

1. `measured`: reproduced in the project's pinned harness.
2. `vendor`: copied from an official primary source with its test context.
3. `vendor-relative`: a vendor comparison without an absolute measurement.
4. `planning_estimate`: useful for capacity planning but not a measured fact.

Unknown values remain JSON `null`. Never turn an absent number into zero. A
hardware combination that cannot run uses `fit_status: "unsupported"` and a
reason. This replaces ambiguous empty `GB tok/s` cells.

## Benchmark evidence and reference quality

Each benchmark definition has a `max_value`, version, unit, and direction.
For the current all-higher-is-better register, individual cells may be
normalized for color intensity:

```text
normalized(model, benchmark) = 100 * value / max_value
```

`max_value` is the documented maximum for that benchmark version or comparison
set. Values from different benchmark versions must not share a column. Missing
results stay null; the dashboard does not infer zero or manufacture a benchmark
composite from sparse, non-overlapping evaluations.

Each model instead has a curated `quality_vs_fable` anchor. Prefer a published
multi-benchmark comparison against Fable 5. A historical normalized score or a
shared SWE-Pro version may be used as a clearly documented fallback. The Kimi
K3 anchor, for example, is the geometric mean of the 14 K3/Fable 5 ratios in
Moonshot's launch comparison.

Quality relative to the selected reference is computed at render time:

```text
quality_vs_reference = 100 * quality_vs_fable(model)
                            / quality_vs_fable(reference)
```

It may exceed 100 and must not be capped.

## Speed evidence and score

Keep TTFT, output tokens per second, and end-to-end task time separate. The
current cross-provider chart uses an end-to-end task-speed index because
comparable token-throughput measurements are unavailable:

```text
task_speed_index = 100 * reference_task_time / model_task_time
speed_score = 100 * sqrt(task_speed_index / max_task_speed_index)
```

Thus Fable 5 is 100 in the cited comparison. A task-speed index of 300 means
the model completed that workload at three times the rate; it is dimensionless
and does not mean 300 tok/s. Provider-documented output throughput is displayed
separately in tok/s with its evidence class. The square root reduces the visual
dominance of extreme relative task-rate claims.

Replace relative indices with local measurements after recording model,
effort, provider, service tier, region, date, cache state, input/output token
counts, and workload. Historical points that do not come from a frozen test
must retain their `history_note` caveat.

## Cost and burn

The workload price blend is:

```text
blended_price = 0.30 * input_price + 0.70 * output_price
```

This represents an output-heavy agent workload. It excludes tools, long-
context surcharges, cache writes, batch discounts, and hidden reasoning
tokens. Those must be modeled separately when applicable.

Cost is converted to a higher-is-better score with log normalization:

```text
cost_score = 10 + 90 * ln(max_price / price)
                         / ln(max_price / min_price)
```

Recompute `min_price` and `max_price` over visible, eligible models.

Burn uses the original report's selectable-reference design:

```text
cache_factor = (1 - cache_hit_rate)
             + cache_hit_rate * cache_read_ratio
absolute_burn = base_blended_price * effort_factor * cache_factor
display_burn = absolute_burn / reference_medium_absolute_burn
```

The GPT-5.6 and Fable effort factors are planning estimates until a controlled
run measures token use. Fable has always-on adaptive thinking, so its effort
setting is a behavioral control, not a published token multiplier.

## Quality, speed, and cost views

The bubble chart uses speed score on x, cost efficiency on y, quality versus
the selected reference for bubble area, and provider for color. The heat map
uses the same three values without a synthetic overall compound. A model enters
either view only when all three values are present. Bubble radius is
proportional to the square root of quality, so area represents magnitude.
Labels sit in edge rails with connector lines to avoid clipping dense clusters.

## Capability compound

The six editorial axes are coding, reasoning and architecture, knowledge and
research, communication and documentation, multimodal, and agentic work. They
are rubric assessments, not benchmark results.

Balanced mode assigns every axis weight 1. Selecting a focus assigns that
axis weight 2.5 and leaves the other five at 1:

```text
capability = sum(axis_score * axis_weight) / sum(axis_weight)
```

The radar compares two chosen models on the raw six-axis scores. The BCG-style
chart uses the mean of quality versus reference, speed, and cost on x and the
focus-weighted capability composite on y. It requires all three market values.
Its 50 lines are orientation guides, not targets.

## Hardware fit

Hardware throughput depends on quantization, backend, batch size, context,
prompt length, interconnect, power limit, and speculative decoding. Every
measured update should store those dimensions. Until then, values marked
`planning_estimate` may support filtering and pastel speed bands but must be
labelled as estimates in the UI.

Recommended display bands are computed per visible table, using the 25th,
50th, and 75th percentiles of non-null throughput. Do not give unsupported or
unknown cells a color implying performance.

## Update procedure

1. Research official provider pages and versioned benchmark publications.
2. Update source URLs and `accessed` dates.
3. Update raw prices, benchmarks, context, and evidence before derived values.
4. Recompute benchmark maxima, Fable quality anchors, scores, and chart domains.
5. Review reference eligibility and burn factors.
6. Review action queue, routing, hardware fit, and changelog.
7. Validate every JSON file with `python3 -m json.tool` or `jq empty`.
8. Run the local build and release checks, then deploy manually. Do not use a
   GitHub Actions workflow.

Primary sources for this refresh:

- <https://openai.com/index/gpt-5-6/>
- <https://developers.openai.com/api/docs/models>
- <https://platform.claude.com/docs/en/about-claude/models/overview>
- <https://platform.claude.com/docs/en/manage-claude/api-and-data-retention>
- <https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash>
- <https://www.kimi.com/blog/kimi-k3>
- <https://platform.kimi.ai/docs/models>
- <https://openai.com/index/introducing-gpt-5-5/>
