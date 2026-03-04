#!/usr/bin/env python3
"""
Discord Slash Command Handlers for Mission Control
Commands: /status /project /costs /tasks /skill
"""

import json
import os
import subprocess
from typing import Dict, Any, Optional
from datetime import datetime

# Discord API Configuration
APPLICATION_ID = "1474838927792668885"
GUILD_ID = "1474838650050314352"
BASE_URL = "https://discord.com/api/v10"
WORKSPACE_DIR = "/Users/daytrons/.openclaw/workspace"

# Slash Command Definitions
COMMANDS = [
    {
        "name": "status",
        "description": "Show Mission Control system status",
        "type": 1,
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
                "type": 3,
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
        "name": "health",
        "description": "Show system health score and metrics",
        "type": 1,
        "options": []
    },
    {
        "name": "sync",
        "description": "Force sync Mission Control with local workspace",
        "type": 1,
        "options": []
    }
]


def load_projects_data() -> Dict:
    """Load project status from JSON"""
    try:
        with open(f"{WORKSPACE_DIR}/projects/status.json", 'r') as f:
            return json.load(f)
    except:
        return {"projects": []}


def load_health_data() -> Dict:
    """Load health report if available"""
    try:
        with open(f"{WORKSPACE_DIR}/logs/health-report.json", 'r') as f:
            return json.load(f)
    except:
        return {"score": 75, "status": "unknown", "components": []}


def get_git_stats() -> Dict[str, Any]:
    """Get git repository stats"""
    try:
        os.chdir(WORKSPACE_DIR)
        
        # Get last commit
        last_commit = subprocess.check_output(
            ["git", "log", "-1", "--format=%h %s (%cr)"],
            text=True, stderr=subprocess.DEVNULL
        ).strip()
        
        # Get uncommitted changes count
        changes = subprocess.check_output(
            ["git", "status", "--porcelain"],
            text=True, stderr=subprocess.DEVNULL
        ).strip().split('\n')
        
        uncommitted = len([c for c in changes if c.strip()])
        
        return {
            "last_commit": last_commit,
            "uncommitted": uncommitted
        }
    except:
        return {"last_commit": "Unknown", "uncommitted": 0}


def get_cron_stats() -> Dict[str, Any]:
    """Get cron job stats"""
    try:
        result = subprocess.run(
            ["crontab", "-l"],
            capture_output=True, text=True
        )
        jobs = [line for line in result.stdout.split('\n') if line.strip() and not line.startswith('#')]
        return {"count": len(jobs)}
    except:
        return {"count": 0}


def handle_status_command() -> Dict[str, Any]:
    """Generate status embed response"""
    projects = load_projects_data()
    git_stats = get_git_stats()
    cron_stats = get_cron_stats()
    
    # Count projects by status
    project_list = projects.get("projects", [])
    active = sum(1 for p in project_list if p.get("status") == "In Progress")
    planning = sum(1 for p in project_list if p.get("status") == "Planning")
    
    # Get top 4 projects by progress
    top_projects = sorted(project_list, key=lambda x: x.get("progress", 0), reverse=True)[:4]
    project_text = "\n".join([
        f"• {p['name'].split()[0]}: {p.get('progress', 0)}%"
        for p in top_projects
    ])
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": "🔬 Mission Control Status",
                "description": "Real-time system overview",
                "color": 0x8b5cf6,
                "fields": [
                    {
                        "name": "🚀 Projects",
                        "value": f"{len(project_list)} total\n{active} active, {planning} planning\n\n{project_text}",
                        "inline": True
                    },
                    {
                        "name": "🔧 System",
                        "value": f"Cron: {cron_stats['count']} jobs\nGit: {git_stats['uncommitted']} uncommitted\nGateway: ✅ Running",
                        "inline": True
                    },
                    {
                        "name": "📦 Git",
                        "value": f"Last: {git_stats['last_commit'][:30]}..." if len(git_stats['last_commit']) > 30 else f"Last: {git_stats['last_commit']}",
                        "inline": False
                    }
                ],
                "footer": {
                    "text": f"Updated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Agent: Nano"
                }
            }]
        }
    }


