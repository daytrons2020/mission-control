# Quick Start Guide - Mission Control

## 🚨 Common Issues & Solutions

### Issue 1: How to Start MLX Server

**Option A - Auto-start script:**
```bash
cd ~/.openclaw/workspace/mission-control-repo
./start-mlx-server.sh
```

**Option B - Manual start (if mlx_lm is installed):**
```bash
mlx_lm.server --model mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit --port 18888
```

**Option C - Using Python:**
```bash
python3 -m mlx_lm.server --model mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit --port 18888
```

**Verify it's running:**
```bash
curl http://127.0.0.1:18888/v1/models
```

---

### Issue 2: Command Bar Not Working

**The command bar in dashboard is for VISUAL feedback only.**

To ACTUALLY run commands:

```bash
# In terminal (not in browser):
mc goals
mc plan
mc start
```

**Why?** Browser JavaScript cannot directly execute shell commands for security reasons.

**What the dashboard command bar does:**
- Shows what command you typed
- Displays a preview of what would happen
- Gives you the terminal command to copy/paste

---

### Issue 3: Dashboard Shows Empty

**First load:** The dashboard needs data. Try:

1. **Refresh the page** (Cmd+R or Ctrl+R)
2. **Check browser console** (F12 → Console tab) for errors
3. **Add a test task:** Click "Quick Task" button

**If still empty:**
```bash
# Reset local storage by running in browser console:
localStorage.clear();
location.reload();
```

---

### Issue 4: Office Page Minimal

The office page was updated with sidebar navigation but kept the same content. To see full office:

**URL:** https://mission-control-o52l.vercel.app/office.html

**What should be there:**
- 10 animated workstations
- Live typing animations
- Agent status indicators
- Floor plan mini-map
- Activity sidebar

---

## 📋 Quick Commands Reference

### Terminal Commands (mc CLI)

```bash
# View your 5 goals
mc goals

# Generate today's work plan
mc plan

# Run one autonomous cycle
mc run

# Start continuous mode
mc start

# Check system status
mc status
```

### Dashboard Actions

| Button | Action |
|--------|--------|
| **Quick Task** | Add a new task |
| **Spawn Agent** | Create a new agent |
| **Refresh** | Reload all data |
| **? Help** | Show command guide |

---

## 🔄 Workflow Example

### Daily Workflow:

1. **Start MLX** (if not running):
   ```bash
   ./start-mlx-server.sh
   ```

2. **View goals**:
   ```bash
   mc goals
   ```

3. **Generate plan**:
   ```bash
   mc plan
   ```

4. **Open dashboard**:
   ```bash
   mc dashboard
   ```

5. **Start autonomous work**:
   ```bash
   mc start
   ```

---

## 🆘 Still Having Issues?

### Check 1: Is MLX running?
```bash
curl http://127.0.0.1:18888/v1/models
```
Should return JSON with model info.

### Check 2: Is OpenClaw running?
```bash
curl http://127.0.0.1:18789/v1/status
```
Should return status JSON.

### Check 3: Are files deployed?
```bash
cd ~/.openclaw/workspace/mission-control-repo
git status
```

### Check 4: Reset everything
```bash
# Reset local storage
rm -f orchestrator-state.json dashboard-data.json

# Clear logs
rm -f logs/*.log

# Reinstall CLI
./install-mc-cli.sh
```

---

## 🎯 What Works Right Now

✅ **Dashboard:** Shows stats, tasks, agents, activity  
✅ **Command Bar:** Visual command entry (shows preview)  
✅ **Help Modal:** Full command reference  
✅ **mc CLI:** Terminal commands work  
✅ **Navigation:** All pages linked  
⚠️ **MLX Integration:** Works if MLX server is running  
⚠️ **Autonomous Execution:** Works in simulation mode  

---

## 📊 Expected Behavior

### When MLX is NOT running:
- `mc plan` → Uses mock data (instant)
- Dashboard → Shows static/demo data
- Agent activities → Simulated

### When MLX IS running:
- `mc plan` → Generates real AI tasks (slower)
- Dashboard → Can show real-time updates
- Agent activities → Actual MLX-generated

---

## 🔗 Links

- **Dashboard:** https://mission-control-o52l.vercel.app/dashboard.html
- **Calendar:** https://mission-control-o52l.vercel.app/calendar.html
- **Team:** https://mission-control-o52l.vercel.app/team.html
- **Office:** https://mission-control-o52l.vercel.app/office.html
- **Pipeline:** https://mission-control-o52l.vercel.app/content-pipeline.html
