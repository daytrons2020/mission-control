# Skill Integration Standard - Proactive Agent v3

## All skills must follow this standard to be compatible with the proactive agent system

## Required Components

### 1. Skill Metadata (_meta.json)

```json
{
  "name": "skill-name",
  "version": "1.0.0",
  "description": "What this skill does",
  "author": "Creator name",
  "agent_compatible": true,
  "proactive_enabled": true,
  "capabilities": ["messaging", "monitoring", "automation"],
  "triggers": {
    "proactive": true,
    "scheduled": true,
    "event_driven": true
  }
}
```

### 2. Proactive Hooks

Every skill must implement these hooks:

```python
# proactive_hooks.py

def on_system_event(event):
    """Called when system event occurs"""
    pass

def on_schedule_trigger(schedule):
    """Called on scheduled intervals"""
    pass

def on_user_pattern_detected(pattern):
    """Called when user pattern identified"""
    pass

def self_monitor():
    """Self-check for issues"""
    pass

def anticipate_need(context):
    """Predict what user might need"""
    pass
```

### 3. Memory Integration

```python
# memory_hooks.py

def save_to_memory(data, category):
    """Save skill data to memory system"""
    pass

def load_from_memory(category, timeframe):
    """Load relevant memory"""
    pass

def learn_from_interaction(interaction):
    """Update based on interaction"""
    pass
```

### 4. Communication Interface

```python
# communication.py

def notify_parent(message, priority="normal"):
    """Send message to parent agent"""
    pass

def alert_user(message, channel="discord"):
    """Alert user directly"""
    pass

def report_status(status):
    """Report current status"""
    pass
```

## Skill Categories

### Category 1: Core System Skills
- **Must be proactive**: Yes
- **Autonomy level**: High
- **Examples**: monitoring, security, maintenance

### Category 2: Communication Skills
- **Must be proactive**: Yes
- **Autonomy level**: Medium
- **Examples**: discord, email, messaging

### Category 3: Utility Skills
- **Must be proactive**: Optional
- **Autonomy level**: Low
- **Examples**: file management, parsing, formatting

### Category 4: Integration Skills
- **Must be proactive**: Yes
- **Autonomy level**: Medium
- **Examples**: API connectors, webhooks, databases

## Installation Requirements

### For New Skills

1. **Extract** skill files
2. **Analyze** for proactive compatibility
3. **Add** proactive hooks if missing
4. **Update** _meta.json with agent flags
5. **Install** to `/skills/[skill-name]/`
6. **Register** with agent system
7. **Test** proactive behaviors
8. **Document** integration steps

### For Existing Skills

1. **Audit** current implementation
2. **Identify** proactive integration points
3. **Add** required hooks and interfaces
4. **Update** metadata
5. **Test** with agent system
6. **Deploy** updated version

## Verification Checklist

### Metadata
- [ ] _meta.json includes `agent_compatible: true`
- [ ] _meta.json includes `proactive_enabled: true`
- [ ] Capabilities are documented
- [ ] Triggers are defined

### Code
- [ ] Proactive hooks implemented
- [ ] Memory integration present
- [ ] Communication interface working
- [ ] Self-monitoring enabled
- [ ] Error handling robust

### Testing
- [ ] Works with main agent
- [ ] Works with sub-agents
- [ ] Proactive triggers fire correctly
- [ ] Memory persistence works
- [ ] Communication channels open

### Documentation
- [ ] SKILL.md updated
- [ ] Integration guide provided
- [ ] Examples included
- [ ] Troubleshooting section added

## Skill Registry

All skills must be registered:

```yaml
# skills/registry.yaml

skills:
  - name: proactive-agent-3
    version: 3.0.0
    status: active
    category: core
    proactive: true
    
  - name: discord-cron
    version: 1.0.0
    status: active
    category: communication
    proactive: true
    
  - name: [new-skill]
    version: 1.0.0
    status: [active/pending/deprecated]
    category: [category]
    proactive: [true/false]
```

## Compliance Enforcement

### For New Skills
- Cannot be installed without proactive compliance
- Must pass verification checklist
- Must include integration tests

### For Existing Skills
- Grace period: 30 days to update
- After grace period: deprecated if not updated
- Critical skills: expedited update required

## Example: Converting Existing Skill

### Before (Non-Proactive)
```python
def send_message(msg):
    # Just send message
    api.send(msg)
```

### After (Proactive)
```python
def send_message(msg, context=None):
    # Check if proactive trigger
    if should_send_proactively(context):
        notify_parent(f"Proactive message: {msg}")
    
    # Send message
    result = api.send(msg)
    
    # Learn from result
    learn_from_interaction({
        "message": msg,
        "result": result,
        "context": context
    })
    
    # Self-monitor
    self_monitor()
    
    return result

def should_send_proactively(context):
    # Proactive logic here
    pass
```

---

**Standard Version:** 3.0
**Last Updated:** 2026-03-06
**Applies To:** All current and future skills