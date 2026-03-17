# Cost Optimization Guide - Mission Control

## Current Costs (Before Optimization)

| Model | Sessions | Cost |
|-------|----------|------|
| kimi-k2.5 | 80 | $0.80 |
| openrouter | 6 | $0.15 |  
| mlx-auto | 2 | $0.03 |
| **Total** | **88** | **~$0.98** |

**Cost per session: ~$0.01**

---

## 🎯 4-Tier Optimized Strategy

### 🟢 Tier 1: MLX (deepseek-14b) - 75% - **FREE**
Use MLX for simple tasks:
- Code generation
- Simple analysis  
- Data processing
- Testing
- UI components

**Cost: $0.00 per task**

### 🟡 Tier 2: Kimi-Code (You) - 12% - $0.02
Use Kimi-Code (You) for complex code:
- Debugging
- Refactoring
- Architecture design
- Code review
- Best practices

**Cost: ~$0.02 per task**

### 🔵 Tier 3: Kimi 2.5 - 8% - $0.02
Use Kimi 2.5 for general reasoning:
- Research tasks
- Strategic planning
- Complex reasoning
- Market analysis

**Cost: ~$0.02 per task**

### 🎭 Tier 4: Minimax - 5% - $0.015
Use Minimax for:
- Image generation
- Chinese text/translation
- Multimodal tasks

**Cost: ~$0.015 per task** (slightly cheaper)

---

## New Tools

### 1. MLX Router (4-Tier)
```bash
# Simple code → MLX (FREE)
node mlx-router.js "Create login form"
# Output: 🍎 MLX (Local) - FREE

# Complex code → Kimi-Code (You)
node mlx-router.js "Debug memory leak"  
# Output: 💻 Kimi-Code (You) - $0.02

# Research → Kimi 2.5
node mlx-router.js "Research market trends"
# Output: 🎯 Kimi 2.5 - $0.02

# Image → Minimax
node mlx-router.js "Generate hero image"
# Output: 🎭 Minimax - $0.015

# Chinese → Minimax
node mlx-router.js "Translate to Chinese"
# Output: 🎭 Minimax - $0.015
```

### 2. Cost-Optimized Orchestrator
```bash
# Generate cost-optimized work plan
node agent-orchestrator-mlx.js plan

# Check cost tracking status
node agent-orchestrator-mlx.js status
```

---

## Expected Savings

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| MLX Usage | 23% | 75% | +52% |
| Kimi-Code Usage | 0% | 12% | New |
| Kimi 2.5 Usage | 77% | 8% | -69% |
| Minimax Usage | 0% | 5% | New |
| **Cost per 100 tasks** | **~$1.00** | **~$0.37** | **63%** |

---

## Daily Budget

- **Target**: Max $1.00/day
- **MLX Tasks**: Unlimited (FREE)
- **Kimi-Code Tasks**: ~25/day ($0.50)
- **Kimi 2.5 Tasks**: ~15/day ($0.30)
- **Minimax Tasks**: ~13/day ($0.20)

When daily cost reaches $1.00, all tasks automatically route to MLX.

---

## All Paid Models

| Model | Cost | Best For | Status |
|-------|------|----------|--------|
| **Kimi-Code (You)** | $0.02 | Complex code, debugging | ✅ Active |
| **Kimi 2.5** | $0.02 | Research, reasoning | ✅ Active |
| **Minimax** | $0.015 | Images, Chinese text | ⏸️ Standby |

**Note**: All three are pay-per-use. Use MLX (FREE) for 75% of tasks to minimize costs.

---

## Model Responsibilities

| Model | Role | When to Use | Cost |
|-------|------|-------------|------|
| **MLX** | Local AI | Simple code, generation, analysis | **FREE** |
| **Kimi-Code (You)** | Code Specialist | Debugging, architecture, complex code | $0.02 |
| **Kimi 2.5** | General AI | Research, planning, reasoning | $0.02 |
| **Minimax** | Multimodal | Images, Chinese text, visuals | $0.015 |

---

## Monitoring

Track costs in real-time:
```bash
# View current session costs
node openclaw-bridge.js

# Check dashboard data
cat dashboard-data.json | grep -E "modelsInUse|stats"
```

---

## Summary

With 4-tier optimization:
- **75% of tasks** → MLX (FREE)
- **12% of tasks** → Kimi-Code (You) - Code specialist
- **8% of tasks** → Kimi 2.5 - General reasoning
- **5% of tasks** → Minimax - Images/Chinese
- **Savings: ~63%** on AI costs
- **Daily cost: ~$0.37** instead of $1.00

**All paid models** (Kimi-Code, Kimi 2.5, Minimax) are reserved for specific use cases:
- Simple code? → MLX (FREE)
- Complex debugging? → Kimi-Code (You)
- Research? → Kimi 2.5
- Image/Chinese? → Minimax
