#!/usr/bin/env python3
"""Cleanup old digest entries from MEMORY_INDEX.json"""
import json
import os
from datetime import datetime, timedelta

base = "/Users/daytrons/.openclaw/workspace"
index_path = os.path.join(base, "MEMORY_INDEX.json")
retention_days = 90

cutoff = datetime.now() - timedelta(days=retention_days)

if not os.path.exists(index_path):
    print("No index to clean.")
    exit(0)

try:
    with open(index_path, 'r') as f:
        index = json.load(f)
except:
    index = []

new_index = []
removed = 0

for entry in index:
    try:
        entry_date = datetime.fromisoformat(entry.get('timestamp', entry.get('date', '2000-01-01')))
        if entry_date > cutoff:
            new_index.append(entry)
        else:
            removed += 1
            # Remove associated digest file if exists
            digest_path = entry.get('digest_path')
            if digest_path and os.path.exists(digest_path):
                os.remove(digest_path)
    except:
        new_index.append(entry)

with open(index_path, 'w') as f:
    json.dump(new_index, f, indent=2)

print(f"Cleanup complete. Retained {len(new_index)} entries, removed {removed}.")
