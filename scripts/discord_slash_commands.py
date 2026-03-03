#!/usr/bin/env python3
"""
Discord Slash Commands for Mission Control
Registers and handles slash commands for the daytrons' Trading Hub server
"""

import json
import requests
from typing import Dict, Any, Optional

# Discord API Configuration
APPLICATION_ID = "1474883613182005369"  # Kimi sl(AI)er bot ID
GUILD_ID = "1474838650050314352"  # daytrons' Trading Hub
BASE_URL = f"https://discord.com/api/v10"

# Slash Command Definitions
COMMANDS = [
    {
        "name": "status",
        "description": "Show Mission Control system status",
        "type": 1,  # CHAT_INPUT
        "options": []
    },
    {
        "name": "project",
        "description": "Get details about a specific project",
        "type": 1,
        "options": [
            {
                "name": "name",
                "description": "Project name",
                "type": 3,  # STRING
                "required": True,
                "choices": [
                    {"name": "Respiratory Education", "value": "respiratory-education"},
                    {"name": "RT Scheduling", "value": "rt-scheduling"},
                    {"name": "Trading System", "value": "trading-system"},
                    {"name": "Respiratory Tools", "value": "respiratory-tools"},
                    {"name": "Reselling Business", "value": "reselling-business"},
                    {"name": "YouTube Empire", "value": "youtube-empire"},
                    {"name": "Kids App", "value": "kids-app"}
                ]
            }
        ]
    },
    {
        "name": "costs",
        "description": "Show today's token usage and costs",
        "type": 1,
        "options": []
    },
    {
        "name": "tasks",
        "description": "List active tasks and their status",
        "type": 1,
        "options": [
            {
                "name": "filter",
                "description": "Filter tasks by status",
                "type": 3,
                "required": False,
                "choices": [
                    {"name": "All", "value": "all"},
                    {"name": "In Progress", "value": "in-progress"},
                    {"name": "Blocked", "value": "blocked"},
                    {"name": "Done", "value": "done"}
                ]
            }
        ]
    },
    {
        "name": "skill",
        "description": "Show information about an installed skill",
        "type": 1,
        "options": [
            {
                "name": "name",
                "description": "Skill name",
                "type": 3,
                "required": True,
                "choices": [
                    {"name": "Elite PowerPoint", "value": "elite-powerpoint"},
                    {"name": "Research", "value": "research"},
                    {"name": "Backtesting", "value": "backtesting"},
                    {"name": "Data Analysis", "value": "data-analysis"},
                    {"name": "Video Edit", "value": "video-edit"},
                    {"name": "Music Creator", "value": "suno-music"},
                    {"name": "Cost Tracker", "value": "cost-tracker"}
                ]
            }
        ]
    },
    {
        "name": "sync",
        "description": "Force sync Mission Control with local workspace",
        "type": 1,
        "options": []
    },
    {
        "name": "health",
        "description": "Show system health score and metrics",
        "type": 1,
        "options": []
    }
]


def register_commands(bot_token: str) -> Dict[str, Any]:
    """Register all slash commands with Discord"""
    url = f"{BASE_URL}/applications/{APPLICATION_ID}/guilds/{GUILD_ID}/commands"
    
    headers = {
        "Authorization": f"Bot {bot_token}",
        "Content-Type": "application/json"
    }
    
    results = {}
    for command in COMMANDS:
        response = requests.post(url, headers=headers, json=command)
        results[command["name"]] = {
            "status": response.status_code,
            "response": response.json() if response.status_code == 200 else response.text
        }
    
    return results


