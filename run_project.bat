@echo off
title VN-ResQ Launcher
echo ===================================================
echo        STARTING VN-RESQ EMERGENCY SYSTEM
echo ===================================================

echo.
echo [1/3] Launching Backend Server (Port 3000)...
start "VN-ResQ Backend" cmd /k "cd backend && npm run dev"

echo.
echo [2/3] Launching Main Frontend Dispatcher...
start "VN-ResQ Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [3/3] Launching External SDK Demo Map...
start "VN-ResQ External Demo" cmd /k "cd external-demo && npm run dev"

echo.
echo ===================================================
echo    ALL SYSTEMS LAUNCHED SUCCESSFULLY
echo ===================================================
echo.
echo Access the apps at:
echo - Frontend: http://localhost:5173
echo - External Demo: http://localhost:5174
echo - Backend API: http://localhost:3000
echo.
pause