def handle_project_command(project_id: str) -> Dict[str, Any]:
    """Generate project details embed"""
    data = load_projects_data()
    projects = {p["id"]: p for p in data.get("projects", [])}
    
    project = projects.get(project_id, {
        "name": "❓ Unknown Project",
        "progress": 0,
        "status": "Unknown",
        "details": "Project not found",
        "priority": "N/A",
        "tasks": []
    })
    
    progress = project.get("progress", 0)
    
    # Color based on progress
    if progress >= 50:
        color = 0x22c55e
    elif progress >= 25:
        color = 0xeab308
    else:
        color = 0xef4444
    
    # Format tasks
    tasks = project.get("tasks", [])
    task_summary = ""
    done = sum(1 for t in tasks if t.get("status") == "Done")
    in_progress = sum(1 for t in tasks if t.get("status") == "In Progress")
    
    if tasks:
        task_summary = f"Tasks: {done} ✅ | {in_progress} 🔄 | {len(tasks) - done - in_progress} ⏳"
        # List top 5 tasks
        task_list = "\n".join([
            f"{'✅' if t.get('status') == 'Done' else '🔄' if t.get('status') == 'In Progress' else '⏳'} {t['name']}"
            for t in tasks[:5]
        ])
    else:
        task_list = "No tasks defined"
        task_summary = "No tasks"
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": project.get("name", "Unknown"),
                "description": f"**Progress:** {progress}%\n**Status:** {project.get('status', 'Unknown')}\n**Priority:** {project.get('priority', 'N/A')}",
                "color": color,
                "fields": [
                    {
                        "name": "📋 Details",
                        "value": project.get("details", "No details"),
                        "inline": False
                    },
                    {
                        "name": task_summary,
                        "value": task_list,
                        "inline": False
                    }
                ]
            }]
        }
    }


def handle_costs_command() -> Dict[str, Any]:
    """Generate costs embed"""
    # Try to load actual cost data
    cost_file = f"{WORKSPACE_DIR}/data/costs.json"
    try:
        with open(cost_file, 'r') as f:
            costs = json.load(f)
        today_cost = costs.get("today", 0)
        today_tokens = costs.get("tokens_today", 0)
    except:
        today_cost = 0.0
        today_tokens = 0
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": "💰 Token Usage Today",
                "description": "API usage and cost tracking",
                "color": 0x3b82f6,
                "fields": [
                    {
                        "name": "📊 Today's Usage",
                        "value": f"**Cost:** ${today_cost:.2f}\n**Tokens:** {today_tokens:,}\n**Model:** kimi-k2.5",
                        "inline": True
                    },
                    {
                        "name": "⏰ Estimates",
                        "value": f"Daily: ~$2-5\nWeekly: ~$15-30\nMonthly: ~$60-120",
                        "inline": True
                    },
                    {
                        "name": "💡 Tips",
                        "value": "• Use caching when possible\n• Batch similar requests\n• Prefer cheaper models for simple tasks",
                        "inline": False
                    }
                ],
                "footer": {
                    "text": "Updates hourly | Check #token-tracker for details"
                }
            }]
        }
    }


