# Cost Optimization Guide - Mission Control

## Current Costs (Before Optimization)

| Model | Sessions | Cost |
|-------|----------|------|
| kimi-k2.5 | 80 | $0.80 |
| openrouter | 6 | $0.15 |
| mlx-auto | 2 | $0.03 |
| **Total** | **88** | **~$0.98** |

**Cost per session: ~$0.01**

## Optimized Strategy (Target: 80% MLX)

### 🟢 FREE - MLX (Target: 80% of tasks)
Use MLX for:
- Code generation
- Documentation  
- Simple analysis
- Data processing
- Refactoring
- Testing
- UI components
- API implementations

**Cost: $0.00 per session**

### 🟡 PAID - Kimi (Target: 20% of tasks)
Use Kimi ONLY for:
- Architecture design
- Complex debugging
- Deep reasoning
- Research tasks
- Strategic planning
- Critical code review

**Cost: ~$0.02 per session**

## New Tools

### 1. MLX Router
```bash
# Route a task to optimal model
node mlx-router.js "Create login form"
# Output: MLX (FREE)

node mlx-router.js "Debug memory leak"  
# Output: Kimi ($0.02)
```

### 2. Cost-Optimized Orchestrator
```bash
# Generate cost-optimized work plan
node agent-orchestrator-mlx.js plan

# Check cost tracking status
node agent-orchestrator-mlx.js status
```

## Expected Savings

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| MLX Usage | 23% | 80% | +57% |
| Kimi Usage | 77% | 20% | -57% |
| Cost per 100 tasks | ~$1.00 | ~$0.40 | **60%** |

## Daily Budget

- **Target**: Max $1.00/day
- **MLX Tasks**: Unlimited (FREE)
- **Kimi Tasks**: Max 50/day ($1.00)

When daily cost reaches $1.00, all tasks automatically route to MLX.

## Configuration

OpenClaw config updated to prioritize MLX:
```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "mlx_14b/deepseek-14b",
        "fallbacks": ["moonshot/kimi-k2.5"]
      }
    }
  }
}
```

## Monitoring

Track costs in real-time:
```bash
# View current session costs
node openclaw-bridge.js

# Check dashboard data
cat dashboard-data.json | grep -E "modelsInUse|stats"
```

## Best Practices

1. **Always start with MLX** - Only escalate to Kimi if MLX fails
2. **Batch simple tasks** - Group small tasks to reduce API calls
3. **Use context limits** - Set max tokens to control costs
4. **Monitor daily spend** - Check status regularly
5. **Reserve Kimi for complexity** - Architecture, debugging, reasoning

## Summary

With this optimization:
- **67% of tasks** → MLX (FREE)
- **33% of tasks** → Kimi (Paid)
- **Savings: ~60%** on AI costs
- **Daily cost: ~$0.40** instead of $1.00

The system now automatically routes tasks to the most cost-effective model while ensuring complex tasks get the reasoning power they need.
