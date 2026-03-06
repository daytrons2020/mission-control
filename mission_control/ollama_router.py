#!/usr/bin/env python3
"""
Ollama Router for Mission Control
Routes simple tasks to local Ollama, complex to cloud models
"""

import json
import subprocess
from datetime import datetime

def ollama_generate(prompt, system=None, model="llama3.2:latest", timeout=60):
    """Generate via Ollama."""
    cmd = ["ollama", "run", model]
    full_prompt = f"{system}\n\n{prompt}" if system else prompt
    
    try:
        result = subprocess.run(
            cmd,
            input=full_prompt,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "success": True,
            "output": result.stdout.strip(),
            "tokens": 0,  # Ollama doesn't report tokens
            "cost": 0.0,
            "model": model,
            "local": True
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "model": model,
            "local": True
        }

def route_task(task_description, complexity="auto"):
    """Route task to appropriate model."""
    
    # Auto-detect complexity
    if complexity == "auto":
        desc_lower = task_description.lower()
        
        # Simple tasks -> Ollama
        simple_keywords = ['format', 'convert', 'summarize', 'check', 'list', 'count']
        if any(kw in desc_lower for kw in simple_keywords):
            complexity = "low"
        
        # Complex tasks -> Cloud
        complex_keywords = ['research', 'analyze', 'code', 'debug', 'design', 'architect']
        if any(kw in desc_lower for kw in complex_keywords):
            complexity = "high"
    
    # Route based on complexity
    if complexity == "low":
        return {
            "route": "ollama",
            "model": "llama3.2:latest",
            "reason": "Low complexity - local execution",
            "estimated_cost": 0.0
        }
    else:
        return {
            "route": "cloud",
            "model": "kimi",  # or minimax based on task type
            "reason": "High complexity - cloud execution",
            "estimated_cost": "variable"
        }

def execute(task_description, task_type="general"):
    """Execute task via appropriate route."""
    route = route_task(task_description)
    
    print(f"[ROUTER] Task routed to {route['route']} ({route['reason']})")
    
    if route['route'] == 'ollama':
        system = f"You are a {task_type} assistant. Be concise and helpful."
        return ollama_generate(task_description, system)
    else:
        # Return routing info for cloud execution
        return {
            "success": False,
            "route": "cloud",
            "model": route['model'],
            "message": "Task requires cloud execution - delegate to sub-agent"
        }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        task = sys.argv[1]
        result = execute(task)
        print(json.dumps(result, indent=2))
    else:
        # Test routing
        test_tasks = [
            "Format this JSON",
            "Research quantum computing",
            "Check if server is running",
            "Design a database schema"
        ]
        for task in test_tasks:
            route = route_task(task)
            print(f"'{task[:30]}...' -> {route['route']} ({route['model']})")
