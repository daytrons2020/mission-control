#!/bin/bash
# GitHub Repository Auto-Sync Setup for Mission Control
# Handles initial setup + auto-sync configuration
# Usage: ./scripts/setup_github_auto_sync.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="mission-control"
WORKSPACE_DIR="/Users/daytrons/.openclaw/workspace"
GITHUB_USER="${GITHUB_USER:-daytrons}"

cd "$WORKSPACE_DIR"

echo -e "${BLUE}🚀 Mission Control GitHub Auto-Sync Setup${NC}"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}📦 Installing GitHub CLI...${NC}"
    brew install gh
fi

# Check authentication
if ! gh auth status &>/dev/null; then
    echo -e "${YELLOW}🔐 Please authenticate with GitHub:${NC}"
    gh auth login --web
fi

# Get GitHub username if not set
if [ -z "$GITHUB_USER" ] || [ "$GITHUB_USER" = "daytrons" ]; then
    GITHUB_USER=$(gh api user -q '.login')
fi

echo -e "${BLUE}👤 GitHub User: $GITHUB_USER${NC}"

# Check if remote exists
if git remote | grep -q origin; then
    echo -e "${GREEN}✅ GitHub remote already configured${NC}"
    git remote -v
    REMOTE_URL=$(git remote get-url origin)
else
    # Check if repo exists on GitHub
    echo -e "${BLUE}🔍 Checking if repository exists...${NC}"
    
    if gh repo view "$GITHUB_USER/$REPO_NAME" &>/dev/null; then
        echo -e "${YELLOW}⚠️  Repository exists. Adding as remote...${NC}"
        git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    else
        echo -e "${BLUE}📦 Creating GitHub repository...${NC}"
        gh repo create "$REPO_NAME" \
            --public \
            --description "Mission Control dashboard and workspace for automated agent systems" \
            --source=. \
            --remote=origin \
            --push
        echo -e "${GREEN}✅ Repository created and pushed!${NC}"
    fi
    
    REMOTE_URL=$(git remote get-url origin)
fi

echo ""
echo -e "${BLUE}🔗 Repository: $REMOTE_URL${NC}"

# Setup auto-sync cron job
echo ""
echo -e "${BLUE}🔄 Setting up auto-sync cron job...${NC}"

# Create sync script
SYNC_SCRIPT="$WORKSPACE_DIR/scripts/auto_git_sync.sh"
cat > "$SYNC_SCRIPT" << 'EOF'
#!/bin/bash
# Auto Git Sync Script - Runs every 15 minutes
# Syncs local workspace with GitHub

WORKSPACE_DIR="/Users/daytrons/.openclaw/workspace"
LOG_FILE="$WORKSPACE_DIR/logs/git-sync.log"
LOCK_FILE="/tmp/mission-control-git-sync.lock"

# Create logs dir if needed
mkdir -p "$WORKSPACE_DIR/logs"

# Prevent concurrent runs
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "[$(date)] Sync already running (PID: $PID)" >> "$LOG_FILE"
        exit 0
    fi
fi
echo $$ > "$LOCK_FILE"

cd "$WORKSPACE_DIR"

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    rm -f "$LOCK_FILE"
    exit 0
fi

# Sync
echo "[$(date)] Starting auto-sync..." >> "$LOG_FILE"

git add -A >> "$LOG_FILE" 2>&1
git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE" 2>&1

if git push origin main >> "$LOG_FILE" 2>&1; then
    echo "[$(date)] ✅ Sync successful" >> "$LOG_FILE"
else
    # Try to pull first if push failed
    git pull --rebase origin main >> "$LOG_FILE" 2>&1
    if git push origin main >> "$LOG_FILE" 2>&1; then
        echo "[$(date)] ✅ Sync successful (after rebase)" >> "$LOG_FILE"
    else
        echo "[$(date)] ❌ Sync failed" >> "$LOG_FILE"
    fi
fi

rm -f "$LOCK_FILE"
EOF

chmod +x "$SYNC_SCRIPT"

# Add to crontab if not already there
CRON_JOB="*/15 * * * * $SYNC_SCRIPT"
if ! crontab -l 2>/dev/null | grep -q "$SYNC_SCRIPT"; then
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    echo -e "${GREEN}✅ Auto-sync cron job added (runs every 15 min)${NC}"
else
    echo -e "${YELLOW}⚠️  Auto-sync cron job already exists${NC}"
fi

# Create manual sync script
MANUAL_SYNC="$WORKSPACE_DIR/scripts/sync_now.sh"
cat > "$MANUAL_SYNC" << 'EOF'
#!/bin/bash
# Manual Git Sync - Run this to sync immediately

cd /Users/daytrons/.openclaw/workspace

echo "🔄 Manual sync starting..."

if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to sync"
    exit 0
fi

git add -A
git commit -m "Manual sync: $(date '+%Y-%m-%d %H:%M')"

if git push origin main; then
    echo "✅ Sync successful!"
    echo "🌐 Changes will auto-deploy to Vercel"
else
    echo "⚠️  Push failed, trying pull + rebase..."
    git pull --rebase origin main
    git push origin main
fi
EOF

chmod +x "$MANUAL_SYNC"

echo ""
echo -e "${GREEN}✅ GitHub Auto-Sync Setup Complete!${NC}"
echo ""
echo "📁 Files created:"
echo "  • scripts/auto_git_sync.sh - Auto-sync every 15 min"
echo "  • scripts/sync_now.sh - Manual sync command"
echo "  • logs/git-sync.log - Sync history"
echo ""
echo "🔄 Auto-sync: Every 15 minutes via cron"
echo "🚀 Manual sync: ./scripts/sync_now.sh"
echo ""
echo "🔗 Repository: $REMOTE_URL"
echo "🌐 Dashboard: https://mission-control-vercel.vercel.app"
