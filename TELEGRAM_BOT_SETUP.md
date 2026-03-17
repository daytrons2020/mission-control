# 🤖 Kimi Telegram Bot - Remote Access Guide

Talk to Kimi Code CLI from anywhere using Telegram on your phone.

## ✅ Features

- **No Terminal needed** - Runs as macOS background service
- **Auto-restart** - If it crashes, it automatically restarts
- **Auto-start on boot** - Starts when you log in
- **Retry logic** - 3 retries on failure
- **Health checks** - Monitors system every 5 minutes
- **Long messages** - Automatically splits responses over 4096 chars
- **Secure** - Optional: restrict to your Telegram user ID only

## 🚀 Quick Setup

### Step 1: Create Telegram Bot

1. Open **Telegram** on your phone or computer
2. Search for **@BotFather**
3. Send message: `/newbot`
4. Follow prompts:
   - Name your bot (e.g., "MyKimiBot")
   - Choose username (e.g., "mykimi_bot" - must end in 'bot')
5. **Copy the token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Run Setup Script

```bash
cd ~/.openclaw/workspace/mission-control-repo
./setup_telegram_bot.sh
```

The script will:
- Ask for your bot token
- Optionally ask for your User ID (for security)
- Install dependencies
- Set up LaunchDaemon service
- Start the bot

### Step 3: Test It

1. Open Telegram on your phone
2. Search for your bot (by the username you chose)
3. Send: `/start`
4. You should see: "👋 Welcome to Kimi Code Bot!"
5. Try asking: "What files are in my home directory?"

## 📱 How to Use

**Just type normally:**
- "Read my ~/.zshrc file"
- "Create a Python script that..."
- "Fix this error: [paste error]"
- "What processes are using the most memory?"

**Commands:**
- `/start` - Welcome message
- `/status` - Check system health
- `/logs` - View recent bot logs
- `/restart` - Restart the bot service
- `/help` - Show help

## 🔧 Management

### Check if Bot is Running
```bash
launchctl list | grep kimi-telegram
```

### View Logs
```bash
# Bot logs
tail -f ~/.openclaw/workspace/logs/telegram_kimi_bot.log

# Service stdout
tail -f ~/.openclaw/workspace/logs/telegram_bot_stdout.log

# Service errors
tail -f ~/.openclaw/workspace/logs/telegram_bot_stderr.log
```

### Stop/Start/Restart
```bash
# Stop
launchctl stop com.openclaw.kimi-telegram-bot

# Start
launchctl start com.openclaw.kimi-telegram-bot

# Restart
launchctl stop com.openclaw.kimi-telegram-bot && launchctl start com.openclaw.kimi-telegram-bot
```

### Disable Completely
```bash
launchctl unload ~/Library/LaunchAgents/com.openclaw.kimi-telegram-bot.plist
```

### Re-enable
```bash
launchctl load ~/Library/LaunchAgents/com.openclaw.kimi-telegram-bot.plist
launchctl start com.openclaw.kimi-telegram-bot
```

## 🔒 Security (Optional but Recommended)

Restrict bot to only respond to you:

1. In Telegram, find **@userinfobot**
2. It will reply with your User ID (e.g., `123456789`)
3. During setup, enter this ID when prompted
4. Now only you can use the bot

## 🐛 Troubleshooting

### Bot not responding
```bash
# Check if service is running
launchctl list | grep kimi-telegram

# Check logs for errors
tail -50 ~/.openclaw/workspace/logs/telegram_bot_stderr.log

# Restart the service
launchctl stop com.openclaw.kimi-telegram-bot
launchctl start com.openclaw.kimi-telegram-bot
```

### Kimi CLI not found
Make sure Kimi CLI is installed:
```bash
which kimi
# Should show path to kimi
```

### Token invalid
If you see "Unauthorized" errors:
```bash
# Edit the plist file
nano ~/Library/LaunchAgents/com.openclaw.kimi-telegram-bot.plist

# Update the TELEGRAM_BOT_TOKEN value
# Then reload:
launchctl unload ~/Library/LaunchAgents/com.openclaw.kimi-telegram-bot.plist
launchctl load ~/Library/LaunchAgents/com.openclaw.kimi-telegram-bot.plist
```

## 📊 Architecture

```
Your Phone (Telegram)
        ↓
Telegram Servers
        ↓
Your Mac (Telegram Bot Service)
        ↓
Kimi Code CLI
        ↓
File System / Shell
```

- **Your Mac must be ON** for the bot to work
- **Internet required** (obviously)
- **Bot runs as service** - no Terminal window needed

## 💡 Tips

- **Be specific** - "Show me the last 10 lines of ~/.zshrc" works better than "show me my config"
- **File paths** - Use full paths or `~` shorthand
- **Timeouts** - Complex tasks may take up to 5 minutes
- **Large outputs** - Bot automatically splits long responses

## 📝 File Locations

| File | Location |
|------|----------|
| Bot script | `~/.openclaw/workspace/mission-control-repo/telegram_kimi_bot.py` |
| Service config | `~/Library/LaunchAgents/com.openclaw.kimi-telegram-bot.plist` |
| Bot logs | `~/.openclaw/workspace/logs/telegram_kimi_bot.log` |
| Service stdout | `~/.openclaw/workspace/logs/telegram_bot_stdout.log` |
| Service stderr | `~/.openclaw/workspace/logs/telegram_bot_stderr.log` |
