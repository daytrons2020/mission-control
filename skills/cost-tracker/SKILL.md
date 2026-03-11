---
name: cost-tracker
description: Track project costs and OpenClaw AI usage with real-time dashboard display, 50% budget alerts, and daily/weekly reporting. Use when managing project budgets, tracking expenses, monitoring spending against budgets, generating cost reports, tracking AI model usage and token costs, or needing budget threshold alerts.
---

# Cost Tracker

A comprehensive cost tracking system with real-time dashboard, budget alerts, and reporting. Includes OpenClaw-specific AI cost tracking for model usage, tokens, and inference costs.

## Features

- **Real-time Dashboard**: Visual display of all projects and spending
- **Budget Alerts**: Automatic alerts at 50%, 75%, 90%, and 100% thresholds
- **Daily/Weekly Reports**: Detailed spending breakdowns by time period
- **Multi-project Support**: Track multiple projects independently
- **Category Tracking**: Organize costs by category

## Quick Start

### Project Cost Tracking

```bash
# Create a project
python3 scripts/cost-tracker.py create "Website Redesign" --budget 5000 --description "Company website overhaul"

# Add costs
python3 scripts/cost-tracker.py add website-redesign 150.00 --description "Domain purchase" --category "infrastructure"
python3 scripts/cost-tracker.py add website-redesign 850.00 --description "Designer fees" --category "design"

# View status
python3 scripts/cost-tracker.py status
```

### OpenClaw AI Cost Tracking

```bash
# Log an AI operation cost
python3 scripts/openclaw-cost-tracker.py log moonshot/kimi-k2.5 1000 500 "Summarized document"

# View today's AI usage status
python3 scripts/openclaw-cost-tracker.py status

# Daily AI cost report
python3 scripts/openclaw-cost-tracker.py daily

# Weekly AI cost report
python3 scripts/openclaw-cost-tracker.py weekly

# Update AI budget settings
python3 scripts/openclaw-cost-tracker.py settings --daily-budget 20.00 --weekly-budget 100.00
```

### View Dashboard

Open `assets/dashboard.html` in a browser for the visual dashboard.

## Commands

### Project Management

```bash
# Create a new project
python3 scripts/cost-tracker.py create "Project Name" --budget 10000 --description "Optional description"

# List all projects
python3 scripts/cost-tracker.py list

# Delete a project
python3 scripts/cost-tracker.py delete project-id
```

### Adding Costs

```bash
# Add a cost entry
python3 scripts/cost-tracker.py add project-id 100.00 --description "What was purchased" --category "category-name"
```

### Viewing Status

```bash
# Show all projects status
python3 scripts/cost-tracker.py status

# Show specific project
python3 scripts/cost-tracker.py status project-id
```

### Reports

```bash
# Daily report (today)
python3 scripts/cost-tracker.py daily

# Daily report for specific date
python3 scripts/cost-tracker.py daily --date 2024-01-15

# Weekly report (current week)
python3 scripts/cost-tracker.py weekly

# Weekly report starting from specific date
python3 scripts/cost-tracker.py weekly --start 2024-01-15
```

## Budget Alerts

The system automatically alerts when budget thresholds are reached:

### Project Cost Alerts
- 🟡 **50% Alert**: First warning when half the budget is used
- 🟠 **75% Alert**: Critical warning when three-quarters used
- 🔴 **90% Alert**: Urgent alert when nearly exhausted
- 🚨 **100% Alert**: Budget exceeded notification

Each alert only triggers once per project.

### OpenClaw AI Cost Alerts
- Tracks both **daily** and **weekly** budgets
- Alerts at 50%, 75%, 90%, and 100% thresholds
- Alerts reset for new days/weeks automatically
- Configure thresholds via settings

## Data Storage

- **Project costs**: `~/.openclaw/cost-tracker/costs.json`
- **OpenClaw AI costs**: `~/.openclaw/cost-tracker/openclaw-costs.json`

