# Copy repaired FTB Quest files from the pack into a Prism Launcher instance.
# Usage: powershell -File scripts/fix_prism_instance.ps1 -InstancePath "C:\...\instances\My Instance"

param(
    [Parameter(Mandatory = $true)]
    [string]$InstancePath
)

$Root = Split-Path $PSScriptRoot -Parent
$PackQuests = Join-Path $Root "config\ftbquests\quests"

if (-not (Test-Path $PackQuests)) {
    Write-Error "Pack quests not found: $PackQuests"
    exit 1
}

$targets = @(
    (Join-Path $InstancePath "minecraft\config\ftbquests\quests")
    (Join-Path $InstancePath "cf-work\config\ftbquests\quests")
)

$py = $null
foreach ($candidate in @(
    "$env:USERPROFILE\miniconda3\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "python"
)) {
    if ($candidate -eq "python") {
        if (Get-Command python -ErrorAction SilentlyContinue) { $py = "python"; break }
    } elseif (Test-Path $candidate) {
        $py = $candidate
        break
    }
}

if ($py) {
    Push-Location $Root
    & $py (Join-Path $PSScriptRoot "check_quest_lang.py")
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        exit 1
    }
    Pop-Location
}

foreach ($dest in $targets) {
    if (-not (Test-Path (Split-Path $dest -Parent))) {
        continue
    }

    New-Item -ItemType Directory -Force -Path (Join-Path $dest "chapters") | Out-Null
    New-Item -ItemType Directory -Force -Path (Join-Path $dest "lang") | Out-Null

    Copy-Item (Join-Path $PackQuests "chapter_groups.snbt") $dest -Force
    Copy-Item (Join-Path $PackQuests "data.snbt") $dest -Force
    Get-ChildItem (Join-Path $PackQuests "chapters\*.snbt") | Copy-Item -Destination (Join-Path $dest "chapters") -Force

    $flatLangSrc = Join-Path $PackQuests "lang\en_us.snbt"
    $flatLangDst = Join-Path $dest "lang\en_us.snbt"
    $langDir = Join-Path $dest "lang\en_us"
    $langBak = "$flatLangDst.bak"

    if (-not (Test-Path $flatLangSrc)) {
        Write-Error "Missing pack lang file (required for FTB Quests 2101.1.x): $flatLangSrc"
        exit 1
    }

    if (Test-Path $langDir) {
        Remove-Item $langDir -Recurse -Force
    }
    if (Test-Path $langBak) {
        Remove-Item $langBak -Force
    }

    Copy-Item $flatLangSrc $flatLangDst -Force

    Write-Host "Fixed $dest"
}

Write-Host ""
Write-Host "Prism instance quest files updated. Fully restart Minecraft before joining."
exit 0