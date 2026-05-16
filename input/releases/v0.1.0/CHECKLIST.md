# v0.1.0 Release Checklist

## Data gate

- [ ] Sage has refreshed `data/market-state.json`.
- [ ] `meta.generated_at` reflects the current refresh window.
- [ ] `GPT-5.3-Codex-Spark` is no longer missing the key release-facing
      data that prompted this release-prep pass.
- [ ] Any remaining `null` values for Codex Spark are explicitly
      justified by source availability.

## Build and artifact gate

- [ ] Run `bash src/scripts/release-check.sh`.
- [ ] Confirm `dist/dashboard.html` rebuilds successfully.
- [ ] Confirm the built artifact does not contain the
      `__MARKET_DATA__` placeholder.
- [ ] Decide the publish path for the built artifact:
      attach `dist/dashboard.html` to the release, or copy it into this
      release folder before publishing.

## Git and version gate

- [ ] Create the initial repository commit if one still does not exist.
- [ ] Confirm there is no conflicting existing `v0.1.0` tag.
- [ ] Tag the release from the validated source snapshot.

## Release wording gate

- [ ] Use the release notes in `RELEASE_NOTES.md` as the starting point.
- [ ] Describe `v0.1.0` as the current prototype baseline.
- [ ] Avoid claiming production automation or continuous operation.

## Known blockers to clear before publish

- [ ] The repo currently has no commit history, so tagging is not yet
      possible.
- [ ] `dist/` is ignored, so the built artifact will not be preserved by
      tag alone.
