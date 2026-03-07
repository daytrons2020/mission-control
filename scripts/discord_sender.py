#!/usr/bin/env python3
"""
Discord Webhook Sender - Mission Control Skill
Sends formatted messages to Discord channels using webhooks
"""

import os
import sys
import json
import requests
from datetime import datetime

# Default webhook URLs (should be set in environment)
DEFAULT_WEBHOOKS = {
    'admin': os.getenv('DISCORD_ADMIN_WEBHOOK'),
    'token-tracker': os.getenv('DISCORD_TOKEN_WEBHOOK'),
    'morning-brief': os.getenv('DISCORD_BRIEF_WEBHOOK'),
    'daily-digest': os.getenv('DISCORD_DIGEST_WEBHOOK'),
    'trading': os.getenv('DISCORD_TRADING_WEBHOOK'),
}

def send_discord_message(content, channel='admin', embed=None, username="Mission Control"):
    """Send a message to Discord via webhook"""
    
    webhook_url = DEFAULT_WEBHOOKS.get(channel)
    
    if not webhook_url:
        print(f"Error: No webhook configured for channel '{channel}'")
        return False
    
    payload = {
        "username": username,
        "content": content
    }
    
    if embed:
        payload["embeds"] = [embed]
    
    try:
        response = requests.post(
            webhook_url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 204:
            print(f"✅ Message sent to #{channel}")
            return True
        else:
            print(f"❌ Failed to send: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        return False

def create_embed(title, description, color=0x8b5cf6, fields=None, footer=None):
    """Create a Discord embed object"""
    embed = {
        "title": title,
        "description": description,
        "color": color,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    
    if fields:
        embed["fields"] = fields
    
    if footer:
        embed["footer"] = {"text": footer}
    
    return embed

# Color codes
COLORS = {
    'success': 0x10b981,  # Green
    'warning': 0xf59e0b,  # Yellow
    'error': 0xef4444,    # Red
    'info': 0x3b82f6,     # Blue
    'purple': 0x8b5cf6,   # Purple
    'cyan': 0x06b6d4,     # Cyan
}

if __name__ == "__main__":
    # Simple CLI usage
    if len(sys.argv) < 3:
        print("Usage: python3 discord_sender.py <channel> <message>")
        print("Example: python3 discord_sender.py admin 'Hello from Mission Control'")
        sys.exit(1)
    
    channel = sys.argv[1]
    message = sys.argv[2]
    
    send_discord_message(message, channel)