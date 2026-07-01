#!/usr/bin/env python3
"""
Validate FTB Quests item task/reward/icon IDs against the installed modpack.

Scans:
  - config/ftbquests/quests/chapters/*.snbt
  - mods/*.jar (item models + data item JSON)
  - kubejs/startup_scripts/*.js (event.create registrations)

Usage (from modpack root):
  python scripts/validate_quest_items.py
  python scripts/validate_quest_items.py --mods-dir mods --quests-dir config/ftbquests/quests/chapters

Exit code 0 = all referenced items found; 1 = missing items reported.
"""

from __future__ import annotations

import argparse
import io
import re
import sys
import zipfile
from pathlib import Path

ITEM_ID_RE = re.compile(r'id:\s*"([a-z0-9_.-]+:[a-z0-9_./-]+)"', re.IGNORECASE)
KUBEJS_CREATE_RE = re.compile(r"event\.create\(['\"]([a-z0-9_./-]+)['\"]")
MODEL_ITEM_RE = re.compile(r"assets/([^/]+)/models/item/([^/]+)\.json$", re.IGNORECASE)
BLOCK_ITEM_MODEL_RE = re.compile(
    r"assets/([^/]+)/models/block/([^/]+)/item\.json$", re.IGNORECASE
)
DATA_ITEM_RE = re.compile(r"data/([^/]+)/(?:items|item)/([^/]+)\.json$", re.IGNORECASE)
ITEM_TEXTURE_RE = re.compile(r"assets/([^/]+)/textures/item/([^/]+)\.png$", re.IGNORECASE)
LANG_ENTRY_RE = re.compile(
    r'"(?:item|block)\.([a-z0-9_.-]+)\.([a-z0-9_./-]+)"\s*:', re.IGNORECASE
)
JSON_ITEM_ID_RE = re.compile(
    r'"(?:id|item|name)"\s*:\s*"([a-z0-9_.-]+:[a-z0-9_./-]+)"', re.IGNORECASE
)
NESTED_JAR_RE = re.compile(r"META-INF/jarjar/.+\.jar$", re.IGNORECASE)

# Vanilla quest references — skip jar lookup (registry always present in-game).
TRUSTED_NAMESPACES = frozenset({"minecraft"})


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def collect_quest_item_ids(quests_dir: Path) -> dict[str, list[str]]:
    refs: dict[str, list[str]] = {}
    for snbt in sorted(quests_dir.glob("*.snbt")):
        text = snbt.read_text(encoding="utf-8")
        for item_id in ITEM_ID_RE.findall(text):
            refs.setdefault(item_id, []).append(snbt.name)
    return refs


def collect_kubejs_items(kubejs_dir: Path) -> set[str]:
    items: set[str] = set()
    startup = kubejs_dir / "startup_scripts"
    if not startup.is_dir():
        return items
    for js in startup.glob("*.js"):
        text = js.read_text(encoding="utf-8", errors="replace")
        for name in KUBEJS_CREATE_RE.findall(text):
            items.add(f"kubejs:{name}")
    return items


def _add_item_from_paths(items: set[str], path: str) -> None:
    m = MODEL_ITEM_RE.match(path)
    if m:
        ns, item_name = m.groups()
        items.add(f"{ns}:{item_name}")
        return
    m = BLOCK_ITEM_MODEL_RE.match(path)
    if m:
        ns, item_name = m.groups()
        items.add(f"{ns}:{item_name}")
        return
    m = DATA_ITEM_RE.match(path)
    if m:
        ns, item_name = m.groups()
        items.add(f"{ns}:{item_name}")
        return
    m = ITEM_TEXTURE_RE.match(path)
    if m:
        ns, item_name = m.groups()
        items.add(f"{ns}:{item_name}")


def _scan_jar_entries(zf: zipfile.ZipFile, items: set[str]) -> None:
    json_texts: list[str] = []
    nested_jars: list[bytes] = []

    for name in zf.namelist():
        if NESTED_JAR_RE.match(name):
            nested_jars.append(zf.read(name))
            continue

        _add_item_from_paths(items, name)

        if name.endswith(".json") and (
            "/lang/" in name or name.startswith("data/") or "/loot_table/" in name
        ):
            try:
                json_texts.append(zf.read(name).decode("utf-8", errors="replace"))
            except KeyError:
                pass

    for text in json_texts:
        for ns, item_name in LANG_ENTRY_RE.findall(text):
            items.add(f"{ns}:{item_name}")
        for item_id in JSON_ITEM_ID_RE.findall(text):
            items.add(item_id)

    for blob in nested_jars:
        try:
            with zipfile.ZipFile(io.BytesIO(blob), "r") as nested:
                _scan_jar_entries(nested, items)
        except zipfile.BadZipFile:
            pass


def collect_jar_items(mods_dir: Path) -> set[str]:
    items: set[str] = set()
    if not mods_dir.is_dir():
        return items
    for jar_path in sorted(mods_dir.glob("*.jar")):
        try:
            with zipfile.ZipFile(jar_path, "r") as zf:
                _scan_jar_entries(zf, items)
        except zipfile.BadZipFile:
            print(f"warn: skipping bad zip {jar_path.name}", file=sys.stderr)
    return items


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate FTB Quest item IDs")
    parser.add_argument(
        "--quests-dir",
        type=Path,
        default=repo_root() / "config" / "ftbquests" / "quests" / "chapters",
    )
    parser.add_argument("--mods-dir", type=Path, default=repo_root() / "mods")
    parser.add_argument("--kubejs-dir", type=Path, default=repo_root() / "kubejs")
    args = parser.parse_args()

    quest_refs = collect_quest_item_ids(args.quests_dir)
    known = collect_jar_items(args.mods_dir) | collect_kubejs_items(args.kubejs_dir)

    missing: list[tuple[str, list[str]]] = []
    for item_id, files in sorted(quest_refs.items()):
        ns = item_id.split(":", 1)[0]
        if ns in TRUSTED_NAMESPACES:
            continue
        if item_id not in known:
            missing.append((item_id, files))

    print(f"Quest item references: {len(quest_refs)}")
    print(f"Known mod/kubejs items: {len(known)}")
    print(f"Missing (non-vanilla): {len(missing)}")

    if missing:
        print("\nMissing items (check JEI / startup scripts / mod updates):")
        for item_id, files in missing:
            loc = ", ".join(sorted(set(files)))
            print(f"  {item_id}  [{loc}]")
        return 1

    print("\nOK — all non-vanilla quest item IDs resolve in mods/ or kubejs startup.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())