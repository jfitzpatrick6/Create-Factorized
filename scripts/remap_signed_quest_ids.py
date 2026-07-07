#!/usr/bin/env python3
"""Remap wing quest IDs from 8F01* to 7F01* (signed-int-safe for FTB Quests 2101.1.x)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTS = ROOT / "config" / "ftbquests" / "quests"
WING_CHAPTER_FILES = [
    "ore_processing_factory.snbt",
    "storage_factory.snbt",
    "petrochem_factory.snbt",
    "electronics_factory.snbt",
    "architecture_factory.snbt",
    "aeronautics_factory.snbt",
]
TARGETS = [
    QUESTS / "chapter_groups.snbt",
    QUESTS / "lang" / "en_us.snbt",
    *[QUESTS / "chapters" / name for name in WING_CHAPTER_FILES],
]

OLD_PREFIX = "8F01"
NEW_PREFIX = "7F01"


def remap_text(text: str) -> tuple[str, int]:
    count = text.count(OLD_PREFIX)
    if count == 0:
        return text, 0
    return text.replace(OLD_PREFIX, NEW_PREFIX), count


def main() -> int:
    total = 0
    for path in TARGETS:
        if not path.is_file():
            print(f"MISSING {path}")
            return 1
        text = path.read_text(encoding="utf-8")
        new_text, count = remap_text(text)
        if count:
            path.write_text(new_text, encoding="utf-8")
            print(f"remapped {path.relative_to(ROOT)} ({count} replacements)")
            total += count

    if total == 0:
        print("No 8F01 IDs found — already remapped?")
        return 0

    # quick sanity: no 8F01 left in quests tree
    leftover = []
    for path in QUESTS.rglob("*"):
        if path.is_file() and OLD_PREFIX in path.read_text(encoding="utf-8"):
            leftover.append(str(path.relative_to(ROOT)))
    if leftover:
        print("WARNING: 8F01 still present in:", leftover)

    print(f"Done — {total} ID prefix replacements")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())