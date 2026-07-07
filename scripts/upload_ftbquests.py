#!/usr/bin/env python3
"""Force-upload config/ftbquests to the Modrinth server."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

try:
    import paramiko
except ImportError:
    raise SystemExit("pip install paramiko")

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / "config" / "ftbquests"
SECRETS = ROOT / "local" / "sftp.secrets.json"

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ftbquests_lang import cleanup_remote_lang, ensure_local_layout, verify_remote_flat_lang  # noqa: E402


def main() -> int:
    key_count = ensure_local_layout()
    if key_count is None:
        return 1

    if not SECRETS.is_file():
        raise SystemExit(
            f"SFTP secrets not found: {SECRETS}\n"
            "Copy scripts/sftp.secrets.example.json to local/sftp.secrets.json"
        )

    secrets = json.loads(SECRETS.read_text(encoding="utf-8"))
    transport = paramiko.Transport((secrets["host"], int(secrets["port"])))
    transport.connect(username=secrets["username"], password=secrets["password"])
    sftp = paramiko.SFTPClient.from_transport(transport)

    def ensure(path: str) -> None:
        parts = [p for p in path.strip("/").split("/") if p]
        cur = ""
        for part in parts:
            cur += "/" + part
            try:
                sftp.stat(cur)
            except FileNotFoundError:
                sftp.mkdir(cur)

    count = 0
    for dirpath, _, files in os.walk(LOCAL):
        lp = Path(dirpath)
        rel = lp.relative_to(LOCAL).as_posix()
        remote = "/config/ftbquests" if rel == "." else f"/config/ftbquests/{rel}"
        ensure(remote)
        for name in files:
            if name.endswith(".bak"):
                continue
            remote_file = f"{remote}/{name}".replace("//", "/")
            sftp.put(str(lp / name), remote_file)
            count += 1
            print(f"uploaded {remote_file}")

    cleanup_remote_lang(sftp)
    verify_remote_flat_lang(sftp, key_count)

    sftp.close()
    transport.close()
    print(f"Done — {count} file(s), {key_count} lang keys on server")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())