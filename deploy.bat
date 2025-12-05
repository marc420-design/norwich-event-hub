@echo off
echo.
echo ========================================
echo  NORWICH EVENT HUB - DEPLOYMENT HELPER
echo ========================================
echo.

:MENU
echo What would you like to do?
echo.
echo [1] Push to GitHub (Step 1)
echo [2] Show GitHub URL
echo [3] Open Cloudflare Dashboard
echo [4] Test local site
echo [5] View deployment guide
echo [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto PUSH_GITHUB
if "%choice%"=="2" goto SHOW_GITHUB
if "%choice%"=="3" goto OPEN_CLOUDFLARE
if "%choice%"=="4" goto TEST_LOCAL
if "%choice%"=="5" goto VIEW_GUIDE
if "%choice%"=="6" goto EXIT

echo Invalid choice. Please try again.
goto MENU

:PUSH_GITHUB
echo.
echo ========================================
echo  PUSHING TO GITHUB
echo ========================================
echo.
echo First, let's check the current status...
echo.
git status
echo.
echo.
echo Have you created a GitHub repository? (y/n)
set /p created="Enter y or n: "

if /i "%created%"=="n" (
    echo.
    echo Please create a GitHub repository first:
    echo 1. Go to: https://github.com/new
    echo 2. Name: norwich-event-hub
    echo 3. Make it Private
    echo 4. DON'T initialize with README
    echo 5. Click "Create repository"
    echo.
    echo Press any key when done...
    pause > nul
)

echo.
echo Enter your GitHub username:
set /p username="Username: "

echo.
echo Setting remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/%username%/norwich-event-hub.git

echo.
echo Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo  SUCCESS! Code is on GitHub
echo ========================================
echo.
echo Next step: Deploy to Cloudflare Pages
echo Press any key to continue...
pause > nul
goto MENU

:SHOW_GITHUB
echo.
echo Your GitHub repository should be at:
echo https://github.com/YOUR_USERNAME/norwich-event-hub
echo.
echo (Replace YOUR_USERNAME with your actual GitHub username)
echo.
pause
goto MENU

:OPEN_CLOUDFLARE
echo.
echo Opening Cloudflare Dashboard...
start https://dash.cloudflare.com/
echo.
echo Follow these steps:
echo 1. Click "Workers & Pages"
echo 2. Click "Create application" -^> "Pages"
echo 3. Click "Connect to Git"
echo 4. Select "norwich-event-hub" repository
echo 5. Build settings:
echo    - Framework preset: None
echo    - Build command: (leave empty)
echo    - Build output: /
echo 6. Click "Save and Deploy"
echo.
pause
goto MENU

:TEST_LOCAL
echo.
echo Starting local server...
echo.
echo Your site will be available at:
echo http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8080
goto MENU

:VIEW_GUIDE
echo.
echo Opening deployment guide...
start DEPLOY_TO_YOUR_DOMAIN.md
goto MENU

:EXIT
echo.
echo ========================================
echo  DEPLOYMENT HELPER CLOSED
echo ========================================
echo.
echo Quick reference:
echo - Full guide: DEPLOY_TO_YOUR_DOMAIN.md
echo - Need help? Check START_HERE.md
echo.
echo Good luck with your launch!
echo.
pause
exit
