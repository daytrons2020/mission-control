#!/bin/bash
# Log Rotation Script for Mission Control Platform
# Rotates logs when they exceed 50KB, keeps last 5 rotations

LOG_DIR="/Users/daytrons/.openclaw/workspace/logs"
MAX_SIZE=51200  # 50KB in bytes
MAX_ROTATIONS=5

rotate_log() {
    local log_file="$1"
    local base_name=$(basename "$log_file" .log)
    
    # Shift existing rotations
    for i in $(seq $((MAX_ROTATIONS - 1)) -1 1); do
        if [ -f "${log_file}.${i}" ]; then
            mv "${log_file}.${i}" "${log_file}.$((i + 1))"
        fi
    done
    
    # Rotate current log
    if [ -f "$log_file" ]; then
        mv "$log_file" "${log_file}.1"
        touch "$log_file"
        echo "$(date '+%Y-%m-%d %H:%M:%S') - Log rotated: ${base_name}.log" >> "$log_file"
    fi
}

# Check each log file
for log_file in "$LOG_DIR"/*.log; do
    if [ -f "$log_file" ]; then
        file_size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null)
        
        if [ "$file_size" -gt "$MAX_SIZE" ]; then
            echo "Rotating: $(basename "$log_file") (${file_size} bytes)"
            rotate_log "$log_file"
        fi
    fi
done

# Clean up old rotations beyond MAX_ROTATIONS
for log_file in "$LOG_DIR"/*.log.*; do
    if [ -f "$log_file" ]; then
        rotation_num=$(echo "$log_file" | sed 's/.*\.log\.//')
        if [ "$rotation_num" -gt "$MAX_ROTATIONS" ]; then
            rm "$log_file"
            echo "Removed old rotation: $(basename "$log_file")"
        fi
    fi
done 2>/dev/null

echo "$(date '+%Y-%m-%d %H:%M:%S') - Log rotation complete"
