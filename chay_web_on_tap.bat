@echo off
title On Tap Tu Vung JLPT N2
cd /d "%~dp0vocab-web"
echo ======================================================================
echo   DANG KHOI DONG WEB ON TAP TU VUNG JLPT N2 (LIGHT MODE - RESPONSIVE)
echo.
echo   1. May tinh truy cap tai:       http://localhost:3000
echo   2. Dien thoai (chung Wi-Fi):   http://192.168.1.233:3000
echo ======================================================================
echo.
npm.cmd run start
pause
