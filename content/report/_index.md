---
title: Signal Room
linkTitle: Signal Room
description: "The current market report -- model roster, configurations, speed evidence, agent harnesses, and self-hosting economics."
params:
  body_class: td-navbar-links-all-active
---

The report below is a self-contained static dashboard, rebuilt locally from
[`data/market-state.json`](https://github.com/projectious-work/ai-market-research/blob/main/data/market-state.json),
[`data/model-roster-v2.json`](https://github.com/projectious-work/ai-market-research/blob/main/data/model-roster-v2.json),
and [`data/report-metrics.json`](https://github.com/projectious-work/ai-market-research/blob/main/data/report-metrics.json).
See the [data methodology]({{< relref "/docs/data-methodology" >}}) for the
evidence classes and calculations behind it.

<p>
  <a class="btn btn-sm btn-secondary" href="{{< site-url "report/dashboard.html" >}}" target="_blank" rel="noopener">
    Open in a new tab <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
  </a>
</p>

<iframe class="sr-report-frame" src="{{< site-url "report/dashboard.html" >}}" title="Signal Room market report" loading="lazy"></iframe>
