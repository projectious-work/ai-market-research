# AI Market Research Tool v0.1.0

## Summary

`v0.1.0` is the first tagged prototype baseline of the AI Market
Research Tool. It captures the split-source dashboard structure, the
refreshed market dataset generated on 2026-05-16, and a validated
dashboard artifact built from that same source snapshot.

## Included in this release

- canonical market state in `data/market-state.json`
- dashboard template in `src/dashboard.template.html`
- deterministic build path in `src/scripts/build.py`
- generated `dashboard.html` built from the tagged source snapshot

## Release framing

This is a prototype release, not a production automation milestone.

It is intended to give the project a stable baseline for:

- reviewing the current dashboard output
- iterating on the daily refresh flow
- comparing later prototype releases against a named starting point

## Known limitations

- refresh orchestration is still prototype-grade
- release packaging is still manual
- the built dashboard artifact is not preserved by git tag alone while
  `dist/` remains ignored

## Publishing notes

Release asset preserved in-repo at
`input/releases/v0.1.0/dashboard-v0.1.0.html`.
