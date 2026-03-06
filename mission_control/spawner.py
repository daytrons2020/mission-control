#!/usr/bin/env python3
"""
Smart Sub-Agent Spawner
Spawns agents with optimal model assignment
"""

import json
import os
from datetime import datetime

BASE_DIR = "/Users/daytrons/.openclaw/workspace/mission_control"
AGENTS_FILE = f"{BASE_DIR}/agents.json"
SPAWN_LOG = f"{BASE_DIR}/spawn_log.jsonl"

# Model assignment rules
MODEL_ASSIGNMENT = {
    # Task type -> primary model, fallback model
    "research": ("kimi", "ollama"),
    "analysis": ("kimi", "minimax"),
    "code": ("minimax", "kimi"),
    "debug": ("minimax", "kimi"),
    "writing": ("kimi", "ollama"),
    "summarize": ("ollama", "kimi"),
    "format": ("ollama", "kimi"),
    "check": ("ollama", "kimi"),
    "verify": ("kimi", "minimax"),
    "default": ("ollama", "kimi")
}

# Complexity detection
COMPLEXITY_INDICATORS = {
    "high": ["design", "architect", "complex", "integrate", "optimize", "refactor"],
    "medium": ["analyze", "research", "implement", "build", "create"],
    "low": ["format", "convert", "check", "list", "count", "summarize"]
}

def detect_complexity(description):
    """Detect task complexity from description."""
    desc_lower = description.lower()
    
    for level, keywords in COMPLEXITY_INDICATORS.items():
        if any(kw in desc_lower for kw in keywords):
            return level
    
    return "medium"  # Default

def assign_model(task_type, description, complexity=None):
    """Assign optimal model for task."""
    
    if complexity is None:
        complexity = detect_complexity(description)
    
    # Get base assignment
    primary, fallback = MODEL_ASSIGNMENT.get(task_type, MODEL_ASSIGNMENT["default"])
    
    # Adjust based on complexity
    if complexity == "low" and primary != "ollama":
        # Low complexity -> use Ollama to save tokens
        return "ollama", primary
    elif complexity == "high" and primary == "ollama":
        # High complexity -> upgrade to cloud model
        return fallback, "kimi"
    
    return primary, fallback

def should_spawn_agent(task_queue_depth, active_agents):
    """Determine if new agent should be spawned."""
    
    # Don't spawn if too many agents already
    if active_agents >= 5:
        return False, "Max agents reached"
    
    # Spawn if queue is backing up
    if task_queue_depth > 3 and active_agents < 3:
        return True, "Queue depth high"
    
    # Spawn for critical tasks
    # (would check task priority here)
    
    return False, "No spawn needed"

def spawn_agent(task_type, description, task_id, priority="medium"):
    """Spawn agent with optimal configuration."""
    
    # Detect complexity
    complexity = detect_complexity(description)
    
    # Assign models
    primary_model, fallback_model = assign_model(task_type, description, complexity)
    
    # Create agent config
    agent_config = {
        "id": f"agent_{task_id}_{int(datetime.now().timestamp())}",
        "task_id": task_id,
        "type": task_type,
        "complexity": complexity,
        "priority": priority,
        "models": {
            "primary": primary_model,
            "fallback": fallback_model
        },
        "spawned_at": datetime.now().isoformat(),
        "status": "initializing"
    }
    
    # Log spawn
    with open(SPAWN_LOG, 'a') as f:
        f.write(json.dumps(agent_config) + '\n')
    
    print(f"[SPAWNER] Agent spawned: {agent_config['id']}")
    print(f"[SPAWNER] Task: {task_type} | Complexity: {complexity}")
    print(f"[SPAWNER] Models: {primary_model} (primary) -> {fallback_model} (fallback)")
    
    return agent_config

def get_spawn_stats():
    """Get spawning statistics."""
    if not os.path.exists(SPAWN_LOG):
        return {"total": 0, "by_model": {}, "by_complexity": {}}
    
    stats = {"total": 0, "by_model": {}, "by_complexity": {}}
    
    with open(SPAWN_LOG, 'r') as f:
        for line in f:
            if line.strip():
                entry = json.loads(line)
                stats["total"] += 1
                
                primary = entry.get("models", {}).get("primary", "unknown")
                stats["by_model"][primary] = stats["by_model"].get(primary, 0) + 1
                
                complexity = entry.get("complexity", "unknown")
                stats["by_complexity"][complexity] = stats["by_complexity"].get(complexity, 0) + 1
    
    return stats

def recommend_model_for_task(description, task_type="general"):
    """Recommend model without spawning."""
    complexity = detect_complexity(description)
    primary, fallback = assign_model(task_type, description, complexity)
    
    return {
        "description": description[:100],
        "task_type": task_type,
        "complexity": complexity,
        "recommended": primary,
        "fallback": fallback,
        "reason": f"{complexity} complexity {task_type} task"
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "stats":
            stats = get_spawn_stats()
            print(json.dumps(stats, indent=2))
        elif sys.argv[1] == "recommend":
            desc = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else "Example task"
            rec = recommend_model_for_task(desc)
            print(json.dumps(rec, indent=2))
        elif sys.argv[1] == "spawn":
            task_type = sys.argv[2] if len(sys.argv) > 2 else "general"
            desc = " ".join(sys.argv[3:]) if len(sys.argv) > 3 else "New task"
            agent = spawn_agent(task_type, desc, "test_001")
            print(json.dumps(agent, indent=2))
    else:
        print("Smart Spawner ready.")
        print("Usage: spawner.py [stats|recommend <desc>|spawn <type> <desc>]")
