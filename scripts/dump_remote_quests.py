#!/usr/bin/env python3
"""Download all remote chapter SNBT and print id/group/filename."""

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


def chapter_info(text: str) -> tuple[str, str, str]:
    cid = re.search(r'^\tid:\s*"([^"]+)"', text, re.M)
    grp = re.search(r'^\tgroup:\s*"([^"]*)"', text, re.M)
    fname = re.search(r'filename:\s*"([^"]+)"', text)
    return (
        fname.group(1) if fname else "?",
        cid.group(1) if cid else "?",
        grp.group(1) if grp else "?",
    )


def main() -> int:
    secrets = json.loads(SECRETS.read_text(encoding="utf-8"))
    transport = paramiko.Transport((secrets["host"], int(secrets["port"])))
    transport.connect(username=secrets["username"], password=secrets["password"])
    sftp = paramiko.SFTPClient.from_transport(transport)

    cg = sftp.open("/config/ftbquests/quests/chapter_groups.snbt").read().decode("utf-8")
    print("chapter_groups.snbt:")
    print(cg[:800])
    print()

    for entry in sorted(sftp.listdir_attr("/config/ftbquests/quests/chapters")):
        if not entry.filename.endswith(".snbt"):
            continue
        path = f"/config/ftbquests/quests/chapters/{entry.filename}"
        text = sftp.open(path).read().decode("utf-8")
        name, cid, grp = chapter_info(text)
        quest_count = len(re.findall(r'^\t\t\{\s*$', text, re.M))
        print(f"{entry.filename}: id={cid} group={grp!r} quests~={quest_count}")

    lang = sftp.open("/config/ftbquests/quests/lang/en_us.snbt").read().decode("utf-8")
    chapter_titles = re.findall(r"chapter\.([0-9A-F]+)\.title:", lang)
    print()
    print(f"lang chapter titles: {len(chapter_titles)}")

    # nested duplicate?
    for extra in ("/config/config/ftbquests", "/kubejs/server_scripts/00_lock_ftb_quest_editor.js"):
        try:
            if extra.endswith(".js"):
                text = sftp.open(extra).read().decode("utf-8")
                print(f"{extra}: present ({len(text)} bytes)")
            else:
                print(extra, [a.filename for a in sftp.listdir_attr(extra)])
        except FileNotFoundError:
            print(f"{extra}: missing")

    sftp.close()
    transport.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())