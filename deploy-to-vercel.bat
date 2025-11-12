@echo off
REM DNwerks Deployment Script to Vercel for Windows
REM This script will pull latest changes and deploy to Vercel production

echo 🚀 Starting DNwerks deployment to Vercel...

REM Check if we're on the correct branch
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" (
    echo ⚠️  Warning: You're currently on branch '%CURRENT_BRANCH%'
    echo    It's recommended to deploy from 'main' branch
    set /p CONTINUE="   Do you want to continue? (y/N): "
    if /i not "%CONTINUE%"=="y" (
        echo ❌ Deployment cancelled
        exit /b 1
    )
)

REM Pull latest changes
echo 📥 Pulling latest changes from origin...
git pull origin main

REM Check if pull was successful
if %errorlevel% neq 0 (
    echo ❌ Failed to pull latest changes
    exit /b 1
)

REM Check if there are any uncommitted changes
for /f "tokens=*" %%i in ('git status --porcelain') do set UNCOMMITTED=%%i
if defined UNCOMMITTED (
    echo ⚠️  Warning: You have uncommitted changes
    echo    These changes will not be included in the deployment
    set /p CONTINUE="   Do you want to continue anyway? (y/N): "
    if /i not "%CONTINUE%"=="y" (
        echo ❌ Deployment cancelled
        exit /b 1
    )
)

REM Deploy to Vercel production
echo 🌐 Deploying to Vercel production...
vercel --prod

REM Check if deployment was successful
if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo.
    echo 📊 Deployment Summary:
    echo    - Branch: %CURRENT_BRANCH%
    for /f "tokens=*" %%i in ('git log -1 --oneline') do echo    - Latest commit: %%i
    echo    - Deployed to: Vercel Production
    echo.
    echo 🔗 Your application should be available at:
    echo    https://your-vercel-app.vercel.app
    echo.
    echo 📝 Note: Make sure all environment variables are configured in Vercel dashboard
) else (
    echo ❌ Deployment failed!
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Check if you're logged into Vercel (run 'vercel login')
    echo    2. Verify Vercel project is linked (run 'vercel link')
    echo    3. Check environment variables in Vercel dashboard
    echo    4. Review build logs for specific errors
    exit /b 1
)