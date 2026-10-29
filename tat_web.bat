@echo off
title Tat Web On Tap JLPT N2
echo ========================================================
echo   DANG TAT SERVER WEB ON TAP TU VUNG JLPT N2 (PORT 3000)
echo ========================================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Dang tat tien trinh PID: %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo Da tat web thanh cong!
timeout /t 3 >nul
