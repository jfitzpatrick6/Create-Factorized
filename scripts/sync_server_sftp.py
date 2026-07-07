#!/usr/bin/env python3
"""Upload prepared server pack files to the Modrinth dedicated server via SFTP."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    import paramiko
except ImportError:
    print("Missing dependency: pip install paramiko", file=sys.stderr)
    raise SystemExit(1)

ROOT = Path(__file__).resolve().parents[1]
SERVER_DIR = ROOT / "server"
SECRETS = ROOT / "local" / "sftp.secrets.json"
UPLOAD_DIRS = ("mods", "config", "kubejs", "defaultconfigs", "datapacks")
SCRIPTS = Path(__file__).resolve().parent


def load_secrets(path: Path) -> dict:
    if not path.is_file():
        raise SystemExit(
            f"SFTP secrets not found: {path}\n"
            "Copy scripts/sftp.secrets.example.json to local/sftp.secrets.json and fill in credentials."
        )
    data = json.loads(path.read_text(encoding="utf-8"))
    for key in ("host", "port", "username", "password", "remotePath"):
        if key not in data:
            raise SystemExit(f"SFTP secrets missing required field: {key}")
    return data


def ensure_remote_dir(sftp: paramiko.SFTPClient, remote_dir: str) -> None:
    parts = [p for p in remote_dir.replace("\\", "/").split("/") if p]
    current = ""
    for part in parts:
        current = f"{current}/{part}"
        try:
            sftp.stat(current)
        except FileNotFoundError:
            sftp.mkdir(current)


def index_remote_tree(sftp: paramiko.SFTPClient, remote_root: str) -> dict[str, int]:
    """Map remote relative paths under remote_root to file sizes."""

    sizes: dict[str, int] = {}
    root = remote_root.rstrip("/") or "/"

    def walk(remote_dir: str, prefix: str) -> None:
        for entry in sftp.listdir_attr(remote_dir):
            name = entry.filename
            if name in (".", ".."):
                continue
            rel = f"{prefix}/{name}" if prefix else name
            remote_path = f"{root}/{rel}".replace("//", "/")
            if entry.st_mode and (entry.st_mode & 0o170000) == 0o040000:
                walk(remote_path, rel)
            else:
                sizes[rel.replace("\\", "/")] = int(entry.st_size)

    try:
        walk(root, "")
    except FileNotFoundError:
        pass
    return sizes


def upload_tree(
    sftp: paramiko.SFTPClient,
    local_root: Path,
    remote_root: str,
    *,
    dry_run: bool,
) -> tuple[int, int]:
    files_uploaded = 0
    bytes_uploaded = 0
    remote_index = index_remote_tree(sftp, remote_root)

    for path in sorted(local_root.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(local_root).as_posix()
        remote_path = f"{remote_root.rstrip('/')}/{rel}".replace("//", "/")
        local_size = path.stat().st_size
        if remote_index.get(rel) == local_size:
            continue

        if dry_run:
            print(f"DRY RUN upload {path} -> {remote_path}")
            files_uploaded += 1
            bytes_uploaded += local_size
            continue

        ensure_remote_dir(sftp, "/".join(remote_path.split("/")[:-1]))
        local_stat = path.stat()
        sftp.put(str(path), remote_path)
        sftp.utime(remote_path, (local_stat.st_atime, local_stat.st_mtime))
        files_uploaded += 1
        bytes_uploaded += local_size
        print(f"uploaded {rel}", flush=True)

    return files_uploaded, bytes_uploaded


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--secrets",
        type=Path,
        default=SECRETS,
        help="Path to SFTP secrets JSON (default: local/sftp.secrets.json)",
    )
    parser.add_argument(
        "--skip-prepare",
        action="store_true",
        help="Skip running scripts/prepare_server_mods.ps1 before upload",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="List files that would be uploaded without transferring",
    )
    args = parser.parse_args()

    sys.path.insert(0, str(SCRIPTS))
    key_count = None
    if not args.dry_run:
        from ftbquests_lang import ensure_local_layout  # noqa: E402

        key_count = ensure_local_layout()
        if key_count is None:
            return 1

    if not args.skip_prepare and not args.dry_run:
        import subprocess

        prep = ROOT / "scripts" / "prepare_server_mods.ps1"
        print(f"Running {prep.name}...")
        subprocess.run(
            ["powershell", "-NoProfile", "-File", str(prep)],
            cwd=ROOT,
            check=True,
        )

    if not SERVER_DIR.is_dir():
        raise SystemExit(f"Server directory not found: {SERVER_DIR}")

    secrets = load_secrets(args.secrets)
    remote_base = secrets["remotePath"].rstrip("/") or ""

    def remote_join(*parts: str) -> str:
        cleaned = [p.strip("/") for p in parts if p and p.strip("/")]
        return "/" + "/".join(cleaned) if cleaned else "/"

    transport = paramiko.Transport((secrets["host"], int(secrets["port"])))
    transport.connect(username=secrets["username"], password=secrets["password"])
    sftp = paramiko.SFTPClient.from_transport(transport)

    total_files = 0
    total_bytes = 0
    try:
        for folder in UPLOAD_DIRS:
            local_dir = SERVER_DIR / folder
            if not local_dir.is_dir():
                print(f"skip missing local folder: {folder}")
                continue
            remote_dir = remote_join(remote_base, folder)
            print(f"sync {local_dir} -> {remote_dir}")
            files, nbytes = upload_tree(
                sftp,
                local_dir,
                remote_dir,
                dry_run=args.dry_run,
            )
            total_files += files
            total_bytes += nbytes
            print(f"  {folder}: {files} file(s), {nbytes / 1024 / 1024:.1f} MiB")
            if folder == "config" and not args.dry_run and key_count is not None:
                from ftbquests_lang import cleanup_remote_lang, verify_remote_flat_lang  # noqa: E402

                cleanup_remote_lang(sftp)
                verify_remote_flat_lang(sftp, key_count)
    finally:
        sftp.close()
        transport.close()

    action = "would upload" if args.dry_run else "uploaded"
    print(f"Done — {action} {total_files} file(s), {total_bytes / 1024 / 1024:.1f} MiB total")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())