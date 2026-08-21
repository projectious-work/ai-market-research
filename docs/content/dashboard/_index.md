---
title: Dashboard
linkTitle: Overview
description: "An overview of the model, harness, and self-hosting research views."
weight: 10
aliases:
  - /report/
cascade:
  type: dashboard
---

# Dashboard overview

The Dashboard is the quickest way to browse the research surface. It groups
model comparisons, agent harness notes, and self-hosting considerations into a
small set of predictable pages.

> **Mock data notice:** every value and row on the Dashboard is a static,
> illustrative fixture. It is included to demonstrate page structure and is
> not a current market claim, benchmark result, price, or recommendation.

## Explore the dashboard

{{< cards >}}
  {{< card title="Models" icon="brain" link="/dashboard/models/" subtitle="Benchmark, capability, and subscription comparison patterns." >}}
  {{< card title="Harnesses" icon="terminal-2" link="/dashboard/harnesses/" subtitle="A neutral profile format for agent harnesses." >}}
  {{< card title="Self-Hosting" icon="server" link="/dashboard/self-hosting/" subtitle="A neutral format for local hardware and hosting notes." >}}
{{< /cards >}}

## Illustrative research flow

{{< mermaid >}}
flowchart LR
  A[Question] --> B[Compare models]
  B --> C[Choose harness]
  C --> D[Assess hosting]
  D --> E[Record evidence]
{{< /mermaid >}}

## Example dashboard status

| Indicator | Example value | Interpretation |
|-----------|---------------|----------------|
| Data mode | Mock / example | Presentation fixture only |
| Evidence links | Sample links | Replace with reviewed sources |
| Refresh state | Not connected | No live values are implied |

Use the [Documentation]({{< relref "/docs" >}}) for the methodology and source
handling rules behind the eventual live views.
