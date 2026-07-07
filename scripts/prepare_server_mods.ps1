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
    $dst = Join-Path $ServerDir $folder
    if (Test-Path $src) {
        if ($folder -eq "config") {
            foreach ($stale in @("ftbquests", "config")) {
                $stalePath = Join-Path $dst $stale
                if (Test-Path $stalePath) {
                    Remove-Item $stalePath -Recurse -Force
                }
            }
        }
        Get-ChildItem $src -Force | Copy-Item -Destination $dst -Recurse -Force
    }
}

$questsLang = Join-Path $ServerDir "config\ftbquests\quests\lang"
if (Test-Path $questsLang) {
    $splitLang = Join-Path $questsLang "en_us"
    if (Test-Path $splitLang) {
        Remove-Item $splitLang -Recurse -Force
        Write-Host "Removed stale server lang/en_us/ split directory"
    }
    $langBak = Join-Path $questsLang "en_us.snbt.bak"
    if (Test-Path $langBak) {
        Remove-Item $langBak -Force
        Write-Host "Removed stale server lang/en_us.snbt.bak"
    }
    $flatLang = Join-Path $questsLang "en_us.snbt"
    if (-not (Test-Path $flatLang)) {
        Write-Error "Missing server lang/en_us.snbt after config copy (required for FTB Quests 2101.1.x)"
        exit 1
    }
}

Write-Host "Copied $copied mod jars to $ModsDst"
Write-Host "Skipped $($skipped.Count) client-only jars:"
$skipped | ForEach-Object { Write-Host "  $_" }