Both stored as JSON for easy access and backup.

## OpenClaw AI Cost Tracking

The OpenClaw cost tracker provides:

- **Model-specific pricing**: Tracks costs for Moonshot, OpenRouter, Ollama models
- **Token tracking**: Input, output, and cached tokens
- **Budget alerts**: 50%, 75%, 90%, 100% thresholds for daily/weekly budgets
- **Detailed reports**: Daily, weekly, and monthly breakdowns
- **Operation types**: Categorize by inference, embedding, etc.

### Supported Models

| Model | Input/1M | Output/1M | Cached/1M |
|-------|----------|-----------|-----------|
| moonshot/kimi-k2.5 | $0.50 | $2.00 | $0.25 |
| openrouter/gpt-4o | $2.50 | $10.00 | $1.25 |
| ollama/* | Free | Free | Free |

### OpenClaw AI Cost Commands

```bash
# Log a cost entry
python3 scripts/openclaw-cost-tracker.py log <model> <input_tokens> <output_tokens> <task>

# View current status
python3 scripts/openclaw-cost-tracker.py status

# Daily report (today or specific date)
python3 scripts/openclaw-cost-tracker.py daily
python3 scripts/openclaw-cost-tracker.py daily --date 2024-01-15

# Weekly report
python3 scripts/openclaw-cost-tracker.py weekly
python3 scripts/openclaw-cost-tracker.py weekly --start 2024-01-15

# Monthly report
python3 scripts/openclaw-cost-tracker.py monthly
python3 scripts/openclaw-cost-tracker.py monthly --year 2024 --month 1

# View/Update settings
python3 scripts/openclaw-cost-tracker.py settings --show
python3 scripts/openclaw-cost-tracker.py settings --daily-budget 20.00 --weekly-budget 100.00

# View recent entries
python3 scripts/openclaw-cost-tracker.py recent --limit 20

# Export data
python3 scripts/openclaw-cost-tracker.py export --format json
python3 scripts/openclaw-cost-tracker.py export --format csv --output costs.csv
```

### Programmatic Usage

#### Using the Logger Module (Recommended)

```python
from scripts.openclaw_cost_logger import (
    log_openclaw_cost,
    log_inference,
    log_tool_usage,
    get_today_summary,
    check_budget_status
)

# Simple logging
result = log_openclaw_cost(
    model="moonshot/kimi-k2.5",
    input_tokens=1000,
    output_tokens=500,
    task="Analyzed PDF document",
    operation_type="pdf_analysis"
)

# Tool-specific logging
result = log_tool_usage(
    tool_name="pdf",
    model="moonshot/kimi-k2.5",
    input_tokens=2000,
    output_tokens=800,
    task_description="Extracted text from invoice.pdf"
)

# Check budget before expensive operations
status = check_budget_status()
if status['percent_used'] > 90:
    print("Warning: Approaching daily budget limit!")
```

#### Using the Tracker Class Directly

```python
from scripts.openclaw_cost_tracker import OpenClawCostTracker

tracker = OpenClawCostTracker()

# Log a cost entry
result = tracker.log_cost(
    model="moonshot/kimi-k2.5",
    input_tokens=1000,
    output_tokens=500,
    task="Document analysis",
    operation_type="inference",
    metadata={"tool": "pdf", "duration_ms": 1500}
)

# Get summaries
summary = tracker.get_daily_summary()
weekly = tracker.get_weekly_summary()
monthly = tracker.get_monthly_summary()

# Check for alerts
if result['alerts']:
    for level, message in result['alerts']:
        print(f"[{level}] {message}")
```

## Dashboard

The HTML dashboard (`assets/dashboard.html`) provides:

- Real-time spending visualization
- Progress bars for each project
- Color-coded status indicators
- Budget alert display
- Auto-refresh every 30 seconds

To use the dashboard with live data, the cost data would need to be served via a simple HTTP server or the dashboard could be modified to read the JSON file directly if served from the same origin.
