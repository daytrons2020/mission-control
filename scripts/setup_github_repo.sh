#!/bin/bash
# GitHub Repository Setup Script for Mission Control
# Run this after authenticating with: gh auth login

cd /Users/daytrons/.openclaw/workspace

echo "🚀 Setting up GitHub repository for Mission Control..."

# Check if already has remote
if git remote | grep -q origin; then
    echo "⚠️  Remote already exists. Skipping repo creation."
    git remote -v
    exit 0
fi

# Create GitHub repository
echo "📦 Creating GitHub repository 'mission-control'..."
gh repo create mission-control \
    --public \
    --description "Mission Control dashboard and workspace for automated agent systems" \
    --source=. \
    --remote=origin \
    --push

if [ $? -eq 0 ]; then
    echo "✅ Repository created and pushed successfully!"
    echo ""
    echo "🔗 Repository URL:"
    git remote get-url origin
    echo ""
    echo "📝 Next steps:"
    echo "1. Connect Vercel to GitHub:"
    echo "   - Go to https://vercel.com/new"
    echo "   - Import 'mission-control' repo"
    echo "   - Deploy"
    echo ""
    echo "2. Update Vercel environment variables if needed"
    echo "3. Test auto-deploy on next git push"
else
    echo "❌ Failed to create repository"
    echo "Make sure you're authenticated: gh auth login"
    exit 1
fi
