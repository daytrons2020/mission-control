#!/bin/bash
# discord_post.sh - Post messages to Discord via webhook
# Usage: discord_post.sh <channel> <message>
# Channels: admin, token-tracker

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/.webhook_config"

# Load webhook URLs from config
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: Webhook config not found at $CONFIG_FILE" >&2
    echo "Run setup_zero_token_cron.sh first" >&2
    exit 1
fi

CHANNEL="$1"
MESSAGE="$2"

if [ -z "$CHANNEL" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: $0 <channel> <message>" >&2
    echo "Channels: admin, token-tracker" >&2
    exit 1
fi

# Select webhook URL based on channel
case "$CHANNEL" in
    admin)
        WEBHOOK_URL="$ADMIN_WEBHOOK_URL"
        ;;
    token-tracker)
        WEBHOOK_URL="$TOKEN_TRACKER_WEBHOOK_URL"
        ;;
    *)
        echo "Error: Unknown channel '$CHANNEL'. Use: admin, token-tracker" >&2
        exit 1
        ;;
esac

if [ -z "$WEBHOOK_URL" ]; then
    echo "Error: Webhook URL not configured for channel '$CHANNEL'" >&2
    exit 1
fi

# Don't post NO_REPLY or empty messages
if [ "$MESSAGE" = "NO_REPLY" ] || [ -z "$MESSAGE" ]; then
    exit 0
fi

# Escape the message for JSON
JSON_MESSAGE=$(echo "$MESSAGE" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g' | tr '\n' ' ' | sed 's/  */ /g')

# Post to Discord
curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"$JSON_MESSAGE\"}" \
    --max-time 10

echo ""
