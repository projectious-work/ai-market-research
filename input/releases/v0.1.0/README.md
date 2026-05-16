# v0.1.0 Release Boundary

This directory holds the release-prep notes for `v0.1.0`.

## What ships

`v0.1.0` should ship as two coupled pieces:

1. A tagged source snapshot of the prototype repo.
2. A generated `dashboard.html` built from that same snapshot.

The source-of-truth inputs remain:

- `data/market-state.json`
- `src/dashboard.template.html`
- `src/scripts/build.py`

The user-facing artifact is:

- `dist/dashboard.html`

## Why `dist/` matters

`dist/` is ignored in the current repo, so a git tag by itself does not
preserve the built dashboard artifact.

That means the release flow must do one of these explicitly:

1. Rebuild `dist/dashboard.html` from the tagged source and attach it to
   the release.
2. Copy the built `dist/dashboard.html` into a tracked release bundle
   under `input/releases/v0.1.0/` before publishing.

For this `v0.1.0` baseline, the chosen boundary is:

- keep `dist/` ignored in the working tree
- copy the validated build to
  `input/releases/v0.1.0/dashboard-v0.1.0.html`
- tag the source snapshot that produced both the data and the bundled
  HTML artifact

## Non-goals for `v0.1.0`

This release is a prototype baseline. It does not claim:

- production automation is complete
- background refresh orchestration is complete
- the release process is fully automated

## Preconditions

Before cutting the release:

- Sage lands refreshed market data
- `GPT-5.3-Codex-Spark` has materially better coverage, especially in
  the quota cross-burn matrix
- `bash src/scripts/release-check.sh` passes
- the repository has an initial commit so `v0.1.0` can be tagged
