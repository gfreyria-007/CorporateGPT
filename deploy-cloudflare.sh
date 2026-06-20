#!/bin/bash

# Cloudflare Pages Deployment Script

echo "🚀 Starting Cloudflare Pages deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run audit fix for security
echo "🔒 Running audit fix..."
npm audit fix --no-audit

# Build the application
echo "🏗️ Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build."
    exit 1
fi

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist

if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "📝 Check your deployment at: https://pages.cloudflare.com/"
else
    echo "❌ Deployment failed. Please check the Cloudflare dashboard for errors."
    exit 1
fi

echo "🔧 Firebase OAuth Setup Reminder:"
echo "1. Go to Firebase Console > Authentication > Sign-in method"
echo "2. Enable Google and Apple OAuth providers"
echo "3. Add your Cloudflare Pages domain to authorized domains"
echo "4. Configure environment variables in Cloudflare Pages dashboard"