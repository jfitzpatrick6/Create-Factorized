#!/usr/bin/env python3
"""Build a Modrinth .mrpack export from the tracked pack folders."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import zipfile
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODS = ROOT / "mods"
EXPORTS = ROOT / "exports"
API = "https://api.modrinth.com/v2/version_files"
USER_AGENT = "Create-Factorized-Export/1.0 (private pack)"

PACK_NAME = "Create Factorized"
MC_VERSION = "1.21.1"
NEOFORGE_VERSION = "21.1.234"

OVERRIDE_DIRS = (
    "config",
    "kubejs",
    "defaultconfigs",
    "defaultoptions",
    "shaderpacks",
)

OVERRIDE_FILES = (
    "Launch-Pack.bat",
    "README.md",
)

SKIP_DIR_NAMES = {
    ".git",
    ".mixin.out",
    ".sable",
    "__pycache__",
    "mcps",
    "agent-tools",
    "server",
    "saves",
    "logs",
    "crash-reports",
    "terminals",
    "exports",
}

SKIP_FILE_NAMES = {
    ".gitignore",
    ".git.zip",
    "options.txt",
    "usercache.json",
    "usernamecache.json",
}


def git_short_hash() -> str:
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=ROOT,
            stderr=subprocess.DEVNULL,
            text=True,
        )
        return out.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "local"


def sha_hashes(path: Path) -> dict[str, str]:
    data = path.read_bytes()
    return {
        "sha1": hashlib.sha1(data).hexdigest(),
        "sha512": hashlib.sha512(data).hexdigest(),
    }


def modrinth_lookup(hashes: list[str]) -> dict[str, dict]:
    if not hashes:
        return {}

    body = json.dumps({"hashes": hashes, "algorithm": "sha512"}).encode()
    request = urllib.request.Request(
        API,
        data=body,
        headers={"Content-Type": "application/json", "User-Agent": USER_AGENT},
    )

    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def pick_primary_file(version: dict) -> dict:
    for entry in version.get("files", []):
        if entry.get("primary"):
            return entry
    files = version.get("files", [])
    if not files:
        raise ValueError(f"Modrinth version {version.get('id')} has no files")
    return files[0]


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIR_NAMES for part in path.parts)


def copy_tree(src: Path, dst: Path) -> None:
    if not src.exists():
        return

    for item in src.rglob("*"):
        rel = item.relative_to(src)
        if should_skip(rel):
            continue
        if item.is_dir():
            continue
        if item.name in SKIP_FILE_NAMES:
            continue

        target = dst / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(item, target)


def add_overrides(staging: Path) -> None:
    overrides = staging / "overrides"
    overrides.mkdir(parents=True, exist_ok=True)

    for folder in OVERRIDE_DIRS:
        copy_tree(ROOT / folder, overrides / folder)

    for filename in OVERRIDE_FILES:
        src = ROOT / filename
        if src.is_file():
            shutil.copy2(src, overrides / filename)


def resolve_mods(staging: Path) -> tuple[list[dict], list[str]]:
    jars = sorted(
        path
        for path in MODS.glob("*.jar")
        if ".bak" not in path.name.lower()
    )
    if not jars:
        raise SystemExit(f"No mod jars found in {MODS}")

    jar_hashes: dict[Path, str] = {}
    for jar in jars:
        jar_hashes[jar] = hashlib.sha512(jar.read_bytes()).hexdigest()

    lookup: dict[str, dict] = {}
    hash_list = list(jar_hashes.values())
    for offset in range(0, len(hash_list), 50):
        batch = hash_list[offset : offset + 50]
        try:
            lookup.update(modrinth_lookup(batch))
        except urllib.error.HTTPError as exc:
            raise SystemExit(f"Modrinth API error: {exc}") from exc
        time.sleep(0.15)

    files: list[dict] = []
    override_names: list[str] = []

    for jar in jars:
        digest = jar_hashes[jar]
        version = lookup.get(digest)
        if version is None:
            override_names.append(jar.name)
            target = staging / "overrides" / "mods" / jar.name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(jar, target)
            continue

        primary = pick_primary_file(version)
        files.append(
            {
                "path": f"mods/{primary['filename']}",
                "hashes": primary["hashes"],
                "env": {"client": "required", "server": "required"},
                "downloads": [primary["url"]],
                "fileSize": primary["size"],
            }
        )

    files.sort(key=lambda entry: entry["path"].lower())
    return files, override_names


def build_index(files: list[dict], version_id: str) -> dict:
    return {
        "formatVersion": 1,
        "game": "minecraft",
        "versionId": version_id,
        "name": PACK_NAME,
        "summary": (
            f"NeoForge {NEOFORGE_VERSION} factory modpack — Create, TFMG, KubeJS, "
            "FTB Quests. Private friend distribution."
        ),
        "files": files,
        "dependencies": {
            "minecraft": MC_VERSION,
            "neoforge": NEOFORGE_VERSION,
        },
    }


def write_mrpack(output: Path, index: dict, staging: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()

    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(
            "modrinth.index.json",
            json.dumps(index, indent=2) + "\n",
        )

        overrides = staging / "overrides"
        if overrides.exists():
            for path in sorted(overrides.rglob("*")):
                if path.is_file():
                    archive.write(path, path.relative_to(staging).as_posix())


def main() -> int:
    version_id = f"{date.today().isoformat()}-{git_short_hash()}"
    output = EXPORTS / f"create-factorized-{version_id}.mrpack"

    with tempfile.TemporaryDirectory(prefix="mrpack-export-") as tmp:
        staging = Path(tmp)
        add_overrides(staging)
        files, override_mods = resolve_mods(staging)
        index = build_index(files, version_id)
        write_mrpack(output, index, staging)

    size_mb = output.stat().st_size / (1024 * 1024)
    print(f"Wrote {output}")
    print(f"  Modrinth downloads: {len(index['files'])}")
    print(f"  Bundled overrides:  {len(override_mods)} mod(s)")
    if override_mods:
        for name in override_mods:
            print(f"    - {name}")
    print(f"  Size: {size_mb:.1f} MB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())