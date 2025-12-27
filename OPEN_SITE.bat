@echo off
echo Opening Norwich Event Hub test pages...
echo.
echo Server should be running on http://localhost:8080
echo.
start http://localhost:8080/index.html
timeout /t 2 /nobreak >nul
start http://localhost:8080/today.html
timeout /t 2 /nobreak >nul
start http://localhost:8080/directory.html
timeout /t 2 /nobreak >nul
start http://localhost:8080/test-api.html
echo.
echo All pages opened in your browser!
echo.
pause