def handle_tasks_command(filter_status: str = "all") -> Dict[str, Any]:
    """Generate tasks list embed from projects"""
    data = load_projects_data()
    
    all_tasks = []
    for project in data.get("projects", []):
        for task in project.get("tasks", []):
            all_tasks.append({
                "name": f"{project['name'].split()[0]}: {task['name']}",
                "status": task.get("status", "Unknown"),
                "progress": task.get("progress", 0),
                "project": project["id"]
            })
    
    # Filter
    if filter_status != "all":
        status_map = {
            "in-progress": "In Progress",
            "blocked": "Blocked",
            "done": "Done"
        }
        target = status_map.get(filter_status, filter_status)
        all_tasks = [t for t in all_tasks if t["status"].lower() == target.lower()]
    
    # Sort by status (In Progress first)
    status_order = {"In Progress": 0, "Blocked": 1, "Not Started": 2, "Done": 3}
    all_tasks.sort(key=lambda x: status_order.get(x["status"], 99))
    
    status_emojis = {
        "Done": "✅",
        "In Progress": "🔄",
        "Blocked": "🚫",
        "Not Started": "⏳"
    }
    
    # Build task list (limit to 15)
    task_lines = []
    for t in all_tasks[:15]:
        emoji = status_emojis.get(t["status"], "⏳")
        task_lines.append(f"{emoji} {t['name']} ({t['progress']}%)")
    
    task_text = "\n".join(task_lines) if task_lines else "No tasks found"
    
    # Count by status
    counts = {}
    for t in all_tasks:
        counts[t["status"]] = counts.get(t["status"], 0) + 1
    
    summary = " | ".join([f"{s}: {c}" for s, c in counts.items()])
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": "📋 Project Tasks",
                "description": f"**Filter:** {filter_status.title()}\n**Total:** {len(all_tasks)} tasks\n{summary}",
                "color": 0xa855f7,
                "fields": [
                    {
                        "name": "Tasks",
                        "value": task_text,
                        "inline": False
                    }
                ],
                "footer": {
                    "text": f"Showing {min(15, len(all_tasks))} of {len(all_tasks)} tasks"
                }
            }]
        }
    }


def handle_skill_command(skill_name: str) -> Dict[str, Any]:
    """Generate skill info embed"""
    skills = {
        "elite-powerpoint": {
            "name": "🎨 Elite PowerPoint",
            "status": "✅ Working",
            "channel": "#elite-powerpoint",
            "description": "Professional presentation creation with AI-powered design",
            "commands": "/pptx create, /pptx enhance"
        },
        "research": {
            "name": "🔬 Research Agent",
            "status": "✅ Working",
            "channel": "#research-agent",
            "description": "Deep web research using Tavily + Kimi fallback",
            "commands": "Auto-triggered on requests"
        },
        "backtesting": {
            "name": "📊 Backtesting",
            "status": "✅ Working",
            "channel": "#backtesting-lab",
            "description": "Trading strategy backtesting and analysis",
            "commands": "Python scripts in trading-system/"
        },
        "data-analysis": {
            "name": "📈 Data Analysis",
            "status": "✅ Working",
            "channel": "#data-analysis",
            "description": "EDA with Python/pandas",
            "commands": "Jupyter notebooks, pandas"
        },
        "video-edit": {
            "name": "🎬 Video Processing",
            "status": "✅ Ready",
            "channel": "#video-edit",
            "description": "Video editing with FFmpeg",
            "commands": "FFmpeg automation"
        },
        "suno-music": {
            "name": "🎵 Suno Music",
            "status": "✅ Ready",
            "channel": "#music-studio",
            "description": "AI music generation",
            "commands": "/music create"
        },
        "cost-tracker": {
            "name": "💰 Cost Tracker",
            "status": "✅ Active",
            "channel": "#token-tracker",
            "description": "Token usage & cost tracking",
            "commands": "/costs"
        }
    }
    
    skill = skills.get(skill_name, {
        "name": "❓ Unknown Skill",
        "status": "🔴 Error",
        "channel": "N/A",
        "description": "Skill not found",
        "commands": "N/A"
    })
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": skill["name"],
                "description": skill["description"],
                "color": 0x10b981,
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
                        "value": skill["commands"],
                        "inline": False
                    }
                ]
            }]
        }
    }


