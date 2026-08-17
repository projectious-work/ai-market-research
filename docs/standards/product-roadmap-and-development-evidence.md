# Product roadmap and development evidence standard

## Purpose and scope

This standard defines how projectious.work software projects express future
direction and connect shipped roadmap outcomes to implementation evidence. It
applies once a project discusses future work beyond the current release.

The canonical roadmap MUST be machine-readable YAML in `roadmap.yaml`, or at a
documented project-specific path. A rendered website or Markdown roadmap MAY be
generated from it, but MUST NOT become a competing source of truth.

## Principles

- Roadmaps communicate outcomes and commitment, not implementation inventory.
- Status is observed state. It is not a substitute for evidence.
- Dates are optional and appear only when the project will maintain them.
- Stable identifiers survive title, grouping, and sequencing changes.
- Planned behavior is never presented as shipped documentation.

## Required model

The roadmap schema MUST be versioned. It MUST support groups containing ordered
items or phases with these fields:

| Field | Requirement |
|---|---|
| `id` | Stable and unique within the project. |
| `title` | Short, outcome-oriented name. |
| `summary` | User or operator outcome, not only a component name. |
| `status` | One of `idea`, `planned`, `in_progress`, `shipped`, or `cancelled`. |
| `target` | Optional release, milestone, or date. |
| `dependencies` | Optional stable IDs whose outcomes are prerequisites. |
| `issues` | Optional external tracking references. |
| `decisions` | Optional governing decision references. |
| `devNote` | Required when a non-trivial item becomes `shipped`. |
| `release` | Required for shipped user-visible behavior. |

Projects MAY extend this model with product-specific fields. Extensions MUST
not redefine the standard fields or statuses.

## Status semantics

- `idea`: exploratory and non-committal.
- `planned`: intended and sequenced, but implementation has not started.
- `in_progress`: active implementation has visible ownership and evidence.
- `shipped`: available in the named release and supported by conformance
  evidence, documentation, and a development note when required.
- `cancelled`: intentionally not proceeding; rationale or a decision reference
  is present.

Changing an item to `shipped` requires agreement between code, tests,
specification where present, user documentation, development evidence, and
release metadata. Merging code alone is insufficient.

## Development notes

Non-trivial roadmap phases and material architectural changes maintain a note
under `dev-notes/`, named with the roadmap ID and a descriptive slug. The note
evolves during implementation and records:

- roadmap item, scope, status, and intended reader;
- implemented behavior and important boundaries;
- decisions, alternatives, and deviations;
- tests and manual validation, including known gaps;
- security, compatibility, migration, and operational consequences;
- documentation and examples changed; and
- unresolved follow-up work linked to owned tracking items.

Development notes explain why and what was proven. They do not narrate commits
or replace stable user documentation.

## Validation

Projects MUST validate roadmap YAML against the declared schema. Validation
MUST reject duplicate IDs, unknown statuses, missing shipped evidence, broken
internal references, and references to absent development notes. Generated
roadmap pages MUST be reproducible locally and checked for drift.

## Agent briefing

> Treat `roadmap.yaml` as the roadmap source of truth. Do not upgrade status
> based on code presence alone. A shipped item names its release and evidence;
> an idea remains explicitly non-committal.
