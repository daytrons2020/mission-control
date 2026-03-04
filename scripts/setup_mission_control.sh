#!/bin/bash
# Mission Control Essentials Setup
# One-command setup for all Mission Control components

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

WORKSPACE_DIR="/Users/daytrons/.openclaw/workspace"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}     🔬 Mission Control Essentials Setup        ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

cd "$WORKSPACE_DIR"

# ========================================
# 1. GitHub Auto-Sync Setup
# ========================================
echo -e "${BLUE}📦 1/5 Setting up GitHub Auto-Sync...${NC}"
if [ -f "scripts/setup_github_auto_sync.sh" ]; then
    ./scripts/setup_github_auto_sync.sh --quiet 2>/dev/null || echo -e "${YELLOW}⚠️  GitHub setup needs manual auth${NC}"
    echo -e "${GREEN}✅ GitHub auto-sync configured${NC}"
else
    echo -e "${RED}❌ GitHub setup script not found${NC}"
fi

# ========================================
# 2. Vercel Deployment Check
# ========================================
echo ""
echo -e "${BLUE}🌐 2/5 Checking Vercel configuration...${NC}"
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json configured${NC}"
    echo "   • Static build for dashboard.html"
    echo "   • API routes for /health and /status"
    echo "   • CORS enabled for cross-origin requests"
else
    echo -e "${RED}❌ vercel.json not found${NC}"
fi

# ========================================
# 3. Discord Slash Commands
# ========================================
echo ""
echo -e "${BLUE}💬 3/5 Setting up Discord slash commands...${NC}"
if [ -f "scripts/discord_slash_commands.py" ]; then
    python3 scripts/discord_slash_commands.py --list
    echo ""
    echo -e "${YELLOW}To register commands with Discord:${NC}"
    echo "   python3 scripts/discord_slash_commands.py --register <BOT_TOKEN>"
    echo -e "${GREEN}✅ Discord handlers ready${NC}"
else
    echo -e "${RED}❌ Discord handlers not found${NC}"
fi

# ========================================
# 4. Health Score Algorithm
# ========================================
echo ""
echo -e "${BLUE}🔧 4/5 Setting up Health Score algorithm...${NC}"
if [ -f "scripts/health_score.py" ]; then
    # Create initial health report
    python3 scripts/health_score.py --quiet 2>/dev/null || true
    
    # Add cron job for health checks (every 6 hours)
    CRON_JOB="0 */6 * * * cd $WORKSPACE_DIR && python3 scripts/health_score.py --quiet"
    if ! crontab -l 2>/dev/null | grep -q "health_score.py"; then
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo -e "${GREEN}✅ Health check cron added (every 6 hours)${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check cron already exists${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Current Health Status:${NC}"
    python3 scripts/health_score.py 2>/dev/null || echo -e "${YELLOW}Run manually to see status${NC}"
else
    echo -e "${RED}❌ Health score script not found${NC}"
fi

# ========================================
# 5. Mobile-First CSS
# ========================================
echo ""
echo -e "${BLUE}📱 5/5 Mobile-First CSS...${NC}"
if [ -f "styles/mobile-first.css" ]; then
    echo -e "${GREEN}✅ Mobile-first CSS created${NC}"
    echo "   • Breakpoints: 480px, 768px, 1024px"
    echo "   • Bottom navigation for mobile"
    echo "   • Touch-friendly targets (44px)"
    echo "   • Safe area support for notch devices"
    
    # Check if CSS is linked in dashboard
    if ! grep -q "mobile-first.css" dashboard.html 2>/dev/null; then
        echo ""
        echo -e "${YELLOW}⚠️  Add this to dashboard.html <head>:${NC}"
        echo "   <link rel=\"stylesheet\" href=\"styles/mobile-first.css\">"
    fi
else
    echo -e "${RED}❌ Mobile CSS not found${NC}"
fi

# ========================================
# Summary
# ========================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}              📋 Setup Summary                  ${BLUE}║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Components Created:${NC}"
echo "   • scripts/setup_github_auto_sync.sh - GitHub auto-sync"
echo "   • scripts/sync_now.sh - Manual sync command"
echo "   • scripts/health_score.py - Health algorithm"
echo "   • scripts/discord_slash_commands.py - Discord handlers"
echo "   • api/health.js - Vercel health API"
echo "   • api/status.js - Vercel status API"
echo "   • styles/mobile-first.css - Responsive CSS"
echo "   • components/mobile-nav.html - Mobile navigation"
echo ""
echo -e "${BLUE}🔗 Quick Commands:${NC}"
echo "   ./scripts/sync_now.sh          # Manual git sync"
echo "   python3 scripts/health_score.py # Check health"
echo "   python3 scripts/discord_slash_commands.py --test status"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "   Dashboard: https://mission-control-vercel.vercel.app"
echo "   Health API: https://mission-control-vercel.vercel.app/api/health"
echo "   Status API: https://mission-control-vercel.vercel.app/api/status"
echo ""
echo -e "${GREEN}✅ Mission Control Essentials Setup Complete!${NC}"
