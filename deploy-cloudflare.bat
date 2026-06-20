@echo off
REM Cloudflare Pages Deployment Script for Windows

echo 🚀 Starting Cloudflare Pages deployment...

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Run audit fix for security
echo 🔒 Running audit fix...
npm audit fix --no-audit

REM Build the application
echo 🏗️ Building application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check the errors above.
    pause
    exit /b 1
)

echo ✅ Build successful!

REM Check if dist folder exists
if not exist "dist" (
    echo ❌ Error: dist folder not found after build.
    pause
    exit /b 1
)

REM Deploy to Cloudflare Pages
echo 🌐 Deploying to Cloudflare Pages...
npx wrangler pages deploy dist

if %errorlevel% equ 0 (
    echo 🎉 Deployment successful!
    echo 📝 Check your deployment at: https://pages.cloudflare.com/
) else (
    echo ❌ Deployment failed. Please check the Cloudflare dashboard for errors.
    pause
    exit /b 1
)

echo 🔧 Firebase OAuth Setup Reminder:
echo 1. Go to Firebase Console ^> Authentication ^> Sign-in method
echo 2. Enable Google and Apple OAuth providers
echo 3. Add your Cloudflare Pages domain to authorized domains
echo 4. Configure environment variables in Cloudflare Pages dashboard

pause