---
apiVersion: processkit.projectious.work/v1
kind: Migration
metadata:
  id: MIG-20260721_0918-ContentSync-processkit-content-sync
  created: 2026-07-21 09:18:49+00:00
  updated: '2026-07-21T10:05:24+00:00'
spec:
  source: processkit
  source_url: https://github.com/projectious-work/processkit.git
  from_version: v0.27.1
  to_version: v0.27.5
  state: applied
  generated_by: aibox apply
  generated_at: 2026-07-21 09:18:49+00:00
  summary: 0 changed upstream, 0 conflicts, 17 new, 0 removed, 0 stale-removed (5
    groups affected)
  affected_groups:
  - AGENTS
  - lib
  - schemas/_generated
  - schemas/src
  - skills/processkit
  affected_files:
  - path: AGENTS.md
    classification: changed-locally-only
  - path: context/schemas/_generated/binding.yaml
    classification: new-upstream
  - path: context/schemas/_generated/decisionrecord.yaml
    classification: new-upstream
  - path: context/schemas/_generated/logentry.yaml
    classification: new-upstream
  - path: context/schemas/_generated/workitem.yaml
    classification: new-upstream
  - path: context/schemas/src/compositions/decisionrecord.yaml
    classification: new-upstream
  - path: context/schemas/src/compositions/logentry.yaml
    classification: new-upstream
  - path: context/schemas/src/fragments/entity.yaml
    classification: new-upstream
  - path: context/schemas/src/fragments/generation.yaml.j2
    classification: new-upstream
  - path: context/schemas/src/fragments/record.yaml
    classification: new-upstream
  - path: context/schemas/src/fragments/relationship.yaml
    classification: new-upstream
  - path: context/schemas/src/fragments/versioned.yaml
    classification: new-upstream
  - path: context/schemas/src/primitives/binding.yaml
    classification: new-upstream
  - path: context/schemas/src/primitives/workitem.yaml
    classification: new-upstream
  - path: context/schemas/src/registry.yaml
    classification: new-upstream
  - path: context/schemas/src/templates/schema.yaml.j2
    classification: new-upstream
  - path: context/skills/_lib/processkit/schema_generation.py
    classification: new-upstream
  - path: context/skills/processkit/repository-portfolio-review/SKILL.md
    classification: new-upstream
  started_at: '2026-07-21T10:05:24+00:00'
  applied_at: '2026-07-21T10:05:24+00:00'
  progress_notes:
  - timestamp: '2026-07-21T10:05:24+00:00'
    actor: mcp
    note: 'Verified installer-applied processkit v0.27.1→v0.27.5 content sync: 17
      upstream additions present, zero conflicts/removals, and local-only AGENTS.md
      preserved.'
---

# Migration MIG-20260721_0918-ContentSync-processkit-content-sync

From `v0.27.1` to `v0.27.5` (source: `https://github.com/projectious-work/processkit.git`).

0 changed upstream, 0 conflicts, 17 new, 0 removed, 0 stale-removed (5 groups affected)

## Counts

- unchanged: 706
- changed-locally-only: 1
- changed-upstream-only: 0
- conflict: 0
- new-upstream: 17
- removed-upstream: 0
- removed-upstream-stale: 0

## Changes by group

### AGENTS

**changed-locally-only**

- `AGENTS.md` → `AGENTS.md`

### lib

**new-upstream**

- `context/skills/_lib/processkit/schema_generation.py` → `context/skills/_lib/processkit/schema_generation.py`

### schemas/_generated

**new-upstream**

- `context/schemas/_generated/binding.yaml` → `context/schemas/_generated/binding.yaml`
- `context/schemas/_generated/decisionrecord.yaml` → `context/schemas/_generated/decisionrecord.yaml`
- `context/schemas/_generated/workitem.yaml` → `context/schemas/_generated/workitem.yaml`
- `context/schemas/_generated/logentry.yaml` → `context/schemas/_generated/logentry.yaml`

### schemas/src

**new-upstream**

- `context/schemas/src/fragments/record.yaml` → `context/schemas/src/fragments/record.yaml`
- `context/schemas/src/fragments/entity.yaml` → `context/schemas/src/fragments/entity.yaml`
- `context/schemas/src/fragments/relationship.yaml` → `context/schemas/src/fragments/relationship.yaml`
- `context/schemas/src/fragments/versioned.yaml` → `context/schemas/src/fragments/versioned.yaml`
- `context/schemas/src/fragments/generation.yaml.j2` → `context/schemas/src/fragments/generation.yaml.j2`
- `context/schemas/src/registry.yaml` → `context/schemas/src/registry.yaml`
- `context/schemas/src/compositions/decisionrecord.yaml` → `context/schemas/src/compositions/decisionrecord.yaml`
- `context/schemas/src/compositions/logentry.yaml` → `context/schemas/src/compositions/logentry.yaml`
- `context/schemas/src/primitives/binding.yaml` → `context/schemas/src/primitives/binding.yaml`
- `context/schemas/src/primitives/workitem.yaml` → `context/schemas/src/primitives/workitem.yaml`
- `context/schemas/src/templates/schema.yaml.j2` → `context/schemas/src/templates/schema.yaml.j2`

### skills/processkit

**new-upstream**

- `context/skills/processkit/repository-portfolio-review/SKILL.md` → `context/skills/processkit/repository-portfolio-review/SKILL.md`
