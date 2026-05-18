---
apiVersion: processkit.projectious.work/v2
kind: DecisionRecord
metadata:
  id: DEC-20260518_0554-DaringCoral-10-phase-release-process-with-per
  created: '2026-05-18T05:54:56+00:00'
  updated: '2026-05-18T05:55:19+00:00'
spec:
  title: 10-phase release process with per-phase Gates, process-definition Artifact,
    and AGENTS.md wiring
  state: accepted
  decision: 'Adopt a 10-phase release process for ai-market-research, modelled as
    one process-definition Artifact + 10 Gate entities (one per phase). The phases
    are: (0) scope+version decision, (1) market data refresh, (2) sources & citations
    audit, (3) security & data privacy sweep, (4) build + UI smoke test, (5) pk-doctor
    + pk-release-audit, (6) documentation update (README + future docs), (7) release
    notes assembly, (8) cut release via `release.sh`, (9) post-release verification.
    Every phase is gated; release.sh is only invoked after all blocking gates pass.
    AGENTS.md gains a "Release process" section that points at the Artifact and the
    gate set, so any agent reading AGENTS.md on a "make a release" request can load
    the process definition and walk it.'
  context: Established v0.2.2; release.sh handles the mechanical tag/push/deploy/gh-release
    path, but the human/agent prep work (data refresh, citations audit, privacy sweep,
    docs, notes) was tacit. The maintainer wants a documented, processkit-modelled
    workflow so that "make a patch/minor/major release" requests are reproducible
    and auditable, not improvised each time. In v2 processkit, Process is legacy —
    the v2 pattern is `process_instance` WorkItems referencing a process-definition
    Artifact, with Gate entities providing per-phase enforcement.
  rationale: Option B (Process + Gates) over Option A (WorkItem epic only) was chosen
    because Gates give machine-readable "is the release ready" — release.sh can refuse
    to proceed when a blocking gate hasn't passed, and each gate evaluation lands
    as a LogEntry so the audit trail per release is queryable. The documentation phase
    was added between phases 5 and 6 (formerly "release notes assembly") because README
    and future docs need to reflect the release's content changes; deferring docs
    to "later" tends to mean "never."
  alternatives:
  - option: WorkItem-epic only (Option A)
    rejected_because: No machine-readable enforcement; phase completion is by convention,
      easy to skip under time pressure.
  - option: Skip the documentation phase, treat docs as a periodic chore
    rejected_because: Maintainer explicitly added it back — README/docs drift faster
      than expected when not gated per release.
  - option: Per-release Process entity (v1 pattern)
    rejected_because: Process is legacy in v2 (see context/skills/processkit/process-management/SKILL.md).
      v2 model is Artifact + process_instance WorkItem + Gates.
  - option: Hardcoded checklist in AGENTS.md only, no entities
    rejected_because: Loses the audit trail — no LogEntry per gate evaluation, no
      queryable record of past releases' compliance.
  consequences: |
    Each future release creates a process_instance WorkItem epic with one step per phase, evaluating the corresponding Gate as each phase completes. release.sh remains the deploy mechanic; the new wrapper is the process. Adds slight ceremony per release (10 gate evaluations vs the current 1 release.sh call), in exchange for reproducibility, auditability, and the ability to surface "what's left before this release can ship" at any moment.</consequences>
    <parameter name="state">accepted
  decided_at: '2026-05-18T05:55:19+00:00'
---
