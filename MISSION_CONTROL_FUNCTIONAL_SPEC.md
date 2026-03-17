# Mission Control Functional Requirements

## What's MISSING (Need to Build)

### 1. LIVE Data Connection (Not Simulated)
- [ ] Real agent status from running processes
- [ ] Actual task progress from session files
- [ ] Live cost tracking from API calls
- [ ] Real-time session data from OpenClaw

### 2. Calendar Integration
- [ ] Schedule view with agent assignments
- [ ] Due dates from actual tasks
- [ ] Milestone tracking
- [ ] Recurring tasks (cron jobs)

### 3. Real Work Tracking
- [ ] What each agent is ACTUALLY doing
- [ ] Progress bars based on real completion %
- [ ] Work output (files created, code written)
- [ ] Session history and logs

### 4. Live Communication
- [ ] WebSocket or polling for real messages
- [ ] Integration with actual agent processes
- [ ] Command execution (not just chat simulation)

### 5. Mission Control Features
- [ ] Start/Stop/Pause agents
- [ ] Reassign tasks
- [ ] View agent logs
- [ ] Trigger actions
- [ ] System health monitoring

## Data Sources to Connect

1. **OpenClaw Sessions**: ~/.openclaw/agents/*/sessions/sessions.json
2. **MLX Server**: http://127.0.0.1:18888
3. **OpenClaw API**: Port 18789
4. **Process Status**: Running agents
5. **File System**: Deliverables, logs, outputs
6. **Cost Data**: Actual API usage

## Implementation Plan

### Phase 1: Real Data Pipeline
- Build data collector that reads actual sources
- Create live data endpoint
- Replace simulated data with real data

### Phase 2: Live Communication
- WebSocket server for real-time updates
- Connect to actual agent processes
- Enable command execution

### Phase 3: Control Features
- Add agent controls (start/stop/restart)
- Task management (assign, reassign, complete)
- System monitoring dashboard
