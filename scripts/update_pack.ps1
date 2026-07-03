# Pull latest pack config/mods from GitHub before playing.
# Usage: powershell -File scripts/update_pack.ps1
# Friends: run this (or Launch-Pack.bat) before clicking Play in Modrinth App.

param(
    [string]$Branch = "main"
)

$Root = Split-Path $PSScriptRoot -Parent
Push-Location $Root

if (-not (Test-Path ".git")) {
    Write-Host "This folder is not a git repo. One-time setup:"
    Write-Host "  git clone https://github.com/jfitzpatrick6/neoforge-1.21.1-modpack.git `"$Root`""
    Pop-Location
    exit 1
}

$before = git rev-parse HEAD 2>$null
git fetch origin $Branch 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
    Write-Error "git fetch failed. Check your network and repo access."
    Pop-Location
    exit 1
}

git pull --ff-only origin $Branch 2>&1 | Out-Host
if ($LASTEXITCODE -ne 0) {
    Write-Error "git pull failed (local changes or merge needed). Stash or reset, then retry."
    Pop-Location
    exit 1
}

$after = git rev-parse HEAD
if ($before -eq $after) {
    Write-Host "Pack already up to date ($after)."
} else {
    Write-Host "Pack updated:"
    git log --oneline "$before..$after"
    Write-Host ""
    Write-Host "Restart Minecraft if the game is already open so configs and scripts reload."
}

Pop-Location
exit 0