#!/usr/bin/env python3
"""
Discord webhook integration for Ollama notifications
"""
import json
import os
import urllib.request
from datetime import datetime

DISCORD_WEBHOOK = os.getenv("DISCORD_WEBHOOK_URL", "")

def send_to_discord(content, username="OllamaBot", avatar_url=None):
    """Send message to Discord webhook."""
    if not DISCORD_WEBHOOK:
        print("Discord webhook not configured")
        return False
    
    payload = {
        "username": username,
        "content": content[:2000]  # Discord limit
    }
    if avatar_url:
        payload["avatar_url"] = avatar_url
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            DISCORD_WEBHOOK,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status == 204
    except Exception as e:
        print(f"Discord send failed: {e}")
        return False

def format_morning_brief(data):
    """Format morning brief for Discord."""
    return f"""📋 **Morning Brief - {data['date']}**

{data['brief'][:1500]}

_Generated at {data['generated_at'][:19]}_"""

def format_daily_digest(data):
    """Format daily digest for Discord."""
    return f"""📊 **Daily Digest - {data['date']}**

{data['digest'][:1500]}

_Generated at {data['generated_at'][:19]}_"""

def format_weekly_report(data):
    """Format weekly report for Discord."""
    return f"""📈 **Weekly Report - Week Ending {data['week_ending']}**

{data['report'][:1500]}

_Generated at {data['generated_at'][:19]}_"""

def format_trading_alert(ticker, price, change_pct):
    """Format trading alert for Discord."""
    emoji = "🟢" if change_pct > 0 else "🔴"
    return f"""{emoji} **Trading Alert: {ticker}**
Price: ${price} ({change_pct:+.2f}%)

_Generated at {datetime.now().strftime('%H:%M:%S')}_"""

def format_cost_report(summary):
    """Format cost report for Discord."""
    return f"""💰 **Hourly Cost Report**

{summary}

_Generated at {datetime.now().strftime('%H:%M')}_"""

if __name__ == "__main__":
    # Test Discord integration
    print("Discord webhook integration ready.")
    print(f"Webhook configured: {'Yes' if DISCORD_WEBHOOK else 'No'}")
    print("Set DISCORD_WEBHOOK_URL environment variable to enable.")
