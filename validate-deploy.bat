@echo off
setlocal enabledelayedexpansion

REM Deployment Validation Script for Windows
REM Run this before deploying to catch common issues

echo.
echo 🔍 Validating TrotinetteApp Deployment Setup...
echo.

set ERRORS=0
set WARNINGS=0

REM Check backend
echo 📦 Checking Backend...

if not exist "trotinette-api\composer.json" (
    echo ❌ composer.json not found
    set /a ERRORS+=1
) else (
    echo ✅ composer.json found
)

if not exist "trotinette-api\.env.example" (
    echo ⚠️  .env.example not found
    set /a WARNINGS+=1
) else (
    echo ✅ .env.example found
)

if not exist "trotinette-api\railway.json" (
    echo ⚠️  railway.json not found (needed for Railway deploy)
    set /a WARNINGS+=1
) else (
    echo ✅ railway.json found
)

REM Check frontend
echo.
echo 🎨 Checking Frontend...

if not exist "trotinette-frontend\package.json" (
    echo ❌ package.json not found
    set /a ERRORS+=1
) else (
    echo ✅ package.json found
)

if not exist "trotinette-frontend\vite.config.ts" (
    echo ❌ vite.config.ts not found
    set /a ERRORS+=1
) else (
    echo ✅ vite.config.ts found
)

if not exist "trotinette-frontend\vercel.json" (
    echo ⚠️  vercel.json not found (needed for Vercel deploy)
    set /a WARNINGS+=1
) else (
    echo ✅ vercel.json found
)

REM Check documentation
echo.
echo 📚 Checking Documentation...

if not exist "DEPLOYMENT.md" (
    echo ⚠️  DEPLOYMENT.md not found
    set /a WARNINGS+=1
) else (
    echo ✅ DEPLOYMENT.md found
)

if not exist "QUICK_DEPLOY.md" (
    echo ⚠️  QUICK_DEPLOY.md not found
    set /a WARNINGS+=1
) else (
    echo ✅ QUICK_DEPLOY.md found
)

REM Check dependencies
echo.
echo 📦 Checking Dependencies...

if not exist "trotinette-api\vendor" (
    echo ⚠️  Backend vendor\ not found - run: composer install
    set /a WARNINGS+=1
) else (
    echo ✅ Backend dependencies installed
)

if not exist "trotinette-frontend\node_modules" (
    echo ⚠️  Frontend node_modules\ not found - run: npm install
    set /a WARNINGS+=1
) else (
    echo ✅ Frontend dependencies installed
)

REM Test builds
echo.
echo 🔨 Testing Builds...

echo Building frontend...
cd trotinette-frontend
npm run build >nul 2>&1
if errorlevel 1 (
    echo ❌ Frontend build failed - check errors with: npm run build
    set /a ERRORS+=1
) else (
    echo ✅ Frontend builds successfully
)
cd ..

REM Summary
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 📊 Validation Summary
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if !ERRORS! equ 0 (
    if !WARNINGS! equ 0 (
        echo ✅ All checks passed! Ready to deploy.
        echo.
        echo Next steps:
        echo 1. Follow QUICK_DEPLOY.md for fastest deployment
        echo 2. Or read DEPLOYMENT.md for all options
        exit /b 0
    ) else (
        echo ⚠️  !WARNINGS! warning(s) found
        echo You can deploy but some features may be missing
        exit /b 0
    )
) else (
    echo ❌ !ERRORS! error(s) and !WARNINGS! warning(s) found
    echo Fix errors before deploying
    exit /b 1
)