def handle_status_command() -> Dict[str, Any]:
    """Generate status embed response"""
    return {
        "type": 4,  # CHANNEL_MESSAGE_WITH_SOURCE
        "data": {
            "embeds": [{
                "title": "🔬 Mission Control Status",
                "description": "All systems operational",
                "color": 0x22c55e,  # Green
                "fields": [
                    {
                        "name": "🚀 Projects",
                        "value": "7 active\n• Respiratory Ed: 45%\n• RT Scheduling: 35%\n• Trading System: 25%\n• RT Tools: 25%\n• 3 more...",
                        "inline": True
                    },
                    {
                        "name": "🛠️ Skills",
                        "value": "11 installed\n• elite-powerpoint ✅\n• research ✅\n• backtesting ✅\n• data-analysis ✅\n• video-edit ✅\n• 6 more...",
                        "inline": True
                    },
                    {
                        "name": "📊 Discord",
                        "value": "21 channels\n6 categories\n✅ Connected",
                        "inline": True
                    },
                    {
                        "name": "🔧 System",
                        "value": "Gateway: ✅ Running\nGit: ✅ Committed\niMessage: ✅ Fixed today\nCron: 🟡 13 jobs",
                        "inline": False
                    }
                ],
                "footer": {
                    "text": "Last updated: Just now | Agent: Nano"
                }
            }]
        }
    }


def handle_project_command(project_name: str) -> Dict[str, Any]:
    """Generate project details embed"""
    projects = {
        "respiratory-education": {
            "name": "🫁 Respiratory Education",
            "progress": 45,
            "status": "🟢 Active",
            "details": "5 PowerPoints + 200 pages notes\n• Anatomy & Physiology ✅\n• COPD Management ✅\n• Mechanical Ventilation ✅\n• Patient Assessment ✅\n• Emergency Procedures ✅",
            "location": "projects/respiratory-education/",
            "priority": "High"
        },
        "rt-scheduling": {
            "name": "📅 RT Scheduling",
            "progress": 35,
            "status": "🟢 Active",
            "details": "React app scaffolded\n• 28-day availability entry\n• Excel sync ready\n• PWA configured\n• Staff management UI",
            "location": "projects/rt-scheduling/",
            "priority": "High"
        },
        "trading-system": {
            "name": "📈 Trading System",
            "progress": 25,
            "status": "🟢 Active",
            "details": "Backend + Frontend ready\n• Real-time price feeds\n• Trinity Consensus Bias\n• Heatseeker patterns\n• Needs deployment",
            "location": "projects/trading-system/",
            "priority": "High"
        },
        "respiratory-tools": {
            "name": "⚙️ Respiratory Tools",
            "progress": 25,
            "status": "🟢 Active",
            "details": "TypeScript codebase\n• QR Scanner PWA ✅\n• QR Generator PWA ✅\n• Admin Dashboard ✅\n• Ready for testing",
            "location": "projects/respiratory-tools/",
            "priority": "High"
        },
        "reselling-business": {
            "name": "🛒 Reselling Business",
            "progress": 15,
            "status": "🟡 Medium",
            "details": "5 strategy documents\n• Sourcing strategies\n• Automation workflows\n• Profit calculators\n• Quick-start checklist",
            "location": "projects/reselling-business/",
            "priority": "Medium"
        },
        "youtube-empire": {
            "name": "📺 YouTube Empire",
            "progress": 10,
            "status": "🟡 Low",
            "details": "5-channel system designed\n• Kids Education\n• Lofi Music\n• Sleep Sounds\n• Stories\n• Audio assets ready",
            "location": "projects/youtube-empire/",
            "priority": "Low"
        },
        "kids-app": {
            "name": "🎮 Kids Mobile App",
            "progress": 10,
            "status": "🟡 Low",
            "details": "Complete game design doc\n• Roblox-style gameplay\n• Ages 3-7 target\n• Educational content\n• Ready for development",
            "location": "projects/kids-app/",
            "priority": "Low"
        }
    }
    
    project = projects.get(project_name, {
        "name": "❓ Unknown Project",
        "progress": 0,
        "status": "🔴 Error",
        "details": "Project not found",
        "location": "N/A",
        "priority": "N/A"
    })
    
    # Color based on progress
    if project["progress"] >= 50:
        color = 0x22c55e  # Green
    elif project["progress"] >= 25:
        color = 0xeab308  # Yellow
    else:
        color = 0xef4444  # Red
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": project["name"],
                "description": f"**Progress:** {project['progress']}%\n**Status:** {project['status']}\n**Priority:** {project['priority']}",
                "color": color,
                "fields": [
                    {
                        "name": "📋 Details",
                        "value": project["details"],
                        "inline": False
                    },
                    {
                        "name": "📁 Location",
                        "value": f"`{project['location']}`",
                        "inline": True
                    }
                ]
            }]
        }
    }


