#!/usr/bin/env python3
"""
Discord slash command handler for Mission Control CLI
Allows /mc command in Discord
"""

import json
import subprocess
import sys

def handle_command(command_text):
    """Handle Mission Control command from Discord."""
    # Run the CLI and capture output
    result = subprocess.run(
        ['python3', '/Users/daytrons/.openclaw/workspace/mission_control/mc_cli.py'] + command_text.split(),
        capture_output=True,
        text=True,
        timeout=30
    )
    return result.stdout or result.stderr or "Command executed."

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = " ".join(sys.argv[1:])
        print(handle_command(cmd))
    else:
        print("Usage: mc_discord.py <command>")
