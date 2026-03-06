#!/usr/bin/env python3
"""
Memory Migration Script - Live Rollout
Backs up existing MEMORY.md, creates centralized structure, and logs migration.
"""
import os
import shutil
from datetime import datetime

MEMORY_FILE = "MEMORY.md"
MEMORY_DIR = "memory"

def get_timestamp():
    return datetime.now().strftime("%Y%m%d-%H%M%S")

def backup_file(filepath):
    if os.path.exists(filepath):
        ts = get_timestamp()
        backup_path = f"{filepath}.bak.{ts}"
        shutil.copy2(filepath, backup_path)
        print(f"Backup: {filepath} -> {backup_path}")
        return backup_path
    return None

def write_file(filepath, content):
    os.makedirs(os.path.dirname(filepath) or ".", exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

def migrate():
    print("Starting memory migration (live)")
    os.makedirs(MEMORY_DIR, exist_ok=True)
    
    # Backup existing
    backup_file(MEMORY_FILE)
    
    # Create migration log
    ts = get_timestamp()
    log_path = os.path.join(MEMORY_DIR, f"migration-{ts}.md")
    log_content = f"""# Migration Log - {ts}
- Migrated to centralized MEMORY.md layout
- Backup created: {MEMORY_FILE}.bak.{ts}
- Daily notes structure initialized
"""
    write_file(log_path, log_content)
    
    # New centralized MEMORY.md
    memory_content = """Memory Version: v1.0 centralized
Last Updated: 2026-03-05

Goals
- Maintain centralized memory for all agents
- Minimize token usage via targeted reads
- Enable clean hand-offs between agents

Key Decisions
- Single MEMORY.md as source of truth
- Daily files memory/YYYY-MM-DD.md for ephemeral context
- Read at start, write concise updates at end

Recent Context
- 2026-03-05 | Migrated to centralized memory structure

Hand-offs
- Time: 2026-03-05 20:00 PT
  Source: Previous Agent
  Task: Memory system migration
  Context: Centralized structure now active
  Next: Populate project details and begin using templates
  Responsible: Current Agent

Projects & Status
- Trading System | Owner: Daytrons | Status: Active
- Mission Control | Owner: Daytrons | Status: Active

Risks & Dependencies
- Ensure all agents adopt new read/write pattern
- Monitor for stale context in daily notes

Lessons Learned
- Centralized memory reduces cross-talk
- Concise summaries > verbose logs

---
## Hand-off Template
- Time: YYYY-MM-DD HH:MM PT
- Source Agent: [Name]
- Task: [Brief description]
- Context Summary: [Concise]
- Key Context: [Bullets]
- Next Steps: [Actions]
- Responsible: [Agent]
- Link: [Optional]
"""
    write_file(MEMORY_FILE, memory_content)
    
    # Create today's daily notes file
    today = datetime.now().strftime("%Y-%m-%d")
    daily_path = os.path.join(MEMORY_DIR, f"{today}.md")
    daily_content = f"""# Session Notes - {today}

## Participants
- 

## Quick Log
- Migration to centralized memory completed

## Scoped Summary
Centralized MEMORY.md structure deployed with hand-off templates

## Context Handoff
- New memory system active
- All agents should read MEMORY.md at task start
- Write concise updates to MEMORY.md or daily files at task end
"""
    write_file(daily_path, daily_content)
    
    print(f"Migration complete:")
    print(f"  - {MEMORY_FILE} (centralized)")
    print(f"  - {log_path} (log)")
    print(f"  - {daily_path} (daily notes)")

if __name__ == "__main__":
    migrate()
"""
STARTER PROMPTS (add to sessions_spawn):
- Read: MEMORY.md and memory/YYYY-MM-DD.md for prior context
- Write: Concise update to MEMORY.md or daily file at task end
- Hand-off: Use standard template for agent transfers
"""
