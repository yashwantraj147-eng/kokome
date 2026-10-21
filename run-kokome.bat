@echo off
cd /d "%~dp0"
echo Launching Kokome Desktop Companion...
start "" ".\node_modules\electron\dist\electron.exe" .
