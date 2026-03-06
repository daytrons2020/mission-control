# Mission Control Architecture v2.0

## Core Purpose
Central autonomous command center for:
- Project lifecycle management (create → delegate → track → complete)
- Sub-agent orchestration (spawn, monitor, coordinate)
- Task queue management (priority, assign, escalate)
- Cross-project resource allocation

## Components

### 1. Project Registry (JSON)
Location: `/Users/daytrons/.openclaw/workspace/mission_control/projects.json`
Tracks: ID, name, status, owner, tasks, sub-agents, deadlines

### 2. Task Queue (JSON)
Location: `/Users/daytrons/.openclaw/workspace/mission_control/task_queue.json`
Tracks: pending, active, completed tasks with priorities

### 3. Sub-Agent Pool
Location: `/Users/daytrons/.openclaw/workspace/mission_control/agents.json`
Tracks: available agents, capabilities, current assignments, load

### 4. Work Orchestrator (Python)
Location: `/Users/daytrons/.openclaw/workspace/mission_control/orchestrator.py`
Functions: spawn agents, assign tasks, monitor progress, handle failures

### 5. Mission Control Dashboard (Discord)
Channel: #mission-control
Auto-posts: project status, agent activity, alerts, completions

## Autonomous Workflow

1. **Intake**: New task/project arrives (Discord, cron, or manual)
2. **Analysis**: Ollama analyzes complexity, estimates tokens/time
3. **Routing**: 
   - Simple → Ollama (local)
   - Complex → Spawn sub-agent (Kimi/Minimax)
   - Critical → Spawn multiple agents + verification agent
4. **Execution**: Sub-agents work in parallel
5. **Verification**: Results checked by verification agent
6. **Delivery**: Posted to Discord, logged to MEMORY.md
7. **Cleanup**: Sub-agents terminated, resources freed

## Sub-Agent Types

| Agent | Model | Purpose |
|-------|-------|---------|
| Worker | Ollama | Simple tasks, data processing |
| Analyst | Kimi | Research, analysis, writing |
| Coder | Minimax | Code generation, debugging |
| Verifier | Kimi | Check work, find errors |
| Coordinator | Nano (main) | Orchestrate other agents |

## Auto-Scaling Rules

- If queue > 5 tasks → spawn additional workers
- If task fails → retry with different agent
- If token budget > 80% → switch to Ollama only
- If deadline < 2 hours → escalate to main agent

## Discord Integration

Mission Control posts to #mission-control:
- Every 2 hours: Active projects, agent status
- On event: Task started/completed/failed
- Daily: Full dashboard summary
- Alert: Budget threshold, deadline approaching

Want me to implement this architecture?
