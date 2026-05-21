@echo off
title MedCourse Platform Server
echo =======================================
echo    Starting MedCourse Platform...
echo =======================================
echo.
echo Please wait while the development server starts...
echo It will automatically open in your browser.
echo.
echo To stop the server later, simply close this window.
echo.

:: Start the backend server in a new window
start "MedCourse Backend" cmd /c "cd backend && npm start"

:: Wait 3 seconds to let the server start before opening the browser
timeout /t 3 /nobreak >nul
start "" http://localhost:5173

:: Start the Vite frontend server
npm run dev

pause
