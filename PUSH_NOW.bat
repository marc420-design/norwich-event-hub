@echo off
echo ========================================
echo   PUSHING TO GITHUB - SIMPLE FIX
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Removing workflow file from git (we'll add it back later)...
git rm --cached .github/workflows/scrape-events.yml 2>nul
if %errorlevel% neq 0 (
    echo Workflow file already removed or doesn't exist in git.
)

echo.
echo Step 2: Adding all files...
git add -A

echo.
echo Step 3: Committing changes...
git commit -m "Initial commit: Norwich Event Hub" 2>nul
if %errorlevel% neq 0 (
    echo No changes to commit, or already committed.
)

echo.
echo Step 4: Pushing to GitHub (master branch)...
git push -u origin master

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo.
    echo Repository: https://github.com/marc420-design/norwich-event-hub
    echo.
    echo Next: Deploy to Cloudflare Pages
    echo See: DEPLOY_NOW.md
    echo.
) else (
    echo.
    echo ========================================
    echo   PUSH FAILED
    echo ========================================
    echo.
    echo Trying alternative: push to 'main' branch instead...
    git branch -M main
    git push -u origin main
    
    if %errorlevel% equ 0 (
        echo SUCCESS with 'main' branch!
    ) else (
        echo Still failed. Check your GitHub authentication:
        echo Run: gh auth login
    )
)

echo.
pause
