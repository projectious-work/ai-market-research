#!/usr/bin/env bash
# Phase 2 — Sources & citations audit (gate: release-citations-valid)
#
# Validates that every cite: [n,n] reference in data/market-state.json
# resolves to an entry in data.sources. Also checks provider_sources
# and section_sources for orphan n's.
set -euo pipefail
REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)"
. "$REPO_ROOT/src/scripts/release/_lib.sh"
cd "$REPO_ROOT"

python3 - <<'PY'
import json, sys, pathlib
DATA = pathlib.Path("data/market-state.json")
d = json.loads(DATA.read_text())
sources = d.get("sources") or []
ns = {s.get("n") for s in sources}

bad = []
def walk(obj, path=""):
    if isinstance(obj, dict):
        if "cite" in obj and isinstance(obj["cite"], list):
            for n in obj["cite"]:
                if n not in ns:
                    bad.append((path or "(root)", n))
        for k, v in obj.items():
            walk(v, f"{path}.{k}" if path else k)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            walk(v, f"{path}[{i}]")
walk(d)

for prov, nums in (d.get("provider_sources") or {}).items():
    for n in nums:
        if n not in ns:
            bad.append((f"provider_sources.{prov}", n))
for sect, nums in (d.get("section_sources") or {}).items():
    for n in nums:
        if n not in ns:
            bad.append((f"section_sources.{sect}", n))

if bad:
    print(f"  [FAIL] {len(bad)} orphan cite reference(s):")
    for path, n in bad[:20]:
        print(f"         {path} → n={n}")
    if len(bad) > 20:
        print(f"         (+{len(bad)-20} more)")
    sys.exit(1)

print(f"  [ok]   {len(sources)} sources, all cite/provider/section refs resolve")
PY
