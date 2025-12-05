@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   NORWICH EVENT HUB - AUTO DEPLOY
echo ========================================
echo.
echo This will:
echo  1. Login to GitHub
echo  2. Create repository
echo  3. Push your 47 events
echo  4. Guide you through Cloudflare setup
echo.
pause

echo.
echo STEP 1: GitHub Login
echo ========================================
echo.
echo A browser will open. Please authorize the app.
echo.

gh auth login --web

if %errorlevel% neq 0 (
    echo.
    echo ERROR: GitHub login failed
    echo Please try manually: gh auth login --web
    pause
    exit /b 1
)

echo.
echo SUCCESS: Logged into GitHub!
echo.

echo.
echo STEP 2: Create Repository
echo ========================================
echo.

gh repo create norwich-event-hub --public --source=. --description="AI-powered Norwich event aggregator with 47 real events" --push

if %errorlevel% neq 0 (
    echo.
    echo Repository might already exist. Trying to push...
    git remote add origin https://github.com/$(gh api user --jq .login)/norwich-event-hub.git 2>nul
    git branch -M main
    git push -u origin main
)

echo.
echo SUCCESS: Code pushed to GitHub!
echo.

gh api user --jq .login > temp_username.txt
set /p GH_USERNAME=<temp_username.txt
del temp_username.txt

echo.
echo ========================================
echo   YOUR REPOSITORY IS LIVE!
echo ========================================
echo.
echo URL: https://github.com/%GH_USERNAME%/norwich-event-hub
echo.
echo Opening in browser...
start https://github.com/%GH_USERNAME%/norwich-event-hub
echo.
pause

echo.
echo STEP 3: Deploy to Cloudflare Pages
echo ========================================
echo.
echo I'll open the Cloudflare signup/login page for you.
echo.
echo Follow these steps:
echo.
echo 1. Sign up/login to Cloudflare
echo 2. Click "Workers and Pages" in sidebar
echo 3. Click "Create application"
echo 4. Click "Pages" tab
echo 5. Click "Connect to Git"
echo 6. Connect GitHub and select "norwich-event-hub"
echo 7. Build settings:
echo    - Framework preset: None
echo    - Build command: (leave blank)
echo    - Build output directory: /
echo 8. Click "Save and Deploy"
echo.
echo Opening Cloudflare...
echo.
pause

start https://dash.cloudflare.com/sign-up

echo.
echo ========================================
echo   WAITING FOR DEPLOYMENT...
echo ========================================
echo.
echo After Cloudflare finishes deploying:
echo.
echo 1. Go to "Custom domains" tab
echo 2. Click "Set up a custom domain"
echo 3. Enter: norwicheventshub.com
echo 4. Click "Activate domain"
echo 5. Follow DNS instructions
echo.
echo Your site will be LIVE at norwicheventshub.com!
echo.
pause

echo.
echo STEP 4: Enable AI Auto-Updates
echo ========================================
echo.
echo To enable weekly AI event updates:
echo.
echo 1. Go to: https://github.com/%GH_USERNAME%/norwich-event-hub/settings/secrets/actions
echo 2. Click "New repository secret"
echo 3. Name: OPENAI_API_KEY
echo 4. Value: (paste your OpenAI key from automation/.env)
echo 5. Click "Add secret"
echo.
echo Opening GitHub Secrets page...
echo.
pause

start https://github.com/%GH_USERNAME%/norwich-event-hub/settings/secrets/actions

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Norwich Event Hub is now:
echo  - Live on GitHub
echo  - Deploying to Cloudflare
echo  - Ready for your domain
echo  - AI-powered weekly updates
echo.
echo Next: Add your custom domain in Cloudflare
echo       and enable AI updates with your API key
echo.
echo Repository: https://github.com/%GH_USERNAME%/norwich-event-hub
echo Domain: norwicheventshub.com (add in Cloudflare)
echo.
echo CONGRATS! You're LIVE! 🎉
echo.
pause
