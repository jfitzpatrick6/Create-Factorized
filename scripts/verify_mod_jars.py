#!/usr/bin/env python3
"""Verify mod jars are readable ZIPs with pack.mcmeta."""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path


def check_jar(path: Path) -> str | None:
    try:
        with zipfile.ZipFile(path) as zf:
            zf.read("pack.mcmeta")
        return None
    except Exception as exc:
        return str(exc)


def main() -> int:
    root = Path(__file__).resolve().parents[1] / "mods"
    bad: list[str] = []
    for jar in sorted(root.glob("*.jar")):
        err = check_jar(jar)
        if err:
            bad.append(f"{jar.name}: {err}")
    if bad:
        print("Corrupt mod jar(s):")
        for line in bad:
            print(f"  - {line}")
        return 1
    print(f"OK — {len(list(root.glob('*.jar')))} mod jar(s) readable")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())