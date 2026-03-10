---
name: cost-tracker
description: Track project costs with real-time dashboard display, 50% budget alerts, and daily/weekly reporting. Use when managing project budgets, tracking expenses, monitoring spending against budgets, generating cost reports, or needing budget threshold alerts.
---

# Cost Tracker

A comprehensive cost tracking system with real-time dashboard, budget alerts, and reporting.

## Features

- **Real-time Dashboard**: Visual display of all projects and spending
- **Budget Alerts**: Automatic alerts at 50%, 75%, 90%, and 100% thresholds
- **Daily/Weekly Reports**: Detailed spending breakdowns by time period
- **Multi-project Support**: Track multiple projects independently
- **Category Tracking**: Organize costs by category

## Quick Start

### Create a Project

```bash
python3 scripts/cost-tracker.py create "Website Redesign" --budget 5000 --description "Company website overhaul"
```

### Add Costs

```bash
python3 scripts/cost-tracker.py add website-redesign 150.00 --description "Domain purchase" --category "infrastructure"
python3 scripts/cost-tracker.py add website-redesign 850.00 --description "Designer fees" --category "design"
```

### View Real-Time Status

```bash
python3 scripts/cost-tracker.py status
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

- 🟡 **50% Alert**: First warning when half the budget is used
- 🟠 **75% Alert**: Critical warning when three-quarters used
- 🔴 **90% Alert**: Urgent alert when nearly exhausted
- 🚨 **100% Alert**: Budget exceeded notification

Each alert only triggers once per project.

## Data Storage

Cost data is stored in `~/.openclaw/cost-tracker/costs.json` as JSON for easy access and backup.

## Dashboard

The HTML dashboard (`assets/dashboard.html`) provides:

- Real-time spending visualization
- Progress bars for each project
- Color-coded status indicators
- Budget alert display
- Auto-refresh every 30 seconds

To use the dashboard with live data, the cost data would need to be served via a simple HTTP server or the dashboard could be modified to read the JSON file directly if served from the same origin.
