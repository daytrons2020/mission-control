# Mission Control - Agent Instructions

## ⚠️ CRITICAL: PRESERVE EXISTING CHANGES

**Mission Control v2 has been extensively modified (March 15, 2026).**

**DO NOT DELETE OR REVERT THESE FILES:**
- `app.js` - Contains working task management & OpenClaw integration
- `dashboard.html` - Has fixed buttons and connection indicator
- `api/spawn-agent.js` - Real OpenClaw API integration
- `CHANGES_MARCH_15_2026.md` - Documents all modifications

**Read `CHANGES_MARCH_15_2026.md` before making any changes.**

---

## Current State

### ✅ Working Features (DO NOT BREAK)
1. **Add Task Button** - Fully functional, creates tasks with prompts
2. **Task Completion** - Checkboxes work, move to Done column
3. **Agent Spawning** - Connects to real OpenClaw API
4. **Real-Time Updates** - Auto-refreshes every 30 seconds
5. **Connection Status** - Shows OpenClaw connection indicator
6. **Notifications** - Working notification system
7. **localStorage** - All data persists
8. **Content Pipeline** - Full 6-stage pipeline with editor
9. **Team Structure** - Complete agent hierarchy visualization
10. **Digital Office** - Live workstations with animated screens
11. **Sidebar Navigation** - Hamburger menu, collapsible sidebar
12. **Calendar** - Month navigation, events, today button
13. **Memory** - Document storage with download capability
14. **Mission Control Logo** - Click to return to dashboard
15. **Full Calendar Page** - Complete calendar with cron jobs, scheduled tasks
16. **Mission Statement** - Now on dashboard for all agents to see daily
17. **Comprehensive Dashboard** - Command Center with:
    - Mission Statement banner (dismissible)
    - Quick Action buttons (Pipeline, Calendar, Team, Office, Reports)
    - Enhanced stats cards with progress bars
    - Priority Tasks panel with checkboxes
    - Agent Status panel showing who's online
    - Recent Activity feed
    - System Health panel (OpenClaw, MLX, Discord, Memory)
    - Task Completion Rate chart
    - Upcoming Events panel
    - Command input bar at bottom

### 📄 New Pages (March 15, 2026)

#### Content Pipeline (`content-pipeline.html`)
- **Stages:** Ideas → Outline → Script → Design → Review → Publish
- **Features:**
  - Stage navigation sidebar
  - Rich text editor for each stage
  - localStorage persistence
  - Progress tracking
  - Assign to agents

#### Team Structure (`team.html`)
- **Hierarchy:** Kimi (Lead) → Nano (Coordinator) → Departments → Sub-agents
- **4 Departments:**
  - Development (Frontend, Backend, Database, Integration)
  - Writers (Content, Script, Copywriter, Researcher)
  - Designers (UI/UX, Graphic, Presentation)
  - Education (RT Educator, Course Creator, Training)
- **Sub-agents Pool:** 8 specialized on-demand agents
- **Stats:** 28 total agents, real-time status indicators

#### Digital Office (`office.html`)
- **10 Workstations:** Each with unique agent, computer, desk items
- **Features:**
  - Animated keyboards (keys light up when "typing")
  - Live progress bars with shimmer effects
  - Typing cursors and code screens
  - Floor plan mini-map with quick navigation
  - Activity sidebar with real-time feed
  - Status counts (Working, Busy, Standby)
- **Auto-animations:** Keys animate, progress updates, status changes

### 🔌 OpenClaw Integration
- Connects to: `http://127.0.0.1:18789`
- Real-time agent status
- Live task creation with agent spawn option
- Connection indicator (bottom right of dashboard)

---

## Safe Operations

### You CAN:
- ✅ Add new pages/html files
- ✅ Add new CSS styles
- ✅ Add new API endpoints
- ✅ Modify notifications/messages
- ✅ Add new task types or priorities
- ✅ Create new dashboard widgets
- ✅ Add charts or visualizations

### You CANNOT (Without Reading CHANGES_MARCH_15_2026.md):
- ❌ Replace app.js with a "fresh" version
- ❌ Remove the spawnAgent() method
- ❌ Remove the addTask() method
- ❌ Remove setupRealTimeUpdates()
- ❌ Revert dashboard.html changes
- ❌ Change localStorage key names

---

## Common Tasks

### Adding a New Page
1. Create `newpage.html`
2. Copy navigation from dashboard.html
3. Add to navigation links
4. Update app.js if needed

### Modifying Task Behavior
- Task logic is in `app.js` MissionControl class
- Tasks stored in `localStorage.mc_tasks`
- Safe to add new fields (type, tags, etc.)

### Adding New API Endpoint
1. Create `api/new-endpoint.js`
2. Export handler function
3. Test locally
4. Document in CHANGES file

---

## Testing Checklist

Before saying "done", verify:
- [ ] Add Task button still works
- [ ] Task checkboxes still toggle
- [ ] Agent spawn still tries to connect
- [ ] Connection indicator shows
- [ ] No console errors
- [ ] localStorage data preserved

---

## Troubleshooting

### "Add Task" not working?
- Check `app.js` has `addTask()` method
- Verify button calls `mcApp.addTask()`

### Agent spawn not connecting?
- Check if OpenClaw is running
- Verify port 18789 is accessible
- Check browser console for errors

### Changes reverted?
- Check backups in `backups/` folder
- Restore from backup if needed

---

## Deployment

Site auto-deploys to Vercel on git push:
```bash
cd ~/.openclaw/workspace/mission-control-repo
git add .
git commit -m "Your changes"
git push origin main
```

Live URL: https://mission-control-o52l.vercel.app

---

## Documentation

- **This file:** Agent instructions
- **CHANGES_MARCH_15_2026.md:** Detailed change log
- **README.md:** User documentation (if exists)

---

**Remember:** When in doubt, check `CHANGES_MARCH_15_2026.md` first!
