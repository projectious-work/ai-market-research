---
title: Revisions
linkTitle: Revisions
description: "Live revision and generated release history for Signal Room."
weight: 30
---

Signal Room has one supported, live revision. Every tagged release is listed
below, generated from the repository's git tags rather than hand-maintained
-- see [`scripts/generate-releases-data.sh`](https://github.com/projectious-work/ai-market-research/blob/main/docs/scripts/generate-releases-data.sh).

## Current revision

**main** is the actively maintained site. It contains the current Signal Room,
current methodology, and the latest research-data policy. It is the revision to
use for decisions and new work.

- [Open the current Signal Room]({{< relref "/report" >}})
- [Read the current documentation]({{< relref "/docs" >}})
- [See the latest tagged release](https://github.com/projectious-work/ai-market-research/releases/latest)

## Release history

Each release is a tagged snapshot of the repository, with the built report
(`dashboard.html`) and `LICENSE` attached as GitHub release assets -- not a
separately rebuilt copy of this documentation site. This list is regenerated
at every Hugo build; it is not hand-maintained.

{{< releases-table >}}

## Support policy

Only `main` and the latest tagged release are supported. Older tags are kept
for provenance -- they document the evidence, methods, and market state at
the time of publication -- but their attached report is not updated when
provider pricing, models, benchmarks, or source pages change.
