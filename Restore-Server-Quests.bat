@echo off
title Restore Server Quests
cd /d "%~dp0"
echo.
echo STOP the Modrinth server first, then press any key to upload quest files...
pause >nul
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\restore_server_quests.ps1
echo.
pause