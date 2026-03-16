#!/bin/bash
# Safe Deployment Script for Mission Control
# Always backs up and verifies before deploying

set -e

REPO_DIR="$HOME/.openclaw/workspace/mission-control-repo"
SCRIPTS_DIR="$REPO_DIR/scripts"

cd "$REPO_DIR"

echo "🚀 Mission Control Deployment"
echo "=============================="
echo ""

# Step 1: Backup and verify
log() {
    echo -e "\033[0;34m[DEPLOY]\033[0m $1"
}

log "Step 1: Creating backup and verifying..."
if ! "$SCRIPTS_DIR/backup-and-verify.sh" auto; then
    echo ""
    echo "❌ Verification failed! Fix issues before deploying."
    exit 1
fi

echo ""
log "Step 2: Checking for uncommitted changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo "Uncommitted changes found. Committing..."
    git add -A
    git commit -m "Auto-commit before deployment $(date +%Y-%m-%d_%H:%M)"
else
    echo "No uncommitted changes."
fi

echo ""
log "Step 3: Pushing to GitHub..."
git push

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "GitHub will trigger Vercel deployment automatically."
echo "Monitor at: https://vercel.com/dashboard"
echo "Live URL: https://mission-control-o52l.vercel.app"
echo ""
echo "To rollback if needed:"
echo "  ./scripts/backup-and-verify.sh list"
echo "  ./scripts/backup-and-verify.sh restore [backup_name]"
