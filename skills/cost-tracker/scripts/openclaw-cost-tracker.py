#!/usr/bin/env python3
"""
OpenClaw Token Cost Tracker
Tracks API token usage and costs for OpenClaw operations.
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path

DATA_DIR = Path.home() / ".openclaw" / "cost-tracker"
DATA_FILE = DATA_DIR / "openclaw-costs.json"

# Model pricing per 1M tokens (USD)
MODEL_PRICING = {
    "moonshot/kimi-k2.5": {"input": 0.50, "output": 2.00, "cached_input": 0.25},
    "ollama/qwen3:8b": {"input": 0.00, "output": 0.00, "cached_input": 0.00},
    "openrouter/auto": {"input": 0.30, "output": 1.20, "cached_input": 0.15},
}

DEFAULT_DAILY_BUDGET = 10.00

def ensure_data_dir():
    """Ensure data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DATA_FILE.exists():
        save_data({"entries": [], "daily_budget": DEFAULT_DAILY_BUDGET})

def load_data():
    """Load cost data from file."""
    ensure_data_dir()
    with open(DATA_FILE, 'r') as f:
        return json.load(f)

def save_data(data):
    """Save cost data to file."""
    ensure_data_dir()
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def calculate_cost(model, input_tokens, output_tokens, cached_tokens=0):
    """Calculate cost for a request."""
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["moonshot/kimi-k2.5"])
    
    # Convert to millions
    input_m = input_tokens / 1_000_000
    output_m = output_tokens / 1_000_000
    cached_m = cached_tokens / 1_000_000
    
    cost = (input_m * pricing["input"] + 
            output_m * pricing["output"] +
            cached_m * pricing["cached_input"])
    
    return round(cost, 4)

def add_entry(model, input_tokens, output_tokens, task, cached_tokens=0):
    """Add a new cost entry."""
    data = load_data()
    
    cost = calculate_cost(model, input_tokens, output_tokens, cached_tokens)
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "date": datetime.now().strftime("%Y-%m-%d"),
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cached_tokens": cached_tokens,
        "cost": cost,
        "task": task
    }
    
    data["entries"].append(entry)
    save_data(data)
    
    return entry

def get_daily_summary(date=None):
    """Get summary for a specific date."""
    if date is None:
        date = datetime.now().strftime("%Y-%m-%d")
    
    data = load_data()
    entries = [e for e in data["entries"] if e["date"] == date]
    
    total_cost = sum(e["cost"] for e in entries)
    total_input = sum(e["input_tokens"] for e in entries)
    total_output = sum(e["output_tokens"] for e in entries)
    total_cached = sum(e["cached_tokens"] for e in entries)
    
    model_breakdown = {}
    for e in entries:
        model = e["model"]
        if model not in model_breakdown:
            model_breakdown[model] = {"cost": 0, "requests": 0}
        model_breakdown[model]["cost"] += e["cost"]
        model_breakdown[model]["requests"] += 1
    
    budget = data.get("daily_budget", DEFAULT_DAILY_BUDGET)
    percent_used = (total_cost / budget * 100) if budget > 0 else 0
    
    return {
        "date": date,
        "total_cost": round(total_cost, 4),
        "total_input_tokens": total_input,
        "total_output_tokens": total_output,
        "total_cached_tokens": total_cached,
        "request_count": len(entries),
        "budget": budget,
        "percent_used": round(percent_used, 2),
        "model_breakdown": model_breakdown
    }

def check_alerts():
    """Check if any budget alerts should trigger."""
    summary = get_daily_summary()
    percent = summary["percent_used"]
    
    alerts = []
    if percent >= 100:
        alerts.append(("CRITICAL", f"Budget exceeded! ${summary['total_cost']:.2f} / ${summary['budget']:.2f}"))
    elif percent >= 90:
        alerts.append(("URGENT", f"90% budget used: ${summary['total_cost']:.2f} / ${summary['budget']:.2f}"))
    elif percent >= 75:
        alerts.append(("WARNING", f"75% budget used: ${summary['total_cost']:.2f} / ${summary['budget']:.2f}"))
    elif percent >= 50:
        alerts.append(("NOTICE", f"50% budget used: ${summary['total_cost']:.2f} / ${summary['budget']:.2f}"))
    
    return alerts

def print_status():
    """Print current cost status."""
    summary = get_daily_summary()
    alerts = check_alerts()
    
    print("=" * 50)
    print(f"📊 OpenClaw Cost Tracker - {summary['date']}")
    print("=" * 50)
    print(f"💰 Total Cost: ${summary['total_cost']:.4f}")
    print(f"📋 Budget: ${summary['budget']:.2f}")
    print(f"📈 Used: {summary['percent_used']:.1f}%")
    print(f"🔢 Requests: {summary['request_count']}")
    print(f"📝 Tokens: {summary['total_input_tokens']:,} in / {summary['total_output_tokens']:,} out")
    print()
    
    if alerts:
        print("⚠️  ALERTS:")
        for level, message in alerts:
            print(f"   [{level}] {message}")
        print()
    
    if summary["model_breakdown"]:
        print("📊 Model Breakdown:")
        for model, stats in summary["model_breakdown"].items():
            print(f"   {model}: ${stats['cost']:.4f} ({stats['requests']} requests)")
        print()
    
    print("💡 Tip: Use Ollama models for zero-cost inference")
    print("=" * 50)

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print_status()
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "add":
        if len(sys.argv) < 6:
            print("Usage: cost-tracker.py add <model> <input_tokens> <output_tokens> <task>")
            sys.exit(1)
        model = sys.argv[2]
        input_t = int(sys.argv[3])
        output_t = int(sys.argv[4])
        task = sys.argv[5]
        entry = add_entry(model, input_t, output_t, task)
        print(f"✅ Added: ${entry['cost']:.4f} for {task}")
    
    elif cmd == "status":
        print_status()
    
    elif cmd == "alerts":
        alerts = check_alerts()
        if alerts:
            for level, message in alerts:
                print(f"[{level}] {message}")
        else:
            print("✅ No alerts")
    
    else:
        print(f"Unknown command: {cmd}")
        print("Commands: add, status, alerts")
