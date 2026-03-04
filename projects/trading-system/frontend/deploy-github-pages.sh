#!/bin/bash
# GitHub Pages Deploy for BINARY Trading Dashboard
# Deploys to: https://daytrons.github.io/binary-dashboard

set -e

echo "🚀 Deploying BINARY Trading Dashboard to GitHub Pages..."
echo ""

# Configuration
REPO_NAME="binary-dashboard"
GITHUB_USER="daytrons"
DEPLOY_DIR="/tmp/binary-dashboard-deploy"

# Check if git is configured
if ! git config --global user.email &>/dev/null; then
    git config --global user.email "deploy@openclaw.local"
    git config --global user.name "OpenClaw Deploy"
fi

# Create deploy directory
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

# Copy files
cp index.html "$DEPLOY_DIR/"
cp gex-dashboard.html "$DEPLOY_DIR/" 2>/dev/null || true

# Create a simple package for GitHub Pages
cd "$DEPLOY_DIR"

# Initialize git repo
git init
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# Add all files
git add .

# Commit
git commit -m "Deploy BINARY Trading Dashboard - $(date)"

# Add remote (user needs to create repo first)
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create a GitHub repo named '$REPO_NAME' at:"
echo "   https://github.com/new"
echo ""
echo "2. Then run:"
echo "   cd $DEPLOY_DIR"
echo "   git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo "   git push -f origin gh-pages"
echo ""
echo "3. Your dashboard will be at:"
echo "   https://$GITHUB_USER.github.io/$REPO_NAME"
echo ""
echo "Or use this one-liner after creating the repo:"
echo "   (cd $DEPLOY_DIR && git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git && git push -f origin gh-pages)"
echo ""

# Alternative: Create a simple local server
echo "🖥️  To preview locally, run:"
echo "   cd /Users/daytrons/.openclaw/workspace/projects/trading-system/frontend"
echo "   python3 -m http.server 8080"
echo "   Then open: http://localhost:8080"
echo ""

# Save deploy directory path
echo "$DEPLOY_DIR" > /tmp/binary-dashboard-deploy-path.txt
echo "Deploy directory: $DEPLOY_DIR"