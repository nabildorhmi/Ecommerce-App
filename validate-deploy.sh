#!/bin/bash

# Deployment Validation Script
# Run this before deploying to catch common issues

echo "🔍 Validating TrotinetteApp Deployment Setup..."
echo ""

ERRORS=0
WARNINGS=0

# Check backend
echo "📦 Checking Backend..."

if [ ! -f "trotinette-api/composer.json" ]; then
    echo "❌ composer.json not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ composer.json found"
fi

if [ ! -f "trotinette-api/.env.example" ]; then
    echo "⚠️  .env.example not found"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ .env.example found"
fi

if [ ! -f "trotinette-api/railway.json" ]; then
    echo "⚠️  railway.json not found (needed for Railway deploy)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ railway.json found"
fi

# Check frontend
echo ""
echo "🎨 Checking Frontend..."

if [ ! -f "trotinette-frontend/package.json" ]; then
    echo "❌ package.json not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ package.json found"
fi

if [ ! -f "trotinette-frontend/vite.config.ts" ]; then
    echo "❌ vite.config.ts not found"
    ERRORS=$((ERRORS + 1))
else
    echo "✅ vite.config.ts found"
fi

if [ ! -f "trotinette-frontend/vercel.json" ]; then
    echo "⚠️  vercel.json not found (needed for Vercel deploy)"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ vercel.json found"
fi

# Check documentation
echo ""
echo "📚 Checking Documentation..."

if [ ! -f "DEPLOYMENT.md" ]; then
    echo "⚠️  DEPLOYMENT.md not found"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ DEPLOYMENT.md found"
fi

if [ ! -f "QUICK_DEPLOY.md" ]; then
    echo "⚠️  QUICK_DEPLOY.md not found"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ QUICK_DEPLOY.md found"
fi

# Check dependencies
echo ""
echo "📦 Checking Dependencies..."

cd trotinette-api
if [ ! -d "vendor" ]; then
    echo "⚠️  Backend vendor/ not found - run: composer install"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ Backend dependencies installed"
fi
cd ..

cd trotinette-frontend
if [ ! -d "node_modules" ]; then
    echo "⚠️  Frontend node_modules/ not found - run: npm install"
    WARNINGS=$((WARNINGS + 1))
else
    echo "✅ Frontend dependencies installed"
fi
cd ..

# Test builds
echo ""
echo "🔨 Testing Builds..."

echo "Building frontend..."
cd trotinette-frontend
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend builds successfully"
else
    echo "❌ Frontend build failed - check errors with: npm run build"
    ERRORS=$((ERRORS + 1))
fi
cd ..

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Ready to deploy."
    echo ""
    echo "Next steps:"
    echo "1. Follow QUICK_DEPLOY.md for fastest deployment"
    echo "2. Or read DEPLOYMENT.md for all options"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found"
    echo "You can deploy but some features may be missing"
    exit 0
else
    echo "❌ $ERRORS error(s) and $WARNINGS warning(s) found"
    echo "Fix errors before deploying"
    exit 1
fi
