# Configure Prism Launcher pre-launch git pull + pack sync for an instance.
# Usage: powershell -File scripts/setup_prism_prelaunch.ps1 -InstancePath "C:\...\instances\My Instance"

param(
    [Parameter(Mandatory = $true)]
    [string]$InstancePath
)

$PackRoot = Split-Path $PSScriptRoot -Parent
$ScriptsDir = Join-Path $InstancePath "scripts"
$InstanceCfg = Join-Path $InstancePath "instance.cfg"

if (-not (Test-Path $InstanceCfg)) {
    Write-Error "Not a Prism instance (missing instance.cfg): $InstancePath"
    exit 1
}

New-Item -ItemType Directory -Force -Path $ScriptsDir | Out-Null

$packRootFile = Join-Path $ScriptsDir "pack_root.txt"
Set-Content -Path $packRootFile -Value $PackRoot -Encoding ASCII -NoNewline

$prelaunch = @"
@echo off
setlocal EnableExtensions
set "PACK_ROOT=$PackRoot"
if exist "%INST_DIR%\scripts\pack_root.txt" (
    set /p PACK_ROOT=<"%INST_DIR%\scripts\pack_root.txt"
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%PACK_ROOT%\scripts\prism_prelaunch_sync.ps1" -InstancePath "%INST_DIR%" -PackRoot "%PACK_ROOT%"
exit /b %ERRORLEVEL%
"@

Set-Content -Path (Join-Path $ScriptsDir "prism_prelaunch.cmd") -Value $prelaunch -Encoding ASCII

$cfg = Get-Content $InstanceCfg -Raw
$cfg = $cfg -replace "(?m)^OverrideCommands=false\s*$", "OverrideCommands=true"
$cfg = $cfg -replace '(?m)^PreLaunchCommand=.*$', 'PreLaunchCommand="%INST_DIR%\scripts\prism_prelaunch.cmd"'
Set-Content -Path $InstanceCfg -Value $cfg.TrimEnd() -Encoding UTF8 -NoNewline
Add-Content -Path $InstanceCfg -Value "" -Encoding UTF8

Write-Host "Configured pre-launch for: $InstancePath"
Write-Host "  Pack root: $PackRoot"
Write-Host '  Pre-launch: "%INST_DIR%\scripts\prism_prelaunch.cmd"'
Write-Host ""
Write-Host "Every Launch will git pull and sync mods/config into the instance."
exit 0