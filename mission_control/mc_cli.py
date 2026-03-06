#!/usr/bin/env python3
"""
Mission Control CLI - User Interface
Direct communication channel with Mission Control
"""

import json
import os
import sys
from datetime import datetime

BASE_DIR = "/Users/daytrons/.openclaw/workspace/mission_control"
COMMAND_LOG = f"{BASE_DIR}/commands.jsonl"

def log_command(user, command, args):
    """Log user command for processing."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "user": user,
        "command": command,
        "args": args,
        "status": "pending"
    }
    with open(COMMAND_LOG, 'a') as f:
        f.write(json.dumps(entry) + '\n')
    return entry

def process_command(command_line):
    """Process a user command."""
    parts = command_line.strip().split()
    if not parts:
        return None
    
    cmd = parts[0].lower()
    args = parts[1:]
    
    # Log the command
    log_command("daytrons", cmd, args)
    
    # Route to appropriate handler
    handlers = {
        "task": handle_task,
        "status": handle_status,
        "agent": handle_agent,
        "project": handle_project,
        "help": handle_help,
        "queue": handle_queue,
        "scale": handle_scale,
        "route": handle_route
    }
    
    handler = handlers.get(cmd, handle_unknown)
    return handler(args)

def handle_task(args):
    """Handle task commands: task add <description> [priority]"""
    if not args:
        return "Usage: task add <description> [priority:low|medium|high|critical]"
    
    if args[0] == "add":
        desc = " ".join(args[1:])
        # Call orchestrator
        os.system(f"cd {BASE_DIR} && python3 orchestrator.py add '{desc}'")
        return f"✅ Task added: {desc[:50]}..."
    
    return "Usage: task add <description> [priority]"

def handle_status(args):
    """Show Mission Control status."""
    result = os.popen(f"cd {BASE_DIR} && python3 orchestrator.py status").read()
    try:
        status = json.loads(result)
        return f"""📊 **Mission Control Status**

📋 Queue: {status['pending']} pending | {status['active']} active
✅ Completed: {status['completed']}
❌ Failed: {status['failed']}
🕐 Updated: {status['timestamp'][:19]}"""
    except:
        return f"Status: {result}"

def handle_agent(args):
    """Handle agent commands."""
    if not args:
        # List agents
        agents_file = f"{BASE_DIR}/agents.json"
        try:
            with open(agents_file, 'r') as f:
                data = json.load(f)
            agents = data.get('agents', {})
            templates = data.get('agent_templates', {})
            
            msg = "🤖 **Active Agents**\n\n"
            for aid, agent in agents.items():
                msg += f"• {aid}: {agent.get('type', 'unknown')} ({agent.get('status', 'unknown')})\n"
            
            msg += "\n📋 **Available Templates**\n\n"
            for tid, tmpl in templates.items():
                msg += f"• {tid}: {tmpl.get('model', 'unknown')}\n"
            
            return msg
        except Exception as e:
            return f"Error loading agents: {e}"
    
    return "Usage: agent [list]"

def handle_project(args):
    """Show project status."""
    projects_file = f"{BASE_DIR}/projects.json"
    try:
        with open(projects_file, 'r') as f:
            data = json.load(f)
        
        msg = "📁 **Projects**\n\n"
        for proj in data.get('projects', []):
            bar = "█" * (proj['progress'] // 10) + "░" * (10 - proj['progress'] // 10)
            msg += f"• {proj['name']}: {bar} {proj['progress']}%\n"
            msg += f"  Tasks: {proj['tasks_completed']}/{proj['tasks_total']} | Priority: {proj['priority']}\n\n"
        
        return msg
    except Exception as e:
        return f"Error loading projects: {e}"

def handle_queue(args):
    """Show task queue."""
    queue_file = f"{BASE_DIR}/task_queue.json"
    try:
        with open(queue_file, 'r') as f:
            data = json.load(f)
        
        pending = [t for t in data.get('queue', []) if t['status'] == 'pending']
        
        msg = f"📋 **Task Queue** ({len(pending)} pending)\n\n"
        for task in pending[:5]:  # Show top 5
            msg += f"• [{task['priority'].upper()}] {task['id']}: {task['description'][:40]}...\n"
        
        if len(pending) > 5:
            msg += f"\n... and {len(pending) - 5} more"
        
        return msg
    except Exception as e:
        return f"Error loading queue: {e}"

def handle_scale(args):
    """Check scaling recommendations."""
    result = os.popen(f"cd {BASE_DIR} && python3 autoscaler.py check").read()
    if result.strip():
        return f"📈 **Scaling Recommendations**\n\n{result}"
    return "📈 **Scaling Status**\n\nNo scaling needed at this time."

def handle_route(args):
    """Test task routing."""
    if not args:
        return "Usage: route <task description>"
    
    desc = " ".join(args)
    result = os.popen(f"cd {BASE_DIR} && python3 ollama_router.py '{desc}'").read()
    try:
        route = json.loads(result)
        if route.get('route'):
            return f"🔄 **Routing Decision**\n\nTask: {desc[:50]}...\nRoute: {route['route']}\nModel: {route['model']}\nReason: {route['reason']}"
        else:
            return f"🔄 **Routing Result**\n\n{result[:500]}"
    except:
        return f"Routing: {result[:500]}"

def handle_help(args):
    """Show help."""
    return """🎛️ **Mission Control Commands**

**Task Management:**
• `task add <description> [priority]` - Add new task
• `queue` - View task queue
• `status` - System status

**Agent Management:**
• `agent` - List agents
• `scale` - Check scaling recommendations

**Project Management:**
• `project` - View project status

**Testing:**
• `route <description>` - Test task routing

**Help:**
• `help` - Show this message

_All commands are logged for processing._"""

def handle_unknown(args):
    """Handle unknown commands."""
    return f"❓ Unknown command. Type `help` for available commands."

def interactive_mode():
    """Run interactive CLI."""
    print("🎛️ Mission Control Interface")
    print("Type 'help' for commands, 'exit' to quit\n")
    
    while True:
        try:
            cmd = input("MC> ").strip()
            if cmd.lower() in ['exit', 'quit']:
                break
            if cmd:
                result = process_command(cmd)
                if result:
                    print(result)
                    print()
        except KeyboardInterrupt:
            break
        except EOFError:
            break
    
    print("\n👋 Mission Control signing off.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Single command mode
        cmd = " ".join(sys.argv[1:])
        result = process_command(cmd)
        if result:
            print(result)
    else:
        # Interactive mode
        interactive_mode()
