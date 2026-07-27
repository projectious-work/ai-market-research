---
title: Quick Start
linkTitle: Quick Start
weight: 10
description: "Build the report, validate the data, and open it locally."
---

Requires `python3`, `bash`, `git`, and (for deploys) the `gh` CLI. Building
and serving the Hugo/Docsy site additionally requires `hugo` (extended) and
`node`/`npm`.

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
# Serve the Hugo/Docsy site locally at http://localhost:1313/, embedding a
# freshly built report
bash docs/scripts/serve-docs.sh

# Produce a production build under docs/public/
bash docs/scripts/build-docs.sh
```

`docs/scripts/build-docs.sh` and `docs/scripts/serve-docs.sh` both rebuild
`dist/dashboard.html` via `src/scripts/build.sh` and copy it to
`static/report/dashboard.html` before invoking Hugo, so the embedded report in
[Signal Room]({{< relref "/report" >}}) always reflects the current data.

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
