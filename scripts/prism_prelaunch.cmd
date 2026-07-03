@echo off
REM Prism Launcher pre-launch hook — git pull before Minecraft starts.
REM Instance Settings -> Custom commands -> Pre-launch command:
REM   "%INST_DIR%\scripts\prism_prelaunch.cmd"

cd /d "%INST_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%INST_DIR%\scripts\update_pack.ps1"
exit /b %ERRORLEVEL%