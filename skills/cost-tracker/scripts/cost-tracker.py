#!/usr/bin/env python3
"""
Cost Tracker - Main tracking script
Tracks project costs with real-time display, budget alerts, and daily/weekly reporting.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import argparse

DATA_DIR = Path.home() / ".openclaw" / "cost-tracker"
DATA_FILE = DATA_DIR / "costs.json"

class CostTracker:
    def __init__(self):
        self.data = self._load_data()
    
    def _load_data(self) -> Dict:
        """Load cost data from file or initialize new structure."""
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        return {
            "projects": {},
            "created_at": datetime.now().isoformat()
        }
    
    def _save_data(self):
        """Save cost data to file."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(DATA_FILE, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def create_project(self, name: str, budget: float, description: str = "") -> str:
        """Create a new project with budget."""
        project_id = name.lower().replace(" ", "-")
        if project_id in self.data["projects"]:
            return f"Error: Project '{name}' already exists"
        
        self.data["projects"][project_id] = {
            "name": name,
            "description": description,
            "budget": float(budget),
            "spent": 0.0,
            "created_at": datetime.now().isoformat(),
            "entries": [],
            "alerts_sent": {
                "50": False,
                "75": False,
                "90": False,
                "100": False
            }
        }
        self._save_data()
        return f"✅ Created project '{name}' with budget ${budget:,.2f}"
    
    def add_cost(self, project_id: str, amount: float, description: str = "", category: str = "") -> str:
        """Add a cost entry to a project."""
        if project_id not in self.data["projects"]:
            return f"Error: Project '{project_id}' not found"
        
        project = self.data["projects"][project_id]
        entry = {
            "amount": float(amount),
            "description": description,
            "category": category,
            "timestamp": datetime.now().isoformat()
        }
        project["entries"].append(entry)
        project["spent"] += float(amount)
        
        # Check for budget alerts
        alerts = self._check_alerts(project)
        self._save_data()
        
        result = f"✅ Added ${amount:,.2f} to '{project['name']}'"
        if description:
            result += f" ({description})"
        if alerts:
            result += "\n" + "\n".join(alerts)
        return result
    
    def _check_alerts(self, project: Dict) -> List[str]:
        """Check and return budget threshold alerts."""
        alerts = []
        budget = project["budget"]
        spent = project["spent"]
        percentage = (spent / budget * 100) if budget > 0 else 0
        
        thresholds = [
            (50, "🟡 50% BUDGET ALERT"),
            (75, "🟠 75% BUDGET ALERT"),
            (90, "🔴 90% BUDGET ALERT"),
            (100, "🚨 100% BUDGET EXCEEDED")
        ]
        
        for threshold, message in thresholds:
            if percentage >= threshold and not project["alerts_sent"].get(str(threshold)):
                remaining = budget - spent
                alerts.append(f"{message}: ${spent:,.2f} / ${budget:,.2f} ({percentage:.1f}%) | Remaining: ${remaining:,.2f}")
                project["alerts_sent"][str(threshold)] = True
        
        return alerts
    
    def get_status(self, project_id: Optional[str] = None) -> str:
        """Get real-time status display."""
        if project_id:
            if project_id not in self.data["projects"]:
                return f"Error: Project '{project_id}' not found"
            return self._format_project_status(self.data["projects"][project_id])
        
        # Show all projects summary
        lines = ["📊 COST TRACKER - REAL-TIME STATUS", "=" * 50]
        if not self.data["projects"]:
            lines.append("No projects tracked yet.")
            return "\n".join(lines)
        
        total_budget = sum(p["budget"] for p in self.data["projects"].values())
        total_spent = sum(p["spent"] for p in self.data["projects"].values())
        
        lines.append(f"💰 Total Budget: ${total_budget:,.2f}")
        lines.append(f"💸 Total Spent:  ${total_spent:,.2f}")
        lines.append(f"📈 Remaining:    ${total_budget - total_spent:,.2f}")
        lines.append("")
        
        for project_id, project in self.data["projects"].items():
            lines.append(self._format_project_summary(project))
        
        return "\n".join(lines)
    
    def _format_project_status(self, project: Dict) -> str:
        """Format detailed status for a single project."""
        budget = project["budget"]
        spent = project["spent"]
        remaining = budget - spent
        percentage = (spent / budget * 100) if budget > 0 else 0
        
        # Progress bar
        bar_length = 30
        filled = int(bar_length * min(percentage / 100, 1))
        bar = "█" * filled + "░" * (bar_length - filled)
        
        lines = [
            f"📋 Project: {project['name']}",
            f"   {project.get('description', '')}",
            "",
            f"Budget:    ${budget:,.2f}",
            f"Spent:     ${spent:,.2f}",
            f"Remaining: ${remaining:,.2f}",
            "",
            f"Progress:  [{bar}] {percentage:.1f}%",
            ""
        ]
        
        # Recent entries (last 10)
        if project["entries"]:
            lines.append("📜 Recent Entries:")
            for entry in reversed(project["entries"][-10:]):
                ts = datetime.fromisoformat(entry["timestamp"]).strftime("%Y-%m-%d %H:%M")
                cat = f"[{entry.get('category', 'uncategorized')}] " if entry.get('category') else ""
                lines.append(f"  {ts} | ${entry['amount']:,.2f} | {cat}{entry.get('description', '')}")
        
        return "\n".join(lines)
    
    def _format_project_summary(self, project: Dict) -> str:
        """Format a one-line project summary."""
        budget = project["budget"]
        spent = project["spent"]
        percentage = (spent / budget * 100) if budget > 0 else 0
        
        # Status indicator
        if percentage >= 100:
            indicator = "🚨"
        elif percentage >= 75:
            indicator = "🔴"
        elif percentage >= 50:
            indicator = "🟡"
        else:
            indicator = "🟢"
        
        return f"{indicator} {project['name']}: ${spent:,.2f} / ${budget:,.2f} ({percentage:.1f}%)"
    
    def get_daily_report(self, date_str: Optional[str] = None) -> str:
        """Generate daily cost report."""
        if date_str:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        else:
            target_date = datetime.now().date()
        
        lines = [f"📅 DAILY REPORT - {target_date}", "=" * 40]
        
        daily_total = 0
        for project_id, project in self.data["projects"].items():
            project_daily = 0
            project_entries = []
            
            for entry in project["entries"]:
                entry_date = datetime.fromisoformat(entry["timestamp"]).date()
                if entry_date == target_date:
                    project_daily += entry["amount"]
                    project_entries.append(entry)
            
            if project_entries:
                lines.append(f"\n📋 {project['name']}:")
                for entry in project_entries:
                    ts = datetime.fromisoformat(entry["timestamp"]).strftime("%H:%M")
                    cat = f"[{entry.get('category', '')}] " if entry.get('category') else ""
                    lines.append(f"  {ts} | ${entry['amount']:,.2f} | {cat}{entry.get('description', '')}")
                lines.append(f"  Subtotal: ${project_daily:,.2f}")
                daily_total += project_daily
        
        if daily_total == 0:
            lines.append("\nNo costs recorded for this day.")
        else:
            lines.append(f"\n💸 Daily Total: ${daily_total:,.2f}")
        
        return "\n".join(lines)
    
    def get_weekly_report(self, week_start: Optional[str] = None) -> str:
        """Generate weekly cost report."""
        if week_start:
            start_date = datetime.strptime(week_start, "%Y-%m-%d").date()
        else:
            # Default to current week (starting Monday)
            today = datetime.now().date()
            start_date = today - timedelta(days=today.weekday())
        
        end_date = start_date + timedelta(days=6)
        
        lines = [f"📊 WEEKLY REPORT - {start_date} to {end_date}", "=" * 50]
        
        weekly_total = 0
        by_project = {}
        by_day = {i: 0.0 for i in range(7)}
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        for project_id, project in self.data["projects"].items():
            project_weekly = 0
            
            for entry in project["entries"]:
                entry_date = datetime.fromisoformat(entry["timestamp"]).date()
                if start_date <= entry_date <= end_date:
                    project_weekly += entry["amount"]
                    day_idx = (entry_date - start_date).days
                    by_day[day_idx] += entry["amount"]
            
            if project_weekly > 0:
                by_project[project['name']] = project_weekly
                weekly_total += project_weekly
        
        if weekly_total == 0:
            lines.append("\nNo costs recorded for this week.")
        else:
            lines.append(f"\n💸 Weekly Total: ${weekly_total:,.2f}")
            lines.append("\n📋 By Project:")
            for name, amount in sorted(by_project.items(), key=lambda x: -x[1]):
                pct = (amount / weekly_total * 100) if weekly_total > 0 else 0
                lines.append(f"  {name}: ${amount:,.2f} ({pct:.1f}%)")
            
            lines.append("\n📅 By Day:")
            for i, day in enumerate(day_names):
                date = start_date + timedelta(days=i)
                amount = by_day[i]
                bar = "█" * int(amount / max(weekly_total, 1) * 20) if amount > 0 else ""
                lines.append(f"  {day} {date.day}: ${amount:,.2f} {bar}")
        
        return "\n".join(lines)
    
    def list_projects(self) -> str:
        """List all projects."""
        if not self.data["projects"]:
            return "No projects tracked yet."
        
        lines = ["📁 PROJECTS:", ""]
        for project_id, project in self.data["projects"].items():
            lines.append(f"  • {project_id} - {project['name']}")
        return "\n".join(lines)
    
    def delete_project(self, project_id: str) -> str:
        """Delete a project."""
        if project_id not in self.data["projects"]:
            return f"Error: Project '{project_id}' not found"
        
        name = self.data["projects"][project_id]["name"]
        del self.data["projects"][project_id]
        self._save_data()
        return f"🗑️ Deleted project '{name}'"


