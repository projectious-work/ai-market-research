---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260727_0742-ClearSpring-migrate-the-published-site-from-raw
  created: '2026-07-27T07:42:23+00:00'
  updated: '2026-07-27T07:42:34+00:00'
spec:
  title: Migrate the published site from raw dashboard.html on gh-pages root to a
    Hugo + Docsy documentation site
  state: accepted
  decision: Adopt a Hugo + Docsy documentation site as the published site, with the
    existing self-contained report embedded via iframe at /report/ instead of being
    the site root. The report's own build pipeline (data/*.json -> src/scripts/build.py
    -> dist/dashboard.html) is unchanged. New scripts/{build,serve,deploy}-docs.sh
    build the Hugo site (rebuilding the report and copying it to static/report/dashboard.html
    first) and publish the Hugo public/ output to the gh-pages branch via a git worktree,
    preserving the no-GitHub-Actions rule and the Pages branch/HTTPS verification
    that src/scripts/deploy.sh used to perform. src/scripts/deploy.sh is now a thin
    deprecated wrapper that delegates to scripts/deploy-docs.sh; src/scripts/release/phase8-cut.sh
    and phase6-docs-current.sh were updated to match. A new Signal Room brand mark
    (a "room" shell with nested signal-wave bands converging on a solid accent source,
    echoing the brand icon's own layered-petal construction) was designed and wired
    into the navbar, static/logo/, and favicons, replacing the placeholder favicon.
    themes/docsy is vendored as a git submodule pinned to the same pre-restructure
    commit kubeclaw uses, and assets/scss carries the same projectious.work brand
    tokens (color scales, type scale) as kubeclaw's Docsy theming.
  context: The published site at https://projectious-work.github.io/ai-market-research/
    was a single self-contained dist/dashboard.html file, built by src/scripts/build.py
    and copied directly to the root of the gh-pages branch by src/scripts/deploy.sh
    (per DEC-20260517_1455-DeftLynx). The user asked to migrate the whole one-page
    site into a Hugo-based site using the Docsy theme, matching the style and README
    structure of the sibling project projectious-work/kubeclaw, aligned to the projectious.work
    brand guide (projectious-work/brand), with a new project logo and an updated favicon.
  rationale: |
    - Matches the explicit ask: migrate the one-page site into a Hugo/Docsy site styled like kubeclaw and the projectious.work brand, with its own logo and favicon.
    - Reuses the exact brand SCSS token structure kubeclaw already validated (contrast ratios, dark-mode overrides, code-block treatment) rather than re-deriving brand-to-Bootstrap mappings from scratch.
    - Keeps the report build pipeline (data validation, JSON->HTML embedding) completely untouched -- only how the resulting artifact is packaged and published changes, so release gates (phase4 build smoke, phase8 cut) needed only path updates, not logic changes.
    - Preserves the repository's hard "no GitHub Actions" deployment constraint and the existing Pages-config verification logic (branch/path/build_type/https_enforced), rather than loosening it for convenience.
  alternatives:
  - option: Keep dashboard.html as gh-pages root and add a separate /docs/ Hugo site
      alongside it
    rejected_because: Produces two disconnected surfaces (a bare dashboard homepage
      plus an unlinked docs site) instead of one coherent, branded site with consistent
      navigation, which is what was actually requested.
  - option: Convert the dashboard's own markup into native Hugo/Docsy content pages
      instead of embedding it as a self-contained iframe
    rejected_because: The dashboard is a hand-built, self-contained artifact with
      its own JS-free chart rendering and __MARKET_DATA__ substitution; re-authoring
      it as Hugo templates would risk the data/methodology logic during a purely presentational
      migration and lose the 'no JS framework, no build chain' property called out
      in AGENTS.md.
  - option: Use Docsy's current upstream structure (theme/ subdirectory, Hugo Modules)
      instead of pinning to kubeclaw's older commit
    rejected_because: kubeclaw's hugo.yaml assumes the classic layouts-at-root Docsy
      layout; matching its exact submodule commit keeps the two sibling sites structurally
      identical and avoids reconciling two different Docsy integration styles.
  consequences: |
    - The live site still reflects the pre-migration deployment (raw dashboard.html at gh-pages root) until someone runs scripts/deploy-docs.sh; this decision records the architecture, it does not itself deploy.
    - Building the site now requires `hugo` (extended) and `node`/`npm` in addition to python3/bash/git, and a submodule checkout (`git submodule update --init --recursive themes/docsy`) before first build.
    - Two build artifacts now exist: dist/dashboard.html (the report) and public/ (the full Hugo site); static/report/dashboard.html is a generated, gitignored copy bridging the two.
    - src/scripts/deploy.sh remains callable (delegates to scripts/deploy-docs.sh) so any external muscle memory or documentation still referencing it keeps working, but new work should call scripts/deploy-docs.sh directly.
    - Future favicon/logo changes must regenerate both assets/favicons/*.png (Hugo-served) and static/logo/*.svg (README/GitHub-rendered) since they are separate copies for different rendering contexts.
  decided_at: '2026-07-27T07:42:23+00:00'
  supersedes: DEC-20260517_1455-DeftLynx
---
