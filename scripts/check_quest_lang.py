#!/usr/bin/env python3
"""Validate FTB Quests SNBT integrity: lang coverage and editor-corruption signals."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "config" / "ftbquests" / "quests"
LANG_DIR = ROOT / "lang" / "en_us"
FLAT_LANG = ROOT / "lang" / "en_us.snbt"
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


def read_lang_text() -> str:
    if FLAT_LANG.is_file():
        return FLAT_LANG.read_text(encoding="utf-8")
    if not LANG_DIR.is_dir():
        return ""
    parts: list[str] = []
    for path in sorted(LANG_DIR.rglob("*.snbt")):
        parts.append(path.read_text(encoding="utf-8"))
    return "\n".join(parts)


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
        group_ids = re.findall(r'^\s*id:\s*"([^"]+)"', groups_text, re.M)
        if any(not gid.startswith("7F01") and gid != "7F00D00000000002" for gid in group_ids):
            errors.append(
                "chapter_groups.snbt has random group IDs (in-game editor save). "
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

        chapter_id = re.search(r'^\tid:\s*"([^"]+)"', text, re.M)
        if name in WING_CHAPTERS and chapter_id and not chapter_id.group(1).startswith("7F01"):
            errors.append(
                f"{path.name}: chapter id {chapter_id.group(1)} looks editor-randomized "
                "(restore from git)"
            )

    return errors


def check_lang_layout() -> list[str]:
    errors: list[str] = []
    if LANG_DIR.is_dir():
        errors.append(
            "lang/en_us/ split directory is not loaded by FTB Quests 2101.1.x — "
            "combine back to lang/en_us.snbt: python scripts/combine_quest_lang.py"
        )
    if not FLAT_LANG.is_file():
        errors.append("missing lang/en_us.snbt (required for FTB Quests 2101.1.x)")
    return errors


def check_formatting() -> list[str]:
    errors: list[str] = []
    lang = read_lang_text()
    for line_no, line in enumerate(lang.splitlines(), 1):
        if re.search(r"(?<!\\)& ", line):
            errors.append(f"lang:{line_no}: unescaped '& ' (use \\& for literal and)")
    return errors


def check_lang() -> list[str]:
    errors: list[str] = []
    lang = read_lang_text()
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


def check_quest_links() -> list[str]:
    import subprocess

    script = Path(__file__).resolve().parent / "validate_quest_links.py"
    proc = subprocess.run([sys.executable, str(script)], capture_output=True, text=True)
    if proc.returncode != 0:
        return [proc.stdout.strip() or proc.stderr.strip() or "invalid quest_links detected"]
    return []


def main() -> int:
    layout = check_lang_layout()
    corruption = check_corruption()
    links = check_quest_links()
    formatting = check_formatting()
    lang = check_lang()

    if layout:
        print("FAIL — quest lang layout:")
        for err in layout:
            print(f"  - {err}")

    if formatting:
        print("FAIL — quest lang formatting:")
        for err in formatting:
            print(f"  - {err}")

    if corruption:
        print("FAIL — quest SNBT corruption detected:")
        for err in corruption:
            print(f"  - {err}")

    if links:
        print("FAIL — quest_links:")
        for err in links:
            print(f"  - {err}")
        print("  Run: python scripts/strip_quest_links.py")

    if lang:
        print("FAIL — quest/lang ID mismatch:")
        for err in lang:
            print(f"  - {err}")

    if layout or corruption or links or formatting or lang:
        print(
            "\nCause: in-game FTB Quests editor saves rewrite chapter files with random IDs. "
            "Titles live in config/ftbquests/quests/lang/en_us.snbt and must match chapter IDs."
        )
        return 1

    quest_count = sum(len(quest_ids_in_chapter(p.read_text(encoding="utf-8"))) for p in CHAPTERS.glob("*.snbt"))
    print(f"OK — {quest_count} quests have matching en_us lang entries; no editor corruption signals.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())