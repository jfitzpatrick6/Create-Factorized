#!/usr/bin/env python3
"""Validate FTB Quests SNBT integrity: lang coverage and editor-corruption signals."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "config" / "ftbquests" / "quests"
LANG = ROOT / "lang" / "en_us.snbt"
CHAPTERS = ROOT / "chapters"
CHAPTER_GROUPS = ROOT / "chapter_groups.snbt"

# Chapters that must belong to a wing group (not Factory Support).
WING_CHAPTERS = frozenset({
    "ore_processing_factory",
    "storage_factory",
    "petrochem_factory",
    "electronics_factory",
    "architecture_factory",
    "aeronautics_factory",
})


def quest_ids_in_chapter(text: str) -> list[str]:
    m = re.search(r"quests:\s*\[(.*)\n\t\]", text, re.S)
    if not m:
        return []
    ids = []
    for quest in re.split(r"\n\t\t\{", m.group(1)):
        qm = re.search(r'\bid:\s*"([0-9A-F]+)"', quest)
        if qm:
            ids.append(qm.group(1))
    return ids


def check_corruption() -> list[str]:
    errors: list[str] = []

    if CHAPTER_GROUPS.is_file():
        groups_text = CHAPTER_GROUPS.read_text(encoding="utf-8")
        if 'id: "1F93D35140E43BA9"' in groups_text or "icon:" not in groups_text:
            errors.append(
                "chapter_groups.snbt looks editor-corrupted (missing icons or auto-generated IDs). "
                "Restore from git: git checkout HEAD -- config/ftbquests/"
            )

    for path in sorted(CHAPTERS.glob("*.snbt")):
        text = path.read_text(encoding="utf-8")
        fname = re.search(r'filename:\s*"([^"]+)"', text)
        name = fname.group(1) if fname else path.stem

        if re.search(r"item:\s*\{\s*\}", text):
            errors.append(f"{path.name}: empty item tasks (question-mark icons)")

        group = re.search(r'group:\s*"([^"]*)"', text)
        if name in WING_CHAPTERS and group and group.group(1) == "":
            errors.append(f"{path.name}: empty chapter group (editor stripped wing assignment)")

    return errors


def check_lang() -> list[str]:
    errors: list[str] = []
    lang = LANG.read_text(encoding="utf-8")
    lang_quest = set(re.findall(r"quest\.([0-9A-F]+)\.", lang))

    for path in sorted(CHAPTERS.glob("*.snbt")):
        text = path.read_text(encoding="utf-8")
        missing = [q for q in quest_ids_in_chapter(text) if q not in lang_quest]
        if missing:
            errors.append(
                f"{path.name}: {len(missing)} quest(s) missing en_us titles "
                f"(e.g. {missing[0]})"
            )
    return errors


def main() -> int:
    corruption = check_corruption()
    lang = check_lang()

    if corruption:
        print("FAIL — quest SNBT corruption detected:")
        for err in corruption:
            print(f"  - {err}")

    if lang:
        print("FAIL — quest/lang ID mismatch:")
        for err in lang:
            print(f"  - {err}")

    if corruption or lang:
        print(
            "\nCause: opening the in-game FTB Quests editor and saving rewrites chapter "
            "files with new random IDs and strips item tasks. Titles live in "
            "config/ftbquests/quests/lang/en_us.snbt and will show as Unknown until restored."
        )
        return 1

    quest_count = sum(len(quest_ids_in_chapter(p.read_text(encoding="utf-8"))) for p in CHAPTERS.glob("*.snbt"))
    print(f"OK — {quest_count} quests have matching en_us lang entries; no editor corruption signals.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())