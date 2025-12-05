@echo off
echo ========================================
echo   FIXING GITHUB PUSH
echo ========================================
echo.

cd /d "%~dp0"

echo Checking git status...
git status

echo.
echo Checking current branch...
git branch --show-current

echo.
echo Checking remote...
git remote -v

echo.
echo Attempting to push to master branch...
git push -u origin master

echo.
echo Done! Check output above for results.

pause
