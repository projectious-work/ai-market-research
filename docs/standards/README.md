# Company engineering standards

This directory contains the company standards applicable to the AI market
research product. They are imported from the projectious.work company
coordination repository so the requirements governing this repository remain
available beside the product.

Importing a standard records applicability; it does not claim that every
requirement is already implemented. Gaps remain visible until they are either
remediated or recorded as explicit, reviewed exceptions.

## AI market research application profile

AI market research is a composite product with these profiles:

- **Primary — documentation or website:** the public research report,
  methodology, evidence, revision history, and documentation site.
- **Secondary — schema, protocol, or process package:** versioned research
  datasets, schedules, generated metrics, release evidence, and the governed
  ten-phase release process.
- **Secondary — CLI application:** local report generation, verification,
  data-refresh, privacy, citation, release, and deployment commands.
- **Conditional overlay — host-gated release:** applies when publication,
  deployment, credentials, signing, or native-host verification is
  intentionally kept outside the development environment.

Service-level runtime requirements are not generally applicable to the static
published report. They apply only if scheduled or continuously running research
workers become a supported product surface.

## Selected standards

The following standards directly govern this product:

- [Open-source documentation strategy](open-source-documentation-strategy.md)
- [Git branching and release promotion](git-branching-and-release-promotion.md)
- [Software verification and release engineering](software-verification-and-release-engineering.md)
- [Application profiles](application-profiles.md)
- [Product roadmap and development evidence](product-roadmap-and-development-evidence.md)
- [Human-controlled host-phase execution](human-controlled-host-phase-execution.md)

The following linked standards and conformance assets are included because the
selected standards depend on them and the project publishes machine-readable
research data, generated evidence, and AI-readable public documentation:

- [AI-agent accessibility and generative discovery](ai-agent-accessibility-and-generative-discovery.md)
- [Compatibility and machine interfaces](compatibility-and-machine-interfaces.md)
- [Security and software supply chain](security-and-software-supply-chain.md)
- [Host-gated release conformance](host-gated-release-conformance.md)
- [Host-gated release handover schema](schemas/host-gated-release-handover-v1.schema.json)

## Project-specific emphasis

For this repository, standards review must pay particular attention to source
and citation integrity, research-data provenance, privacy checks, reproducible
report generation, release-evidence retention, version alignment between the
report and public site, and independent post-publication verification.

## Maintenance

Company-standard updates should be reviewed as product-contract changes. Keep
local implementation guidance outside these imported files, and record
deviations in a separate applicability or conformance document.
