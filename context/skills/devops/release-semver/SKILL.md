---
name: release-semver
description: "Prepare semantic-versioned releases, including version selection, changelogs, tags, publishing, and post-release verification."
metadata:
  processkit:
    apiVersion: processkit.projectious.work/v2
    id: SKILL-release-semver
    version: "1.2.0"
    created: 2026-04-06T00:00:00Z
    category: devops
    layer: 3
---

# Semantic Versioning Release Process

## Intro

Use this skill to prepare and publish a release with a consistent semantic
version, curated changelog, verified tag, and distribution-channel release.

## Overview

1. Classify the change: patch for compatible fixes, minor for compatible
   features, and major for breaking changes.
2. Run the project's canonical release process and all required checks.
3. Update every relevant version file and the changelog in one commit.
4. Create and push an annotated `vX.Y.Z` tag only from the verified release
   commit.
5. Publish and verify the distribution-channel release and its assets.

## Gotchas

- Do not treat a pushed tag as a published release; verify the release
  channel separately.
- Do not publish from a dirty worktree or before the release checks pass.
- Do not retag an already published version; cut a new patch release.
- Keep user-visible changelog entries distinct from internal maintenance.
- Follow project-specific release gates when they are stricter than this
  generic workflow.

## Full reference

Use the repository's release process as the source of truth for commands,
required evidence, and branch policy.
