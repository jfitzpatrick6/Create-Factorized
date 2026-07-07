#!/usr/bin/env python3
"""Inspect remote FTB Quest lang files and chapter ID alignment."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import paramiko
except ImportError:
    raise SystemExit("pip install paramiko")

ROOT = Path(__file__).resolve().parents[1]
SECRETS = ROOT / "local" / "sftp.secrets.json"


def main() -> int:
    secrets = json.loads(SECRETS.read_text(encoding="utf-8"))
    transport = paramiko.Transport((secrets["host"], int(secrets["port"])))
    transport.connect(username=secrets["username"], password=secrets["password"])
    sftp = paramiko.SFTPClient.from_transport(transport)

    chapter_ids: dict[str, str] = {}
    for entry in sftp.listdir_attr("/config/ftbquests/quests/chapters"):
        if not entry.filename.endswith(".snbt"):
            continue
        text = sftp.open(f"/config/ftbquests/quests/chapters/{entry.filename}").read().decode("utf-8")
        cid = re.search(r'^\tid:\s*"([^"]+)"', text, re.M)
        if cid:
            chapter_ids[entry.filename] = cid.group(1)

    lang_keys: set[str] = set()

    def walk(remote_dir: str) -> None:
        for entry in sftp.listdir_attr(remote_dir):
            remote_path = f"{remote_dir}/{entry.filename}"
            if entry.st_mode and (entry.st_mode & 0o170000) == 0o040000:
                walk(remote_path)
            elif entry.filename.endswith(".snbt"):
                text = sftp.open(remote_path).read().decode("utf-8")
                for key in re.findall(r"^\t([^\s:]+):", text, re.M):
                    lang_keys.add(key)

    lang_root = "/config/ftbquests/quests/lang"
    try:
        entries = [e.filename for e in sftp.listdir_attr(lang_root)]
    except FileNotFoundError:
        print("MISSING lang folder")
        return 1

    bad = 0
    print("lang root:", entries)
    has_flat = "en_us.snbt" in entries
    has_split = "en_us" in entries
    if has_split:
        print("  ERROR: lang/en_us/ directory is ignored by FTB Quests 2101.1.x — remove it and use en_us.snbt")
        bad += 1
        walk(f"{lang_root}/en_us")
    if "en_us.snbt.bak" in entries:
        print("  WARNING: stale en_us.snbt.bak on server (not loaded)")
        bad += 1
    if not has_flat:
        print("  ERROR: missing lang/en_us.snbt on server")
        bad += 1
    else:
        text = sftp.open(f"{lang_root}/en_us.snbt").read().decode("utf-8")
        lang_keys.update(re.findall(r"^\t([^\s:]+):", text, re.M))

    chapter_title_keys = {k for k in lang_keys if k.startswith("chapter.") and k.endswith(".title")}
    group_title_keys = {k for k in lang_keys if k.startswith("chapter_group.") and k.endswith(".title")}
    quest_title_keys = {k for k in lang_keys if k.startswith("quest.") and k.endswith(".title")}

    print(f"lang keys: {len(lang_keys)} total, {len(chapter_title_keys)} chapter titles, {len(quest_title_keys)} quest titles")

    print("\nChapter ID vs lang title:")
    for file_name, cid in sorted(chapter_ids.items()):
        key = f"chapter.{cid}.title"
        ok = key in lang_keys
        print(f"  {file_name}: {cid} -> {key} {'OK' if ok else 'MISSING'}")
        if not ok:
            bad += 1

    print("\nChapter groups in chapter_groups.snbt:")
    groups = sftp.open("/config/ftbquests/quests/chapter_groups.snbt").read().decode("utf-8")
    for gid in re.findall(r'^\s*id:\s*"([^"]+)"', groups, re.M):
        key = f"chapter_group.{gid}.title"
        ok = key in lang_keys
        print(f"  {gid} -> {key} {'OK' if ok else 'MISSING'}")
        if not ok:
            bad += 1

    data = sftp.open("/config/ftbquests/quests/data.snbt").read().decode("utf-8")
    print("\ndata.snbt:")
    for field in ("fallback_locale", "disable_gui"):
        m = re.search(rf"{field}:\s*\"?([^\"\n]+)\"?", data)
        print(f"  {field}: {m.group(1).strip() if m else '?'}")

    sftp.close()
    transport.close()
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())