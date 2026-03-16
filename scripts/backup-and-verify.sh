#!/bin/bash
# Backup and Verify System for Mission Control
# Prevents data loss during updates

set -e

REPO_DIR="$HOME/.openclaw/workspace/mission-control-repo"
BACKUP_DIR="$REPO_DIR/.backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Function to backup current state
backup_current() {
    local name="${1:-auto}"
    local backup_path="$BACKUP_DIR/${name}_${TIMESTAMP}"
    
    log "Creating backup: $backup_path"
    
    mkdir -p "$backup_path"
    
    # Backup key files
    cp -r "$REPO_DIR"/*.html "$backup_path/" 2>/dev/null || true
    cp -r "$REPO_DIR"/*.js "$backup_path/" 2>/dev/null || true
    cp -r "$REPO_DIR"/*.css "$backup_path/" 2>/dev/null || true
    cp -r "$REPO_DIR"/deliverables "$backup_path/" 2>/dev/null || true
    
    # Save file manifest with checksums
    cd "$REPO_DIR"
    find . -name "*.html" -o -name "*.js" -o -name "*.css" 2>/dev/null | \
        xargs md5 2>/dev/null | head -50 > "$backup_path/MANIFEST.txt"
    
    # Keep only last 20 backups
    ls -t "$BACKUP_DIR" | tail -n +21 | xargs -I {} rm -rf "$BACKUP_DIR/{}" 2>/dev/null || true
    
    success "Backup created: $backup_path"
    echo "$backup_path"
}

# Function to verify critical features exist
verify_dashboard() {
    log "Verifying dashboard integrity..."
    
    local issues=0
    local file="$REPO_DIR/dashboard.html"
    
    # Critical features to check
    declare -a checks=(
        "Command Center:Command Center"
        "Command buttons:cmd-btn"
        "Results box:results-box"
        "Stats grid:stats-grid"
        "Tasks panel:task-list"
        "Agents panel:agent-list"
        "Activity feed:activity-list"
        "Memory tab:tab-memory"
        "Memory search:memory-search"
        "Documents grid:memory-docs"
        "Help tab:tab-help"
        "Sidebar navigation:sidebar"
        "Connection status:connection-status"
        "Add task function:addTask"
        "Run command function:runCommand"
    )
    
    for check in "${checks[@]}"; do
        IFS=':' read -r name pattern <<< "$check"
        if grep -q "$pattern" "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} $name"
        else
            echo -e "  ${RED}✗${NC} $name MISSING!"
            ((issues++))
        fi
    done
    
    # Check file size (should be > 1500 lines)
    local lines=$(wc -l < "$file")
    if [ "$lines" -gt 1500 ]; then
        echo -e "  ${GREEN}✓${NC} File size: $lines lines"
    else
        echo -e "  ${RED}✗${NC} File size suspicious: $lines lines (expected > 1500)"
        ((issues++))
    fi
    
    if [ $issues -eq 0 ]; then
        success "Dashboard verification passed!"
        return 0
    else
        error "Dashboard verification FAILED - $issues issues found!"
        return 1
    fi
}

# Function to compare with backup
compare_with_backup() {
    local backup="$1"
    
    if [ -z "$backup" ]; then
        # Use most recent backup
        backup=$(ls -t "$BACKUP_DIR" | head -1)
        backup="$BACKUP_DIR/$backup"
    fi
    
    log "Comparing current state with backup: $backup"
    
    for file in dashboard.html office.html team.html; do
        if [ -f "$backup/$file" ] && [ -f "$REPO_DIR/$file" ]; then
            local diff_lines=$(diff -u "$backup/$file" "$REPO_DIR/$file" 2>/dev/null | wc -l)
            if [ "$diff_lines" -eq 0 ]; then
                echo -e "  ${GREEN}✓${NC} $file: No changes"
            else
                echo -e "  ${YELLOW}⚠${NC} $file: $diff_lines lines different"
            fi
        fi
    done
}

# Function to restore from backup
restore_backup() {
    local backup="$1"
    
    if [ -z "$backup" ]; then
        error "No backup specified. Available backups:"
        ls -lt "$BACKUP_DIR" | head -10
        exit 1
    fi
    
    backup="$BACKUP_DIR/$backup"
    
    if [ ! -d "$backup" ]; then
        error "Backup not found: $backup"
        exit 1
    fi
    
    warning "This will OVERWRITE current files with backup!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        log "Restoring from $backup..."
        cp -r "$backup"/*.html "$REPO_DIR/" 2>/dev/null || true
        cp -r "$backup"/*.js "$REPO_DIR/" 2>/dev/null || true
        success "Restore complete!"
    else
        log "Restore cancelled"
    fi
}

# Function to list backups
list_backups() {
    log "Available backups:"
    ls -lt "$BACKUP_DIR" | head -15
}

# Main command handler
case "${1:-help}" in
    backup)
        backup_current "$2"
        ;;
    verify)
        verify_dashboard
        ;;
    compare)
        compare_with_backup "$2"
        ;;
    restore)
        restore_backup "$2"
        ;;
    list)
        list_backups
        ;;
    auto)
        # Run before deployment
        log "Running auto backup and verify..."
        backup_current "pre_deploy"
        verify_dashboard
        ;;
    *)
        echo "Mission Control Backup & Verify System"
        echo ""
        echo "Usage: ./backup-and-verify.sh [command]"
        echo ""
        echo "Commands:"
        echo "  backup [name]   - Create backup with optional name"
        echo "  verify          - Verify dashboard has all features"
        echo "  compare [name]  - Compare current with backup"
        echo "  restore [name]  - Restore from backup"
        echo "  list            - List available backups"
        echo "  auto            - Backup + verify (run before deploy)"
        echo ""
        ;;
esac
