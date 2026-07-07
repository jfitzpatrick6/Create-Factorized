#!/usr/bin/env python3
"""Shared helpers for FTB Quests 2101.1.x flat lang/en_us.snbt layout."""

from __future__ import annotations

import re
import sys
from pathlib import Path

QUESTS_ROOT = Path(__file__).resolve().parents[1] / "config" / "ftbquests" / "quests"
FLAT_LANG = QUESTS_ROOT / "lang" / "en_us.snbt"
SPLIT_LANG_DIR = QUESTS_ROOT / "lang" / "en_us"

KEY_RE = re.compile(r"^\t([^\s:]+):", re.MULTILINE)
MIN_LANG_KEYS = 100


def count_lang_keys(text: str) -> int:
    return len(KEY_RE.findall(text))


def validate_local_layout() -> tuple[list[str], int]:
    errors: list[str] = []
    if SPLIT_LANG_DIR.is_dir():
        errors.append(
            "lang/en_us/ split directory is not loaded by FTB Quests 2101.1.x — "
            "combine back to lang/en_us.snbt: python scripts/combine_quest_lang.py"
        )
    if not FLAT_LANG.is_file():
        errors.append("missing lang/en_us.snbt (required for FTB Quests 2101.1.x)")
        return errors, 0

    text = FLAT_LANG.read_text(encoding="utf-8")
    key_count = count_lang_keys(text)
    if key_count < MIN_LANG_KEYS:
        errors.append(
            f"lang/en_us.snbt has only {key_count} keys (expected at least {MIN_LANG_KEYS})"
        )
    return errors, key_count


def ensure_local_layout() -> int | None:
    errors, key_count = validate_local_layout()
    if errors:
        print("FAIL — quest lang layout:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return None
    return key_count


REMOTE_LANG_ROOT = "/config/ftbquests/quests/lang"


def remove_remote_path(sftp, path: str) -> None:
    try:
        attrs = sftp.stat(path)
    except FileNotFoundError:
        return

    if attrs.st_mode and (attrs.st_mode & 0o170000) == 0o040000:
        for entry in sftp.listdir_attr(path):
            remove_remote_path(sftp, f"{path}/{entry.filename}")
        sftp.rmdir(path)
    else:
        sftp.remove(path)
    print(f"removed stale {path}")


def cleanup_remote_lang(sftp) -> None:
    remove_remote_path(sftp, f"{REMOTE_LANG_ROOT}/en_us")
    remove_remote_path(sftp, f"{REMOTE_LANG_ROOT}/en_us.snbt.bak")


def verify_remote_flat_lang(sftp, expected_keys: int) -> None:
    remote_path = f"{REMOTE_LANG_ROOT}/en_us.snbt"
    try:
        text = sftp.open(remote_path).read().decode("utf-8")
    except FileNotFoundError:
        raise SystemExit(f"remote verification failed: missing {remote_path}")

    remote_keys = count_lang_keys(text)
    if remote_keys < expected_keys:
        raise SystemExit(
            f"remote verification failed: {remote_path} has {remote_keys} keys "
            f"(expected {expected_keys})"
        )
    print(f"verified {remote_path} ({remote_keys} lang keys)")