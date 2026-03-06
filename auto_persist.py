#!/usr/bin/env python3
"""
Auto-Persist Middleware
Automatically handles MEMORY.md read/write for all agent sessions.
"""
import os
import json
from datetime import datetime

MEMORY_FILE = "MEMORY.md"
MEMORY_DIR = "memory"
STATE_FILE = ".openclaw/auto_persist_state.json"

def ensure_dirs():
    os.makedirs(MEMORY_DIR, exist_ok=True)
    os.makedirs(".openclaw", exist_ok=True)

def auto_read():
    """Auto-read MEMORY.md at session start"""
    ensure_dirs()
    context = {"memory": "", "daily": "", "timestamp": datetime.now().isoformat()}
    
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            context["memory"] = f.read()[:2000]  # First 2000 chars
    
    today = datetime.now().strftime("%Y-%m-%d")
    daily_file = os.path.join(MEMORY_DIR, f"{today}.md")
    if os.path.exists(daily_file):
        with open(daily_file, 'r') as f:
            context["daily"] = f.read()[:1000]
    
    # Save state
    with open(STATE_FILE, 'w') as f:
        json.dump(context, f)
    
    return context

def auto_write(summary, agent_id="agent"):
    """Auto-write to daily notes at session end"""
    ensure_dirs()
    today = datetime.now().strftime("%Y-%m-%d")
    daily_file = os.path.join(MEMORY_DIR, f"{today}.md")
    
    entry = f"\n- {datetime.now().strftime('%H:%M')} | {agent_id} | {summary}\n"
    
    with open(daily_file, 'a') as f:
        f.write(entry)
    
    # Update Recent Context in MEMORY.md
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            content = f.read()
        
        # Simple append to Recent Context section
        if "Recent Context" in content:
            lines = content.split('\n')
            new_lines = []
            for i, line in enumerate(lines):
                new_lines.append(line)
                if line.strip() == "Recent Context" and i + 1 < len(lines):
                    new_lines.append(f"- {datetime.now().strftime('%Y-%m-%d')} | {agent_id} | {summary}")
            
            with open(MEMORY_FILE, 'w') as f:
                f.write('\n'.join(new_lines))

def session_start():
    """Call at agent session start"""
    return auto_read()

def session_end(summary, agent_id="agent"):
    """Call at agent session end"""
    auto_write(summary, agent_id)

if __name__ == "__main__":
    # Demo
    ctx = session_start()
    print(f"Auto-read: {len(ctx['memory'])} chars from MEMORY.md")
    session_end("Test auto-persist", "demo-agent")
    print("Auto-write: Summary saved to daily notes")
