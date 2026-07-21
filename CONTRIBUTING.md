# Contributing

Contributions that improve the accuracy, provenance, accessibility, or
maintainability of the Signal Room are welcome.

## Research changes

Follow [`docs/research-data-policy.md`](docs/research-data-policy.md). In
particular:

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
then publish with:

```sh
bash src/scripts/deploy.sh --message "deploy: refresh signal room"
```

Deployment is a local, non-force push to the `gh-pages` branch. GitHub Actions
workflows are not permitted in this repository; the deploy script rejects a
`.github/workflows/` directory. Do not use `--skip-build` unless the exact
artifact has already been reviewed.

Versioned releases use the gated process described in `AGENTS.md`; do not cut
a tag or invoke the release-cut phase before its preceding gates pass.

## Pull requests

Keep changes focused, use Conventional Commits, explain data-source changes,
and include the validation evidence. Link the relevant issue or WorkItem when
one exists.
