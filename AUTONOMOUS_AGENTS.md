# Autonomous Agent System

This system makes your AI agents work autonomously toward your 5 goals using MLX (free, local execution).

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS AGENT FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. READS GOALS      →  2. GENERATES TASKS  →  3. ASSIGNS   │
│     (from build          (using MLX AI)         (to best    │
│      plan)                                       agent)     │
│                                                             │
│  4. EXECUTES         →  5. REPORTS           →  6. UPDATES  │
│     (via MLX,           (saves deliverable)    (dashboard)  │
│      FREE)                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Your 5 Goals (From Build Plan)

| # | Goal | Hours | Status |
|---|------|-------|--------|
| 1 | **Respiratory Education Empire** | 40h | 🆕 Not Started |
| 2 | **Autonomous Trading System** | 52h | 🟡 Partial |
| 3 | **24/7 Reselling Business** | 52h | 🆕 Not Started |
| 4 | **Polymarket Crypto Bot** | 56h | 🆕 Not Started |
| 5 | **Life-Improving Programs** | 52h | 🆕 Not Started |

**Total: ~340 hours of autonomous work**

---

## Quick Start

### Option 1: Run Once (See Today's Plan)

```bash
cd ~/.openclaw/workspace/mission-control-repo
./start-autonomous-agents.sh
# Select option 1: Run one cycle
```

### Option 2: Full Autonomous Mode (Recommended)

```bash
cd ~/.openclaw/workspace/mission-control-repo
./start-autonomous-agents.sh
# Select option 2: Start continuous mode
```

The system will:
- Run daily at 9:00 AM
- Generate tasks automatically
- Execute via MLX (FREE)
- Save deliverables
- Update dashboard in real-time

### Option 3: Just View Dashboard (No Execution)

```bash
./start-autonomous-agents.sh
# Select option 3: Dashboard only
```

---

## Cost: $0 (Uses MLX)

The system uses your local MLX server (port 18888) which is **FREE**:

- ✅ No API costs
- ✅ No subscription fees
- ✅ Unlimited executions
- ✅ Runs on your Mac

Requirements:
- MLX server running on port 18888
- OpenClaw gateway running on port 18789 (optional)

---

## What Gets Created

### Deliverables
Agents save their work to:
```
deliverables/
├── goal-1-respiratory-education/
│   ├── task-xxx-research-rt-curriculum.md
│   └── task-xxx-design-content-templates.md
├── goal-2-trading/
│   ├── task-xxx-pattern-recognition-ai.md
│   └── task-xxx-backtesting-system.md
└── ...
```

### Logs
```
logs/
├── orchestrator.log       # What the system is doing
└── dashboard-realtime.log # Real-time updates
```

### State
```
orchestrator-state.json    # Progress tracking
dashboard-data.json        # Real-time dashboard data
```

---

## Commands

### View Today's Work Plan
```bash
node agent-orchestrator.js plan
```

### View Parsed Goals
```bash
node agent-orchestrator.js goals
```

### Run One Cycle
```bash
node agent-orchestrator.js run
```

### Start Continuous Mode
```bash
node agent-orchestrator.js continuous
```

### Check Status
```bash
node agent-orchestrator.js status
```

---

## How Tasks Are Generated

1. **Read Goals** - System parses `MISSION_CONTROL_BUILD_PLAN.md`
2. **Find Incomplete Tasks** - Identifies what needs work
3. **Generate Subtasks** - Uses MLX AI to break tasks into 1-2 hour chunks
4. **Assign Agents** - Matches tasks to agent capabilities
5. **Execute** - Runs tasks via MLX
6. **Save Results** - Stores deliverables and updates progress

---

## Agent Types

| Agent | Capabilities | Priority |
|-------|--------------|----------|
| **Nano** | Planning, coordination, architecture | 1 |
| **Frontend Dev** | React, TypeScript, CSS, UI | 2 |
| **Backend Dev** | Node.js, Python, APIs | 2 |
| **Database Eng** | PostgreSQL, LanceDB, optimization | 2 |
| **AI Engineer** | ML models, training, analysis | 2 |
| **Integration Spec** | Discord API, webhooks, trading APIs | 2 |
| **Content Writer** | Documentation, research, writing | 3 |
| **Researcher** | Web research, market analysis | 3 |
| **Trading Analyst** | Technical analysis, patterns | 3 |

---

## Real-Time Dashboard

When running, the dashboard shows:

- ✅ **Live agent status** (online/busy)
- ✅ **Current activity** (what each agent is doing)
- ✅ **Progress on all 5 goals**
- ✅ **Recent activity feed**
- ✅ **System health** (MLX, OpenClaw, Discord)
- ✅ **Running tasks** with progress bars

**Dashboard:** https://mission-control-o52l.vercel.app/dashboard.html

---

## Stopping the System

Press `Ctrl+C` to stop.

The system will:
- Save current state
- Complete running tasks
- Shutdown gracefully

---

## Troubleshooting

### "MLX not detected"
Make sure MLX server is running:
```bash
curl http://127.0.0.1:18888/v1/models
```

If not running, the system will use **simulation mode** (shows fake activity but doesn't execute real tasks).

### "OpenClaw not detected"
Optional. The system works without OpenClaw for task generation, just can't spawn external agents.

### No activity showing
Check if dashboard-realtime.js is running:
```bash
ps aux | grep dashboard-realtime
```

### Reset state
```bash
rm orchestrator-state.json dashboard-data.json
```

---

## Mission Statement Integration

The autonomous agents read the mission statement daily:

> "We don't just complete tasks—we create value. We don't just process data—we generate insights."

This guides their work priorities and decision-making.

---

## Next Steps

1. **Start the system:** `./start-autonomous-agents.sh`
2. **Watch the dashboard:** https://mission-control-o52l.vercel.app/dashboard.html
3. **Review deliverables:** Check `deliverables/` folder
4. **Adjust goals:** Edit `MISSION_CONTROL_BUILD_PLAN.md`

The agents will now work autonomously toward your goals 24/7 (within the scheduled hours).

---

**Questions?** The system logs everything to `logs/orchestrator.log`
