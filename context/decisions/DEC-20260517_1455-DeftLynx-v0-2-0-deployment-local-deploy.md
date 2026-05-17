---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260517_1455-DeftLynx-v0-2-0-deployment-local-deploy
  created: '2026-05-17T14:55:27+00:00'
spec:
  title: 'v0.2.0 deployment: local deploy.sh + gh-pages branch source, no GitHub Actions'
  state: accepted
  decision: 'Deploy `dist/dashboard.html` to GitHub Pages from the local container
    via a `src/scripts/deploy.sh` script that uses `git worktree` to commit and push
    a built site to a `gh-pages` orphan branch. The script auto-enables Pages on first
    run via `gh api` (source: branch=gh-pages, path=/). A new `src/scripts/release.sh`
    orchestrator wires release-check → tag → push → deploy → GitHub Release. No GitHub
    Actions workflow is added.'
  context: v0.1.0 published the dashboard as a release asset (`dashboard-v0.1.0.html`)
    but never deployed it as a hosted site. For v0.2.0 the owner wants the dashboard
    reachable at a stable URL via GitHub Pages — but wants the build + deploy to remain
    fully local (no GH Actions runner). The owner also plans to move to Hugo as the
    static site generator after v0.2.0 ships, so this deploy mechanism must remain
    simple and dependency-free to avoid lock-in.
  rationale: Without GitHub Actions, the only Pages mode is branch-source. `git worktree`
    keeps the deploy script zero-dep (no npm `gh-pages` package, no rsync wrapper),
    preserves the main working tree, and naturally lands a single deterministic commit
    per deploy on the `gh-pages` branch. Auto-enabling Pages via `gh api` removes
    a manual setup step and is idempotent. Keeping deploy and release as separate
    scripts preserves the read-only nature of release-check and lets ad-hoc redeploys
    (content-only updates) skip the tag/release machinery.
  alternatives:
  - option: GitHub Actions Pages workflow
    rejected_because: Owner explicitly excluded Actions for v0.2.0; wants local-deploy
      control.
  - option: Use docs/ on main as Pages source
    rejected_because: docs/ is already used for CLI upgrade briefings (host-side notes);
      polluting it with the built dashboard mixes audiences.
  - option: npm gh-pages package
    rejected_because: Adds a Node.js dependency to a project that today only needs
      python3 + bash + git + gh. Lock-in cost not justified.
  - option: Rename build output to dist/index.html
    rejected_because: Breaks the dashboard-vX.Y.Z.html release-asset naming convention
      from v0.1.0. Owner chose to keep dashboard.html as canonical and copy to index.html
      at deploy time.
  consequences: 'A `gh-pages` orphan branch will exist in the repo (created on first
    deploy). Site URL: https://projectious-work.github.io/ai-market-research/ (visibility
    follows repo visibility). Future Hugo migration will need to either replace deploy.sh
    entirely or have deploy.sh learn a Hugo build path — clean swap point. Every release.sh
    run rewrites gh-pages with a fresh commit; deploy history is intentionally shallow
    (no need to rebase or merge).'
  decided_at: '2026-05-17T14:55:27+00:00'
---
