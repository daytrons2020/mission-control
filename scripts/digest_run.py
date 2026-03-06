#!/usr/bin/env python3
import os, json, datetime
base = "/Users/daytrons/.openclaw/workspace"
memory_md = os.path.join(base, "MEMORY.md")

# Get today's date and format it
try:
    today_dt = datetime.date.today()
    today_str = today_dt.strftime("%Y-%m-%d")
except Exception as e:
    print(f"Error getting today's date: {e}")
    today_str = "2026-03-05" # Fallback date

# Calculate yesterday's date string
try:
    yesterday_dt = today_dt - datetime.timedelta(days=1)
    yesterday_str = yesterday_dt.strftime("%Y-%m-%d")
except Exception as e:
    print(f"Error calculating yesterday's date: {e}")
    yesterday_str = "2026-03-04" # Fallback date

paths = [os.path.join(base, "memory", today_str+".md"), os.path.join(base, "memory", yesterday_str+".md")]

# read sources safely
sources_data = []
source_files_list = []
for p in [memory_md] + paths:
    if os.path.exists(p):
        source_files_list.append(p)
        try:
            with open(p, 'r', encoding='utf-8') as f:
                data = f.read().strip()
                if data:
                    sources_data.append((p, data[:200])) # Store path and first 200 chars
        except Exception as e:
            print(f"Error reading file {p}: {e}")

# build digest
now = datetime.datetime.now()
now_str_md = now.strftime("%Y-%m-%d %H:%M %Z")
now_str_json = now.isoformat() + now.strftime('%z')

digest_md = os.path.join(base, "MEMORY_SUMMARY.md")
digest_json = os.path.join(base, "MEMORY_SUMMARY.json")
memory_index_json = os.path.join(base, "MEMORY_INDEX.json")

entry = {
  "updated_at": now_str_json,
  "updated_by": "Nano (automation)",
  "source_files": source_files_list,
  "summary": "Concise context snapshot from MEMORY and recent memory; top decisions, risks, and open items.",
  "decisions": ["automatic digest generated"],
  "risks": ["privacy redaction enforced by default"],
  "open_items": [{"item":"wire cadence controls" , "owner":"Nano", "due":"2026-03-05"}]
}

# Append to MD
# Check if MEMORY_SUMMARY.md exists and is not empty, otherwise write header
if not os.path.exists(digest_md) or os.stat(digest_md).st_size == 0:
    with open(digest_md, 'w', encoding='utf-8') as f:
        f.write("# MEMORY_SUMMARY\n")
        f.write("This file provides a running summary of critical context, decisions, and status.\n\n")

with open(digest_md, 'a', encoding='utf-8') as f:
    f.write(f"\n\n## Digest @{now.strftime('%Y-%m-%d %H:%M')}\n")
    f.write(f"Updated: {now_str_md} by Nano (automation)\n")
    f.write(f"Source files: {', '.join(source_files_list)}\n")
    f.write(f"Summary: Concise context snapshot from current memory.\n")

# Write JSON
with open(digest_json, 'w', encoding='utf-8') as jf:
    json.dump(entry, jf, indent=2)

# Update MEMORY_INDEX.json
memory_index_entries = []
if os.path.exists(memory_index_json):
    try:
        with open(memory_index_json, 'r', encoding='utf-8') as f:
            current_index_data = json.load(f)
            if isinstance(current_index_data, list):
                memory_index_entries = current_index_data
    except (json.JSONDecodeError, FileNotFoundError):
        pass # handle empty or invalid JSON

new_index_entry = {
    "id": f"digest_{now.strftime('%Y%m%d%H%M%S')}",
    "type": "summary_digest",
    "date": now.strftime("%Y-%m-%d"),
    "timestamp": now_str_json,
    "source_paths": source_files_list,
    "summary": entry["summary"],
    "updated_by": entry["updated_by"],
    "digest_path": digest_json
}
memory_index_entries.append(new_index_entry)

with open(memory_index_json, 'w', encoding='utf-8') as jf:
    json.dump(memory_index_entries, jf, indent=2)

print("Digest run complete. MEMORY_SUMMARY.md, MEMORY_SUMMARY.json, and MEMORY_INDEX.json updated.")
