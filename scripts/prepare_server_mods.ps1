# Copy pack files into server/ and omit known client-only jars.
# Usage: powershell -File scripts/prepare_server_mods.ps1 [-ServerDir server]

param(
    [string]$ServerDir = (Join-Path (Split-Path $PSScriptRoot -Parent) "server")
)

$Root = Split-Path $PSScriptRoot -Parent
$ModsSrc = Join-Path $Root "mods"
$ModsDst = Join-Path $ServerDir "mods"

# Pure client rendering / UI — safe to omit on dedicated server.
# Keep jei + fzzy_config: other mods declare them as mandatory dependencies.
$ClientOnlyPatterns = @(
    "iris-neoforge",
    "sodium-neoforge",
    "jeiworldgen",
    "createjeicompat",
    "appleskin-neoforge",
    "entityculling-neoforge",
    "Controlling-neoforge",
    "Searchables-neoforge",
    "defaultoptions-neoforge",
    "ferritecore",
    "DistantHorizons",
    "lithium-neoforge",
    "MouseTweaks-neoforge",
    "SSRD-",
    "kubejs-create"
)

function Test-ClientOnly([string]$Name) {
    foreach ($pat in $ClientOnlyPatterns) {
        if ($Name -like "*$pat*") { return $true }
    }
    return $false
}

if (-not (Test-Path $ServerDir)) {
    Write-Error "Server directory not found: $ServerDir. Run the NeoForge installer first (see docs/SERVER_SETUP.md)."
    exit 1
}

$PatchScript = Join-Path $Root "scripts\patch_coe_kubejs_load_order.py"
if (Test-Path $PatchScript) {
    python $PatchScript
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to patch createoreexcavation load order. See scripts/patch_coe_kubejs_load_order.py"
        exit 1
    }
}

New-Item -ItemType Directory -Force -Path $ModsDst | Out-Null

$skipped = @()
$copied = 0
Get-ChildItem $ModsSrc -Filter "*.jar" | ForEach-Object {
    if (Test-ClientOnly $_.Name) {
        $skipped += $_.Name
    } else {
        Copy-Item $_.FullName (Join-Path $ModsDst $_.Name) -Force
        $copied++
    }
}

foreach ($folder in @("config", "kubejs", "defaultconfigs", "datapacks")) {
    $src = Join-Path $Root $folder
    if (Test-Path $src) {
        Copy-Item $src (Join-Path $ServerDir $folder) -Recurse -Force
    }
}

Write-Host "Copied $copied mod jars to $ModsDst"
Write-Host "Skipped $($skipped.Count) client-only jars:"
$skipped | ForEach-Object { Write-Host "  $_" }