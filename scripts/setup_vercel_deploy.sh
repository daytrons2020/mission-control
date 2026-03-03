#!/bin/bash
# Complete GitHub + Vercel Setup Script
# Run this after authenticating with: gh auth login

set -e

echo "🚀 Mission Control Deployment Setup"
echo "===================================="
echo ""

# Configuration
REPO_NAME="mission-control"
WORKSPACE_DIR="/Users/daytrons/.openclaw/workspace"

cd "$WORKSPACE_DIR"

# Check if already has remote
if git remote | grep -q origin; then
    echo "✅ GitHub remote already configured"
    git remote -v
else
    echo "📦 Creating GitHub repository..."
    
    # Check if gh is authenticated
    if ! gh auth status &>/dev/null; then
        echo "❌ Not authenticated with GitHub"
        echo "Please run: gh auth login"
        exit 1
    fi
    
    # Create repo
    gh repo create "$REPO_NAME" \
        --public \
        --description "Mission Control dashboard and workspace for automated agent systems" \
        --source=. \
        --remote=origin \
        --push
    
    echo "✅ Repository created and pushed!"
fi

echo ""
echo "🔗 Repository URL:"
git remote get-url origin

echo ""
echo "🌐 Next: Connect to Vercel"
echo "1. Go to https://vercel.com/new"
echo "2. Import the '$REPO_NAME' repository"
echo "3. Framework preset: Other (static)"
echo "4. Deploy!"
echo ""
echo "📱 Or use Vercel CLI:"
echo "   npm i -g vercel"
echo "   vercel --prod"
echo ""

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo "🚀 Vercel CLI detected! Deploy now? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "📤 Deploying to Vercel..."
        vercel --prod
    fi
else
    echo "📦 Install Vercel CLI: npm i -g vercel"
fi

echo ""
echo "✅ Setup complete!"
echo "Website will auto-deploy on every git push"
