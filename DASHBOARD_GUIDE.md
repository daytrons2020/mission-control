# Dashboard Guide - How to Use Mission Control

## 🎯 Dashboard Overview

**URL:** https://mission-control-o52l.vercel.app/dashboard.html

### What You See

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 Mission Control    [Status] [?] [🔄]                    │  ← Top bar
├─────────────────────────────────────────────────────────────┤
│  ≡  [Sidebar]  │  💡 How to use commands...                 │  ← Command notice
│                │  $ [Type command here...]        [Send]    │  ← Command bar
│                │  ───────────────────────────────────────   │
│                │  🎯 Our Mission (dismissible banner)        │  ← Mission statement
│                │  [Pipeline] [Calendar] [Team] [Office] [?] │  ← Quick actions
│                │  ┌────┬────┬────┬────┐                     │  ← Stats row
│                │  │ 12 │  3 │ 45 │ 14 │                     │
│                │  └────┴────┴────┴────┘                     │
│                │  ┌──────────┬──────────┬──────────┐         │  ← 3 panels
│                │  │ Tasks    │ Agents   │ Activity │         │
│                │  │ (list)   │ (list)   │ (feed)   │         │
│                │  └──────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 How to Use Each Section

### 1. Command Bar (Top)

**What it does:** Shows you a PREVIEW of what commands would do

**How to use:**
1. Click in the command bar (where it shows `$`)
2. Type: `goals`
3. Press Enter
4. See output in the panel below

**Important:** This shows a PREVIEW. To actually run commands, use your terminal:
```bash
mc goals
```

---

### 2. Quick Action Buttons

These work immediately (no terminal needed):

| Button | What It Does |
|--------|--------------|
| **Content Pipeline** | Opens content-pipeline.html |
| **View Schedule** | Opens calendar.html |
| **Team Status** | Opens team.html |
| **Digital Office** | Opens office.html |
| **Command Help** | Opens help modal |

---

### 3. Stats Row

Shows real-time (or simulated) data:
- **Total Tasks** - All tasks created
- **In Progress** - Tasks being worked on
- **Completed** - Finished tasks
- **Active Agents** - Number of agents online

**Note:** If MLX is not running, these show demo data.

---

### 4. Three Panels

#### Tasks Panel
- Shows your task list
- Click "Add First Task" to create one
- Tasks persist in browser storage

#### Agent Status Panel
- Shows which agents are online
- Shows what they're doing
- Updates every few seconds

#### Activity Feed
- Shows recent actions
- Updates when you do things
- Click "Clear" to reset

---

## 🖥️ Using the Terminal (Real Commands)

To actually execute autonomous tasks, you need the terminal:

### Step 1: Open Terminal

### Step 2: Run Commands

```bash
# See your goals
mc goals

# Generate today's plan
mc plan

# Run one cycle
mc run

# Start continuous mode
mc start
```

### Step 3: View Results

Results appear in:
- Terminal output
- `deliverables/` folder
- Dashboard activity feed

---

## 🔧 Setting Up MLX (For Real AI)

### Check if MLX is installed:
```bash
which mlx_lm.server
```

### If not installed:
```bash
pip install mlx-lm
```

### Start MLX Server:
```bash
# Option 1: Use helper script
cd ~/.openclaw/workspace/mission-control-repo
./start-mlx-server.sh

# Option 2: Manual start
mlx_lm.server --model mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit --port 18888
```

### Verify it's running:
```bash
curl http://127.0.0.1:18888/v1/models
```

---

## 🎨 Office Page

**URL:** https://mission-control-o52l.vercel.app/office.html

### What You Should See:

1. **10 Workstations** - Each with:
   - Agent avatar (emoji)
   - Computer screen with "typing" code
   - Animated keyboard (keys light up)
   - Progress bars
   - Desk items (☕ coffee, 📱 phone, etc.)

2. **Floor Plan** - Mini-map showing all stations

3. **Activity Sidebar** - Live feed of agent actions

### If Office Looks Empty:

1. **Wait 5 seconds** - JavaScript needs time to render
2. **Refresh the page** (F5 or Cmd+R)
3. **Check browser console** (F12 → Console) for errors
4. **Try different browser** (Chrome, Firefox, Safari)

---

## 🐛 Troubleshooting

### Problem: Dashboard is empty

**Solution 1:** Refresh the page
**Solution 2:** Add a test task:
```javascript
// Press F12, then in Console type:
localStorage.setItem('mc_tasks', JSON.stringify([{id: '1', title: 'Test Task', assignee: 'Nano', priority: 'high', status: 'todo', completed: false, created: new Date().toISOString()}]));
location.reload();
```

### Problem: Command bar does nothing

**Expected behavior:** It shows preview output, not actually running commands.

To actually run commands, use terminal:
```bash
mc goals
```

### Problem: Office page is blank

**Check 1:** Wait 10 seconds for JavaScript to load  
**Check 2:** Look for errors in browser console (F12)  
**Check 3:** Try opening directly: https://mission-control-o52l.vercel.app/office.html

### Problem: mc command not found

**Solution:**
```bash
source ~/.zshrc
# or
source ~/.bashrc
```

Or run directly:
```bash
~/.openclaw/workspace/mission-control-repo/mc goals
```

---

## 📊 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Terminal   │────▶│   mc CLI    │────▶│ Orchestrator│
│  (mc goals) │     │             │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                         ┌──────────────────────┘
                         │
                         ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │◀────│  localStorage│◀────│    MLX      │
│  (display)  │     │  (tasks)    │     │   (AI)      │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## ✅ Quick Checklist

- [ ] Can open dashboard URL
- [ ] Can see command bar
- [ ] Can type `goals` and see preview
- [ ] Can click Quick Action buttons
- [ ] Can see 3 panels (Tasks, Agents, Activity)
- [ ] Can open office.html and see workstations
- [ ] Can run `mc goals` in terminal
- [ ] (Optional) MLX server running

---

## 📞 Still Need Help?

1. **Check Quick Start:** `QUICK_START.md`
2. **Check logs:** `logs/orchestrator.log`
3. **Reset:** Clear browser localStorage
4. **Redeploy:** `git push origin main`

**All URLs:**
- Dashboard: https://mission-control-o52l.vercel.app/dashboard.html
- Calendar: https://mission-control-o52l.vercel.app/calendar.html
- Team: https://mission-control-o52l.vercel.app/team.html
- Office: https://mission-control-o52l.vercel.app/office.html
- Pipeline: https://mission-control-o52l.vercel.app/content-pipeline.html
