# Quick Start

> Build the report, validate the data, and open it locally.

---

LLMS index: [llms.txt](/ai-market-research/llms.txt)

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
bash scripts/serve-docs.sh

# Produce a production build under public/
bash scripts/build-docs.sh
```

`scripts/build-docs.sh` and `scripts/serve-docs.sh` both rebuild
`dist/dashboard.html` via `src/scripts/build.sh` and copy it to
`static/report/dashboard.html` before invoking Hugo, so the embedded report in
[Signal Room](/ai-market-research/report/) always reflects the current data.

## Deploy

```sh
bash src/scripts/release-check.sh
bash scripts/deploy-docs.sh
```

GitHub Pages is fed from the root of the `gh-pages` branch by a local script.
No GitHub Actions workflow is used or permitted. See
[Project Status](/ai-market-research/docs/project-status/) for the deployment
architecture decision.
