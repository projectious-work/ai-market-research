# Contributing

Contributions that improve the accuracy, provenance, accessibility, or
maintainability of the Signal Room are welcome.

## Research changes

Follow [`docs/content/docs/research-data-policy.md`](docs/content/docs/research-data-policy.md)
(published at
[docs/research-data-policy](https://projectious-work.github.io/ai-market-research/docs/research-data-policy/)).
In particular:

- use a public, lawful source and prefer the model or service owner's primary
  publication;
- retain a canonical source URL and distinguish reported facts from estimates;
- do not copy restricted source material, personal data, credentials, or
  private customer information into the repository;
- record the observation date and update the relevant archive or changelog;
- represent unverified values as unknown instead of inferring precision.

## Canonical Git identity

Repository commits use the project identity and email
`projectious <info@projectious.work>`. Configure the repository-local email
before committing:

```sh
git config --local user.name projectious
git config --local user.email info@projectious.work
```

`src/scripts/release-check.sh` enforces the canonical email. Use
repository-local configuration so unrelated repositories retain their own Git
identity.

## Branching and deployment policy

The repository has two long-lived branches:

- `development` is the integration branch for ordinary work.
- `main` is the published branch. Releases are tagged and deployed only from
  `main`.

Create short-lived branches from `development` using a typed prefix, for
example `feat/42-provider-refresh`, `fix/citation-link`, `docs/methodology`,
`refactor/report-builder`, or `chore/dependency-lock`. Open a focused pull
request to `development`; squash-merge it after review and validation, then
delete the short-lived branch.

For a release, first ensure `development` is green and includes every intended
change. Open a release pull request from `development` to `main` and merge it
with a merge commit. Run the gated release process from `main`, which creates
the version tag, deploys the Hugo site, and publishes the GitHub Release.
Then merge `main` back into `development` so the branches remain aligned.

For an urgent production fix, branch `fix/<short-description>` from `main`.
Merge it into `main`, release from `main`, and then merge `main` back into
`development` before resuming ordinary work.

Protect both `main` and `development`: require pull requests, disallow direct
pushes, force pushes, and branch deletion, and require the applicable
validation checks. Keep `main` as GitHub's default branch for consumers; set
`development` explicitly as the base branch for normal feature pull requests.

## Validate changes

The workflow is deliberately local and deterministic:

```sh
bash src/scripts/release-check.sh
```

That command validates the source data, rebuilds `dist/dashboard.html`, and
checks the generated artifact. Review the dashboard visually when a change
affects presentation or data interpretation.

## Refresh and deploy

Refresh the JSON inputs and citations manually, run the validation above, and
then publish the Hugo site with:

```sh
bash docs/scripts/deploy-docs.sh --message "deploy: refresh signal room"
```

Deployment is a local, non-force push to the `gh-pages` branch. GitHub Actions
workflows are not permitted in this repository; the deploy script rejects a
`.github/workflows/` directory. Do not use `--skip-build` unless the exact
artifact has already been reviewed. Preview locally first with
`bash docs/scripts/serve-docs.sh` (Hugo with the pinned projectious.work brand
theme, port 1320).

Versioned releases use the gated process described in `AGENTS.md`; do not cut
a tag or invoke the release-cut phase before its preceding gates pass.

## Pull requests

Keep changes focused, use Conventional Commits, explain data-source changes,
and include the validation evidence. Link the relevant issue or WorkItem when
one exists.
