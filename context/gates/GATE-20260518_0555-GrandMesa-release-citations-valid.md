---
apiVersion: processkit.projectious.work/v2
kind: Gate
metadata:
  id: GATE-20260518_0555-GrandMesa-release-citations-valid
  created: '2026-05-18T05:55:47+00:00'
spec:
  name: release-citations-valid
  description: 'Phase 2 — sources & citations audit: every cite reference resolves;
    sources.md aligned with data.sources'
  kind: hybrid
  validator: 'All `cite: [n,n]` arrays in data/market-state.json reference an `n`
    that exists in data.sources. Any new vendors/products added since last release
    are reflected in data.provider_sources, data.section_sources, and data.sources.
    src/sources.md still corresponds to data.sources at the category level.'
  blocking: true
  evidence_required: true
  validator_command: 'python3 -c "import json; d=json.load(open(''data/market-state.json''));
    ns={s[''n''] for s in d.get(''sources'',[])}; bad=[]; \nfor e in (d.get(''harnesses'',[])
    + d.get(''agent_policies'',[])):\n    for n in (e.get(''cite'') or []):\n        if
    n not in ns: bad.append((e.get(''id'') or e.get(''provider''), n))\nprint(''OK''
    if not bad else ''BAD: '' + repr(bad))"'
---
