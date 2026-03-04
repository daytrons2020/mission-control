#!/bin/bash
# Quick setup for GitHub Pages deployment
# Run this after creating the repo at https://github.com/new

REPO_NAME="binary-dashboard"
GITHUB_USER="daytrons"
DEPLOY_DIR="/tmp/binary-dashboard-deploy"

echo "🔗 Connecting to GitHub..."
cd "$DEPLOY_DIR"

# Add remote and push
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git" 2>/dev/null || true
git push -f origin gh-pages

echo ""
echo "✅ Deployed!"
echo ""
echo "🌐 Your BINARY Dashboard is at:"
echo "   https://$GITHUB_USER.github.io/$REPO_NAME"
echo ""
echo "📱 Mobile-optimized and ready!"
echo ""
echo "To update in the future:"
echo "   cd /Users/daytrons/.openclaw/workspace/projects/trading-system/frontend"
echo "   ./update-github-pages.sh"