@echo off
REM Git Hooks Setup for Automatic Changelog Updates (Windows)
REM This script sets up git hooks to automatically update the changelog

setlocal enabledelayedexpansion

echo 🔧 Setting up git hooks for automatic changelog updates...

REM Get project root
for %%i in ("%~dp0..") do set "PROJECT_ROOT=%%~fi"
set "HOOKS_DIR=%PROJECT_ROOT%\.git\hooks"

REM Check if git hooks directory exists
if not exist "%HOOKS_DIR%" (
    echo ❌ Git hooks directory not found. Please run this from a git repository.
    exit /b 1
)

REM Create pre-commit hook
echo @echo off > "%HOOKS_DIR%\pre-commit"
echo. >> "%HOOKS_DIR%\pre-commit"
echo REM Pre-commit hook for automatic changelog update >> "%HOOKS_DIR%\pre-commit"
echo echo 📝 Updating changelog before commit... >> "%HOOKS_DIR%\pre-commit"
echo. >> "%HOOKS_DIR%\pre-commit"
echo REM Run changelog update and stage it >> "%HOOKS_DIR%\pre-commit"
echo call npm run changelog:update >> "%HOOKS_DIR%\pre-commit"
echo. >> "%HOOKS_DIR%\pre-commit"
echo REM Check if changelog was modified >> "%HOOKS_DIR%\pre-commit"
echo git diff --quiet CHANGELOG.md >> "%HOOKS_DIR%\pre-commit"
echo if !errorlevel! equ 0 ( >> "%HOOKS_DIR%\pre-commit"
echo     echo ✅ No changelog changes to stage >> "%HOOKS_DIR%\pre-commit"
echo ^) else ( >> "%HOOKS_DIR%\pre-commit"
echo     echo 📋 Staging changelog updates... >> "%HOOKS_DIR%\pre-commit"
echo     git add CHANGELOG.md >> "%HOOKS_DIR%\pre-commit"
echo ^) >> "%HOOKS_DIR%\pre-commit"
echo. >> "%HOOKS_DIR%\pre-commit"
echo echo ✅ Pre-commit hook completed >> "%HOOKS_DIR%\pre-commit"

REM Create post-commit hook
echo @echo off > "%HOOKS_DIR%\post-commit"
echo. >> "%HOOKS_DIR%\post-commit"
echo REM Post-commit hook for additional changelog processing >> "%HOOKS_DIR%\post-commit"
echo echo 📊 Commit completed. Changelog has been updated. >> "%HOOKS_DIR%\post-commit"
echo echo 💡 Run 'npm run changelog:daily' or 'npm run changelog:weekly' for summaries >> "%HOOKS_DIR%\post-commit"

echo ✅ Git hooks installed successfully:
echo    📝 Pre-commit: Automatically updates changelog before each commit
echo    📊 Post-commit: Provides summary information after commit
echo.
echo 🔧 You can now use these commands:
echo    npm run changelog:update  - Update changelog manually
echo    npm run changelog:daily   - Show daily summary
echo    npm run changelog:weekly  - Show weekly summary
echo    npm run precommit        - Run changelog update and stage changes
echo.
echo ⚡ The changelog will be automatically updated on each commit!

pause