#!/usr/bin/env python3
"""Inspect remote Modrinth server FTB Quest files for editor corruption."""

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
EXPECTED_GROUPS = [
    "7F01E00000000002",
    "7F01F00000000002",
    "7F00D00000000002",
    "7F01A00000000002",
    "7F01B00000000002",
    "7F01C00000000002",
    "7F01D00000000002",
]
EXPECTED_CHAPTERS = {
    "ore_processing_factory.snbt": ("7F01E00000000001", "7F01E00000000002"),
    "petrochem_factory.snbt": ("7F01A00000000001", "7F01A00000000002"),
    "factory_kitchen.snbt": ("7F00D00000000001", "7F00D00000000002"),
}


def main() -> int:
    secrets = json.loads(SECRETS.read_text(encoding="utf-8"))
    transport = paramiko.Transport((secrets["host"], int(secrets["port"])))
    transport.connect(username=secrets["username"], password=secrets["password"])
    sftp = paramiko.SFTPClient.from_transport(transport)

    def read(path: str) -> str:
        with sftp.open(path) as handle:
            return handle.read().decode("utf-8")

    bad = 0
    cg = read("/config/ftbquests/quests/chapter_groups.snbt")
    ids = re.findall(r'^\s*id:\s*"([^"]+)"', cg, re.M)
    print("chapter_groups:", ids)
    if ids != EXPECTED_GROUPS:
        print("  EXPECTED:", EXPECTED_GROUPS)
        bad += 1

    for file_name, (exp_id, exp_group) in EXPECTED_CHAPTERS.items():
        text = read(f"/config/ftbquests/quests/chapters/{file_name}")
        cid = re.search(r'^\tid:\s*"([^"]+)"', text, re.M)
        grp = re.search(r'^\tgroup:\s*"([^"]*)"', text, re.M)
        got_id = cid.group(1) if cid else "?"
        got_grp = grp.group(1) if grp else "?"
        ok = got_id == exp_id and got_grp == exp_group
        print(f"{file_name}: id={got_id} group={got_grp} {'OK' if ok else 'BAD'}")
        if not ok:
            bad += 1

    data = read("/config/ftbquests/quests/data.snbt")
    print("disable_gui:", "true" if "disable_gui: true" in data else "false")

    for path in ("/world/ftbquests", "/world/serverconfig/ftbquests"):
        try:
            entries = [a.filename for a in sftp.listdir_attr(path)]
            print(path, entries)
        except FileNotFoundError:
            print(path, "missing")

    sftp.close()
    transport.close()
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())