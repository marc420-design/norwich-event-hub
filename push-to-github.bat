@echo off
echo.
echo ========================================
echo  Norwich Event Hub - Push to GitHub
echo ========================================
echo.

REM Check if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo No GitHub remote configured yet.
    echo.
    set /p username="Enter your GitHub username: "
    set /p reponame="Enter repository name (default: norwich-event-hub): "

    if "%reponame%"=="" set reponame=norwich-event-hub

    echo.
    echo Setting up remote: https://github.com/!username!/!reponame!.git
    git remote add origin https://github.com/!username!/!reponame!.git

    echo.
    echo IMPORTANT: Create this repository on GitHub first!
    echo Visit: https://github.com/new
    echo - Name: !reponame!
    echo - Keep it PUBLIC
    echo - DO NOT initialize with README
    echo.
    pause
)

echo.
echo Pushing to GitHub...
echo.

git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo.
    echo Next: Deploy to Cloudflare Pages or Netlify
    echo See: DEPLOY_NOW.md for instructions
    echo.
) else (
    echo.
    echo ========================================
    echo  ERROR: Push failed
    echo ========================================
    echo.
    echo Make sure:
    echo 1. Repository exists on GitHub
    echo 2. You're logged into Git
    echo 3. Repository name is correct
    echo.
    echo Run this to login:
    echo   git config --global user.name "Your Name"
    echo   git config --global user.email "your@email.com"
    echo.
)

pause
