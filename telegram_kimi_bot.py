#!/usr/bin/env python3
"""
Telegram Bot for Kimi Code CLI - Reliable 24/7 Service
Runs as macOS LaunchDaemon - no Terminal required
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import tempfile
import time
from datetime import datetime
from typing import Optional

# Setup logging
LOG_FILE = "/Users/daytrons/.openclaw/workspace/logs/telegram_kimi_bot.log"
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
ALLOWED_USER_IDS = os.getenv("ALLOWED_USER_IDS", "").split(",") if os.getenv("ALLOWED_USER_IDS") else []
MAX_MESSAGE_LENGTH = 4096  # Telegram limit
REQUEST_TIMEOUT = 300  # 5 minutes for complex tasks
MAX_RETRIES = 3
RETRY_DELAY = 5

class KimiTelegramBot:
    """Telegram bot that proxies messages to Kimi Code CLI"""
    
    def __init__(self):
        self.token = TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.token}"
        self.offset = 0
        self.last_health_check = 0
        self.consecutive_errors = 0
        
    async def start(self):
        """Main bot loop with health checks"""
        if not self.token:
            logger.error("❌ TELEGRAM_BOT_TOKEN not set!")
            logger.error("Set it with: export TELEGRAM_BOT_TOKEN='your-token'")
            return
            
        logger.info("🤖 Kimi Telegram Bot starting...")
        logger.info(f"   Log file: {LOG_FILE}")
        logger.info(f"   Timeout: {REQUEST_TIMEOUT}s")
        
        # Test Kimi CLI is available
        if not await self._check_kimi_available():
            logger.error("❌ Kimi CLI not available!")
            return
            
        logger.info("✅ Kimi CLI is available")
        
        # Main loop
        while True:
            try:
                await self._process_updates()
                self.consecutive_errors = 0  # Reset on success
                
                # Periodic health check every 5 minutes
                if time.time() - self.last_health_check > 300:
                    await self._health_check()
                    
            except Exception as e:
                self.consecutive_errors += 1
                logger.error(f"❌ Error in main loop (attempt {self.consecutive_errors}): {e}")
                
                if self.consecutive_errors >= 5:
                    logger.error("🚨 Too many consecutive errors, restarting...")
                    await asyncio.sleep(30)
                    self.consecutive_errors = 0
                else:
                    await asyncio.sleep(RETRY_DELAY)
    
    async def _check_kimi_available(self) -> bool:
        """Check if Kimi CLI is installed and working"""
        try:
            result = subprocess.run(
                ["which", "kimi"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Kimi check failed: {e}")
            return False
    
    async def _health_check(self):
        """Periodic health check"""
        self.last_health_check = time.time()
        
        # Check Kimi still works
        if not await self._check_kimi_available():
            logger.warning("⚠️ Health check: Kimi CLI not responding")
        else:
            logger.info("✅ Health check passed")
    
    async def _process_updates(self):
        """Fetch and process Telegram updates"""
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            try:
                url = f"{self.base_url}/getUpdates"
                params = {
                    "offset": self.offset,
                    "limit": 10,
                    "timeout": 30
                }
                
                async with session.get(url, params=params, timeout=35) as resp:
                    if resp.status != 200:
                        logger.warning(f"Telegram API returned {resp.status}")
                        return
                        
                    data = await resp.json()
                    
                    if not data.get("ok"):
                        logger.error(f"Telegram API error: {data}")
                        return
                    
                    updates = data.get("result", [])
                    
                    for update in updates:
                        await self._handle_update(update)
                        self.offset = update["update_id"] + 1
                        
            except asyncio.TimeoutError:
                # Normal - long polling timeout
                pass
            except Exception as e:
                logger.error(f"Error fetching updates: {e}")
                await asyncio.sleep(1)
    
    async def _handle_update(self, update: dict):
        """Handle a single update"""
        message = update.get("message")
        if not message:
            return
            
        chat_id = message.get("chat", {}).get("id")
        user_id = message.get("from", {}).get("id")
        text = message.get("text", "")
        
        if not text:
            return
            
        # Check authorization
        if ALLOWED_USER_IDS and str(user_id) not in ALLOWED_USER_IDS:
            logger.warning(f"Unauthorized access attempt from user {user_id}")
            await self._send_message(chat_id, "⛔ Unauthorized. Contact admin to get access.")
            return
        
        logger.info(f"📩 Message from user {user_id}: {text[:50]}...")
        
        # Handle commands
        if text.startswith("/"):
            await self._handle_command(chat_id, text, user_id)
        else:
            await self._handle_chat(chat_id, text)
    
    async def _handle_command(self, chat_id: int, text: str, user_id: int):
        """Handle bot commands"""
        command = text.split()[0].lower()
        
        if command == "/start":
            welcome = """👋 **Welcome to Kimi Code Bot!**