def main():
    parser = argparse.ArgumentParser(description="Cost Tracker CLI")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Create project
    create_parser = subparsers.add_parser("create", help="Create a new project")
    create_parser.add_argument("name", help="Project name")
    create_parser.add_argument("--budget", "-b", type=float, required=True, help="Budget amount")
    create_parser.add_argument("--description", "-d", default="", help="Project description")
    
    # Add cost
    add_parser = subparsers.add_parser("add", help="Add a cost entry")
    add_parser.add_argument("project", help="Project ID")
    add_parser.add_argument("amount", type=float, help="Cost amount")
    add_parser.add_argument("--description", "-d", default="", help="Cost description")
    add_parser.add_argument("--category", "-c", default="", help="Cost category")
    
    # Status
    status_parser = subparsers.add_parser("status", help="Show real-time status")
    status_parser.add_argument("project", nargs="?", help="Specific project ID (optional)")
    
    # Daily report
    daily_parser = subparsers.add_parser("daily", help="Show daily report")
    daily_parser.add_argument("--date", help="Date (YYYY-MM-DD), defaults to today")
    
    # Weekly report
    weekly_parser = subparsers.add_parser("weekly", help="Show weekly report")
    weekly_parser.add_argument("--start", help="Week start date (YYYY-MM-DD), defaults to current week")
    
    # List projects
    subparsers.add_parser("list", help="List all projects")
    
    # Delete project
    delete_parser = subparsers.add_parser("delete", help="Delete a project")
    delete_parser.add_argument("project", help="Project ID to delete")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    tracker = CostTracker()
    
    if args.command == "create":
        print(tracker.create_project(args.name, args.budget, args.description))
    elif args.command == "add":
        print(tracker.add_cost(args.project, args.amount, args.description, args.category))
    elif args.command == "status":
        print(tracker.get_status(args.project))
    elif args.command == "daily":
        print(tracker.get_daily_report(args.date))
    elif args.command == "weekly":
        print(tracker.get_weekly_report(args.start))
    elif args.command == "list":
        print(tracker.list_projects())
    elif args.command == "delete":
        print(tracker.delete_project(args.project))


if __name__ == "__main__":
    main()
