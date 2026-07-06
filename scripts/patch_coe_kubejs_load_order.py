#!/usr/bin/env python3
"""Patch Create Ore Excavation 1.6.8 for KubeJS Create compatibility.

COE 1.6.8 ships inverted branch bytecode in KubeJSExcavation: it registers its
ProcessingOutput wrapper when kubejs_create *is* loaded, which makes KubeJS
Create crash with "ProcessingOutput already exists".

This script flips ifeq -> ifne in registerTypeWrappers and registerRecipeComponents.
"""

from __future__ import annotations

import os
import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JAR = ROOT / "mods" / "createoreexcavation-1.21-1.6.8.jar"
PLUGIN_CLASS = "com/tom/createores/kubejs/KubeJSExcavation.class"
META = "META-INF/neoforge.mods.toml"

# getstatic kubeJSCreate; ifeq +N  =>  getstatic kubeJSCreate; ifne +N
BYTECODE_FIXES = (
    (bytes.fromhex("b200419a000e"), bytes.fromhex("b200419d000e"), "registerTypeWrappers"),
    (bytes.fromhex("b200419a000c"), bytes.fromhex("b200419d000c"), "registerRecipeComponents"),
)

KUBEJS_CREATE_ORDERING_OLD = """[[dependencies.createoreexcavation]]
    modId="kubejs_create"
    type="optional"
    versionRange="[2101.3.1-build.14,)"
    ordering="NONE"
    side="BOTH\""""

KUBEJS_CREATE_ORDERING_NEW = """[[dependencies.createoreexcavation]]
    modId="kubejs_create"
    type="optional"
    versionRange="[2101.3.1-build.14,)"
    ordering="AFTER"
    side="BOTH\""""


def patch_plugin_class(data: bytes) -> tuple[bytes, list[str]]:
    patched = data
    changes: list[str] = []

    for old, new, label in BYTECODE_FIXES:
        count = patched.count(old)
        if count == 0:
            if new in patched:
                changes.append(f"{label}: already fixed")
                continue
            raise ValueError(f"{label}: expected bytecode {old.hex()} not found")
        if count != 1:
            raise ValueError(f"{label}: expected one match, found {count}")
        patched = patched.replace(old, new)
        changes.append(f"{label}: ifeq -> ifne")

    return patched, changes


def patch_jar(jar_path: Path) -> bool:
    if not jar_path.is_file():
        print(f"COE jar not found: {jar_path}", file=sys.stderr)
        return False

    with zipfile.ZipFile(jar_path, "r") as zin:
        try:
            plugin_data = zin.read(PLUGIN_CLASS)
            meta_text = zin.read(META).decode("utf-8")
        except KeyError as exc:
            print(f"Missing {exc} in {jar_path.name}", file=sys.stderr)
            return False

    try:
        plugin_data, plugin_changes = patch_plugin_class(plugin_data)
    except ValueError as exc:
        print(f"Bytecode patch failed: {exc}", file=sys.stderr)
        return False

    meta_changes: list[str] = []
    if KUBEJS_CREATE_ORDERING_OLD in meta_text:
        meta_text = meta_text.replace(KUBEJS_CREATE_ORDERING_OLD, KUBEJS_CREATE_ORDERING_NEW)
        meta_changes.append("mods.toml: kubejs_create ordering AFTER")
    elif 'modId="kubejs_create"' in meta_text and 'ordering="AFTER"' in meta_text.split("kubejs_create")[-1][:200]:
        meta_changes.append("mods.toml: ordering already AFTER")

    if not plugin_changes and not meta_changes:
        print(f"No changes needed for {jar_path.name}")
        return True

    backup = jar_path.with_suffix(".jar.bak")
    if not backup.exists():
        shutil.copy2(jar_path, backup)

    with tempfile.TemporaryDirectory() as tmp:
        extracted = Path(tmp) / "jar"
        with zipfile.ZipFile(jar_path, "r") as zin:
            zin.extractall(extracted)

        (extracted / PLUGIN_CLASS).write_bytes(plugin_data)
        if meta_changes and "ordering AFTER" in meta_changes[0]:
            (extracted / META).write_text(meta_text, encoding="utf-8")

        patched = jar_path.with_name(jar_path.stem + ".patched.jar")
        with zipfile.ZipFile(patched, "w", compression=zipfile.ZIP_DEFLATED) as zout:
            for root, _, files in os.walk(extracted):
                for file in files:
                    fp = Path(root) / file
                    zout.write(fp, fp.relative_to(extracted).as_posix())

        shutil.move(patched, jar_path)

    print(f"Patched {jar_path.name}")
    for change in plugin_changes + meta_changes:
        print(f"  - {change}")
    return True


def main() -> int:
    return 0 if patch_jar(JAR) else 1


if __name__ == "__main__":
    raise SystemExit(main())