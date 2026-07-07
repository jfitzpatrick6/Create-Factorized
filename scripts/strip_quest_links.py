#!/usr/bin/env python3
"""Remove quest_links from FTB Quest chapter SNBT files (8F01* IDs break server load)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

CHAPTERS = Path(__file__).resolve().parents[1] / "config" / "ftbquests" / "quests" / "chapters"
QUEST_LINKS_RE = re.compile(r"\tquest_links:\s*\[[\s\S]*?\n\t\]\n", re.MULTILINE)


def main() -> int:
    changed = 0
    for path in sorted(CHAPTERS.glob("*.snbt")):
        text = path.read_text(encoding="utf-8")
        if "quest_links:" not in text:
            continue
        if re.search(r"\tquest_links:\s*\[\s*\]", text):
            continue
        new_text, count = QUEST_LINKS_RE.subn("\tquest_links: [ ]\n", text, count=1)
        if count:
            path.write_text(new_text, encoding="utf-8")
            print(f"stripped quest_links from {path.name}")
            changed += 1
    if changed:
        print(f"Done — updated {changed} chapter file(s)")
        return 0
    print("No quest_links to strip")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())