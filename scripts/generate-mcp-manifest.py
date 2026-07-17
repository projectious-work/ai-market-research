#!/usr/bin/env -S uv run --quiet
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Generate the processkit MCP configuration manifest."""
from __future__ import annotations

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DOGFOOD_MANIFEST = REPO_ROOT / "context" / ".processkit-mcp-manifest.json"
SRC_MANIFEST = REPO_ROOT / "src" / "context" / ".processkit-mcp-manifest.json"
GATEWAY_CONFIG_REL = Path(
    "context/skills/processkit/processkit-gateway/mcp/mcp-config.json"
)


def _canonical_json(data: object) -> str:
    return json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _sha256_of_json(path: Path) -> str:
    return hashlib.sha256(_canonical_json(json.loads(path.read_text())).encode()).hexdigest()


def _context_rel(path: Path) -> str:
    rel = path.relative_to(REPO_ROOT)
    if rel.parts[:2] == ("src", "context"):
        return Path("context", *rel.parts[2:]).as_posix()
    return rel.as_posix()


def _processkit_version() -> str:
    override = os.environ.get("PROCESSKIT_VERSION", "").strip()
    if override:
        return override
    lock = REPO_ROOT / "aibox.lock"
    if lock.is_file():
        in_processkit = False
        for line in lock.read_text().splitlines():
            stripped = line.strip()
            if stripped.startswith("["):
                in_processkit = stripped == "[processkit]"
            elif in_processkit and stripped.startswith("version"):
                return stripped.partition("=")[2].strip().strip("\"'") or "unknown"
    return "unknown"


def _collect_json_configs() -> tuple[list[dict], list[dict]]:
    entries: list[dict] = []
    seen: set[str] = set()
    gateway: list[dict] = []
    for root in (REPO_ROOT / "context" / "skills", REPO_ROOT / "src" / "context" / "skills"):
        if not root.is_dir():
            continue
        for pattern in ("*/*/mcp/mcp-config.json", "*/mcp/mcp-config.json"):
            for path in sorted(root.glob(pattern)):
                rel = _context_rel(path)
                if rel in seen:
                    continue
                seen.add(rel)
                item = {"path": rel, "sha256": _sha256_of_json(path)}
                if rel == GATEWAY_CONFIG_REL.as_posix():
                    gateway.append(item)
                else:
                    entries.append(item)
    return sorted(entries, key=lambda item: item["path"]), gateway


def _pep723_header(path: Path) -> str | None:
    in_block = False
    lines: list[str] = []
    for line in path.read_text().splitlines():
        if not in_block:
            if line.strip() == "# /// script":
                in_block = True
                lines.append(line)
        else:
            lines.append(line)
            if line.strip() == "# ///":
                return "\n".join(lines) + "\n"
    return None


def _collect_server_headers() -> list[dict]:
    entries: list[dict] = []
    seen: set[str] = set()
    for root in (REPO_ROOT / "context" / "skills", REPO_ROOT / "src" / "context" / "skills"):
        if not root.is_dir():
            continue
        for path in sorted(root.glob("*/*/mcp/server.py")):
            rel = _context_rel(path)
            if rel in seen:
                continue
            seen.add(rel)
            header = _pep723_header(path)
            if header:
                entries.append({"path": rel, "sha256": hashlib.sha256(header.encode()).hexdigest()})
    return sorted(entries, key=lambda item: item["path"])


def _write(path: Path, manifest: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n")


def main() -> int:
    skills, gateway = _collect_json_configs()
    headers = _collect_server_headers()
    aggregate = hashlib.sha256("\n".join(item["sha256"] for item in skills).encode()).hexdigest()
    existing = json.loads(DOGFOOD_MANIFEST.read_text()) if DOGFOOD_MANIFEST.is_file() else {}
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if all(existing.get(key) == value for key, value in {
        "per_skill": skills, "per_gateway": gateway, "per_server_header": headers,
        "aggregate_sha256": aggregate, "processkit_version": _processkit_version(),
    }.items()):
        generated_at = existing.get("generated_at", generated_at)
    manifest = {"version": 1, "generated_at": generated_at,
                "processkit_version": _processkit_version(), "per_skill": skills,
                "per_gateway": gateway, "per_server_header": headers,
                "aggregate_sha256": aggregate}
    _write(DOGFOOD_MANIFEST, manifest)
    if (SRC_MANIFEST.parent / "skills").is_dir():
        _write(SRC_MANIFEST, manifest)
    print(f"wrote {len(skills)} skills and {len(headers)} server headers")
    return 0


if __name__ == "__main__":
    sys.exit(main())