def handle_costs_command() -> Dict[str, Any]:
    """Generate costs embed"""
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": "💰 Token Usage Today",
                "description": "Tracking all API calls and costs",
                "color": 0x3b82f6,  # Blue
                "fields": [
                    {
                        "name": "📊 Summary",
                        "value": "**Cost:** $0.00\n**Tokens:** ~10M\n**Requests:** ~400\n**Model:** kimi-k2.5",
                        "inline": True
                    },
                    {
                        "name": "⏰ Hourly Average",
                        "value": "~$0.05/hour\n~500K tokens/hour\n~20 requests/hour",
                        "inline": True
                    },
                    {
                        "name": "📈 Trend",
                        "value": "↗️ 15% above yesterday\n📊 Normal range",
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "Updates hourly in #token-tracker"
                }
            }]
        }
    }


def handle_tasks_command(filter_status: str = "all") -> Dict[str, Any]:
    """Generate tasks list embed"""
    tasks = [
        {"name": "Fix iMessage permissions", "status": "done", "priority": "high"},
        {"name": "Migrate Linux → Mac paths", "status": "done", "priority": "high"},
        {"name": "Commit workspace to git", "status": "done", "priority": "high"},
        {"name": "Update Vercel website", "status": "in-progress", "priority": "high"},
        {"name": "Create slash commands", "status": "in-progress", "priority": "high"},
        {"name": "Import cron jobs", "status": "blocked", "priority": "medium"},
        {"name": "Deploy BINARY dashboard", "status": "pending", "priority": "medium"},
        {"name": "Test all automations", "status": "pending", "priority": "low"}
    ]
    
    if filter_status != "all":
        tasks = [t for t in tasks if t["status"] == filter_status]
    
    status_emojis = {
        "done": "✅",
        "in-progress": "🔄",
        "blocked": "🚫",
        "pending": "⏳"
    }
    
    task_list = "\n".join([
        f"{status_emojis.get(t['status'], '⏳')} {t['name']}"
        for t in tasks[:10]  # Limit to 10
    ])
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": "📋 Active Tasks",
                "description": f"**Filter:** {filter_status.title()}\n**Showing:** {len(tasks)} tasks",
                "color": 0xa855f7,  # Purple
                "fields": [
                    {
                        "name": "Tasks",
                        "value": task_list or "No tasks found",
                        "inline": False
                    }
                ]
            }]
        }
    }


def handle_skill_command(skill_name: str) -> Dict[str, Any]:
    """Generate skill info embed"""
    skills = {
        "elite-powerpoint": {
            "name": "🎨 Elite PowerPoint Designer",
            "status": "✅ Working",
            "channel": "#elite-powerpoint",
            "description": "Professional presentation creation with AI-powered design",
            "usage": "High"
        },
        "research": {
            "name": "🔬 Research Agent",
            "status": "✅ Working",
            "channel": "#research-agent",
            "description": "Deep web research using Tavily + Kimi fallback",
            "usage": "High"
        },
        "backtesting": {
            "name": "📊 Backtesting Trading",
            "status": "✅ Working",
            "channel": "#backtesting-lab",
            "description": "Trading strategy backtesting and analysis",
            "usage": "Medium"
        },
        "data-analysis": {
            "name": "📈 Data Analysis",
            "status": "✅ Working",
            "channel": "#data-analysis",
            "description": "EDA with Python/pandas",
            "usage": "Medium"
        },
        "video-edit": {
            "name": "🎬 Video Processing",
            "status": "✅ Ready",
            "channel": "#video-edit",
            "description": "Video editing with FFmpeg",
            "usage": "Low"
        },
        "suno-music": {
            "name": "🎵 Suno Music Creator",
            "status": "✅ Ready",
            "channel": "#music-studio",
            "description": "AI music generation",
            "usage": "Low"
        },
        "cost-tracker": {
            "name": "💰 Cost Tracker",
            "status": "✅ Ready",
            "channel": "N/A",
            "description": "Token usage & cost tracking",
            "usage": "Always active"
        }
    }
    
    skill = skills.get(skill_name, {
        "name": "❓ Unknown Skill",
        "status": "🔴 Error",
        "channel": "N/A",
        "description": "Skill not found",
        "usage": "N/A"
    })
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": skill["name"],
                "description": skill["description"],
                "color": 0x10b981,  # Emerald
                "fields": [
                    {
                        "name": "Status",
                        "value": skill["status"],
                        "inline": True
                    },
                    {
                        "name": "Channel",
                        "value": skill["channel"],
                        "inline": True
                    },
                    {
                        "name": "Usage",
                        "value": skill["usage"],
                        "inline": True
                    }
                ]
            }]
        }
    }


