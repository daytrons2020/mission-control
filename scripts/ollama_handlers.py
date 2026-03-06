#!/usr/bin/env python3
"""
Ollama-based handlers for high-frequency, low-complexity tasks.
Zero token cost - runs entirely local.
"""

import json
import subprocess
import sys
from datetime import datetime

OLLAMA_MODEL = "llama3.2:latest"

def ollama_generate(prompt, system=None):
    """Call Ollama for simple generation tasks."""
    cmd = ["/opt/homebrew/bin/ollama", "run", OLLAMA_MODEL]
    full_prompt = f"{system}\n\n{prompt}" if system else prompt
    try:
        result = subprocess.run(
            cmd,
            input=full_prompt,
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def price_threshold_check(current_price, threshold, direction="above"):
    """Simple threshold check - no AI needed, pure logic."""
    if direction == "above" and current_price > threshold:
        return {"alert": True, "message": f"Price ${current_price} above threshold ${threshold}"}
    elif direction == "below" and current_price < threshold:
        return {"alert": True, "message": f"Price ${current_price} below threshold ${threshold}"}
    return {"alert": False}

def format_cost_report(usage_data):
    """Format cost data into readable report using Ollama for summary."""
    prompt = f"""Given this token usage data, create a brief 2-line summary:
{json.dumps(usage_data, indent=2)}

Format: "Total: $X.XX | Model: $Y.YY | Efficiency: Z%"
"""
    return ollama_generate(prompt, system="You are a cost reporting assistant. Be concise.")

def gateway_health_check():
    """Check if gateway is responding - pure system call."""
    try:
        result = subprocess.run(
            ["openclaw", "gateway", "status"],
            capture_output=True,
            text=True,
            timeout=10
        )
        return {"status": "OK" if result.returncode == 0 else "ERROR", "details": result.stdout}
    except Exception as e:
        return {"status": "ERROR", "details": str(e)}

def update_memory_index(digest_entry):
    """Update memory index with new entry - data operation only."""
    base_path = "/Users/daytrons/.openclaw/workspace"
    index_path = f"{base_path}/MEMORY_INDEX.json"
    
    try:
        with open(index_path, 'r') as f:
            index = json.load(f)
    except:
        index = []
    
    index.append(digest_entry)
    
    # Keep only last 90 days
    cutoff = datetime.now().timestamp() - (90 * 24 * 3600)
    index = [e for e in index if datetime.fromisoformat(e.get('timestamp', '2000-01-01')).timestamp() > cutoff]
    
    with open(index_path, 'w') as f:
        json.dump(index, f, indent=2)
    
    return {"status": "updated", "entries": len(index)}

def simple_alert_format(ticker, price, change_pct):
    """Format a simple price alert - uses Ollama for natural language."""
    prompt = f"Create a one-line alert: {ticker} at ${price} ({change_pct:+.2f}%)"
    return ollama_generate(prompt, system="You are a trading alert assistant. Be brief and professional.")

if __name__ == "__main__":
    # Test handlers
    print("Testing Ollama handlers...")
    
    # Test 1: Price threshold
    result = price_threshold_check(150.50, 150.00, "above")
    print(f"Threshold check: {result}")
    
    # Test 2: Cost report format
    test_data = {"total": 0.14, "models": {"kimi": 0.08, "minimax": 0.06}}
    print(f"Cost report: {format_cost_report(test_data)}")
    
    # Test 3: Simple alert
    print(f"Alert format: {simple_alert_format('SPY', 450.25, 2.5)}")
    
    print("Handlers ready.")
