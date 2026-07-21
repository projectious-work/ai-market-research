# Research data policy

This policy applies to market facts, benchmark observations, pricing,
availability, source links, and historical snapshots used by the Signal Room.

## Source rights and collection

Use sources that are publicly accessible and lawful to consult. Prefer primary
sources such as official model cards, documentation, pricing pages, release
notes, repositories, and benchmark publications. Do not bypass access controls,
paywalls, authentication, rate limits, or technical restrictions.

Store only the facts and short summaries needed for market analysis. Do not
mirror articles, proprietary datasets, benchmark submissions, or other
copyrighted source material. A public URL does not imply permission to copy the
underlying work.

## Attribution and evidence

Every externally verifiable claim must retain a canonical source URL through
the repository's source or citation fields. Record the observation date and,
when relevant, the source's publication or release date. Prefer stable,
first-party URLs; use independent benchmark sources for claims that the vendor
cannot establish itself.

Label evidence as measured, vendor-reported, derived, estimated, or unknown.
Do not combine measurements with incompatible conditions as though they were
directly comparable. Calculated values must identify their formula and inputs.

## Permitted use

Collected facts and links are used for research, comparison, summarization, and
decision support. They must remain within the permissions and terms of their
original sources. The repository's MIT License covers original code and text;
it does not relicense third-party trademarks, source publications, benchmark
data, or linked materials.

## Retention and corrections

Keep the current normalized facts required by the dashboard and dated archive
snapshots needed to explain material changes. Retain citation links and
changelog entries so published conclusions remain auditable. Do not retain raw
scrapes, authentication material, private exports, or unnecessary personal
data.

Correct demonstrably inaccurate data in the current dataset and preserve a
short correction record when the change affects a published conclusion. Honor
valid removal requests for material that should not have been collected while
keeping a non-sensitive audit note when appropriate.

## Update verification

For each refresh:

1. compare the current value with the most recent primary source;
2. confirm the product or model identifier, unit, currency, region, and date;
3. verify consequential comparative claims against an independent source when
   one is available;
4. preserve unknown values instead of filling gaps with unsupported estimates;
5. validate every citation and record the material change in the archive or
   changelog;
6. run `bash src/scripts/release-check.sh`; and
7. inspect the rendered dashboard for misleading presentation, unsafe links,
   personal data, secrets, and accidental source-text reproduction.

## Privacy and security review

The delivered data was reviewed on 2026-07-21. It contains public model,
provider, tool, benchmark, and infrastructure information, not customer or
individual-level records. No credentials, private keys, authenticated URLs,
private datasets, or sensitive personal information were identified. The
project deployment email is intentionally public and is not research data.

Repeat this review whenever a new data class, ingestion mechanism, binary
asset, or non-public source is proposed. Security concerns should follow
[`SECURITY.md`](../SECURITY.md).
