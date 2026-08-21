---
title: Quick Start
linkTitle: Quick Start
weight: 10
description: "Build the report, validate the data, and open it locally."
---

Requires `python3`, `bash`, `git`, and (for deploys) the `gh` CLI. Building
and serving the website additionally requires Hugo Extended, Go, and
Node.js/npm. Go resolves the pinned theme module; npm supplies Tailwind and
Tabler Icons.

## Build the report

```sh
# Build the dashboard from the JSON data inputs
bash src/scripts/build.sh

# Validate JSON + rebuild + sanity-check the artifact
bash src/scripts/release-check.sh

# Open the current report directly, without the documentation site
xdg-open dist/dashboard.html
```

## Build and serve the documentation site

```sh
# Serve the projectious.work-branded site at http://localhost:1320/
bash docs/scripts/serve-docs.sh

# Produce a production build under docs/public/
bash docs/scripts/build-docs.sh
```

The website consumes the exact
`github.com/projectious-work/brand-theme-hugo-vanilla@v0.3.3` Hugo Module.
Its [Dashboard]({{< relref "/dashboard" >}}) intentionally contains labelled
mock data while each future live section receives its own evidence and filter
contract. Build the separate research artifact with `src/scripts/build.sh`.

## Deploy

```sh
bash src/scripts/release-check.sh
bash docs/scripts/deploy-docs.sh
```

GitHub Pages is fed from the root of the `gh-pages` branch by a local script.
No GitHub Actions workflow is used or permitted. See
[Project Status]({{< relref "/docs/project-status" >}}) for the deployment
architecture decision.

### Publish an archived revision

Run the deployment from the release commit or tag, then set `DOCS_VERSION` to
the revision name. The snapshot is published below that path without replacing
the live site:

```sh
git switch --detach v0.4.0
DOCS_VERSION=v0.4.0 bash docs/scripts/deploy-docs.sh
```

Archived revisions show a support banner and link readers back to `main`. Add
the version to `params.versions` in `docs/hugo.yaml` in the subsequent live-site
change so it appears in the **Revisions** picker and on the
[Revision index]({{< relref "/revisions" >}}).
