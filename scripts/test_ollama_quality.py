#!/usr/bin/env python3
"""Test Ollama on Twitter research, weekly report, daily digest"""
import subprocess

def ollama_generate(prompt, system=None, timeout=60):
    cmd = ["ollama", "run", "llama3.2:latest"]
    full = f"{system}\n\n{prompt}" if system else prompt
    try:
        r = subprocess.run(cmd, input=full, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

# Test 1: Twitter Research (trending topics summary)
print("=== TWITTER RESEARCH TEST ===")
twitter_prompt = """Summarize trending topics in tech/stocks for today:
- AI developments
- Market movers
- Key earnings
Format: 3 bullet points, max 20 words each."""
print(ollama_generate(twitter_prompt, "You are a social media analyst. Be concise.", timeout=30))
print()

# Test 2: Daily Digest (portfolio/market summary)
print("=== DAILY DIGEST TEST ===")
digest_prompt = """Create a daily trading digest:
- Market close: SPY +1.2%, QQQ +0.8%
- Notable: Tech rally, Fed speech tomorrow
- Action: Review stops
Format: 3 sections, 1 sentence each."""
print(ollama_generate(digest_prompt, "You are a trading assistant. Be brief and actionable.", timeout=30))
print()

# Test 3: Weekly Report (portfolio performance)
print("=== WEEKLY REPORT TEST ===")
weekly_prompt = """Generate weekly trading report:
- Week: SPY +2.1%, QQQ +1.5%, portfolio +1.8%
- Best trade: AAPL calls +15%
- Worst: TSLA puts -8%
- Lesson: Stick to plan
Format: Summary + 2 insights."""
print(ollama_generate(weekly_prompt, "You are a portfolio analyst. Professional tone.", timeout=30))
