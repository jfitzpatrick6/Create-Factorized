# Generate .vscode/sftp.json from local/sftp.secrets.json for the VS Code SFTP extension.
# Usage: powershell -File scripts/setup_sftp_vscode.ps1

$Root = Split-Path $PSScriptRoot -Parent
$SecretsPath = Join-Path $Root "local\sftp.secrets.json"
$OutDir = Join-Path $Root ".vscode"
$OutPath = Join-Path $OutDir "sftp.json"

if (-not (Test-Path $SecretsPath)) {
    Write-Error "Missing $SecretsPath - copy scripts/sftp.secrets.example.json to local/sftp.secrets.json"
    exit 1
}

$secrets = Get-Content $SecretsPath -Raw | ConvertFrom-Json

$config = [ordered]@{
    name       = $secrets.name
    host       = $secrets.host
    protocol   = "sftp"
    port       = [int]$secrets.port
    username   = $secrets.username
    password   = $secrets.password
    remotePath = $secrets.remotePath
    context    = "server"
    uploadOnSave = $false
    ignore     = @(
        "**/.git/**",
        "**/libraries/**",
        "**/world/**",
        "**/logs/**",
        "**/crash-reports/**",
        "**/*.jar.log",
        "**/neoforge-*-installer.jar",
        "**/run.bat",
        "**/run.sh",
        "**/eula.txt",
        "**/server.properties"
    )
    watcher = @{
        files        = "**/*"
        autoUpload   = $false
        autoDelete   = $false
    }
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$json = $config | ConvertTo-Json -Depth 6
[System.IO.File]::WriteAllText($OutPath, $json)
Write-Host "Wrote $OutPath"
Write-Host 'In VS Code/Cursor: Command Palette - SFTP: Upload Project Folder'