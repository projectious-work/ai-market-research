---
title: Signal Room
description: "Inspectable decision support for AI infrastructure-oriented developers choosing models, configurations, subscriptions, agent harnesses, and self-hosting options."
params:
  body_class: td-navbar-links-all-active td-report-page
  show_report_controls: true
  ui:
    navbar_theme: dark
---

{{% blocks/cover
  title="What should you actually run, and what will it cost you?"
  image_anchor="top"
  height="full td-below-navbar"
%}}

<div class="sr-status-banner" role="note">
  <span class="sr-status-banner__tag">Active</span>
  <span class="sr-status-banner__text">
    Applied research, actively maintained. Maintainers monitor material
    changes daily and perform a weekly review.
  </span>
</div>

Signal Room tracks the current model roster, provider-native reasoning
configurations, speed evidence, agent harnesses, and self-hosting economics --
with evidence classes and source links that stay visible so you can make your
own tradeoffs.
{.lead .display-6}

<div class="td-cta-buttons my-5">
  <a class="btn btn-lg btn-primary me-3" href="{{< relref "/report" >}}">
    Open the Signal Room
  </a>
  <a class="btn btn-lg btn-secondary" href="{{< relref "/docs" >}}">
    Read the methodology
  </a>
</div>

{{% /blocks/cover %}}

{{% blocks/lead color="white" %}}

Choosing a model, a reasoning configuration, an agent harness, or a self-hosting
setup means comparing vendor claims that are rarely apples to apples. Signal
Room is a non-exhaustive, inspectable report: every number is either measured,
vendor-reported, or explicitly marked unknown, and every claim keeps a
canonical source link.

{{% /blocks/lead %}}

<div class="container-fluid sr-now-section">

{{< report-section "00-now" >}}

</div>

{{% blocks/section color="light" type="row" %}}

{{% blocks/feature icon="fa-layer-group" title="Model roster & configurations" %}}

Anthropic, OpenAI, Google, xAI, Meta, Mistral, Cursor, and major Chinese labs,
with provider-native reasoning effort, thinking levels, and token budgets.

[Read the data methodology]({{< relref "/docs/data-methodology" >}})

{{% /blocks/feature %}}

{{% blocks/feature icon="fa-gauge-high" title="Speed & cost evidence" %}}

Time to first token, output throughput, task latency, and quota-burn cross
matrices -- vendor claims and unknowns are labelled, never blended together.

[Open the Signal Room]({{< relref "/report" >}})

{{% /blocks/feature %}}

{{% blocks/feature icon="fa-server" title="Agent harnesses & self-hosting" %}}

Claude Code, OpenCode, Codex CLI, and more, alongside dated GPU-hosting prices,
local Mac configurations, and open-weight model fit.

[Read the research-data policy]({{< relref "/docs/research-data-policy" >}})

{{% /blocks/feature %}}

{{% /blocks/section %}}

{{% blocks/section color="primary" type="row" %}}

<div class="col-lg-8">
<h2>Inspect the evidence, not just the conclusion</h2>
<p class="lead">Every figure in the report traces back to an evidence class, a source, and an update date. Use it to reach your own conclusion, not to take ours on faith.</p>
</div>
<div class="col-lg-4 d-flex align-items-center justify-content-lg-end">
<a class="btn btn-lg btn-light" href="{{< relref "/report" >}}">Open the Signal Room</a>
</div>

{{% /blocks/section %}}
