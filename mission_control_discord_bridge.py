#!/usr/bin/env python3
"""
Mission Control Discord Bridge
Real-time updates and two-way communication for autonomous agents
"""

import asyncio
import json
import os
import sys
import subprocess
from datetime import datetime
from typing import Optional, Dict, Any
import aiohttp

# Configuration
DISCORD_TOKEN = os.environ.get('DISCORD_BOT_TOKEN', '')
MISSION_CONTROL_CHANNEL = 'mission-control'  # Channel name or ID
WEBHOOK_URL = os.environ.get('DISCORD_WEBHOOK_URL', '')

# Status tracking
class MissionControlDiscordBridge:
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.last_status = {}
        self.active_jobs = {}
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    async def send_to_discord(self, message: str, embed: Optional[Dict] = None):
        """Send message to Discord via webhook"""
        if not WEBHOOK_URL:
            print("❌ No webhook URL configured")
            return False
            
        payload = {"content": message}
        if embed:
            payload["embeds"] = [embed]
            
        try:
            async with self.session.post(
                WEBHOOK_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            ) as resp:
                return resp.status in [200, 204]
        except Exception as e:
            print(f"Discord error: {e}")
            return False
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get current agent orchestrator status"""
        try:
            # Check if agent-orchestrator is running
            result = subprocess.run(
                ["pgrep", "-f", "agent-orchestrator"],
                capture_output=True,
                text=True
            )
            is_running = result.returncode == 0
            
            # Get recent log
            log_result = subprocess.run(
                ["tail", "-20", "/Users/daytrons/.openclaw/workspace/mission-control-repo/logs/dashboard-realtime.log"],
                capture_output=True,
                text=True
            )
            recent_logs = log_result.stdout.strip().split('\n')[-5:] if log_result.stdout else []
            
            return {
                "running": is_running,
                "pid": result.stdout.strip() if is_running else None,
                "recent_activity": recent_logs,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {"error": str(e), "running": False}
    
    def get_job_queue(self) -> list:
        """Get current job queue from agent-orchestrator state"""
        state_file = "/Users/daytrons/.openclaw/workspace/mission-control-repo/state.json"
        try:
            if os.path.exists(state_file):
                with open(state_file, 'r') as f:
                    state = json.load(f)
                    return state.get('runningTasks', [])
        except:
            pass
        return []
    
    async def send_status_update(self):
        """Send periodic status update to Discord"""
        status = self.get_agent_status()
        jobs = self.get_job_queue()
        
        # Build status message
        if status.get('running'):
            status_emoji = "🟢"
            status_text = "Online"
        else:
            status_emoji = "🔴"
            status_text = "Offline"
        
        message = f"""{status_emoji} **Mission Control Status Update**

**System:** {status_text}
**Active Jobs:** {len(jobs)}
**Last Updated:** {datetime.now().strftime('%I:%M %p')}
"""
        
        if jobs:
            message += "\n**Current Jobs:**\n"
            for job in jobs[:5]:  # Show top 5
                job_name = job.get('name', 'Unknown')
                progress = job.get('progress', 0)
                message += f"• {job_name} - {progress}%\n"
        
        await self.send_to_discord(message)
    
    async def send_job_start(self, job_name: str, agent: str, eta: str = "Unknown"):
        """Notify when a job starts"""
        embed = {
            "title": "🚀 Job Started",
            "color": 3447003,  # Blue
            "fields": [
                {"name": "Job", "value": job_name, "inline": True},
                {"name": "Agent", "value": agent, "inline": True},
                {"name": "ETA", "value": eta, "inline": True}
            ],
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_discord("", embed)
    
    async def send_job_complete(self, job_name: str, agent: str, result: str = "Success"):
        """Notify when a job completes"""
        embed = {
            "title": "✅ Job Completed",
            "color": 3066993,  # Green
            "fields": [
                {"name": "Job", "value": job_name, "inline": True},
                {"name": "Agent", "value": agent, "inline": True},
                {"name": "Result", "value": result[:1000], "inline": False}
            ],
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_discord("", embed)
    
    async def send_job_failed(self, job_name: str, agent: str, error: str):
        """Notify when a job fails"""
        embed = {
            "title": "❌ Job Failed",
            "color": 15158332,  # Red
            "fields": [
                {"name": "Job", "value": job_name, "inline": True},
                {"name": "Agent", "value": agent, "inline": True},
                {"name": "Error", "value": error[:1000], "inline": False}
            ],
            "timestamp": datetime.now().isoformat()
        }
        await self.send_to_discord("", embed)
    
    async def process_command(self, command: str) -> str:
        """Process a command from Discord"""
        command = command.lower().strip()
        
        if command in ['status', 'health']:
            status = self.get_agent_status()
            if status.get('running'):
                return f"🟢 Mission Control is ONLINE (PID: {status.get('pid')})"
            else:
                return "🔴 Mission Control is OFFLINE"
        
        elif command == 'jobs':
            jobs = self.get_job_queue()
            if not jobs:
                return "📋 No active jobs"
            response = "📋 **Active Jobs:**\n"
            for job in jobs:
                response += f"• {job.get('name', 'Unknown')}\n"
            return response
        
        elif command == 'agents':
            return """🤖 **Available Agents:**