I'm connected to Kimi Code CLI on your Mac.

**Commands:**
• Just type your question - I'll process it
• `/status` - Check if system is healthy
• `/logs` - Get recent log entries
• `/restart` - Restart the bot service
• `/help` - Show this help

**Tips:**
• Be specific with coding questions
• I can read and edit files on your Mac
• Complex tasks may take 1-5 minutes
"""
            await self._send_message(chat_id, welcome)
            
        elif command == "/status":
            status = await self._get_system_status()
            await self._send_message(chat_id, status)
            
        elif command == "/logs":
            logs = await self._get_recent_logs()
            await self._send_message(chat_id, logs)
            
        elif command == "/restart":
            await self._send_message(chat_id, "🔄 Restarting bot service...")
            logger.info("Restart requested via Telegram")
            # Exit - LaunchDaemon will restart us
            sys.exit(0)
            
        elif command == "/help":
            help_text = """🤖 **Kimi Code Bot Help**

**Chat with me:**
Just send any message and I'll respond using Kimi Code CLI.

**Commands:**
• `/start` - Welcome message
• `/status` - System health check
• `/logs` - Recent log entries
• `/restart` - Restart bot service
• `/help` - This message

**What I can do:**
• Answer coding questions
• Read and analyze files
• Help debug errors
• Write and edit code
• Run shell commands (safely)

