@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Start-Process -FilePath 'node.exe' -ArgumentList 'scripts/article-studio.mjs' -WorkingDirectory '%CD%' -WindowStyle Hidden"
