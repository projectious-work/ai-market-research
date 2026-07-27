---
title: Project Status
linkTitle: Project Status
weight: 20
description: "Lifecycle, support, and what is and is not covered by this report."
---

**Lifecycle: active.** The market roster and published dashboard are actively
maintained. Historical snapshots remain available for provenance, but only the
current dashboard and latest tagged release are supported.

## What this is

Signal Room is inspectable decision support: a manually rebuilt, single static
dashboard that tracks model rosters, provider-native reasoning configurations,
speed evidence, agent harnesses, and self-hosting economics, with evidence
classes and source links kept visible throughout.

## What this is not

- Not exhaustive. Pricing changes, and vendor-reported claims and
  heterogeneous benchmarks are not universally comparable.
- Not a recommendation engine for every workload -- treat its outputs as a
  starting point, not a substitute for your own evaluation.
- Not dynamically updated. There is no runtime CDN dependency or live data
  fetch; GitHub Pages serves a manually rebuilt static artifact.

## Deployment architecture

GitHub Pages is fed from the root of the `gh-pages` branch by a local build
and deploy of this Hugo/Docsy site; no GitHub Actions workflow is used or
permitted. See
[DEC-20260727_0742-ClearSpring](https://github.com/projectious-work/ai-market-research/blob/main/context/decisions/DEC-20260727_0742-ClearSpring-migrate-the-published-site-from-raw.md),
which supersedes
[DEC-20260517_1455-DeftLynx](https://github.com/projectious-work/ai-market-research/blob/main/context/decisions/DEC-20260517_1455-DeftLynx-v0-2-0-deployment-local-deploy.md).

## Release process

Releases follow the repository's phased release process defined in
[`AGENTS.md`](https://github.com/projectious-work/ai-market-research/blob/main/AGENTS.md).
Do not cut a version directly before the release gates have been evaluated.