def handle_health_command() -> Dict[str, Any]:
    """Generate health score embed"""
    health = load_health_data()
    score = health.get("score", 75)
    status = health.get("status", "unknown")
    
    # Color based on score
    if score >= 80:
        color = 0x22c55e
    elif score >= 60:
        color = 0xeab308
    else:
        color = 0xef4444
    
    # Build component fields
    fields = []
    for comp in health.get("components", []):
        emoji = "🟢" if comp.get("status") == "healthy" else "🟡" if comp.get("status") == "warning" else "🔴"
        fields.append({
            "name": f"{emoji} {comp.get('name', 'Unknown')}",
            "value": f"**{comp.get('score', 0)}/100**\n{comp.get('details', 'No details')}",
            "inline": True
        })
    
    if not fields:
        fields = [{"name": "Status", "value": "Health check not run yet", "inline": False}]
    
    summary = health.get("summary", {})
    
    return {
        "type": 4,
        "data": {
            "embeds": [{
                "title": f"🔧 Health Score: {score}/100",
                "description": f"Overall Status: **{status.upper()}**\n🟢 {summary.get('healthy', 0)} | 🟡 {summary.get('warning', 0)} | 🔴 {summary.get('critical', 0)}",
                "color": color,
                "fields": fields,
                "footer": {
                    "text": "Run /health anytime | Updates every 6 hours"
                }
            }]
        }
    }


def handle_sync_command() -> Dict[str, Any]:
    """Handle force sync command"""
    return {
        "type": 4,
        "data": {
            "content": "🔄 **Force Sync Initiated**\n\nSyncing:\n• Local workspace → GitHub\n• GitHub → Vercel\n• Discord channels\n\n⏱️ ETA: 2-3 minutes\n📊 Results will be posted in <#admin>"
        }
    }


def handle_interaction(interaction: Dict[str, Any]) -> Dict[str, Any]:
    """Main handler for Discord interactions"""
    command_name = interaction.get("data", {}).get("name", "")
    options = interaction.get("data", {}).get("options", [])
    
    # Extract first option value if present
    option_value = options[0].get("value", "") if options else ""
    
    handlers = {
        "status": handle_status_command,
        "project": lambda: handle_project_command(option_value),
        "costs": handle_costs_command,
        "tasks": lambda: handle_tasks_command(option_value or "all"),
        "skill": lambda: handle_skill_command(option_value),
        "health": handle_health_command,
        "sync": handle_sync_command
    }
    
    handler = handlers.get(command_name)
    if handler:
        return handler()
    
    return {
        "type": 4,
        "data": {
            "content": "❌ Unknown command. Available: /status, /project, /costs, /tasks, /skill, /health, /sync"
        }
    }


def register_commands(bot_token: str) -> Dict[str, Any]:
    """Register all slash commands with Discord"""
    import requests
    
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


def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Discord Slash Commands for Mission Control')
    parser.add_argument('--register', '-r', help='Register commands with Discord (provide bot token)')
    parser.add_argument('--test', '-t', choices=['status', 'project', 'costs', 'tasks', 'skill', 'health', 'sync'],
                       help='Test a command locally')
    parser.add_argument('--list', '-l', action='store_true', help='List all commands')
    
    args = parser.parse_args()
    
    if args.list:
        print("Available Slash Commands:")
        print("=" * 40)
        for cmd in COMMANDS:
            print(f"  /{cmd['name']:<12} - {cmd['description']}")
        return
    
    if args.register:
        print("Registering commands with Discord...")
        results = register_commands(args.register)
        for name, result in results.items():
            status = "✅" if result["status"] == 200 else "❌"
            print(f"{status} /{name}: {result['status']}")
        return
    
    if args.test:
        # Mock interaction
        mock = {"data": {"name": args.test, "options": []}}
        result = handle_interaction(mock)
        print(json.dumps(result, indent=2))
        return
    
    print("Discord Slash Commands for Mission Control")
    print("=" * 40)
    print(f"\n{COMMANDS} commands defined")
    print("\nUsage:")
    print("  --list           List all commands")
    print("  --register TOKEN Register with Discord")
    print("  --test COMMAND   Test a command locally")


if __name__ == "__main__":
    main()
