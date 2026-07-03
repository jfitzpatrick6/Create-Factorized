@echo off
REM Pull latest pack from GitHub, then open Modrinth App.
REM Friends: use this shortcut instead of opening Modrinth directly.

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\update_pack.ps1"
if errorlevel 1 (
    echo.
    echo Update failed - fix git issues above, then try again.
    pause
    exit /b 1
)

set "MODRINTH=%LOCALAPPDATA%\Programs\Modrinth App\Modrinth App.exe"
if exist "%MODRINTH%" (
    start "" "%MODRINTH%"
    echo Opened Modrinth App - click Play on "NeoForge 1.21.1".
) else (
    echo Modrinth App not found at:
    echo   %MODRINTH%
    echo Open Modrinth manually and click Play on this profile.
)

exit /b 0