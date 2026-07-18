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

## Benchmark normalization

Each benchmark definition has a `max_value`, version, unit, and direction.
For the current all-higher-is-better register:

```text
normalized(model, benchmark) = 100 * value / max_value
```

`max_value` is the best value in the selected published comparison set, not
the theoretical scale maximum. Changing the comparison set or benchmark
version requires reviewing every maximum.

The quality composite is a weighted arithmetic mean:

```text
quality = sum(normalized_i * weight_i) / sum(weight_i for available i)
coverage = sum(weight_i for available i) / sum(all configured weights)
```

Display the composite only when `coverage >= 0.50`. Show coverage beside the
score. Values from different benchmark versions must not share a column.

Quality relative to the selected reference is computed at render time:

```text
quality_vs_reference = 100 * quality / reference_quality
```

It may exceed 100 and must not be capped.

## Speed composite

Keep TTFT, output tokens per second, and end-to-end task time separate. The
current cross-provider chart uses an end-to-end task-speed index because
comparable token-throughput measurements are unavailable:

```text
task_speed_index = 100 * reference_task_time / model_task_time
speed_score = 100 * sqrt(task_speed_index / max_task_speed_index)
```

Thus Fable 5 is 100 in the cited comparison. A speed index of 300 means the
model completed that workload at three times the rate, not 300 tok/s. The
square root reduces the visual dominance of extreme speed claims.

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

The floor of 10 avoids a zero that would collapse the geometric compound.
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

## Speed, quality, cost compound

The SCQ compound uses a geometric mean:

```text
SCQ = cbrt(quality_score * speed_score * cost_score)
```

It is null when any category is null or benchmark coverage is below 50%.
Geometric averaging makes a serious weakness visible instead of allowing one
excellent category to fully offset it.

The bubble chart uses cost score on x, speed score on y, quality for bubble
area, and provider for color. All axes are higher-is-better. The heat map uses
model rows and quality, speed, cost, and SCQ columns on one 0-100 sequential
"good" scale. Bubble radius must be proportional to the square root of quality
so area, not radius, represents magnitude.

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
chart uses capability composite on x and SCQ on y, with median lines computed
from the currently visible models. Median lines are descriptive, not targets.

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
4. Recompute maxima, quality coverage, composites, and chart domains.
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
