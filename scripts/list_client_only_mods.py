#!/usr/bin/env python3
"""List mod jars that declare client-only or CLIENT distribution in NeoForge metadata."""

from __future__ import annotations

import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODS = ROOT / "mods"

CLIENT_PATTERNS = (
    re.compile(r"displayTest\s*=\s*[\"']IGNORE_SERVER_VERSION[\"']", re.I),
    re.compile(r"displayTest\s*=\s*[\"']IGNORE_ALL_VERSION[\"']", re.I),
    re.compile(r"side\s*=\s*[\"']CLIENT[\"']", re.I),
    re.compile(r"dist\s*=\s*[\"']CLIENT[\"']", re.I),
)

# Known render/UI mods that are safe to omit on dedicated server even if metadata is loose.
KNOWN_CLIENT_ONLY = {
    "iris-neoforge",
    "sodium-neoforge",
    "sodiumextras",
    "reeses-sodium-options",
    "entityculling",
    "notenoughanimations",
    "controlling",
    "searchables",
    "fzzy_config",
    "immediatelyfast",
    "modmenu",
    "jei",  # JEI is client UI; server runs without it
    "jeiworldgen",
    "createjeicompat",
    "appleskin",
    "xaerominimap",
    "xaeroworldmap",
    "journeymap",
    "oculus",
    "embeddium",
    "iris",
    "sodium",
    "ferritecore",  # client perf; optional on server
    "konkrete",
    "fancymenu",
    "fancymenu_neoforge",
    "defaultoptions",  # client keybind defaults only
}


def jar_stem(name: str) -> str:
    return name.lower().replace(".jar", "")


def is_known_client_only(filename: str) -> bool:
    stem = jar_stem(filename)
    return any(k in stem for k in KNOWN_CLIENT_ONLY)


def scan_jar(path: Path) -> list[str]:
    reasons: list[str] = []
    try:
        with zipfile.ZipFile(path) as zf:
            meta = [n for n in zf.namelist() if n.endswith("neoforge.mods.toml") or n.endswith("mods.toml")]
            if not meta:
                return reasons
            text = zf.read(meta[0]).decode("utf-8", errors="replace")
            for pat in CLIENT_PATTERNS:
                if pat.search(text):
                    reasons.append(pat.pattern)
    except zipfile.BadZipFile:
        reasons.append("bad zip")
    return reasons


def main() -> int:
    if not MODS.is_dir():
        print(f"mods folder not found: {MODS}", file=sys.stderr)
        return 1

    client_only: list[tuple[str, str]] = []
    for jar in sorted(MODS.glob("*.jar")):
        reasons = scan_jar(jar)
        if reasons or is_known_client_only(jar.name):
            label = "metadata" if reasons else "heuristic"
            client_only.append((jar.name, label))

    print(f"Client-only candidates ({len(client_only)}):")
    for name, label in client_only:
        print(f"  {name}  [{label}]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())