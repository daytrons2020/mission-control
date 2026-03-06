#!/usr/bin/env python3
"""
Error Recovery System
Prevents token waste and minimizes delays
"""

import json
import os
import time
from datetime import datetime, timedelta

BASE_DIR = "/Users/daytrons/.openclaw/workspace/mission_control"
ERROR_LOG = f"{BASE_DIR}/error_log.jsonl"
RECOVERY_STATE = f"{BASE_DIR}/recovery_state.json"

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY_BASE = 5  # seconds
FALLBACK_CHAIN = {
    "ollama": "kimi",
    "kimi": "minimax", 
    "minimax": "ollama"  # Last resort - try local again
}

def log_error(task_id, error, model, attempt):
    """Log error for analysis."""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "task_id": task_id,
        "error": str(error),
        "model": model,
        "attempt": attempt
    }
    with open(ERROR_LOG, 'a') as f:
        f.write(json.dumps(entry) + '\n')

def should_retry(task_id, error, current_model, attempt):
    """Determine if task should be retried."""
    
    # Don't retry these errors
    fatal_errors = [
        "invalid api key",
        "unauthorized",
        "rate limit exceeded",
        "context length exceeded"
    ]
    
    error_str = str(error).lower()
    if any(fatal in error_str for fatal in fatal_errors):
        return False, f"Fatal error: {error}"
    
    # Check max retries
    if attempt >= MAX_RETRIES:
        return False, "Max retries exceeded"
    
    # Determine fallback model
    fallback = FALLBACK_CHAIN.get(current_model)
    if not fallback:
        fallback = "ollama"  # Default to local
    
    return True, fallback

def calculate_backoff(attempt):
    """Calculate exponential backoff delay."""
    return RETRY_DELAY_BASE * (2 ** (attempt - 1))

def execute_with_recovery(task_func, task_id, model, *args, **kwargs):
    """Execute task with error recovery."""
    
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[RECOVERY] Attempt {attempt}/{MAX_RETRIES} with {model}")
            result = task_func(*args, **kwargs)
            
            # Check if result indicates success
            if isinstance(result, dict) and result.get('success'):
                return {
                    "success": True,
                    "result": result,
                    "attempts": attempt,
                    "model": model
                }
            
            # Handle soft failures (result returned but indicates failure)
            if isinstance(result, dict) and not result.get('success'):
                error = result.get('error', 'Unknown error')
                log_error(task_id, error, model, attempt)
                
                should_retry_flag, fallback = should_retry(task_id, error, model, attempt)
                
                if should_retry_flag and attempt < MAX_RETRIES:
                    delay = calculate_backoff(attempt)
                    print(f"[RECOVERY] Retrying with {fallback} in {delay}s...")
                    time.sleep(delay)
                    model = fallback
                    continue
                else:
                    return {
                        "success": False,
                        "error": error,
                        "attempts": attempt,
                        "final_model": model
                    }
            
            # Success
            return {
                "success": True,
                "result": result,
                "attempts": attempt,
                "model": model
            }
            
        except Exception as e:
            log_error(task_id, e, model, attempt)
            
            should_retry_flag, fallback = should_retry(task_id, e, model, attempt)
            
            if should_retry_flag and attempt < MAX_RETRIES:
                delay = calculate_backoff(attempt)
                print(f"[RECOVERY] Error: {e}")
                print(f"[RECOVERY] Retrying with {fallback} in {delay}s...")
                time.sleep(delay)
                model = fallback
            else:
                return {
                    "success": False,
                    "error": str(e),
                    "attempts": attempt,
                    "final_model": model
                }
    
    return {
        "success": False,
        "error": "All retries exhausted",
        "attempts": MAX_RETRIES
    }

def get_error_stats():
    """Get error statistics for analysis."""
    if not os.path.exists(ERROR_LOG):
        return {"total": 0, "by_model": {}, "recent": []}
    
    stats = {"total": 0, "by_model": {}, "recent": []}
    
    with open(ERROR_LOG, 'r') as f:
        for line in f:
            if line.strip():
                entry = json.loads(line)
                stats["total"] += 1
                
                model = entry.get("model", "unknown")
                stats["by_model"][model] = stats["by_model"].get(model, 0) + 1
                
                # Keep last 10 errors
                stats["recent"].append(entry)
                stats["recent"] = stats["recent"][-10:]
    
    return stats

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "stats":
        stats = get_error_stats()
        print(json.dumps(stats, indent=2))
    else:
        print("Error recovery system ready.")
        print("Usage: error_recovery.py [stats]")
