# Restore server FTB Quest files from pack git and upload via SFTP.
# STOP the Modrinth server before running this.
# Usage: powershell -File scripts/restore_server_quests.ps1

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

if (-not $py) {
    Write-Error "Python not found."
    Pop-Location
    exit 1
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

Write-Host ""
Write-Host "Uploading ftbquests to Modrinth server (server must be stopped)..."
& $py (Join-Path $PSScriptRoot "upload_ftbquests.py")
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    exit 1
}

Write-Host ""
Write-Host "Done. Start the server, then run Repair-Quests.bat on each client before joining."
Pop-Location
exit 0