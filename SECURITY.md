# Security policy

## Supported version

This project has an active lifecycle. Security fixes target the current
dashboard on the default development branch and the latest published site.
Historical archives and older release artifacts are retained for provenance
but are not maintained as supported versions.

## Reporting a vulnerability

Do not disclose an exploitable vulnerability, credential, or personal data in
a public issue. Report it privately to `info@projectious.work` with the affected
revision, reproduction details, impact, and any safe remediation suggestion.

The maintainer will acknowledge a report, validate its scope, coordinate a fix,
and publish an advisory or release when appropriate. Public discussion should
wait until remediation is available.

## Data and deployment safeguards

The published site is static and has no server-side application or runtime
dependency. Research inputs must still be treated as untrusted content:

- never ingest executable markup, embedded credentials, private exports, or
  personal/customer records;
- keep source URLs free of access tokens and user information;
- inspect rendered text and links before deployment;
- run `bash src/scripts/release-check.sh` before publishing;
- deploy only through `src/scripts/deploy.sh`, without force-pushing; and
- do not add GitHub Actions workflows or expose repository secrets to a build.

See [`docs/research-data-policy.md`](docs/research-data-policy.md) for the full
provenance, rights, retention, verification, and privacy rules.