• Coordinator - Task coordination
• AI Engineer - ML/AI development
• Backend Developer - Server/API code
• Frontend Developer - UI/UX code
• Database Engineer - Database design
• Integration Specialist - API integrations"""
        
        elif command.startswith('spawn '):
            # Extract agent type
            parts = command.split(' ', 1)
            if len(parts) > 1:
                agent_type = parts[1]
                # This would trigger the actual spawn
                return f"🚀 Spawning {agent_type} agent... (not yet implemented)"
            return "❌ Usage: spawn <agent-type>"
        
        elif command == 'help':
            return """📖 **Mission Control Commands:**
`status` - Check system status
`jobs` - List active jobs
`agents` - List available agents
`spawn <agent>` - Spawn an agent (e.g., spawn ai-engineer)
`help` - Show this help"""
        
        else:
            return f"❓ Unknown command: `{command}`. Type `help` for available commands."


# Simple HTTP server to receive webhooks from agent-orchestrator
from aiohttp import web

routes = web.RouteTableDef()
bridge_instance: Optional[MissionControlDiscordBridge] = None

@routes.post('/notify/job-start')
async def notify_job_start(request):
    """Receive job start notification"""
    try:
        data = await request.json()
        await bridge_instance.send_job_start(
            data.get('job_name', 'Unknown'),
            data.get('agent', 'Unknown'),
            data.get('eta', 'Unknown')
        )
        return web.json_response({"status": "ok"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@routes.post('/notify/job-complete')
async def notify_job_complete(request):
    """Receive job completion notification"""
    try:
        data = await request.json()
        await bridge_instance.send_job_complete(
            data.get('job_name', 'Unknown'),
            data.get('agent', 'Unknown'),
            data.get('result', 'Success')
        )
        return web.json_response({"status": "ok"})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@routes.post('/command')
async def handle_command(request):
    """Handle command from Discord"""
    try:
        data = await request.json()
        command = data.get('command', '')
        response = await bridge_instance.process_command(command)
        return web.json_response({"response": response})
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


async def main():
    global bridge_instance
    
    print("🎮 Mission Control Discord Bridge")
    print("=================================")
    
    if not WEBHOOK_URL:
        print("\n⚠️  WARNING: DISCORD_WEBHOOK_URL not set!")
        print("Set it with: export DISCORD_WEBHOOK_URL='your-webhook-url'")
    
    bridge_instance = MissionControlDiscordBridge()
    await bridge_instance.__aenter__()
    
    # Send startup notification
    await bridge_instance.send_to_discord(
        "🎮 **Mission Control Discord Bridge Started**\n"
        "Real-time job updates enabled.\n"
        "Use `help` command in Discord for available commands."
    )
    
    # Start HTTP server
    app = web.Application()
    app.add_routes(routes)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '127.0.0.1', 11437)
    await site.start()
    
    print("\n✅ Bridge running on http://127.0.0.1:11437")
    print("\nEndpoints:")
    print("  POST /notify/job-start    - Job started")
    print("  POST /notify/job-complete - Job completed")
    print("  POST /command             - Process Discord command")
    print("\nPress Ctrl+C to stop")
    
    # Keep running
    while True:
        await asyncio.sleep(60)
        # Send periodic status update
        await bridge_instance.send_status_update()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n👋 Bridge stopped")
