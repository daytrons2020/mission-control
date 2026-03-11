#!/usr/bin/env python3
"""
OpenClaw Cost Tracker - Track AI model usage costs
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
import argparse

DATA_DIR = Path.home() / ".openclaw" / "cost-tracker"
DATA_FILE = DATA_DIR / "openclaw-costs.json"

# Model pricing per 1M tokens
MODEL_COSTS = {
    "moonshot/kimi-k2.5": {"input": 0.50, "output": 2.00, "cached": 0.25},
    "ollama/qwen3:8b": {"input": 0.00, "output": 0.00, "cached": 0.00},
    "openrouter/auto": {"input": 0.30, "output": 1.20, "cached": 0.15},
    "xai/grok-4": {"input": 3.00, "output": 15.00, "cached": 1.50},
    "moonshot/kimi-k1.6": {"input": 0.80, "output": 3.20, "cached": 0.40}
}

DEFAULT_DAILY_BUDGET = 10.0


class OpenClawCostTracker:
    def __init__(self):
        self.data = self._load_data()
    
    def _load_data(self) -> Dict:
        """Load cost data from file or initialize new structure."""
        if DATA_FILE.exists():
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        return {
            "daily_budget": DEFAULT_DAILY_BUDGET,
            "entries": [],
            "created_at": datetime.now().isoformat()
        }
    
    def _save_data(self):
        """Save cost data to file."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(DATA_FILE, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def add_usage(self, model: str, input_tokens: int, output_tokens: int, 
                  task: str = "", cached_input: int = 0) -> dict:
        """Add a usage entry."""
        costs = MODEL_COSTS.get(model, {"input": 0.50, "output": 2.00, "cached": 0.25})
        
        input_cost = (input_tokens / 1_000_000) * costs["input"]
        output_cost = (output_tokens / 1_000_000) * costs["output"]
        cached_cost = (cached_input / 1_000_000) * costs["cached"]
        total_cost = input_cost + output_cost + cached_cost
        
        entry = {
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cached_input": cached_input,
            "input_cost": round(input_cost, 6),
            "output_cost": round(output_cost, 6),
            "cached_cost": round(cached_cost, 6),
            "total_cost": round(total_cost, 6),
            "task": task
        }
        
        self.data["entries"].append(entry)
        self._save_data()
        
        return entry
    
    def get_daily_usage(self, date: Optional[datetime] = None) -> dict:
        """Get usage for a specific day."""
        if date is None:
            date = datetime.now()
        
        target_date = date.date()
        
        entries = [
            e for e in self.data["entries"]
            if datetime.fromisoformat(e["timestamp"]).date() == target_date
        ]
        
        total_cost = sum(e["total_cost"] for e in entries)
        total_input = sum(e["input_tokens"] for e in entries)
        total_output = sum(e["output_tokens"] for e in entries)
        
        by_model = {}
        for e in entries:
            model = e["model"]
            if model not in by_model:
                by_model[model] = {"cost": 0, "input": 0, "output": 0, "calls": 0}
            by_model[model]["cost"] += e["total_cost"]
            by_model[model]["input"] += e["input_tokens"]
            by_model[model]["output"] += e["output_tokens"]
            by_model[model]["calls"] += 1
        
        budget = self.data.get("daily_budget", DEFAULT_DAILY_BUDGET)
        percentage = (total_cost / budget * 100) if budget > 0 else 0
        
        return {
            "date": target_date.isoformat(),
            "total_cost": round(total_cost, 4),
            "total_input": total_input,
            "total_output": total_output,
            "budget": budget,
            "percentage": round(percentage, 2),
            "by_model": by_model,
            "entries": entries
        }
    
    def check_alerts(self) -> List[str]:
        """Check for budget threshold alerts."""
        daily = self.get_daily_usage()
        percentage = daily["percentage"]
        budget = daily["budget"]
        spent = daily["total_cost"]
        
        alerts = []
        thresholds = [
            (100, "🚨", "BUDGET EXCEEDED"),
            (90, "🔴", "90% BUDGET USED"),
            (75, "🟠", "75% BUDGET USED"),
            (50, "🟡", "50% BUDGET USED")
        ]
        
        for threshold, icon, message in thresholds:
            if percentage >= threshold:
                remaining = budget - spent
                alerts.append(f"{icon} {message}: ${spent:.2f} / ${budget:.2f} ({percentage:.1f}%) | Remaining: ${remaining:.2f}")
                break  # Only show highest threshold
        
        return alerts
    
    def get_status(self) -> str:
        """Get real-time status display."""
        daily = self.get_daily_usage()
        
        lines = [
            "📊 OPENCLAW COST TRACKER",
            "=" * 50,
            f"📅 Date: {daily['date']}",
            f"💰 Daily Budget: ${daily['budget']:.2f}",
            f"💸 Total Spent:  ${daily['total_cost']:.4f}",
            f"📈 Remaining:    ${daily['budget'] - daily['total_cost']:.4f}",
            f"📊 Usage:        {daily['percentage']:.1f}%",
            ""
        ]
        
        # Progress bar
        bar_length = 30
        filled = int(bar_length * min(daily['percentage'] / 100, 1))
        bar = "█" * filled + "░" * (bar_length - filled)
        lines.append(f"Progress: [{bar}] {daily['percentage']:.1f}%")
        lines.append("")
        
        # By model breakdown
        if daily["by_model"]:
            lines.append("📋 By Model:")
            for model, stats in daily["by_model"].items():
                icon = "🆓" if stats["cost"] == 0 else "💸"
                lines.append(f"  {icon} {model}:")
                lines.append(f"     Calls: {stats['calls']} | Tokens: {stats['input'] + stats['output']:,}")
                lines.append(f"     Cost: ${stats['cost']:.4f}")
            lines.append("")
        
        # Alerts
        alerts = self.check_alerts()
        if alerts:
            lines.append("⚠️  ALERTS:")
            for alert in alerts:
                lines.append(f"   {alert}")
        else:
            lines.append("✅ No budget alerts")
        
        return "\n".join(lines)
    
    def get_weekly_report(self) -> str:
        """Generate weekly report."""
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        lines = [
            f"📊 WEEKLY REPORT - {week_start} to {week_end}",
            "=" * 50
        ]
        
        weekly_cost = 0
        by_day = {}
        by_model = {}
        
        for entry in self.data["entries"]:
            entry_date = datetime.fromisoformat(entry["timestamp"]).date()
            if week_start <= entry_date <= week_end:
                weekly_cost += entry["total_cost"]
                
                day_key = entry_date.isoformat()
                if day_key not in by_day:
                    by_day[day_key] = 0
                by_day[day_key] += entry["total_cost"]
                
                model = entry["model"]
                if model not in by_model:
                    by_model[model] = {"cost": 0, "calls": 0}
                by_model[model]["cost"] += entry["total_cost"]
                by_model[model]["calls"] += 1
        
        lines.append(f"\n💸 Weekly Total: ${weekly_cost:.4f}")
        lines.append(f"📊 Daily Budget: ${self.data.get('daily_budget', DEFAULT_DAILY_BUDGET):.2f}")
        
        if by_model:
            lines.append("\n📋 By Model:")
            for model, stats in sorted(by_model.items(), key=lambda x: -x[1]["cost"]):
                lines.append(f"  {model}: ${stats['cost']:.4f} ({stats['calls']} calls)")
        
        if by_day:
            lines.append("\n📅 By Day:")
            for day in sorted(by_day.keys()):
                cost = by_day[day]
                bar = "█" * int(cost / max(weekly_cost, 0.01) * 20) if cost > 0 else ""
                lines.append(f"  {day}: ${cost:.4f} {bar}")
        
        return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="OpenClaw Cost Tracker")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Add usage
    add_parser = subparsers.add_parser("add", help="Add usage entry")
    add_parser.add_argument("--model", "-m", required=True, help="Model used")
    add_parser.add_argument("--input", "-i", type=int, required=True, help="Input tokens")
    add_parser.add_argument("--output", "-o", type=int, required=True, help="Output tokens")
    add_parser.add_argument("--cached", "-c", type=int, default=0, help="Cached input tokens")
    add_parser.add_argument("--task", "-t", default="", help="Task description")
    
    # Status
    subparsers.add_parser("status", help="Show current status")
    
    # Weekly report
    subparsers.add_parser("weekly", help="Show weekly report")
    
    # Set budget
    budget_parser = subparsers.add_parser("budget", help="Set daily budget")
    budget_parser.add_argument("amount", type=float, help="Daily budget amount")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    tracker = OpenClawCostTracker()
    
    if args.command == "add":
        entry = tracker.add_usage(args.model, args.input, args.output, args.task, args.cached)
        print(f"✅ Added: ${entry['total_cost']:.6f} for {args.model}")
        
        # Show alerts
        alerts = tracker.check_alerts()
        if alerts:
            print("\n".join(alerts))
    
    elif args.command == "status":
        print(tracker.get_status())
    
    elif args.command == "weekly":
        print(tracker.get_weekly_report())
    
    elif args.command == "budget":
        tracker.data["daily_budget"] = args.amount
        tracker._save_data()
        print(f"✅ Daily budget set to ${args.amount:.2f}")


if __name__ == "__main__":
    main()
