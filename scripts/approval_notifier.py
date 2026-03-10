#!/usr/bin/env python3
"""
Exec Approval iMessage Notifier
Monitors for pending exec approvals and sends iMessage notifications
"""

import json
import socket
import struct
import sys
import subprocess
import time
import os
from pathlib import Path

# Config
SOCK_PATH = "/Users/daytrons/.openclaw/exec-approvals.sock"
IMSG_TARGET = "+19092979578"  # Your iMessage number
STATE_FILE = "/Users/daytrons/.openclaw/.approval_notifier_state.json"

def send_imessage(message):
    """Send iMessage using the imsg CLI"""
    try:
        # Use the imsg skill if available, otherwise use osascript
        result = subprocess.run(
            ["imsg", "send", IMSG_TARGET, message],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return True
    except:
        pass
    
    # Fallback to osascript
    try:
        script = f'''
        tell application "Messages"
            set targetService to 1st service whose service type = iMessage
            set targetBuddy to buddy "{IMSG_TARGET}" of targetService
            send "{message}" to targetBuddy
        end tell
        '''
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode == 0
    except Exception as e:
        print(f"Failed to send iMessage: {e}")
        return False

def get_pending_approvals():
    """Query the exec approval socket for pending approvals"""
    try:
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.settimeout(5)
        sock.connect(SOCK_PATH)
        
        # Send query request
        request = {"action": "list", "agentId": "main"}
        request_bytes = json.dumps(request).encode()
        sock.sendall(struct.pack("!I", len(request_bytes)) + request_bytes)
        
        # Read response
        sock.settimeout(10)
        size_data = sock.recv(4)
        if len(size_data) != 4:
            return []
        
        size = struct.unpack("!I", size_data)[0]
        response_data = b""
        while len(response_data) < size:
            chunk = sock.recv(min(4096, size - len(response_data)))
            if not chunk:
                break
            response_data += chunk
        
        sock.close()
        
        response = json.loads(response_data.decode())
        return response.get("pending", [])
    except Exception as e:
        print(f"Error querying approvals: {e}")
        return []

def load_state():
    """Load previously notified approval IDs"""
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
    except:
        pass
    return {"notified": []}

def save_state(state):
    """Save notified approval IDs"""
    try:
        with open(STATE_FILE, 'w') as f:
            json.dump(state, f)
    except Exception as e:
        print(f"Error saving state: {e}")

def main():
    state = load_state()
    pending = get_pending_approvals()
    
    if not pending:
        print("No pending approvals")
        return
    
    new_approvals = []
    for approval in pending:
        approval_id = approval.get("id")
        if approval_id and approval_id not in state["notified"]:
            new_approvals.append(approval)
            state["notified"].append(approval_id)
    
    if not new_approvals:
        print("No new approvals to notify")
        return
    
    # Send iMessage for each new approval
    for approval in new_approvals:
        command = approval.get("command", "Unknown command")
        host = approval.get("host", "unknown")
        security = approval.get("security", "unknown")
        
        message = f"""🔐 OpenClaw Approval Required

Command: {command[:100]}{'...' if len(command) > 100 else ''}
Host: {host}
Security: {security}

Reply with:
• "approve" to allow once
• "approve always" to allow always  
• "deny" to reject

Or approve in dashboard: http://127.0.0.1:18789"""
        
        if send_imessage(message):
            print(f"Sent notification for approval: {approval.get('id')}")
        else:
            print(f"Failed to send notification for approval: {approval.get('id')}")
    
    save_state(state)

if __name__ == "__main__":
    main()
