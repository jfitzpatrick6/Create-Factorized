# Restore FTB Quest SNBT from git and validate lang/chapter IDs.
# Usage: powershell -File scripts/repair_quest_files.ps1

$Root = Split-Path $PSScriptRoot -Parent
Push-Location $Root

Write-Host "Restoring config/ftbquests from git..."
git checkout HEAD -- config/ftbquests/
if ($LASTEXITCODE -ne 0) {
    Write-Error "git checkout failed."
    Pop-Location
    exit 1
}

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
    & $py (Join-Path $PSScriptRoot "strip_quest_links.py")

    $questsDir = Join-Path $Root "config\ftbquests\quests"
    $needsRemap = Select-String -Path (Join-Path $questsDir "chapters\*.snbt") -Pattern '8F01' -Quiet
    if ($needsRemap) {
        & $py (Join-Path $PSScriptRoot "remap_signed_quest_ids.py")
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            exit 1
        }
    }

    $splitLang = Join-Path $Root "config\ftbquests\quests\lang\en_us"
    if (Test-Path $splitLang) {
        & $py (Join-Path $PSScriptRoot "combine_quest_lang.py")
        if ($LASTEXITCODE -ne 0) {
            Pop-Location
            exit 1
        }
    }
    & $py (Join-Path $PSScriptRoot "check_quest_lang.py")
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        exit 1
    }
}

Write-Host ""
Write-Host "Quest files repaired. Fully restart Minecraft before joining the server."
Pop-Location
exit 0