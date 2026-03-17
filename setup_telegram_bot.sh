#!/bin/bash
# Setup Telegram Bot for Kimi Code CLI
# Runs as background service - no Terminal required

set -e

echo "🤖 Kimi Telegram Bot Setup"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

REPO_DIR="$HOME/.openclaw/workspace/mission-control-repo"
LOG_DIR="$HOME/.openclaw/workspace/logs"
PLIST_NAME="com.openclaw.kimi-telegram-bot.plist"
PLIST_SOURCE="$REPO_DIR/$PLIST_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"

echo "Step 1: Checking prerequisites..."
echo "---------------------------------"

# Check if Kimi CLI is installed
if ! command -v kimi &> /dev/null; then
    echo -e "${RED}❌ Kimi CLI not found!${NC}"
    echo "Install it first: https://github.com/moonshot-ai/Kimi-Chat"
    exit 1
fi
echo -e "${GREEN}✅ Kimi CLI found${NC}"

# Check if in venv
cd "$REPO_DIR"
if [ ! -f "venv/bin/python3" ]; then
    echo -e "${RED}❌ Virtual environment not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Virtual environment found${NC}"

# Install dependencies
echo ""
echo "Installing dependencies..."
source venv/bin/activate
pip install -q aiohttp psutil
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check for existing bot
echo ""
echo "Step 2: Telegram Bot Token"
echo "--------------------------"
echo ""

if [ -f "$PLIST_DEST" ]; then
    echo -e "${YELLOW}⚠️  Telegram bot service already exists${NC}"
    CURRENT_TOKEN=$(grep -A1 "TELEGRAM_BOT_TOKEN" "$PLIST_DEST" | grep -oP '(?<=<string>).*?(?=</string>)' | head -1)
    if [ "$CURRENT_TOKEN" != "YOUR_BOT_TOKEN_HERE" ] && [ -n "$CURRENT_TOKEN" ]; then
        echo "Current token: ${CURRENT_TOKEN:0:10}..."
        read -p "Use existing token? (y/n): " use_existing
        if [[ $use_existing =~ ^[Yy]$ ]]; then
            BOT_TOKEN="$CURRENT_TOKEN"
        fi
    fi
fi

if [ -z "$BOT_TOKEN" ]; then
    echo "To create a bot:"
    echo "  1. Open Telegram and search for @BotFather"
    echo "  2. Send: /newbot"
    echo "  3. Follow instructions to name your bot"
    echo "  4. Copy the token (looks like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)"
    echo ""
    read -p "Enter your bot token: " BOT_TOKEN
    
    if [ -z "$BOT_TOKEN" ] || [ "$BOT_TOKEN" = "YOUR_BOT_TOKEN_HERE" ]; then
        echo -e "${RED}❌ Invalid token!${NC}"
        exit 1
    fi
fi

echo ""
echo "Step 3: Optional Security"
echo "-------------------------"
echo "Restrict bot to only respond to you? (recommended)"
echo "  1. Open Telegram"
echo "  2. Find @userinfobot"
echo "  3. It will reply with your User ID (e.g., 123456789)"
echo ""
read -p "Enter your User ID (or press Enter to allow anyone): " USER_ID

# Update plist file with token
echo ""
echo "Step 4: Configuring service..."
echo "------------------------------"

# Create plist with actual token
mkdir -p "$HOME/Library/LaunchAgents"

cat > "$PLIST_DEST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.openclaw.kimi-telegram-bot</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>$REPO_DIR/venv/bin/python3</string>
        <string>$REPO_DIR/telegram_kimi_bot.py</string>
    </array>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>TELEGRAM_BOT_TOKEN</key>
        <string>$BOT_TOKEN</string>
EOF

# Add user ID restriction if provided
if [ -n "$USER_ID" ]; then
    cat >> "$PLIST_DEST" << EOF
        <key>ALLOWED_USER_IDS</key>
        <string>$USER_ID</string>
EOF
fi

cat >> "$PLIST_DEST" << EOF
        <key>PATH</key>
        <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    
    <key>WorkingDirectory</key>
    <string>$HOME</string>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
        <key>Crashed</key>
        <true/>
    </dict>
    
    <key>ThrottleInterval</key>
    <integer>30</integer>
    
    <key>StandardOutPath</key>
    <string>$LOG_DIR/telegram_bot_stdout.log</string>
    
    <key>StandardErrorPath</key>
    <string>$LOG_DIR/telegram_bot_stderr.log</string>
    
    <key>ProcessType</key>
    <string>Background</string>
</dict>
</plist>
EOF

echo -e "${GREEN}✅ Service configured${NC}"

# Load and start service
echo ""
echo "Step 5: Starting service..."
echo "---------------------------"

# Unload if exists (to update)
launchctl unload "$PLIST_DEST" 2>/dev/null || true

# Load new service
launchctl load "$PLIST_DEST"

# Start service
launchctl start com.openclaw.kimi-telegram-bot

sleep 2

# Check if running
if launchctl list | grep -q "com.openclaw.kimi-telegram-bot"; then
    echo -e "${GREEN}✅ Service is running!${NC}"
else
    echo -e "${RED}⚠️  Service may not have started. Checking logs...${NC}"
    tail -20 "$LOG_DIR/telegram_bot_stderr.log" 2>/dev/null || true
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=============================================="
echo ""
echo "Your bot is now running as a background service."
echo "It will:"
echo "  • Start automatically when you log in"
echo "  • Restart if it crashes"
echo "  • Run without Terminal open"
echo ""
echo "To use it:"
echo "  1. Open Telegram on your phone"
echo "  2. Search for your bot (the name you gave @BotFather)"
echo "  3. Send /start"
echo "  4. Start chatting with Kimi!"
echo ""
echo "Management commands:"
echo "  Check status:   launchctl list | grep kimi-telegram"
echo "  View logs:      tail -f $LOG_DIR/telegram_kimi_bot.log"
echo "  Stop bot:       launchctl stop com.openclaw.kimi-telegram-bot"
echo "  Start bot:      launchctl start com.openclaw.kimi-telegram-bot"
echo "  Restart bot:    launchctl stop com.openclaw.kimi-telegram-bot && launchctl start com.openclaw.kimi-telegram-bot"
echo "  Disable:        launchctl unload $PLIST_DEST"
echo ""
echo -e "${YELLOW}📱 Test your bot now by sending /start in Telegram!${NC}"
