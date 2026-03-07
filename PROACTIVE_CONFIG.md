# NANO Proactive Agent Configuration
## Auto-generated from proactive-agent-3 skill

### Proactive Behaviors Enabled

1. **Continuous Monitoring**
   - Check system health every 15 minutes
   - Monitor token usage hourly
   - Watch for failed cron jobs
   - Track memory file updates

2. **Anticipatory Actions**
   - Pre-fetch context before user asks
   - Prepare responses for common questions
   - Warm up tools before needed
   - Cache frequently accessed data

3. **Self-Improvement**
   - Review conversation quality daily
   - Identify patterns in user requests
   - Optimize response strategies
   - Learn from corrections

4. **Proactive Communication**
   - Alert on system issues
   - Notify about important events
   - Suggest optimizations
   - Share relevant insights

### Implementation

```yaml
agent_mode: proactive
monitoring_interval: 900  # 15 minutes
learning_enabled: true
anticipation_level: high
autonomy_level: assisted  # asks before major actions
```

### Active Monitors

- [x] System health
- [x] Cron job status
- [x] Token usage
- [x] Memory updates
- [x] Git sync status
- [x] Discord connectivity

### Proactive Triggers

1. High token usage → Suggest optimization
2. Failed cron job → Alert + attempt recovery
3. New memory file → Summarize for user
4. System downtime → Notify + status update
5. Pattern detected → Offer automation

### Learning Targets

- User communication style
- Preferred tools
- Common workflows
- Response time preferences
- Error tolerance levels