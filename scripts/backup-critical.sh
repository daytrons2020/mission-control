#!/bin/bash
# Automated Backup Script for Mission Control Platform
# Backs up critical files daily, keeps last 7 days

WORKSPACE="/Users/daytrons/.openclaw/workspace"
BACKUP_DIR="$WORKSPACE/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mission_control_backup_$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Critical files and directories to backup
CRITICAL_PATHS=(
    "memory/"
    "agents/"
    "memory.json"
    "MEMORY.md"
    "MEMORY_INDEX.json"
    "MEMORY_SUMMARY.json"
    "logs/"
    "zero-token-cron/"
    "config/"
    "AGENTS.md"
    "HEARTBEAT.md"
    "PROACTIVE_CONFIG.md"
    "SOUL.md"
    "IDENTITY.md"
    "USER.md"
    "TOOLS.md"
)

# Build tar command with existing files only
tar_args=""
for path in "${CRITICAL_PATHS[@]}"; do
    full_path="$WORKSPACE/$path"
    if [ -e "$full_path" ]; then
        tar_args="$tar_args $path"
    fi
done

# Create backup
cd "$WORKSPACE" || exit 1
tar czf "$BACKUP_FILE" $tar_args 2>/dev/null

if [ -f "$BACKUP_FILE" ]; then
    backup_size=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
    echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup created: $BACKUP_FILE (${backup_size} bytes)"
else
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ERROR: Backup failed"
    exit 1
fi

# Clean up backups older than 7 days
find "$BACKUP_DIR" -name "mission_control_backup_*.tar.gz" -mtime +7 -delete

# List remaining backups
echo "Current backups:"
ls -lh "$BACKUP_DIR"/mission_control_backup_*.tar.gz 2>/dev/null | tail -5

echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup process complete"
