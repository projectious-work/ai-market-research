---
apiVersion: processkit.projectious.work/v1
kind: Migration
metadata:
  id: MIG-RUNTIME-DRIFT-20260515T191051
  created: 2026-05-15 19:10:51+00:00
  updated: '2026-05-17T13:05:21+00:00'
spec:
  source: aibox-runtime-drift
  source_url: aibox://runtime-drift
  to_version: 0.26.5
  variant: 3
  state: applied
  generated_by: aibox apply
  generated_at: 2026-05-15 19:10:51+00:00
  summary: 1 drifted managed runtime file(s) found at 0.26.5
  started_at: '2026-05-17T13:05:21+00:00'
  applied_at: '2026-05-17T13:05:21+00:00'
  progress_notes:
  - timestamp: '2026-05-17T13:05:21+00:00'
    actor: mcp
    note: 'Resolved: live .aibox-home/.claude.json is Claude Code''s own runtime cache
      (userID/OAuth/projects/skill usage), not a user customization. Marked preserve-as-is
      — no canonical content to restore (0.26.5 template was {}). Superseded in spirit
      by 0.26.7 which removes the file from the managed template entirely.'
---

# Migration MIG-RUNTIME-DRIFT-20260515T191051

## Drifted managed runtime files (Variant 3 — BR-CLEANUP-ARCH item 6)

The following managed `.aibox-home/` runtime files have been modified on the host and match **neither** the current canonical aibox generation **nor** any known archived template snapshot. They may represent intentional user customisations.

`aibox apply` left these files **untouched**. Review each one and decide whether to preserve the local edit or restore the canonical generated content.

## Per-file recommendations

| file | reason-for-classification | recommendation |
|------|--------------------------|----------------|
| `.aibox-home/.claude.json` | content matches neither current canonical nor any archived snapshot | review-manually |

## How to resolve

For each file above, choose one of:
- **`preserve-as-is`** — keep your local edit; mark this migration applied.
- **`overwrite-with-canonical`** — run `aibox apply --force-runtime-file <path>` (once that flag ships) or manually copy the canonical content from `context/templates/aibox-home/<version>/<path>`.
- **`review-manually`** — compare live vs canonical using your diff tool and cherry-pick the parts you want to keep.
