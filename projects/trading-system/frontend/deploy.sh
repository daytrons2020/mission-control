#!/bin/bash
# Quick Deploy Script for BINARY Trading Dashboard
# Deploys to Netlify (quickest free option)

cd /Users/daytrons/.openclaw/workspace/projects/trading-system/frontend

echo "🚀 Deploying BINARY Trading Dashboard..."
echo ""

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Check if logged in
if ! netlify status &> /dev/null; then
    echo "🔑 Please login to Netlify:"
    netlify login
fi

# Deploy
echo ""
echo "📤 Deploying to Netlify..."
netlify deploy --prod --dir=. --site=binary-trading-dashboard

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📝 To set a custom domain:"
    echo "   1. Go to Netlify dashboard"
    echo "   2. Find 'binary-trading-dashboard' site"
    echo "   3. Domain settings → Add custom domain"
    echo ""
    echo "🔄 To redeploy after changes:"
    echo "   cd /Users/daytrons/.openclaw/workspace/projects/trading-system/frontend"
    echo "   ./deploy.sh"
else
    echo ""
    echo "❌ Deployment failed"
    echo "Check errors above and try again"
    exit 1
fi
