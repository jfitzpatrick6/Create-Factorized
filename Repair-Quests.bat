@echo off
title Repair FTB Quests
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\repair_quest_files.ps1
echo.
pause