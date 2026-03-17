#!/bin/bash
# Start Mission Control Discord Integration
# Real-time updates to #mission-control channel

cd "$(dirname "$0")"

echo "🎮 Starting Mission Control Discord Integration..."
echo "================================================"

# Check if webhook URL is configured
if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    # Try to load from .env
    if [ -f ~/.env ]; then
        export $(grep -v '^#' ~/.env | xargs)
    fi
fi

if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo "❌ ERROR: DISCORD_WEBHOOK_URL not set!"
    echo "Please set your Discord webhook URL:"
    echo "  export DISCORD_WEBHOOK_URL='https://discord.com/api/webhooks/...'"
    exit 1
fi

echo "✓ Webhook configured"

# Use venv Python
if [ -f "venv/bin/python3" ]; then
    PYTHON="venv/bin/python3"
else
    PYTHON="python3"
fi

# Install required packages
$PYTHON -c "import aiohttp" 2>/dev/null || $PYTHON -m pip install aiohttp -q

echo ""
echo "Starting Discord Bridge..."
echo "  - Real-time job updates"
echo "  - Status notifications"
echo "  - Command processing"
echo ""
echo "Webhook will post to: #mission-control"
echo ""

# Start the bridge
exec $PYTHON mission_control_discord_bridge.py
