#!/usr/bin/env python3
"""
Auto-Scaler for Mission Control
Monitors queue depth and spawns agents as needed
"""

import json
import os
from datetime import datetime

BASE_DIR = "/Users/daytrons/.openclaw/workspace/mission_control"
QUEUE_FILE = f"{BASE_DIR}/task_queue.json"
AGENTS_FILE = f"{BASE_DIR}/agents.json"

# Scaling thresholds
SCALE_UP_THRESHOLD = 5    # Spawn new agent if >5 pending tasks
SCALE_DOWN_THRESHOLD = 2  # Consider killing agent if <2 pending
MAX_AGENTS = 5            # Maximum concurrent agents
MIN_AGENTS = 1            # Minimum agents to keep

def load_json(path):
    try:
        with open(path, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

def check_scale():
    """Check if we need to scale up or down."""
    queue = load_json(QUEUE_FILE)
    agents = load_json(AGENTS_FILE)
    
    pending = len([t for t in queue.get('queue', []) if t['status'] == 'pending'])
    active_agents = len([a for a in agents.get('agents', {}).values() if a.get('status') == 'active'])
    
    decisions = []
    
    # Scale up
    if pending > SCALE_UP_THRESHOLD and active_agents < MAX_AGENTS:
        needed = min(pending // 3, MAX_AGENTS - active_agents)
        for i in range(needed):
            decisions.append({"action": "spawn", "type": "worker", "reason": f"Queue depth: {pending}"})
    
    # Scale down
    elif pending < SCALE_DOWN_THRESHOLD and active_agents > MIN_AGENTS:
        excess = active_agents - MIN_AGENTS
        for i in range(excess):
            decisions.append({"action": "kill", "reason": f"Low queue: {pending}"})
    
    return decisions

def execute_scaling(decisions):
    """Execute scaling decisions."""
    for decision in decisions:
        if decision['action'] == 'spawn':
            print(f"[AUTOSCALER] Spawning {decision['type']} agent: {decision['reason']}")
            # In production: call orchestrator.spawn_agent()
        elif decision['action'] == 'kill':
            print(f"[AUTOSCALER] Killing agent: {decision['reason']}")
            # In production: terminate idle agent

def get_recommendations():
    """Get scaling recommendations without executing."""
    return check_scale()

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        decisions = check_scale()
        if decisions:
            print(json.dumps(decisions, indent=2))
        else:
            print("[AUTOSCALER] No scaling needed")
    else:
        decisions = check_scale()
        execute_scaling(decisions)
