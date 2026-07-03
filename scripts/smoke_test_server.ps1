# Boot dedicated server briefly and check latest.log for a clean start.
# Usage: powershell -File scripts/smoke_test_server.ps1 [-WaitSeconds 120]

param(
    [int]$WaitSeconds = 120
)

$Root = Split-Path $PSScriptRoot -Parent
$ServerDir = Join-Path $Root "server"
$Java = Join-Path $env:APPDATA "ModrinthApp\meta\java_versions\zulu21.44.17-ca-jre21.0.8-win_x64\bin\java.exe"

if (-not (Test-Path $Java)) {
    Write-Error "Java 21 not found at $Java. Install Java 21 or update this script."
    exit 1
}

if (-not (Test-Path (Join-Path $ServerDir "run.bat"))) {
    Write-Error "Server not installed. See docs/SERVER_SETUP.md."
    exit 1
}

& (Join-Path $Root "scripts\prepare_server_mods.ps1") -ServerDir $ServerDir | Out-Null

$eula = Join-Path $ServerDir "eula.txt"
Set-Content -Path $eula -Value @("eula=true") -Encoding ASCII

$props = Join-Path $ServerDir "server.properties"
if (-not (Test-Path $props)) {
    Copy-Item (Join-Path $ServerDir "server.properties.example") $props
}

$logDir = Join-Path $ServerDir "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "latest.log"
if (Test-Path $logFile) { Remove-Item $logFile -Force }

Push-Location $ServerDir
$proc = Start-Process -FilePath $Java -ArgumentList "@user_jvm_args.txt","@libraries/net/neoforged/neoforge/21.1.234/win_args.txt","nogui" -PassThru -NoNewWindow
Pop-Location

Write-Host "Server PID $($proc.Id) - waiting up to $WaitSeconds seconds..."
$deadline = (Get-Date).AddSeconds($WaitSeconds)
$done = $false
$fatal = $false

while ((Get-Date) -lt $deadline -and -not $proc.HasExited) {
    Start-Sleep -Seconds 5
    if (Test-Path $logFile) {
        if (Select-String -Path $logFile -Pattern 'Done \(' -Quiet) { $done = $true; break }
        $tail = Get-Content $logFile -Tail 40 -ErrorAction SilentlyContinue
        if ($tail -match 'Mod loading has failed|Failed to start the minecraft server|FATAL] \[ne\.ne\.ne\.se\.lo\.ServerModLoader|Server Watchdog') { $fatal = $true; break }
    }
}

if (-not $proc.HasExited) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}

if ($fatal) {
    Write-Error "Smoke test FAILED - see server/logs/latest.log"
    exit 1
}
if (-not $done) {
    Write-Error "Smoke test inconclusive - Done not seen within $WaitSeconds s. Check server/logs/latest.log"
    exit 2
}

Write-Host "Smoke test OK - server reached Done ($WaitSeconds s window)."
exit 0