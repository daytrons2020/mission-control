#!/usr/bin/env python3
"""
Mission Control Orchestrator
Manages sub-agents, task queue, and autonomous execution
"""

import json
import os
import subprocess
import time
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = "/Users/daytrons/.openclaw/workspace/mission_control"
AGENTS_FILE = f"{BASE_DIR}/agents.json"
QUEUE_FILE = f"{BASE_DIR}/task_queue.json"
PROJECTS_FILE = f"{BASE_DIR}/projects.json"

def load_json(path):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def get_next_task_id():
    queue = load_json(QUEUE_FILE)
    task_id = queue.get('next_id', 1)
    queue['next_id'] = task_id + 1
    save_json(QUEUE_FILE, queue)
    return f"task_{task_id:04d}"

def add_task(description, task_type="general", priority="medium", project=None, data=None):
    """Add a task to the queue."""
    task = {
        "id": get_next_task_id(),
        "description": description,
        "type": task_type,
        "priority": priority,
        "project": project,
        "data": data or {},
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "assigned_to": None,
        "started_at": None,
        "completed_at": None
    }
    
    queue = load_json(QUEUE_FILE)
    queue.setdefault('queue', []).append(task)
    save_json(QUEUE_FILE, queue)
    
    print(f"[ORCHESTRATOR] Task added: {task['id']} - {description[:50]}")
    return task['id']

def spawn_agent(agent_type, task_id):
    """Spawn a sub-agent for a task."""
    agents = load_json(AGENTS_FILE)
    template = agents.get('agent_templates', {}).get(agent_type)
    
    if not template:
        print(f"[ORCHESTRATOR] Unknown agent type: {agent_type}")
        return None
    
    agent_id = f"{agent_type}_{int(time.time())}"
    
    # Determine model based on type
    if template['model'].startswith('ollama'):
        # Use Ollama for local execution
        print(f"[ORCHESTRATOR] Spawning Ollama agent: {agent_id}")
        # Ollama tasks run inline, no separate spawn needed
        return {"id": agent_id, "type": agent_type, "model": "ollama", "local": True}
    else:
        # Spawn actual sub-agent session
        print(f"[ORCHESTRATOR] Spawning sub-agent: {agent_id} with {template['model']}")
        # This would call sessions_spawn in production
        return {"id": agent_id, "type": agent_type, "model": template['model'], "local": False}

def route_task(task):
    """Route task to appropriate agent type."""
    task_type = task.get('type', 'general')
    description = task.get('description', '').lower()
    
    # Routing logic
    if any(word in description for word in ['code', 'script', 'function', 'api']):
        return 'coder'
    elif any(word in description for word in ['research', 'analyze', 'summary', 'report']):
        return 'analyst'
    elif any(word in description for word in ['check', 'verify', 'validate', 'test']):
        return 'verifier'
    else:
        return 'worker'

def process_queue():
    """Process pending tasks in queue."""
    queue_data = load_json(QUEUE_FILE)
    pending = [t for t in queue_data.get('queue', []) if t['status'] == 'pending']
    
    # Sort by priority
    priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    pending.sort(key=lambda x: priority_order.get(x['priority'], 2))
    
    for task in pending[:3]:  # Process max 3 at a time
        agent_type = route_task(task)
        agent = spawn_agent(agent_type, task['id'])
        
        if agent:
            task['status'] = 'active'
            task['assigned_to'] = agent['id']
            task['started_at'] = datetime.now().isoformat()
            
            if agent.get('local'):
                # Execute via Ollama locally
                execute_local_task(task, agent)
            else:
                # Delegate to sub-agent
                print(f"[ORCHESTRATOR] Delegating {task['id']} to {agent['id']}")
    
    save_json(QUEUE_FILE, queue_data)

def execute_local_task(task, agent):
    """Execute task locally via Ollama."""
    print(f"[ORCHESTRATOR] Executing local: {task['id']}")
    
    # Simple execution via Ollama
    try:
        result = subprocess.run(
            ['python3', '/Users/daytrons/.openclaw/workspace/scripts/ollama_handlers.py'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        task['status'] = 'completed'
        task['completed_at'] = datetime.now().isoformat()
        task['result'] = result.stdout[:500]
        
        # Move to completed
        queue_data = load_json(QUEUE_FILE)
        queue_data['queue'] = [t for t in queue_data['queue'] if t['id'] != task['id']]
        queue_data.setdefault('completed', []).append(task)
        save_json(QUEUE_FILE, queue_data)
        
        print(f"[ORCHESTRATOR] Completed: {task['id']}")
        
    except Exception as e:
        task['status'] = 'failed'
        task['error'] = str(e)
        print(f"[ORCHESTRATOR] Failed: {task['id']} - {e}")

def get_status():
    """Get orchestrator status."""
    queue = load_json(QUEUE_FILE)
    agents = load_json(AGENTS_FILE)
    
    pending = len([t for t in queue.get('queue', []) if t['status'] == 'pending'])
    active = len([t for t in queue.get('queue', []) if t['status'] == 'active'])
    completed = len(queue.get('completed', []))
    failed = len(queue.get('failed', []))
    
    return {
        "pending": pending,
        "active": active,
        "completed": completed,
        "failed": failed,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "add":
            desc = sys.argv[2] if len(sys.argv) > 2 else "New task"
            task_type = sys.argv[3] if len(sys.argv) > 3 else "general"
            priority = sys.argv[4] if len(sys.argv) > 4 else "medium"
            add_task(desc, task_type, priority)
        elif sys.argv[1] == "process":
            process_queue()
        elif sys.argv[1] == "status":
            print(json.dumps(get_status(), indent=2))
    else:
        print("Usage: orchestrator.py [add|process|status]")
