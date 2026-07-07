@echo off
setlocal EnableExtensions
title Sync Server to Modrinth
cd /d "%~dp0"

echo.
echo === Create-Factorized server sync ===
echo.

if not exist "local\sftp.secrets.json" (
    echo ERROR: Missing local\sftp.secrets.json
    echo Copy scripts\sftp.secrets.example.json to local\sftp.secrets.json
    echo and fill in your Modrinth SFTP credentials.
    goto :fail
)

set "PY="
for %%P in (
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    "%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    "%USERPROFILE%\miniconda3\python.exe"
    "%USERPROFILE%\anaconda3\python.exe"
    "C:\Python314\python.exe"
    "C:\Python313\python.exe"
    "C:\Python312\python.exe"
) do (
    if not defined PY if exist %%~P set "PY=%%~P"
)

if not defined PY (
    where py >nul 2>&1
    if not errorlevel 1 set "PY=py -3"
)

if not defined PY (
    where python >nul 2>&1
    if not errorlevel 1 set "PY=python"
)

if not defined PY (
    echo ERROR: Python not found. Install Python 3 from https://python.org
    goto :fail
)

echo Using Python: %PY%
echo.

%PY% -c "import paramiko" >nul 2>&1
if errorlevel 1 (
    echo Installing paramiko...
    %PY% -m pip install paramiko
    if errorlevel 1 (
        echo ERROR: Failed to install paramiko.
        goto :fail
    )
)

echo Starting sync...
echo.
%PY% scripts\sync_server_sftp.py
if errorlevel 1 goto :fail

echo.
echo Sync finished successfully.
goto :done

:fail
echo.
echo Sync FAILED. Read the messages above.
goto :done

:done
echo.
pause
endlocal