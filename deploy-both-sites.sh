#!/bin/bash
# Deploy CSRC and BINARY websites to GitHub Pages -> Vercel

set -e

echo "🚀 Preparing websites for deployment..."

# Create deploy directories
mkdir -p /tmp/deploy-csrc
mkdir -p /tmp/deploy-binary

# Copy CSRC website
cp /Users/daytrons/.openclaw/workspace/csrc-website/index.html /tmp/deploy-csrc/
cd /tmp/deploy-csrc
git init
git checkout -b main 2>/dev/null || git checkout main
git add .
git commit -m "Initial CSRC website"

echo ""
echo "📋 CSRC Website Ready"
echo ""

# Copy BINARY dashboard
cp /tmp/binary-dashboard-deploy/*.html /tmp/deploy-binary/
cd /tmp/deploy-binary
git init
git checkout -b main 2>/dev/null || git checkout main
git add .
git commit -m "Initial BINARY dashboard"

echo "📋 BINARY Dashboard Ready"
echo ""

echo "✅ Both sites prepared!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repos:"
echo "   - https://github.com/new (name: csrc-website)"
echo "   - https://github.com/new (name: binary-dashboard)"
echo ""
echo "2. Push both sites:"
echo "   cd /tmp/deploy-csrc && git remote add origin https://github.com/daytrons/csrc-website.git && git push -f origin main"
echo "   cd /tmp/deploy-binary && git remote add origin https://github.com/daytrons/binary-dashboard.git && git push -f origin main"
echo ""
echo "3. Connect to Vercel:"
echo "   - Import both repos at https://vercel.com/new"
echo "   - Auto-deploy on every push"
echo ""
echo "Or use this one-liner after creating repos:"
echo "   (cd /tmp/deploy-csrc && git remote add origin https://github.com/daytrons/csrc-website.git && git push -f origin main) && (cd /tmp/deploy-binary && git remote add origin https://github.com/daytrons/binary-dashboard.git && git push -f origin main)"