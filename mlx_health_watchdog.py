#!/usr/bin/env python3
"""
MLX Health Watchdog - Automatically detects and fixes MLX issues
Runs continuously to ensure MLX stays healthy
"""

import asyncio
import json
import os
import subprocess
import sys
import time
from datetime import datetime
import aiohttp
import psutil

# Configuration
MLX_PORT = 18888
MLX_MODEL = "mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit"
CHECK_INTERVAL = 60  # Check every 60 seconds
FAILURE_THRESHOLD = 3  # Restart after 3 consecutive failures
RESTART_COOLDOWN = 300  # Don't restart more often than every 5 minutes

LOG_FILE = "/Users/daytrons/.openclaw/workspace/logs/mlx_watchdog.log"

def log(message):
    """Log with timestamp"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    log_msg = f"[{timestamp}] {message}"
    print(log_msg)
    
    # Write to log file
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(log_msg + '\n')
    except:
        pass

class MLXWatchdog:
    def __init__(self):
        self.consecutive_failures = 0
        self.last_restart = 0
        self.is_healthy = True
        
    async def check_mlx_health(self) -> bool:
        """Check if MLX is actually working (not just responding to /models)"""
        try:
            # Test 1: Check if MLX responds to /models
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"http://127.0.0.1:{MLX_PORT}/v1/models",
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as resp:
                    if resp.status != 200:
                        log("⚠️ MLX /models endpoint not responding")
                        return False
                        
            # Test 2: Check if MLX can actually generate (the real test)
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"http://127.0.0.1:{MLX_PORT}/v1/chat/completions",
                    json={
                        "model": MLX_MODEL,
                        "messages": [{"role": "user", "content": "Hi"}],
                        "max_tokens": 5
                    },
                    timeout=aiohttp.ClientTimeout(total=15)  # Should respond in 15s
                ) as resp:
                    if resp.status == 200:
                        return True
                    else:
                        log(f"⚠️ MLX chat endpoint returned {resp.status}")
                        return False
                        
        except asyncio.TimeoutError:
            log("⚠️ MLX timeout - model is likely stuck")
            return False
        except Exception as e:
            log(f"⚠️ MLX error: {e}")
            return False
    
    def is_mlx_running(self) -> bool:
        """Check if MLX process exists"""
        try:
            result = subprocess.run(
                ["pgrep", "-f", "mlx_lm.server"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False
    
    def restart_mlx(self) -> bool:
        """Restart MLX server with memory check and exponential backoff"""
        now = time.time()
        
        # Exponential backoff: delay increases with consecutive failures (30s, 60s, 120s, max 5min)
        backoff_delay = min(30 * (2 ** self.consecutive_failures), 300)
        if now - self.last_restart < backoff_delay:
            log(f"⏳ Backoff active ({backoff_delay}s), skipping restart...")
            return False
        
        # Memory check: need at least 5GB free for 14B model
        mem = psutil.virtual_memory()
        free_gb = mem.available / (1024 ** 3)
        if free_gb < 5:
            log(f"⚠️ Low memory: {free_gb:.1f}GB free. Need 5GB+. Delaying restart...")
            return False
        
        log(f"🔄 Restarting MLX server (attempt #{self.consecutive_failures + 1})...")
        self.last_restart = now
        
        try:
            # Kill existing MLX gracefully first
            subprocess.run(
                ["pkill", "-15", "-f", "mlx_lm.server"],  # SIGTERM first
                capture_output=True,
                timeout=5
            )
            time.sleep(2)
            
            # Force kill if still running
            subprocess.run(
                ["pkill", "-9", "-f", "mlx_lm.server"],
                capture_output=True,
                timeout=5
            )
            time.sleep(3)
            
            # Start new MLX using venv Python
            venv_python = "/Users/daytrons/.openclaw/workspace/mission-control-repo/venv/bin/python3"
            if not os.path.exists(venv_python):
                log(f"❌ Venv Python not found: {venv_python}")
                return False
            
            subprocess.Popen(
                [
                    venv_python, "-m", "mlx_lm.server",
                    "--model", MLX_MODEL,
                    "--port", str(MLX_PORT)
                ],
                stdout=open("/Users/daytrons/.openclaw/workspace/logs/mlx_server.log", "a"),
                stderr=subprocess.STDOUT,
                start_new_session=True
            )
            
            log("✅ MLX restart initiated")
            
            # Wait for MLX to be ready
            log("⏳ Waiting for MLX to warm up (30s)...")
            time.sleep(30)
            
            # Verify it's working
            if self.is_mlx_running():
                log("✅ MLX process is running")
                return True
            else:
                log("❌ MLX failed to start")
                return False
                
        except Exception as e:
            log(f"❌ Failed to restart MLX: {e}")
            return False
    
    def notify_discord(self, message: str):
        """Send notification to Discord"""
        webhook = os.environ.get('DISCORD_WEBHOOK_URL', '')
        if not webhook:
            return
        
        try:
            import requests
            requests.post(
                webhook,
                json={"content": message},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
        except:
            pass
    
    async def run(self):
        """Main watchdog loop"""
        log("🐶 MLX Health Watchdog started")
        log(f"   Check interval: {CHECK_INTERVAL}s")
        log(f"   Failure threshold: {FAILURE_THRESHOLD}")
        log(f"   Restart cooldown: {RESTART_COOLDOWN}s")
        
        # Initial check
        if not self.is_mlx_running():
            log("⚠️ MLX not running on startup, starting it...")
            self.restart_mlx()
        
        while True:
            try:
                # Check MLX health
                is_healthy = await self.check_mlx_health()
                
                if is_healthy:
                    if not self.is_healthy:
                        # Recovered from unhealthy state
                        log("✅ MLX is healthy again")
                        self.notify_discord("✅ **MLX Recovered**\nModel is responding normally.")
                        self.is_healthy = True
                    
                    self.consecutive_failures = 0
                    log("✓ Health check passed")
                    
                else:
                    self.consecutive_failures += 1
                    log(f"⚠️ Health check failed ({self.consecutive_failures}/{FAILURE_THRESHOLD})")
                    
                    if self.consecutive_failures >= FAILURE_THRESHOLD:
                        log("🚨 Failure threshold reached, triggering restart...")
                        self.notify_discord(
                            f"🚨 **MLX Auto-Restart Triggered**\n"
                            f"Detected {self.consecutive_failures} consecutive failures.\n"
                            f"Automatically restarting MLX server..."
                        )
                        
                        if self.restart_mlx():
                            self.consecutive_failures = 0
                            self.notify_discord("✅ **MLX Restarted**\nModel is back online.")
                        else:
                            self.notify_discord("❌ **MLX Restart Failed**\nManual intervention required.")
                        
                        self.is_healthy = False
                
                await asyncio.sleep(CHECK_INTERVAL)
                
            except Exception as e:
                log(f"❌ Watchdog error: {e}")
                await asyncio.sleep(CHECK_INTERVAL)


def main():
    # Ensure log directory exists
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    watchdog = MLXWatchdog()
    
    try:
        asyncio.run(watchdog.run())
    except KeyboardInterrupt:
        log("👋 Watchdog stopped by user")
    except Exception as e:
        log(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