**Limitations:**
• Max message length: 4096 characters
• Request timeout: 5 minutes
• Your Mac must be on and online
"""
            await self._send_message(chat_id, help_text)
            
        else:
            await self._send_message(chat_id, f"Unknown command: {command}\nUse /help for available commands.")
    
    async def _handle_chat(self, chat_id: int, text: str):
        """Handle regular chat messages"""
        # Send "typing" indicator
        await self._send_chat_action(chat_id, "typing")
        
        # Process with Kimi
        response = await self._ask_kimi(text)
        
        # Send response
        await self._send_message(chat_id, response)
    
    async def _ask_kimi(self, prompt: str) -> str:
        """Send prompt to Kimi CLI with retry logic"""
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                logger.info(f"🤔 Asking Kimi (attempt {attempt})...")
                
                # Run Kimi in non-interactive mode with --print and --yolo
                # --print: non-interactive, --yolo: auto-approve actions
                result = subprocess.run(
                    ["kimi", "--print", "--yolo", "-c", prompt],
                    capture_output=True,
                    text=True,
                    timeout=REQUEST_TIMEOUT
                )
                
                if result.returncode == 0:
                    response = result.stdout.strip()
                    if response:
                        logger.info(f"✅ Kimi responded ({len(response)} chars)")
                        return response
                    else:
                        return "🤔 I didn't generate a response. Try rephrasing your question."
                else:
                    error = result.stderr[:500] if result.stderr else "Unknown error"
                    logger.warning(f"Kimi returned error: {error}")
                    
                    if attempt < MAX_RETRIES:
                        await asyncio.sleep(RETRY_DELAY * attempt)
                    else:
                        return f"❌ Error after {MAX_RETRIES} attempts:\n```{error}```"
                        
            except subprocess.TimeoutExpired:
                logger.warning(f"⏱️ Kimi timeout (attempt {attempt})")
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(RETRY_DELAY * attempt)
                else:
                    return "⏱️ Request timed out after 5 minutes. Your query may be too complex. Try breaking it into smaller parts."
                    
            except Exception as e:
                logger.error(f"Exception asking Kimi: {e}")
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(RETRY_DELAY * attempt)
                else:
                    return f"❌ Error: {str(e)}"
        
        return "❌ Failed to get response after all retries"
    
    async def _send_message(self, chat_id: int, text: str):
        """Send message to Telegram with chunking for long messages"""
        import aiohttp
        
        # Truncate if way too long (shouldn't happen with normal use)
        if len(text) > 10000:
            text = text[:9990] + "\n\n...[truncated]"
        
        # Split into chunks if needed
        chunks = []
        while len(text) > MAX_MESSAGE_LENGTH:
            # Find good break point
            break_point = text.rfind("\n\n", 0, MAX_MESSAGE_LENGTH - 100)
            if break_point == -1:
                break_point = text.rfind("\n", 0, MAX_MESSAGE_LENGTH - 100)
            if break_point == -1:
                break_point = MAX_MESSAGE_LENGTH - 100
            
            chunks.append(text[:break_point])
            text = text[break_point:].strip()
        
        chunks.append(text)
        
        async with aiohttp.ClientSession() as session:
            for i, chunk in enumerate(chunks):
                # Add continuation marker
                if len(chunks) > 1:
                    prefix = f"📄 Part {i+1}/{len(chunks)}\n\n" if i > 0 else ""
                    chunk = prefix + chunk
                
                payload = {
                    "chat_id": chat_id,
                    "text": chunk
                    # Note: Not using parse_mode to avoid Markdown parsing errors
                }
                
                try:
                    async with session.post(
                        f"{self.base_url}/sendMessage",
                        json=payload,
                        timeout=30
                    ) as resp:
                        if resp.status != 200:
                            error_text = await resp.text()
                            logger.warning(f"Failed to send message: {resp.status} - {error_text[:200]}")
                        await asyncio.sleep(0.5)  # Rate limiting
                except Exception as e:
                    logger.error(f"Error sending message: {e}")
    
    async def _send_chat_action(self, chat_id: int, action: str):
        """Send typing indicator"""
        import aiohttp
        
        try:
            async with aiohttp.ClientSession() as session:
                await session.post(
                    f"{self.base_url}/sendChatAction",
                    json={"chat_id": chat_id, "action": action},
                    timeout=10
                )
        except:
            pass  # Non-critical
    
    async def _get_system_status(self) -> str:
        """Get system health status"""
        import psutil
        
        # Check Kimi CLI
        kimi_ok = await self._check_kimi_available()
        
        # Get system info
        mem = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        status = f"""📊 **System Status**

**Kimi CLI:** {'✅ Online' if kimi_ok else '❌ Offline'}
**Bot Uptime:** {self._format_uptime()}

**System Resources:**
• Memory: {mem.percent}% used ({mem.available // (1024**3)} GB free)
• Disk: {disk.percent}% used ({disk.free // (1024**3)} GB free)
• CPU: {psutil.cpu_percent()}%

**Bot Stats:**
• Consecutive errors: {self.consecutive_errors}
• Log file: {LOG_FILE}
"""
        return status
    
    async def _get_recent_logs(self) -> str:
        """Get recent log entries"""
        try:
            result = subprocess.run(
                ["tail", "-20", LOG_FILE],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                logs = result.stdout
                return f"📋 **Recent Logs:**\n```\n{logs[:3500]}\n```"
            else:
                return "❌ Could not read logs"
        except Exception as e:
            return f"❌ Error reading logs: {e}"
    
    def _format_uptime(self) -> str:
        """Format bot uptime"""
        try:
            with open('/tmp/kimi_bot_start_time', 'r') as f:
                start_time = float(f.read().strip())
            uptime = time.time() - start_time
            hours = int(uptime // 3600)
            minutes = int((uptime % 3600) // 60)
            return f"{hours}h {minutes}m"
        except:
            return "Unknown"


def main():
    """Entry point"""
    # Record start time
    with open('/tmp/kimi_bot_start_time', 'w') as f:
        f.write(str(time.time()))
    
    bot = KimiTelegramBot()
    
    try:
        asyncio.run(bot.start())
    except KeyboardInterrupt:
        logger.info("👋 Bot stopped by user")
    except Exception as e:
        logger.error(f"💥 Fatal error: {e}")
        raise


if __name__ == "__main__":
    main()
