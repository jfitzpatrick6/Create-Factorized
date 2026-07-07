# Git pull the pack repo and sync mods/config into a Prism Launcher instance.
# Called from the instance pre-launch command (see scripts/setup_prism_prelaunch.ps1).

param(
    [Parameter(Mandatory = $true)]
    [string]$InstancePath,
    [Parameter(Mandatory = $true)]
    [string]$PackRoot,
    [string]$Branch = "main"
)

if (-not (Test-Path (Join-Path $PackRoot ".git"))) {
    Write-Error "Pack root is not a git repo: $PackRoot"
    exit 1
}

if (-not (Test-Path (Join-Path $InstancePath "minecraft"))) {
    Write-Error "Prism instance missing minecraft folder: $InstancePath"
    exit 1
}

Push-Location $PackRoot

$before = git rev-parse HEAD 2>$null
& git fetch origin $Branch 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) {
    Write-Error "git fetch failed. Check network and repo access."
    Pop-Location
    exit 1
}

& git pull --ff-only origin $Branch 2>&1 | ForEach-Object { Write-Host $_ }
if ($LASTEXITCODE -ne 0) {
    Write-Error "git pull failed (local changes or merge needed)."
    Pop-Location
    exit 1
}

$after = git rev-parse HEAD
if ($before -eq $after) {
    Write-Host "Pack already up to date ($after)."
} else {
    Write-Host "Pack updated:"
    git log --oneline "$before..$after"
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
    & $py (Join-Path $PSScriptRoot "check_quest_lang.py")
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Quest validation failed after git pull."
        Pop-Location
        exit 1
    }
}

Pop-Location

function Sync-PackFolder {
    param(
        [string]$SrcRoot,
        [string]$DstRoot,
        [string]$Name
    )

    $src = Join-Path $SrcRoot $Name
    if (-not (Test-Path $src)) {
        return
    }

    $dst = Join-Path $DstRoot $Name
    New-Item -ItemType Directory -Force -Path $dst | Out-Null

    if ($Name -eq "config") {
        foreach ($stale in @("ftbquests", "config")) {
            $stalePath = Join-Path $dst $stale
            if (Test-Path $stalePath) {
                Remove-Item $stalePath -Recurse -Force
            }
        }
    }

    Get-ChildItem $src -Force | Copy-Item -Destination $dst -Recurse -Force
    Write-Host "Synced $Name -> $dst"
}

$folders = @("mods", "config", "kubejs", "defaultconfigs", "datapacks", "defaultoptions")
$targets = @(
    (Join-Path $InstancePath "minecraft")
)
$cfWork = Join-Path $InstancePath "cf-work"
if (Test-Path $cfWork) {
    $targets += $cfWork
}

foreach ($target in $targets) {
    Write-Host ""
    Write-Host "Updating $target ..."
    foreach ($folder in $folders) {
        Sync-PackFolder -SrcRoot $PackRoot -DstRoot $target -Name $folder
    }
}

Write-Host ""
Write-Host "Prism instance synced from $PackRoot"
exit 0