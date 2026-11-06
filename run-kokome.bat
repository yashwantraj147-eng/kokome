@echo off
cd /d "%~dp0"
if not exist "dist\index.html" (
    echo Building Kokome web assets...
    call npm run build
)
echo Launching Kokome Desktop Companion...
start "" ".\node_modules\electron\dist\electron.exe" .
