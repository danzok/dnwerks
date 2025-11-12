#!/bin/bash

# DNwerks Deployment Script to Vercel
# This script will pull the latest changes and deploy to Vercel production

echo "🚀 Starting DNwerks deployment to Vercel..."

# Check if we're on the correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're currently on branch '$CURRENT_BRANCH'"
    echo "   It's recommended to deploy from 'main' branch"
    read -p "   Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Pull latest changes
echo "📥 Pulling latest changes from origin..."
git pull origin main

# Check if pull was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to pull latest changes"
    exit 1
fi

# Check if there are any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   These changes will not be included in the deployment"
    read -p "   Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Deploy to Vercel production
echo "🌐 Deploying to Vercel production..."
vercel --prod

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📊 Deployment Summary:"
    echo "   - Branch: $CURRENT_BRANCH"
    echo "   - Latest commit: $(git log -1 --oneline)"
    echo "   - Deployed to: Vercel Production"
    echo ""
    echo "🔗 Your application should be available at:"
    echo "   https://your-vercel-app.vercel.app"
    echo ""
    echo "📝 Note: Make sure all environment variables are configured in Vercel dashboard"
else
    echo "❌ Deployment failed!"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Check if you're logged into Vercel (run 'vercel login')"
    echo "   2. Verify Vercel project is linked (run 'vercel link')"
    echo "   3. Check environment variables in Vercel dashboard"
    echo "   4. Review build logs for specific errors"
    exit 1
fi