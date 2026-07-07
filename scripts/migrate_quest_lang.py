#!/usr/bin/env python3
"""Deprecated — FTB Quests 2101.1.x uses flat lang/en_us.snbt, not lang/en_us/ directories."""

from __future__ import annotations

import sys


def main() -> int:
    print(
        "ERROR: Do not use migrate_quest_lang.py for FTB Quests 2101.1.x.\n"
        "That release loads flat config/ftbquests/quests/lang/en_us.snbt only.\n"
        "If you have a split lang/en_us/ directory, run: python scripts/combine_quest_lang.py"
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())