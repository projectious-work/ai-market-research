#!/usr/bin/env python3
"""Project canonical market-state data into Hugo's model roster data file."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


DOCS_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = DOCS_DIR.parent
SOURCE = REPO_ROOT / "data" / "market-state.json"
ROSTER_SOURCE = REPO_ROOT / "data" / "model-roster-v2.json"
OUTPUT = DOCS_DIR / "data" / "model-roster.json"

FAMILY_OVERRIDES = {
    "opus-4.7": "Claude 4",
    "sonnet-4.6": "Claude 4",
    "gpt-5.4": "GPT-5.4",
    "gpt-5.4-mini": "GPT-5.4",
    "gpt-5.4-nano": "GPT-5.4",
    "gpt-5.3-codex": "GPT-5.3",
    "gpt-5.3-codex-spark": "GPT-5.3",
    "gpt-5.2": "GPT-5.2",
    "gpt-5.2-codex": "GPT-5.2",
    "deepseek-v4-pro": "DeepSeek V4",
    "deepseek-v4-flash": "DeepSeek V4",
    "minimax-m2.7": "MiniMax M2.7",
    "grok-4.3": "Grok 4",
    "grok-4.1-fast": "Grok 4",
    "mistral-medium-3.5": "Mistral 3",
    "mistral-large-3": "Mistral 3",
    "subq-1m-preview": "SubQ",
    "nemotron-3-ultra": "Nemotron 3",
    "qwen3.8-max": "Qwen3.8",
    "qwen3.6-27b": "Qwen3.6",
    "glm-5.3": "GLM-5",
    "tencent-hy3": "Hunyuan Hy3",
    "seed2.1": "Seed2",
    "mimo-v2-flash": "MiMo V2",
    "inkling-small": "Inkling",
    "apertus-v1.5-8b": "Apertus v1.5",
    "apertus-v1.5-70b": "Apertus v1.5",
}


def split_context_label(label: str) -> tuple[str, str | None]:
    """Split a parenthetical context qualifier onto its own display line."""
    match = re.fullmatch(r"(.+?)\s+\((.+)\)", label)
    if not match:
        return label, None
    return match.group(1), match.group(2)


def released_model_ids() -> set[str]:
    """Return model IDs shipped in the most recent Git release tag."""
    try:
        tag = subprocess.check_output(
            ["git", "describe", "--tags", "--abbrev=0"],
            cwd=REPO_ROOT,
            text=True,
        ).strip()
        released_source = subprocess.check_output(
            ["git", "show", f"{tag}:data/market-state.json"],
            cwd=REPO_ROOT,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return set()
    payload = json.loads(released_source)
    return {model["id"] for model in payload["models"]}


def main() -> None:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    roster_source = json.loads(ROSTER_SOURCE.read_text(encoding="utf-8"))
    released_ids = released_model_ids()
    families = {
        model["id"]: model.get("family", model["name"])
        for model in roster_source["models"]
    }
    models = []
    for model in source["models"]:
        context_label, context_note = split_context_label(
            model["context_label"]
        )
        models.append({
            "name": model["name"],
            "is_new": bool(released_ids and model["id"] not in released_ids),
            "family": families.get(
                model["id"], FAMILY_OVERRIDES.get(model["id"], model["name"])
            ),
            "provider": model["provider"],
            "context": model["context"],
            "context_label": context_label,
            "context_note": context_note,
            "modalities": model.get("modalities", ["text"]),
            "api_in": model.get("api_in"),
            "api_out": model.get("api_out"),
            "api_cache_hit": model.get("api_cache_hit"),
        })
    models.sort(
        key=lambda model: (
            model["provider"].casefold(),
            model["family"].casefold(),
            model["name"].casefold(),
        )
    )
    payload = {
        "researched_at": source.get("researched_at"),
        "models": models,
    }
    OUTPUT.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {OUTPUT} ({len(models)} models)")


if __name__ == "__main__":
    main()
