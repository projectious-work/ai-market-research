# Software verification and release-engineering standard

## Purpose and relationship to branching

This standard defines the evidence required to integrate, promote, and publish
projectious.work software. The
[Git branching and release promotion standard](git-branching-and-release-promotion.md)
defines Git topology and commit movement; this document defines what must be
proven about the exact commit and artifacts at each gate.

Repositories document an applicable verification profile. A skipped
non-applicable check is explicit; an unexpected skip in a required gate is a
failure.

Repositories requiring native-host, container-engine, signing, or publication
authority also apply the
[human-controlled host-phase execution standard](human-controlled-host-phase-execution.md).

## Test layers

| Layer | Purpose |
|---|---|
| Unit | Prove pure behavior and edge cases quickly. |
| Component | Prove collaboration behind one boundary with controlled dependencies. |
| Black box | Prove public behavior from outside implementation internals. |
| Integration | Prove supported dependency, protocol, platform, or tool contracts. |
| Disposable end to end | Prove a complete real workflow with explicit credentials, cost, isolation, and cleanup. |

Higher layers are smaller than lower layers. End-to-end tests do not replace
focused negative, boundary, and failure-path tests.

Default local tests MUST be deterministic, offline, credential-free,
parallel-safe, and isolated from real user state. External integration and
live tests are opt-in and declare prerequisites.

## Verification gates

### Local fast

- formatting and static analysis applicable to the language;
- unit and focused component tests;
- contract/schema and maintained-example validation;
- documentation checks affected by the change.

### Change-risk

Local-fast evidence plus checks selected from changed risk: black-box,
integration, concurrency, race, fuzz smoke, security, migration,
compatibility, performance, and platform tests.

Impact selection retains a mandatory core and starts from a reviewed universe
of conditional surfaces. Evidence records comparison provenance and proves a
complete partition: every surface is either selected by a deterministic
trigger or skipped with a reason. A publisher revalidates that partition.

### Pre-release

- the complete supported test and compatibility matrix;
- dependency, license, vulnerability, and secret review;
- schemas, examples, generated references, and golden output;
- documentation build, links, migration, changelog, and roadmap consistency;
- clean-room or integration evidence for public extension contracts;
- builds for every supported release target.

### Release candidate

Tests run against the exact candidate artifacts where practical, not only the
source tree. Candidate evidence records toolchain versions, skips, reruns,
platforms, and sanitized external-system evidence.

Readiness evidence MAY replace nested execution when nested execution would
widen the outer trust boundary without proving a release claim. Full nested
lifecycle evidence remains required when relevant inputs changed or the
release claims that boundary.

### Published release

Download artifacts from the publication surface and independently verify
checksums, signatures or attestations, SBOM presence, installation, version,
help, and a minimal workflow. Publication is incomplete until verification
succeeds or the release is explicitly declared failed.

## Regression, isolation, and reliability

- Every confirmed defect adds or identifies permanent regression coverage.
- A user-visible defect has a public-boundary assertion when feasible.
- Security defects add negative refusal or redaction fixtures.
- Tests use temporary roots and controlled environments.
- Tests do not depend on a developer home, locale, credentials, network, or
  mutable global state unless explicitly classified as integration tests.
- Flaky tests are defects. Quarantine requires an owner, issue, scope, and
  expiry; silent retry-until-green is prohibited.
- Coverage is a risk signal, not a universal percentage target.
- Cache reuse does not waive validation: every gate command and runtime probe
  still runs, the cache policy and identity are evidenced, and a force-fresh
  mode exists for cache-sensitive changes.
- Security-relevant operator interfaces receive structural rendering tests in
  addition to semantic event tests. Layout remains unambiguous at narrow and
  wide sizes.

## Release artifacts and provenance

Releases originate from clean worktrees and the exact annotated release tag.
Repositories publish the artifacts appropriate to their profile plus:

- checksums;
- source/tag reference;
- human-curated release notes;
- installation and verification guidance;
- SBOMs and signatures or attestations when required by the security profile.

Build metadata identifies product version, source commit, toolchain, and
supported contract versions. Published tags are immutable.

## Release record

The release record includes source SHA, target branches, intended version,
approvals, checks, tool versions, artifacts, hashes, warnings, and
post-publication verification. Warnings requiring judgment are acknowledged
explicitly; release gates fail closed on errors.

## Agent briefing

> Branch promotion moves an already proven commit. Select checks by product
> profile and change risk, verify exact candidate artifacts, and independently
> verify what was published.
