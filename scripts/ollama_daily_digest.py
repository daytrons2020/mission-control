#!/usr/bin/env python3
"""
Ollama-based Daily Digest generator
Zero token cost
"""
import subprocess
import json
from datetime import datetime

def ollama_generate(prompt, system=None, timeout=45):
    cmd = ["/opt/homebrew/bin/ollama", "run", "llama3.2:latest"]
    full = f"{system}\n\n{prompt}" if system else prompt
    try:
        r = subprocess.run(cmd, input=full, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def generate_daily_digest(market_data=None):
    """Generate daily trading digest."""
    
    # Default mock data if none provided
    if not market_data:
        market_data = {
            "spy_change": "+1.2%",
            "qqq_change": "+0.8%",
            "notable": "Tech rally, Fed speech tomorrow",
            "portfolio_change": "+1.5%"
        }
    
    system = "You are a trading assistant. Create concise, actionable daily digests."
    
    prompt = f"""Create a daily trading digest:

Market Close:
- SPY: {market_data['spy_change']}
- QQQ: {market_data['qqq_change']}
- Portfolio: {market_data['portfolio_change']}

Notable Events: {market_data['notable']}

Format with 3 sections:
1. Market Update (1 sentence)
2. Key Events (1-2 bullets)
3. Action Items (1 actionable item)

Keep under 100 words."""

    digest = ollama_generate(prompt, system)
    
    return {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "digest": digest,
        "data": market_data,
        "generated_at": datetime.now().isoformat(),
        "model": "llama3.2:latest"
    }

if __name__ == "__main__":
    result = generate_daily_digest()
    print(json.dumps(result, indent=2))
