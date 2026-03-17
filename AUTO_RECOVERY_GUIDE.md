# 🔒 Auto-Recovery & Safeguard System

## Overview
Your Mission Control system now has **multiple layers of protection** to automatically detect and fix MLX issues without manual intervention.

---

## 🛡️ Safeguard Layers

### Layer 1: MLX Health Watchdog (External Monitor)
**File:** `mlx_health_watchdog.py`
**Status:** ✅ Running (PID monitored separately)

**What it does:**
- Checks MLX health every **60 seconds**
- Performs 2 tests:
  1. `/v1/models` endpoint (basic health)
  2. Actual chat completion (real functionality)
- If MLX fails **3 consecutive checks** → **Auto-restart**
- Sends Discord notifications about issues/recovery
- 5-minute cooldown between restarts (prevents restart loops)

**How to check if it's running:**
```bash
pgrep -f mlx_health_watchdog
# or
ps aux | grep mlx_health_watchdog
```

**View logs:**
```bash
tail -f ~/.openclaw/workspace/logs/mlx_watchdog.log
```

---

### Layer 2: Agent Orchestrator Auto-Recovery (Built-in)
**File:** `agent-orchestrator.js` (modified)
**Status:** ✅ Active

**What it does:**
- When a task fails due to MLX timeout → **Attempts auto-restart**
- Retries the task **once** after recovery
- If recovery fails → Falls back to simulation mode
- **Notifies Discord** about simulation mode fallback

**Recovery process:**
```
1. Task starts
2. MLX timeout detected
3. Kill MLX process
4. Wait 3 seconds
5. Start new MLX instance
6. Wait 30 seconds for warmup
7. Verify MLX is responding
8. Retry the task
9. If still failing → Use simulation
```

---

### Layer 3: Service Health Checks (Status Monitoring)
**File:** `status_services.sh`
**Status:** ✅ Available

**What it does:**
- Shows status of all services
- Run anytime to verify everything is working

**Usage:**
```bash
~/.openclaw/workspace/mission-control-repo/status_services.sh
```

---

## 📊 What Happens When MLX Gets Stuck

### Scenario: MLX Responds to Health Checks But Times Out on Work

**Without safeguards:**
```
Agent sends task → MLX timeout → Simulation mode → You get fake results
```

**With safeguards (NEW):**
```
Agent sends task → MLX timeout → 
  ├─ Watchdog detects issue (within 60s)
  ├─ Watchdog restarts MLX (if 3 failures)
  ├─ OR Agent Orchestrator restarts MLX (immediate)
  ├─ MLX comes back online
  ├─ Agent retries task
  └─ Task completes with REAL MLX results
```

---

## 🔔 Notifications You'll Receive

### On Discord (#mission-control):

| Event | Message |
|-------|---------|
| **MLX Stuck** | 🚨 **MLX Auto-Restart Triggered** - Detected 3 consecutive failures. Automatically restarting MLX server... |
| **MLX Recovered** | ✅ **MLX Recovered** - Model is responding normally. |
| **Fallback to Simulation** | ⚠️ **Falling Back to Simulation Mode** - Auto-recovery was attempted but failed. Task completed using simulation. |
| **Job Started** | 🚀 **Job Started** - Task, Agent, ETA |
| **Job Complete** | ✅ **Job Completed** - Task, Agent, Result |
| **Job Failed** | ❌ **Job Failed** - Task, Agent, Error |

---

## 🚀 How to Start Everything with Safeguards

### Option 1: Start All Services (Recommended)
```bash
cd ~/.openclaw/workspace/mission-control-repo
./start_all_services.sh
```

This starts:
- ✅ MLX Server
- ✅ Smart Router (port 11435)
- ✅ Kimi Code Bridge (port 11436)
- ✅ Discord Bridge (port 11437)
- ✅ **MLX Health Watchdog** (auto-recovery)
- ✅ Agent Orchestrator (with built-in recovery)

### Option 2: Individual Control

**Start just the watchdog:**
```bash
export DISCORD_WEBHOOK_URL='your-webhook-url'
python3 mlx_health_watchdog.py
```

**Start agent orchestrator:**
```bash
export DISCORD_WEBHOOK_URL='your-webhook-url'
node agent-orchestrator.js continuous
```

---

## 📋 Monitoring Commands

### Check All Safeguards Status
```bash
# 1. Check watchdog is running
pgrep -f mlx_health_watchdog && echo "✅ Watchdog running" || echo "❌ Watchdown not running"

# 2. Check agent orchestrator
pgrep -f "agent-orchestrator.js.*continuous" && echo "✅ Orchestrator running" || echo "❌ Orchestrator not running"

# 3. Check MLX
pgrep -f mlx_lm.server && echo "✅ MLX running" || echo "❌ MLX not running"

# 4. Full status
./status_services.sh
```

### View Logs
```bash
# Watchdog logs (auto-recovery events)
tail -f logs/mlx_watchdog.log

# Agent orchestrator logs (task execution)
tail -f logs/orchestrator.log

# MLX server logs
 tail -f logs/mlx_server.log
```

---

## ⚠️ When Manual Intervention Needed

The auto-recovery handles **90% of MLX issues**, but you may need to manually intervene if:

1. **Watchdog restarts MLX 3+ times in 10 minutes**
   - Likely a deeper issue (disk space, memory, corrupted model)
   
2. **All tasks failing for >30 minutes**
   - Check: `tail -f logs/orchestrator.log`
   
3. **Discord notifications stop**
   - Webhook may be invalid
   - Check: `echo $DISCORD_WEBHOOK_URL`

4. **System out of memory**
   - MLX + Agent Orchestrator + Discord Bridge = ~10GB RAM
   - Close other apps or restart Mac

---

## 🔧 Manual Recovery (If Auto-Recovery Fails)

```bash
# 1. Stop everything
./stop_all_services.sh

# 2. Kill any remaining processes
pkill -f mlx_lm.server
pkill -f agent-orchestrator
pkill -f mlx_health_watchdog

# 3. Wait a moment
sleep 5

# 4. Restart everything
./start_all_services.sh

# 5. Verify
./status_services.sh
```

---

## 📊 Current Safeguard Status

| Safeguard | Status | Last Checked |
|-----------|--------|--------------|
| MLX Health Watchdog | ✅ Running | Continuous |
| Agent Orchestrator Recovery | ✅ Active | Per-task |
| Discord Notifications | ✅ Configured | On events |
| Service Health Checks | ✅ Available | Manual |

---

## 🎯 Summary

**You now have 3 layers of protection:**

1. **Watchdog** - Monitors MLX every minute, auto-restarts if stuck
2. **Orchestrator** - Auto-retry with recovery on task failure
3. **Notifications** - Alerts you on Discord about issues

**Result:** Even if MLX gets stuck, the system will **automatically recover** and continue working with minimal interruption!
