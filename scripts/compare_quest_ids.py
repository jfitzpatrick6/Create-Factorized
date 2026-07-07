#!/usr/bin/env python3
"""Compare local vs remote FTB Quest chapter/group IDs."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / "config" / "ftbquests" / "quests"
REMOTE = ROOT / "local" / "server-debug" / "quests"


def read_id_group(path: Path) -> tuple[str, str, str]:
    text = path.read_text(encoding="utf-8")
    cid = re.search(r'^\tid:\s*"([^"]+)"', text, re.M)
    grp = re.search(r'^\tgroup:\s*"([^"]*)"', text, re.M)
    fname = re.search(r'filename:\s*"([^"]+)"', text)
    return (
        fname.group(1) if fname else path.stem,
        cid.group(1) if cid else "?",
        grp.group(1) if grp else "?",
    )


def main() -> int:
    if not REMOTE.is_dir():
        print(f"Missing {REMOTE} — download server quests first.")
        return 1

    print("Chapter ID mismatches (local vs server):")
    bad = 0
    for local_path in sorted((LOCAL / "chapters").glob("*.snbt")):
        remote_path = REMOTE / "chapters" / local_path.name
        if not remote_path.is_file():
            print(f"  MISSING on server: {local_path.name}")
            bad += 1
            continue
        lname, lid, lgrp = read_id_group(local_path)
        rname, rid, rgrp = read_id_group(remote_path)
        if lid != rid or lgrp != rgrp:
            print(f"  {lname}:")
            print(f"    local  id={lid} group={lgrp}")
            print(f"    server id={rid} group={rgrp}")
            bad += 1

    lg = (LOCAL / "chapter_groups.snbt").read_text(encoding="utf-8")
    rg = (REMOTE / "chapter_groups.snbt").read_text(encoding="utf-8")
    lgroups = re.findall(r'id:\s*"([^"]+)"', lg)
    rgroups = re.findall(r'id:\s*"([^"]+)"', rg)
    if lgroups != rgroups:
        print("chapter_groups.snbt IDs differ:")
        print(f"  local:  {lgroups}")
        print(f"  server: {rgroups}")
        bad += 1

    if bad:
        print(f"\n{bad} mismatch(es) — re-upload config/ftbquests from git.")
        return 1

    print("All chapter/group IDs match.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())