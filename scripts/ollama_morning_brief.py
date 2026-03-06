#!/usr/bin/env python3
"""
Ollama-based Morning Brief generator
Zero token cost - runs entirely local
"""

import json
import subprocess
from datetime import datetime

OLLAMA_MODEL = "llama3.2:latest"

def ollama_generate(prompt, system=None):
    """Call Ollama for generation."""
    cmd = ["/opt/homebrew/bin/ollama", "run", OLLAMA_MODEL]
    full_prompt = f"{system}\n\n{prompt}" if system else prompt
    try:
        result = subprocess.run(
            cmd,
            input=full_prompt,
            capture_output=True,
            text=True,
            timeout=60
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def get_weather():
    """Fetch weather via wttr.in (free, no API key)."""
    try:
        import urllib.request
        with urllib.request.urlopen("https://wttr.in/?format=%C+%t+%w", timeout=10) as response:
            return response.read().decode('utf-8').strip()
    except:
        return "Weather data unavailable"

def generate_morning_brief():
    """Generate complete morning brief using Ollama."""
    
    weather = get_weather()
    date_str = datetime.now().strftime("%A, %B %d, %Y")
    
    system_prompt = """You are a concise morning briefing assistant. Create a brief, professional morning summary.
Format:
- Date
- Weather
- 2-3 key market trends (if available)
- 1 important news item
- 1 actionable insight
Keep it under 150 words."""

    prompt = f"""Generate a morning brief for {date_str}.

Weather: {weather}

Create a professional morning brief with:
1. Weather summary
2. Key market trends (general knowledge)
3. One important headline
4. One actionable insight for the day

Be concise and actionable."""

    brief = ollama_generate(prompt, system=system_prompt)
    
    return {
        "date": date_str,
        "weather": weather,
        "brief": brief,
        "generated_at": datetime.now().isoformat(),
        "model": OLLAMA_MODEL
    }

if __name__ == "__main__":
    result = generate_morning_brief()
    print(json.dumps(result, indent=2))
