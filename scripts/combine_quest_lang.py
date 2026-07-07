#!/usr/bin/env python3
"""Combine lang/en_us/ split files back to flat lang/en_us.snbt for FTB Quests 2101.1.x."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "config" / "ftbquests" / "quests"
LANG_DIR = ROOT / "lang"
FLAT_LANG = LANG_DIR / "en_us.snbt"
SPLIT_DIR = LANG_DIR / "en_us"

ENTRY_RE = re.compile(
    r"^\t([^\s:]+):\s*(?:\"((?:\\.|[^\"\\])*)\"|\[\s*\n((?:\t\t\"(?:\\.|[^\"\\])*\"\s*\n)+)\t\])",
    re.MULTILINE,
)


def parse_entries(text: str) -> dict[str, str | list[str]]:
    entries: dict[str, str | list[str]] = {}
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r"^\t([^\s:]+):\s*(.+)$", line)
        if not m:
            i += 1
            continue
        key, rest = m.group(1), m.group(2).strip()
        if rest == "[":
            block: list[str] = []
            i += 1
            while i < len(lines):
                row = lines[i]
                if row.strip() == "]":
                    break
                sm = re.match(r'^\t\t"((?:\\.|[^"\\])*)"\s*,?\s*$', row)
                if sm:
                    block.append(sm.group(1))
                i += 1
            entries[key] = block
        else:
            sm = re.match(r'^"((?:\\.|[^"\\])*)"\s*,?\s*$', rest)
            if sm:
                entries[key] = sm.group(1)
        i += 1
    return entries


def write_flat(entries: dict[str, str | list[str]]) -> None:
    lines = ["{"]
    for key in sorted(entries.keys()):
        value = entries[key]
        if isinstance(value, list):
            lines.append(f"\t{key}: [")
            for item in value:
                item_esc = item.replace("\\", "\\\\").replace('"', '\\"')
                lines.append(f'\t\t"{item_esc}"')
            lines.append("\t]")
        else:
            val_esc = value.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'\t{key}: "{val_esc}"')
    lines.append("}")
    FLAT_LANG.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    if not SPLIT_DIR.is_dir():
        if FLAT_LANG.is_file():
            print(f"Already flat: {FLAT_LANG}")
            return 0
        print(f"Missing {SPLIT_DIR}")
        return 1

    combined: dict[str, str | list[str]] = {}
    for path in sorted(SPLIT_DIR.rglob("*.snbt")):
        for key, value in parse_entries(path.read_text(encoding="utf-8")).items():
            combined[key] = value

    if not combined:
        print("No lang entries found to combine")
        return 1

    write_flat(combined)

    import shutil

    shutil.rmtree(SPLIT_DIR)
    print(f"Wrote {FLAT_LANG} ({len(combined)} keys)")
    print(f"Removed {SPLIT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())