#!/usr/bin/env python3
"""
OpenClaw Cost Tracker - Comprehensive AI usage and cost tracking for OpenClaw
Tracks model usage, tokens, costs, and provides daily/weekly reports.
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse

# Data storage paths
DATA_DIR = Path.home() / ".openclaw" / "cost-tracker"
OPENCLAW_DATA_FILE = DATA_DIR / "openclaw-costs.json"

# Model pricing per 1M tokens (USD) - kept up to date
MODEL_PRICING = {
    # Moonshot models
    "moonshot/kimi-k2.5": {"input": 0.50, "output": 2.00, "cached_input": 0.25},
    "moonshot/kimi-k1.5": {"input": 0.80, "output": 2.00, "cached_input": 0.40},
    # OpenRouter models
    "openrouter/auto": {"input": 0.30, "output": 1.20, "cached_input": 0.15},
    "openrouter/gpt-4o": {"input": 2.50, "output": 10.00, "cached_input": 1.25},
    "openrouter/claude-3.5-sonnet": {"input": 3.00, "output": 15.00, "cached_input": 1.50},
    # Ollama models (free, local)
    "ollama/qwen3:8b": {"input": 0.00, "output": 0.00, "cached_input": 0.00},
    "ollama/llama3.2": {"input": 0.00, "output": 0.00, "cached_input": 0.00},
    "ollama/deepseek-r1:8b": {"input": 0.00, "output": 0.00, "cached_input": 0.00},
    # Default fallback
    "default": {"input": 0.50, "output": 2.00, "cached_input": 0.25},
}

# Default configuration
DEFAULT_DAILY_BUDGET = 10.00
DEFAULT_WEEKLY_BUDGET = 50.00


class OpenClawCostTracker:
    """Main class for tracking OpenClaw AI costs."""
    
    def __init__(self):
        self.data = self._load_data()
    
    def _load_data(self) -> Dict:
        """Load cost data from file or initialize new structure."""
        if OPENCLAW_DATA_FILE.exists():
            with open(OPENCLAW_DATA_FILE, 'r') as f:
                data = json.load(f)
                # Ensure all required keys exist (for backward compatibility)
                if "settings" not in data:
                    data["settings"] = self._default_settings()
                if "alerts_triggered" not in data:
                    data["alerts_triggered"] = {"daily": {}, "weekly": {}}
                if "entries" not in data:
                    data["entries"] = []
                return data
        return self._init_data()
    
    def _default_settings(self) -> Dict:
        """Return default settings."""
        return {
            "daily_budget": DEFAULT_DAILY_BUDGET,
            "weekly_budget": DEFAULT_WEEKLY_BUDGET,
            "alerts_enabled": True,
            "alert_thresholds": [50, 75, 90, 100]
        }
    
    def _init_data(self) -> Dict:
        """Initialize new data structure."""
        return {
            "version": "1.0",
            "created_at": datetime.now().isoformat(),
            "settings": self._default_settings(),
            "alerts_triggered": {
                "daily": {},
                "weekly": {}
            },
            "entries": []
        }
    
    def _save_data(self):
        """Save cost data to file."""
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with open(OPENCLAW_DATA_FILE, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def calculate_cost(self, model: str, input_tokens: int, output_tokens: int, 
                       cached_tokens: int = 0) -> float:
        """Calculate cost for a request based on model pricing."""
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["default"])
        
        # Convert to millions
        input_m = input_tokens / 1_000_000
        output_m = output_tokens / 1_000_000
        cached_m = cached_tokens / 1_000_000
        
        cost = (input_m * pricing["input"] + 
                output_m * pricing["output"] +
                cached_m * pricing["cached_input"])
        
        return round(cost, 6)
    
    def log_cost(self, model: str, input_tokens: int, output_tokens: int,
                 task: str, operation_type: str = "inference",
                 cached_tokens: int = 0, metadata: Optional[Dict] = None) -> Dict:
        """
        Log a cost entry from an OpenClaw operation.
        
        Args:
            model: Model name/identifier
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            task: Description of the task/operation
            operation_type: Type of operation (inference, embedding, etc.)
            cached_tokens: Number of cached tokens (if applicable)
            metadata: Additional metadata (tool used, duration, etc.)
        
        Returns:
            The created entry dict
        """
        cost = self.calculate_cost(model, input_tokens, output_tokens, cached_tokens)
        
        entry = {
            "id": f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{len(self.data['entries'])}",
            "timestamp": datetime.now().isoformat(),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "week": datetime.now().strftime("%Y-W%U"),
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cached_tokens": cached_tokens,
            "total_tokens": input_tokens + output_tokens + cached_tokens,
            "cost": cost,
            "task": task,
            "operation_type": operation_type,
            "metadata": metadata or {}
        }
        
        self.data["entries"].append(entry)
        self._save_data()
        
        # Check for alerts
        alerts = self._check_budget_alerts()
        
        return {"entry": entry, "alerts": alerts}
    
    def _check_budget_alerts(self) -> List[Tuple[str, str]]:
        """Check and return budget threshold alerts."""
        if not self.data["settings"].get("alerts_enabled", True):
            return []
        
        alerts = []
        today = datetime.now().strftime("%Y-%m-%d")
        this_week = datetime.now().strftime("%Y-W%U")
        
        daily_summary = self.get_daily_summary(today)
        weekly_summary = self.get_weekly_summary()
        
        thresholds = self.data["settings"].get("alert_thresholds", [50, 75, 90, 100])
        
        # Check daily budget
        daily_pct = daily_summary["percent_used"]
        for threshold in sorted(thresholds, reverse=True):
            if daily_pct >= threshold:
                key = f"daily_{today}_{threshold}"
                if key not in self.data["alerts_triggered"]["daily"]:
                    if threshold >= 100:
                        alerts.append(("CRITICAL", f"🚨 Daily budget EXCEEDED: ${daily_summary['total_cost']:.2f} / ${daily_summary['budget']:.2f} ({daily_pct:.1f}%)"))
                    elif threshold >= 90:
                        alerts.append(("URGENT", f"🔴 Daily budget {threshold}% used: ${daily_summary['total_cost']:.2f} / ${daily_summary['budget']:.2f}"))
                    elif threshold >= 75:
                        alerts.append(("WARNING", f"🟠 Daily budget {threshold}% used: ${daily_summary['total_cost']:.2f} / ${daily_summary['budget']:.2f}"))
                    else:
                        alerts.append(("NOTICE", f"🟡 Daily budget {threshold}% used: ${daily_summary['total_cost']:.2f} / ${daily_summary['budget']:.2f}"))
                    self.data["alerts_triggered"]["daily"][key] = datetime.now().isoformat()
                break
        
        # Check weekly budget
        weekly_pct = weekly_summary["percent_used"]
        for threshold in sorted(thresholds, reverse=True):
            if weekly_pct >= threshold:
                key = f"weekly_{this_week}_{threshold}"
                if key not in self.data["alerts_triggered"]["weekly"]:
                    if threshold >= 100:
                        alerts.append(("CRITICAL", f"🚨 Weekly budget EXCEEDED: ${weekly_summary['total_cost']:.2f} / ${weekly_summary['budget']:.2f} ({weekly_pct:.1f}%)"))
                    elif threshold >= 90:
                        alerts.append(("URGENT", f"🔴 Weekly budget {threshold}% used: ${weekly_summary['total_cost']:.2f} / ${weekly_summary['budget']:.2f}"))
                    elif threshold >= 75:
                        alerts.append(("WARNING", f"🟠 Weekly budget {threshold}% used: ${weekly_summary['total_cost']:.2f} / ${weekly_summary['budget']:.2f}"))
                    else:
                        alerts.append(("NOTICE", f"🟡 Weekly budget {threshold}% used: ${weekly_summary['total_cost']:.2f} / ${weekly_summary['budget']:.2f}"))
                    self.data["alerts_triggered"]["weekly"][key] = datetime.now().isoformat()
                break
        
        if alerts:
            self._save_data()
        
        return alerts
    
    def get_daily_summary(self, date: Optional[str] = None) -> Dict:
        """Get comprehensive summary for a specific date."""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")
        
        entries = [e for e in self.data["entries"] if e["date"] == date]
        
        total_cost = sum(e["cost"] for e in entries)
        total_input = sum(e["input_tokens"] for e in entries)
        total_output = sum(e["output_tokens"] for e in entries)
        total_cached = sum(e["cached_tokens"] for e in entries)
        
        # Model breakdown
        model_breakdown = {}
        for e in entries:
            model = e["model"]
            if model not in model_breakdown:
                model_breakdown[model] = {"cost": 0, "requests": 0, "tokens": 0}
            model_breakdown[model]["cost"] += e["cost"]
            model_breakdown[model]["requests"] += 1
            model_breakdown[model]["tokens"] += e["total_tokens"]
        
        # Operation type breakdown
        operation_breakdown = {}
        for e in entries:
            op_type = e.get("operation_type", "inference")
            if op_type not in operation_breakdown:
                operation_breakdown[op_type] = {"cost": 0, "count": 0}
            operation_breakdown[op_type]["cost"] += e["cost"]
            operation_breakdown[op_type]["count"] += 1
        
        # Hourly breakdown
        hourly_breakdown = {h: 0.0 for h in range(24)}
        for e in entries:
            hour = datetime.fromisoformat(e["timestamp"]).hour
            hourly_breakdown[hour] += e["cost"]
        
        budget = self.data["settings"].get("daily_budget", DEFAULT_DAILY_BUDGET)
        percent_used = (total_cost / budget * 100) if budget > 0 else 0
        
        return {
            "date": date,
            "total_cost": round(total_cost, 4),
            "total_input_tokens": total_input,
            "total_output_tokens": total_output,
            "total_cached_tokens": total_cached,
            "total_tokens": total_input + total_output + total_cached,
            "request_count": len(entries),
            "budget": budget,
            "percent_used": round(percent_used, 2),
            "remaining_budget": round(budget - total_cost, 4),
            "model_breakdown": model_breakdown,
            "operation_breakdown": operation_breakdown,
            "hourly_breakdown": hourly_breakdown
        }
    
    def get_weekly_summary(self, week_start: Optional[str] = None) -> Dict:
        """Get comprehensive summary for a week."""
        if week_start:
            start_date = datetime.strptime(week_start, "%Y-%m-%d").date()
        else:
            # Default to current week (starting Monday)
            today = datetime.now().date()
            start_date = today - timedelta(days=today.weekday())
        
        end_date = start_date + timedelta(days=6)
        
        entries = []
        for e in self.data["entries"]:
            entry_date = datetime.fromisoformat(e["timestamp"]).date()
            if start_date <= entry_date <= end_date:
                entries.append(e)
        
        total_cost = sum(e["cost"] for e in entries)
        total_input = sum(e["input_tokens"] for e in entries)
        total_output = sum(e["output_tokens"] for e in entries)
        total_cached = sum(e["cached_tokens"] for e in entries)
        
        # Daily breakdown
        daily_breakdown = {}
        for i in range(7):
            date = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            daily_breakdown[date] = 0.0
        for e in entries:
            daily_breakdown[e["date"]] = daily_breakdown.get(e["date"], 0) + e["cost"]
        
        # Model breakdown
        model_breakdown = {}
        for e in entries:
            model = e["model"]
            if model not in model_breakdown:
                model_breakdown[model] = {"cost": 0, "requests": 0}
            model_breakdown[model]["cost"] += e["cost"]
            model_breakdown[model]["requests"] += 1
        
        budget = self.data["settings"].get("weekly_budget", DEFAULT_WEEKLY_BUDGET)
        percent_used = (total_cost / budget * 100) if budget > 0 else 0
        
        return {
            "week_start": start_date.strftime("%Y-%m-%d"),
            "week_end": end_date.strftime("%Y-%m-%d"),
            "total_cost": round(total_cost, 4),
            "total_input_tokens": total_input,
            "total_output_tokens": total_output,
            "total_cached_tokens": total_cached,
            "total_tokens": total_input + total_output + total_cached,
            "request_count": len(entries),
            "budget": budget,
            "percent_used": round(percent_used, 2),
            "remaining_budget": round(budget - total_cost, 4),
            "daily_breakdown": daily_breakdown,
            "model_breakdown": model_breakdown
        }
    
    def get_monthly_summary(self, year: Optional[int] = None, month: Optional[int] = None) -> Dict:
        """Get summary for a specific month."""
        if year is None:
            year = datetime.now().year
        if month is None:
            month = datetime.now().month
        
        month_str = f"{year}-{month:02d}"
        entries = [e for e in self.data["entries"] if e["date"].startswith(month_str)]
        
        total_cost = sum(e["cost"] for e in entries)
        total_tokens = sum(e["total_tokens"] for e in entries)
        
        # Daily breakdown
        daily_costs = {}
        for e in entries:
            daily_costs[e["date"]] = daily_costs.get(e["date"], 0) + e["cost"]
        
        return {
            "year": year,
            "month": month,
            "total_cost": round(total_cost, 4),
            "total_tokens": total_tokens,
            "request_count": len(entries),
            "daily_costs": daily_costs
        }
    
    def print_daily_report(self, date: Optional[str] = None):
        """Print formatted daily report."""
        summary = self.get_daily_summary(date)
        date_str = summary["date"]
        
        # Progress bar
        bar_length = 30
        filled = int(bar_length * min(summary["percent_used"] / 100, 1))
        bar = "█" * filled + "░" * (bar_length - filled)
        
        lines = [
            "=" * 60,
            f"📊 OPENCLAW AI COST REPORT - {date_str}",
            "=" * 60,
            "",
            f"💰 Total Cost:     ${summary['total_cost']:.4f}",
            f"📋 Daily Budget:   ${summary['budget']:.2f}",
            f"📈 Budget Used:    [{bar}] {summary['percent_used']:.1f}%",
            f"💵 Remaining:      ${summary['remaining_budget']:.4f}",
            "",
            f"🔢 Total Requests: {summary['request_count']}",
            f"📝 Total Tokens:   {summary['total_tokens']:,}",
            f"   ├─ Input:       {summary['total_input_tokens']:,}",
            f"   ├─ Output:      {summary['total_output_tokens']:,}",
            f"   └─ Cached:      {summary['total_cached_tokens']:,}",
            ""
        ]
        
        # Model breakdown
        if summary["model_breakdown"]:
            lines.append("📊 By Model:")
            for model, stats in sorted(summary["model_breakdown"].items(), 
                                       key=lambda x: -x[1]["cost"]):
                lines.append(f"   {model}:")
                lines.append(f"      Cost: ${stats['cost']:.4f} | Requests: {stats['requests']} | Tokens: {stats['tokens']:,}")
            lines.append("")
        
        # Operation breakdown
        if summary["operation_breakdown"]:
            lines.append("🔧 By Operation Type:")
            for op_type, stats in sorted(summary["operation_breakdown"].items(),
                                         key=lambda x: -x[1]["cost"]):
                lines.append(f"   {op_type}: ${stats['cost']:.4f} ({stats['count']} ops)")
            lines.append("")
        
        # Hourly breakdown
        lines.append("⏰ Hourly Distribution:")
        for hour in range(24):
            cost = summary["hourly_breakdown"][hour]
            if cost > 0:
                bar = "█" * int(cost / max(summary["total_cost"], 0.001) * 20)
                lines.append(f"   {hour:02d}:00 | ${cost:.4f} {bar}")
        
        lines.append("")
        lines.append("💡 Tip: Use Ollama models for zero-cost local inference")
        lines.append("=" * 60)
        
        print("\n".join(lines))
    
    def print_weekly_report(self, week_start: Optional[str] = None):
        """Print formatted weekly report."""
        summary = self.get_weekly_summary(week_start)
        
        # Progress bar
        bar_length = 30
        filled = int(bar_length * min(summary["percent_used"] / 100, 1))
        bar = "█" * filled + "░" * (bar_length - filled)
        
        day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        
        lines = [
            "=" * 60,
            f"📊 OPENCLAW WEEKLY COST REPORT",
            f"   {summary['week_start']} to {summary['week_end']}",
            "=" * 60,
            "",
            f"💰 Total Cost:      ${summary['total_cost']:.4f}",
            f"📋 Weekly Budget:   ${summary['budget']:.2f}",
            f"📈 Budget Used:     [{bar}] {summary['percent_used']:.1f}%",
            f"💵 Remaining:       ${summary['remaining_budget']:.4f}",
            "",
            f"🔢 Total Requests:  {summary['request_count']}",
            f"📝 Total Tokens:    {summary['total_tokens']:,}",
            ""
        ]
        
        # Daily breakdown
        lines.append("📅 Daily Breakdown:")
        for i, (date, cost) in enumerate(summary["daily_breakdown"].items()):
            day_name = day_names[i]
            bar = "█" * int(cost / max(summary["total_cost"], 0.001) * 20) if cost > 0 else ""
            lines.append(f"   {day_name} {date[-5:]} | ${cost:.4f} {bar}")
        lines.append("")
        
        # Model breakdown
        if summary["model_breakdown"]:
            lines.append("📊 By Model:")
            for model, stats in sorted(summary["model_breakdown"].items(),
                                       key=lambda x: -x[1]["cost"]):
                pct = (stats["cost"] / summary["total_cost"] * 100) if summary["total_cost"] > 0 else 0
                lines.append(f"   {model}: ${stats['cost']:.4f} ({stats['requests']} requests, {pct:.1f}%)")
            lines.append("")
        
        lines.append("💡 Tip: Use Ollama models for zero-cost local inference")
        lines.append("=" * 60)
        
        print("\n".join(lines))
    
    def print_status(self):
        """Print current status with alerts."""
        summary = self.get_daily_summary()
        alerts = self._check_budget_alerts()
        
        # Progress bar
        bar_length = 30
        filled = int(bar_length * min(summary["percent_used"] / 100, 1))
        bar = "█" * filled + "░" * (bar_length - filled)
        
        lines = [
            "=" * 50,
            f"🔬 OpenClaw Cost Tracker - {summary['date']}",
            "=" * 50,
            f"💰 Today's Cost: ${summary['total_cost']:.4f}",
            f"📋 Daily Budget: ${summary['budget']:.2f}",
            f"📈 Used:         [{bar}] {summary['percent_used']:.1f}%",
            f"🔢 Requests:     {summary['request_count']}",
            f"📝 Tokens:       {summary['total_tokens']:,}",
            ""
        ]
        
        if alerts:
            lines.append("⚠️  ALERTS:")
            for level, message in alerts:
                lines.append(f"   [{level}] {message}")
            lines.append("")
        
        if summary["model_breakdown"]:
            lines.append("📊 Top Models Today:")
            for model, stats in sorted(summary["model_breakdown"].items(),
                                       key=lambda x: -x[1]["cost"])[:3]:
                lines.append(f"   {model}: ${stats['cost']:.4f}")
            lines.append("")
        
        lines.append("💡 Tip: Use Ollama models for zero-cost inference")
        lines.append("=" * 50)
        
        print("\n".join(lines))
    
    def update_settings(self, daily_budget: Optional[float] = None,
                       weekly_budget: Optional[float] = None,
                       alerts_enabled: Optional[bool] = None):
        """Update tracker settings."""
        if daily_budget is not None:
            self.data["settings"]["daily_budget"] = float(daily_budget)
        if weekly_budget is not None:
            self.data["settings"]["weekly_budget"] = float(weekly_budget)
        if alerts_enabled is not None:
            self.data["settings"]["alerts_enabled"] = bool(alerts_enabled)
        
        self._save_data()
        return self.data["settings"]
    
    def get_settings(self) -> Dict:
        """Get current settings."""
        return self.data["settings"]
    
    def get_recent_entries(self, limit: int = 20) -> List[Dict]:
        """Get recent cost entries."""
        return sorted(self.data["entries"], 
                     key=lambda x: x["timestamp"], 
                     reverse=True)[:limit]
    
    def export_data(self, format: str = "json") -> str:
        """Export data in specified format."""
        if format == "json":
            return json.dumps(self.data, indent=2)
        elif format == "csv":
            import csv
            import io
            output = io.StringIO()
            if self.data["entries"]:
                writer = csv.DictWriter(output, fieldnames=self.data["entries"][0].keys())
                writer.writeheader()
                writer.writerows(self.data["entries"])
            return output.getvalue()
        else:
            raise ValueError(f"Unsupported format: {format}")


def main():
    parser = argparse.ArgumentParser(
        description="OpenClaw Cost Tracker - Track AI usage and costs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Log a cost entry
  openclaw-cost-tracker.py log moonshot/kimi-k2.5 1000 500 "Task description"
  
  # View today's status
  openclaw-cost-tracker.py status
  
  # Daily report
  openclaw-cost-tracker.py daily
  
  # Weekly report
  openclaw-cost-tracker.py weekly
  
  # Update budget settings
  openclaw-cost-tracker.py settings --daily-budget 20.00 --weekly-budget 100.00
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Log command
    log_parser = subparsers.add_parser("log", help="Log a cost entry")
    log_parser.add_argument("model", help="Model name (e.g., moonshot/kimi-k2.5)")
    log_parser.add_argument("input_tokens", type=int, help="Number of input tokens")
    log_parser.add_argument("output_tokens", type=int, help="Number of output tokens")
    log_parser.add_argument("task", help="Task description")
    log_parser.add_argument("--cached-tokens", type=int, default=0, help="Cached tokens")
    log_parser.add_argument("--operation-type", default="inference", 
                           help="Type of operation")
    
    # Status command
    subparsers.add_parser("status", help="Show current status")
    
    # Daily report
    daily_parser = subparsers.add_parser("daily", help="Show daily report")
    daily_parser.add_argument("--date", help="Date (YYYY-MM-DD), defaults to today")
    
    # Weekly report
    weekly_parser = subparsers.add_parser("weekly", help="Show weekly report")
    weekly_parser.add_argument("--start", help="Week start date (YYYY-MM-DD)")
    
    # Monthly report
    monthly_parser = subparsers.add_parser("monthly", help="Show monthly report")
    monthly_parser.add_argument("--year", type=int, help="Year")
    monthly_parser.add_argument("--month", type=int, help="Month (1-12)")
    
    # Settings
    settings_parser = subparsers.add_parser("settings", help="Update settings")
    settings_parser.add_argument("--daily-budget", type=float, help="Daily budget in USD")
    settings_parser.add_argument("--weekly-budget", type=float, help="Weekly budget in USD")
    settings_parser.add_argument("--alerts-enabled", type=lambda x: x.lower() == "true",
                                help="Enable/disable alerts (true/false)")
    settings_parser.add_argument("--show", action="store_true", help="Show current settings")
    
    # Recent entries
    recent_parser = subparsers.add_parser("recent", help="Show recent entries")
    recent_parser.add_argument("--limit", type=int, default=20, help="Number of entries")
    
    # Export
    export_parser = subparsers.add_parser("export", help="Export data")
    export_parser.add_argument("--format", choices=["json", "csv"], default="json",
                              help="Export format")
    export_parser.add_argument("--output", help="Output file (default: stdout)")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    tracker = OpenClawCostTracker()
    
    if args.command == "log":
        result = tracker.log_cost(
            model=args.model,
            input_tokens=args.input_tokens,
            output_tokens=args.output_tokens,
            task=args.task,
            cached_tokens=args.cached_tokens,
            operation_type=args.operation_type
        )
        entry = result["entry"]
        print(f"✅ Logged: ${entry['cost']:.6f} for {entry['task']}")
        print(f"   Model: {entry['model']}")
        print(f"   Tokens: {entry['input_tokens']:,} in / {entry['output_tokens']:,} out")
        if result["alerts"]:
            print("\n⚠️  ALERTS:")
            for level, message in result["alerts"]:
                print(f"   [{level}] {message}")
    
    elif args.command == "status":
        tracker.print_status()
    
    elif args.command == "daily":
        tracker.print_daily_report(args.date)
    
    elif args.command == "weekly":
        tracker.print_weekly_report(args.start)
    
    elif args.command == "monthly":
        summary = tracker.get_monthly_summary(args.year, args.month)
        print(f"📊 Monthly Report: {summary['year']}-{summary['month']:02d}")
        print(f"   Total Cost: ${summary['total_cost']:.4f}")
        print(f"   Total Tokens: {summary['total_tokens']:,}")
        print(f"   Requests: {summary['request_count']}")
    
    elif args.command == "settings":
        if args.show:
            settings = tracker.get_settings()
            print("Current Settings:")
            print(f"  Daily Budget: ${settings['daily_budget']:.2f}")
            print(f"  Weekly Budget: ${settings['weekly_budget']:.2f}")
            print(f"  Alerts Enabled: {settings['alerts_enabled']}")
            print(f"  Alert Thresholds: {settings['alert_thresholds']}")
        else:
            settings = tracker.update_settings(
                daily_budget=args.daily_budget,
                weekly_budget=args.weekly_budget,
                alerts_enabled=args.alerts_enabled
            )
            print("✅ Settings updated")
            print(f"  Daily Budget: ${settings['daily_budget']:.2f}")
            print(f"  Weekly Budget: ${settings['weekly_budget']:.2f}")
    
    elif args.command == "recent":
        entries = tracker.get_recent_entries(args.limit)
        print(f"📜 Recent {len(entries)} Entries:")
        print("-" * 80)
        for entry in entries:
            ts = datetime.fromisoformat(entry["timestamp"]).strftime("%Y-%m-%d %H:%M:%S")
            print(f"{ts} | ${entry['cost']:.4f} | {entry['model']}")
            print(f"   Task: {entry['task']}")
            print(f"   Tokens: {entry['input_tokens']:,} in / {entry['output_tokens']:,} out")
            print()
    
    elif args.command == "export":
        data = tracker.export_data(args.format)
        if args.output:
            with open(args.output, 'w') as f:
                f.write(data)
            print(f"✅ Exported to {args.output}")
        else:
            print(data)


if __name__ == "__main__":
    main()
