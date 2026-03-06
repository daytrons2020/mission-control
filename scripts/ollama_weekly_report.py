#!/usr/bin/env python3
"""
Ollama-based Weekly Report generator
Zero token cost
"""
import subprocess
import json
from datetime import datetime

def ollama_generate(prompt, system=None, timeout=60):
    cmd = ["ollama", "run", "llama3.2:latest"]
    full = f"{system}\n\n{prompt}" if system else prompt
    try:
        r = subprocess.run(cmd, input=full, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def generate_weekly_report(week_data=None):
    """Generate weekly trading report."""
    
    if not week_data:
        week_data = {
            "spy": "+2.1%",
            "qqq": "+1.5%",
            "portfolio": "+1.8%",
            "best_trade": "AAPL calls +15%",
            "worst_trade": "TSLA puts -8%",
            "lesson": "Stick to plan"
        }
    
    system = "You are a portfolio analyst. Create professional weekly reports with insights."
    
    prompt = f"""Generate weekly trading report:

Performance:
- SPY: {week_data['spy']}
- QQQ: {week_data['qqq']}
- Portfolio: {week_data['portfolio']}

Trades:
- Best: {week_data['best_trade']}
- Worst: {week_data['worst_trade']}

Lesson: {week_data['lesson']}

Format:
1. Brief summary (2 sentences)
2. 2 key insights with bullet points

Professional tone, max 150 words."""

    report = ollama_generate(prompt, system)
    
    return {
        "week_ending": datetime.now().strftime("%Y-%m-%d"),
        "report": report,
        "data": week_data,
        "generated_at": datetime.now().isoformat(),
        "model": "llama3.2:latest"
    }

if __name__ == "__main__":
    result = generate_weekly_report()
    print(json.dumps(result, indent=2))
