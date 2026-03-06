#!/usr/bin/env python3
"""
Agent Communication Layer
File-based messaging system for agent coordination
"""

import json
import os
from datetime import datetime
from pathlib import Path

BASE_DIR = "/Users/daytrons/.openclaw/workspace/mission_control"
INBOX_DIR = f"{BASE_DIR}/inbox"
OUTBOX_DIR = f"{BASE_DIR}/outbox"

def ensure_dirs():
    Path(INBOX_DIR).mkdir(parents=True, exist_ok=True)
    Path(OUTBOX_DIR).mkdir(parents=True, exist_ok=True)

def send_message(to_agent, from_agent, message_type, content, priority="normal"):
    """Send a message to another agent."""
    ensure_dirs()
    
    msg = {
        "id": f"msg_{int(datetime.now().timestamp() * 1000)}",
        "to": to_agent,
        "from": from_agent,
        "type": message_type,
        "content": content,
        "priority": priority,
        "timestamp": datetime.now().isoformat(),
        "read": False
    }
    
    # Write to recipient's inbox
    inbox_file = f"{INBOX_DIR}/{to_agent}.jsonl"
    with open(inbox_file, 'a') as f:
        f.write(json.dumps(msg) + '\n')
    
    # Also write to sender's outbox
    outbox_file = f"{OUTBOX_DIR}/{from_agent}.jsonl"
    with open(outbox_file, 'a') as f:
        f.write(json.dumps(msg) + '\n')
    
    print(f"[COMMS] Message sent: {from_agent} -> {to_agent} [{message_type}]")
    return msg['id']

def get_messages(agent_id, unread_only=False):
    """Get messages for an agent."""
    ensure_dirs()
    
    inbox_file = f"{INBOX_DIR}/{agent_id}.jsonl"
    if not os.path.exists(inbox_file):
        return []
    
    messages = []
    with open(inbox_file, 'r') as f:
        for line in f:
            if line.strip():
                msg = json.loads(line)
                if not unread_only or not msg.get('read', False):
                    messages.append(msg)
    
    return messages

def mark_read(agent_id, message_id):
    """Mark a message as read."""
    inbox_file = f"{INBOX_DIR}/{agent_id}.jsonl"
    if not os.path.exists(inbox_file):
        return False
    
    lines = []
    found = False
    with open(inbox_file, 'r') as f:
        for line in f:
            if line.strip():
                msg = json.loads(line)
                if msg['id'] == message_id:
                    msg['read'] = True
                    found = True
                lines.append(json.dumps(msg))
    
    with open(inbox_file, 'w') as f:
        f.write('\n'.join(lines) + '\n')
    
    return found

def broadcast(from_agent, message_type, content, priority="normal"):
    """Broadcast to all agents."""
    agents_file = f"{BASE_DIR}/agents.json"
    try:
        with open(agents_file, 'r') as f:
            agents = json.load(f)
        
        for agent_id in agents.get('agents', {}).keys():
            if agent_id != from_agent:
                send_message(agent_id, from_agent, message_type, content, priority)
    except:
        pass

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "send":
            to_agent = sys.argv[2]
            from_agent = sys.argv[3]
            content = sys.argv[4]
            send_message(to_agent, from_agent, "text", content)
        elif sys.argv[1] == "inbox":
            agent_id = sys.argv[2]
            messages = get_messages(agent_id, unread_only=True)
            for msg in messages:
                print(f"[{msg['from']}] {msg['content'][:100]}")
    else:
        print("Usage: comms.py [send|inbox]")
