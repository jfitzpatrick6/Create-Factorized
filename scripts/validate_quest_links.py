#!/usr/bin/env python3
"""Fail if FTB Quests quest_links reference IDs that exceed Java signed long."""

from __future__ import annotations

import re
import sys
from pathlib import Path

LINKED_QUEST_RE = re.compile(r'linked_quest:\s*"([0-9A-Fa-f]+)"')
MAX_SIGNED_HEX = 0x7FFFFFFFFFFFFFFF


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    chapters = root / "config" / "ftbquests" / "quests" / "chapters"
    bad: list[tuple[str, str]] = []

    for snbt in sorted(chapters.glob("*.snbt")):
        text = snbt.read_text(encoding="utf-8")
        for quest_id in LINKED_QUEST_RE.findall(text):
            value = int(quest_id, 16)
            if value > MAX_SIGNED_HEX:
                bad.append((snbt.name, quest_id))

    if bad:
        print("Invalid quest_links (linked_quest must fit in signed 64-bit hex):")
        for file_name, quest_id in bad:
            print(f"  {file_name}: {quest_id}")
        print("Use quest dependencies instead, or re-ID targets with 0-7 leading nybble.")
        return 1

    print("quest_links OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())