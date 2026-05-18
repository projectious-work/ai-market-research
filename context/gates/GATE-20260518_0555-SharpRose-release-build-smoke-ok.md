---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0555-SharpRose-release-build-smoke-ok
  created: '2026-05-18T05:55:57+00:00'
spec:
  name: release-build-smoke-ok
  description: 'Phase 4 — build + UI smoke test: release-check passes and a human/agent
    visually verifies all tabs render'
  kind: hybrid
  validator: bash src/scripts/release-check.sh exits 0 (JSON valid, build succeeds,
    no __MARKET_DATA__ placeholder leak). A human or sub-agent opens dist/dashboard.html
    in a browser and visually confirms all six tabs (Dashboard, Models, Harnesses,
    Self-Hosting, Strategy, Sources) render without JS errors and that filter controls
    still respond.
  blocking: true
  evidence_required: false
  validator_command: bash src/scripts/release-check.sh
---