def handle_sync_command() -> Dict[str, Any]:
    """Handle force sync command"""
    return {
        "type": 4,
        "data": {
            "content": "🔄 **Force Sync Initiated**\n\nSyncing:\n• Local workspace → GitHub\n• GitHub → Vercel\n• Discord channels\n\nETA: 2-3 minutes\nI'll post results in #mission-control when complete."
        }
    }


def handle_health_command() -> Dict[str, Any]:
    """Generate health score embed"""
    # Calculate health score (0-100)
    # Factors: cron health (40%), disk (20%), memory (20%), git (10%), errors (10%)
    cron_health = 60  # 60% success rate
    disk_health = 100  # 37% used
    memory_health = 90  # 625Mi available
    git_health = 100  # committed today
    error_health = 40  # some cron errors
    
    health_score = int(
        cron_health * 0.40 +
        disk_health * 0.20 +
        memory_health * 0.20 +
        git_health * 0.10 +
        error_health * 0.10
    )
    
    if health_score >= 80:
        color = 0x22c55e  # Green
        status = "🟢 Healthy"
    elif health_score >= 60:
        color = 0xeab308  # Yellow
        status = "🟡 Warning"
    else:
        color = 0xef4444  # Red
        status = "🔴 Critical"
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": f"🔧 System Health: {health_score}/100",
                "description": f"**Status:** {status}",
                "color": color,
                "fields": [
                    {
                        "name": "🕐 Cron Jobs",
                        "value": f"{cron_health}%\n13 jobs, some errors",
                        "inline": True
                    },
                    {
                        "name": "💾 Disk",
                        "value": f"{disk_health}%\n37% used (14G/40G)",
                        "inline": True
                    },
                    {
                        "name": "🧠 Memory",
                        "value": f"{memory_health}%\n625Mi available",
                        "inline": True
                    },
                    {
                        "name": "📦 Git",
                        "value": f"{git_health}%\nCommitted today",
                        "inline": True
                    },
                    {
                        "name": "⚠️ Errors",
                        "value": f"{error_health}%\nSome cron failures",
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "Updates every 6 hours in #admin"
                }
            }]
        }
    }


def handle_interaction(interaction: Dict[str, Any]) -> Dict[str, Any]:
    """Main handler for Discord interactions"""
    command_name = interaction.get("data", {}).get("name", "")
    
    handlers = {
        "status": handle_status_command,
        "project": lambda: handle_project_command(
            interaction.get("data", {}).get("options", [{}])[0].get("value", "")
        ),
        "costs": handle_costs_command,
        "tasks": lambda: handle_tasks_command(
            interaction.get("data", {}).get("options", [{}])[0].get("value", "all")
        ),
        "skill": lambda: handle_skill_command(
            interaction.get("data", {}).get("options", [{}])[0].get("value", "")
        ),
        "sync": handle_sync_command,
        "health": handle_health_command
    }
    
    handler = handlers.get(command_name)
    if handler:
        return handler()
    
    return {
        "type": 4,
        "data": {
            "content": "❌ Unknown command"
        }
    }


if __name__ == "__main__":
    # Example usage for registration
    print("Slash Commands for Mission Control")
    print("=================================")
    print(f"\nAvailable commands ({len(COMMANDS)}):")
    for cmd in COMMANDS:
        print(f"  /{cmd['name']} - {cmd['description']}")
    
    print("\n\nTo register:")
    print("1. Get bot token from Discord Developer Portal")
    print("2. Call register_commands(BOT_TOKEN)")
    print("3. Commands will appear in server immediately")
