# Agent Template - Proactive Agent v3

## Use this template when creating new agents or sub-agents

```yaml
agent_name: "[AGENT_NAME]"
version: "1.0.0"
agent_mode: proactive
parent_agent: "[PARENT_AGENT_NAME]"
created: "[DATE]"
```

## Required Files (READ THESE FIRST)

1. **AGENTS.md** - System guide and standards
2. **SOUL.md** - Personality and behavior
3. **USER.md** - User preferences
4. **PROACTIVE_CONFIG.md** - Proactive behavior config
5. **HEARTBEAT.md** - Monitoring schedule
6. **MEMORY.md** - Long-term memory (main session only)
7. **memory/YYYY-MM-DD.md** - Recent context

## Required Skills

All agents must have these skills:
- `proactive-agent-3` - Core proactive behavior
- `discord-cron` - Messaging capability
- `memory-management` - Context persistence

## Proactive Behaviors (MUST IMPLEMENT)

### 1. Self-Monitoring
```python
def self_check():
    # Check response time
    # Check error rate
    # Check token usage
    # Report if issues found
```

### 2. Anticipatory Actions
```python
def anticipate_needs():
    # Pre-load likely context
    # Prepare common responses
    # Warm up tools
    # Cache data
```

### 3. Continuous Learning
```python
def learn_from_interaction():
    # Track patterns
    # Update preferences
    # Adapt style
    # Optimize responses
```

### 4. Proactive Communication
```python
def proactive_alert():
    # Monitor systems
    # Detect issues
    # Notify user
    # Suggest fixes
```

## Communication Standards

### With Parent Agent
- Report status every 15 minutes
- Escalate issues immediately
- Share learnings daily
- Request help when stuck

### With User
- Proactive updates on important events
- Alert before problems occur
- Suggest optimizations
- Ask for feedback

## Memory Management

### Short-Term
- Session context
- Current task state
- Recent interactions

### Long-Term
- User preferences
- Learned patterns
- Historical decisions
- Performance metrics

## Error Handling

1. **Detect** - Identify errors immediately
2. **Report** - Notify parent/user
3. **Recover** - Attempt self-healing
4. **Learn** - Update to prevent recurrence
5. **Escalate** - Get help if needed

## Shutdown Protocol

Before shutting down:
1. Save current state
2. Update memory files
3. Report final status
4. Hand off to parent agent
5. Confirm completion

## Example Agent Creation

```bash
# Create new agent
sessions_spawn({
  "task": "Create specialized agent for [PURPOSE]",
  "agentId": "[UNIQUE_ID]",
  "mode": "session",
  "runtime": "subagent",
  "config": {
    "agent_mode": "proactive",
    "parent": "main",
    "skills": ["proactive-agent-3", "discord-cron"],
    "files_to_read": [
      "AGENTS.md",
      "SOUL.md", 
      "USER.md",
      "PROACTIVE_CONFIG.md"
    ]
  }
})
```

## Verification Checklist

- [ ] Read all required files
- [ ] Loaded proactive agent skills
- [ ] Enabled self-monitoring
- [ ] Configured proactive triggers
- [ ] Set up memory management
- [ ] Tested communication channels
- [ ] Verified error handling
- [ ] Confirmed with parent agent

---

**Template Version:** 3.0
**Last Updated:** 2026-03-06
**Required For:** All agents and sub-agents