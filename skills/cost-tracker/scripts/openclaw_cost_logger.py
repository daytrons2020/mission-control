#!/usr/bin/env python3
"""
OpenClaw Cost Logger - Simple interface for logging AI costs from OpenClaw operations

This module provides a simple way to log costs from anywhere in the OpenClaw system.
Just import and call log_openclaw_cost() after model operations.
"""

import os
import sys
import importlib.util
from typing import Optional, Dict

# Load the openclaw_cost_tracker module directly
scripts_dir = os.path.dirname(os.path.abspath(__file__))
tracker_path = os.path.join(scripts_dir, "openclaw-cost-tracker.py")

spec = importlib.util.spec_from_file_location("openclaw_cost_tracker", tracker_path)
openclaw_cost_tracker = importlib.util.module_from_spec(spec)
sys.modules["openclaw_cost_tracker"] = openclaw_cost_tracker
spec.loader.exec_module(openclaw_cost_tracker)

OpenClawCostTracker = openclaw_cost_tracker.OpenClawCostTracker


# Global tracker instance (lazy-loaded)
_tracker = None

def get_tracker() -> OpenClawCostTracker:
    """Get or create the global tracker instance."""
    global _tracker
    if _tracker is None:
        _tracker = OpenClawCostTracker()
    return _tracker


def log_openclaw_cost(
    model: str,
    input_tokens: int,
    output_tokens: int,
    task: str,
    operation_type: str = "inference",
    cached_tokens: int = 0,
    metadata: Optional[Dict] = None
) -> Dict:
    """
    Log a cost entry from an OpenClaw operation.
    
    This is the main interface for logging AI costs. Call this after any
    model inference operation to track usage and costs.
    
    Args:
        model: Model name/identifier (e.g., "moonshot/kimi-k2.5")
        input_tokens: Number of input tokens
        output_tokens: Number of output tokens
        task: Description of what was done
        operation_type: Type of operation (inference, embedding, etc.)
        cached_tokens: Number of cached tokens (if applicable)
        metadata: Additional metadata dict (tool used, duration, etc.)
    
    Returns:
        Dict with 'entry' and 'alerts' keys
    
    Example:
        >>> from openclaw_cost_logger import log_openclaw_cost
        >>> result = log_openclaw_cost(
        ...     model="moonshot/kimi-k2.5",
        ...     input_tokens=1500,
        ...     output_tokens=800,
        ...     task="Analyzed PDF document",
        ...     operation_type="pdf_analysis"
        ... )
        >>> if result['alerts']:
        ...     print("Budget alert triggered!")
    """
    tracker = get_tracker()
    return tracker.log_cost(
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        task=task,
        operation_type=operation_type,
        cached_tokens=cached_tokens,
        metadata=metadata
    )


def get_today_summary() -> Dict:
    """Get today's cost summary."""
    tracker = get_tracker()
    return tracker.get_daily_summary()


def check_budget_status() -> Dict:
    """
    Check current budget status and return warnings if needed.
    
    Returns:
        Dict with 'status', 'percent_used', 'remaining', and 'alerts'
    """
    tracker = get_tracker()
    summary = tracker.get_daily_summary()
    alerts = tracker._check_budget_alerts()
    
    status = "ok"
    if summary['percent_used'] >= 100:
        status = "exceeded"
    elif summary['percent_used'] >= 90:
        status = "critical"
    elif summary['percent_used'] >= 75:
        status = "warning"
    elif summary['percent_used'] >= 50:
        status = "notice"
    
    return {
        "status": status,
        "percent_used": summary['percent_used'],
        "remaining": summary['remaining_budget'],
        "total_today": summary['total_cost'],
        "alerts": alerts
    }


# Convenience function for common OpenClaw operations
def log_inference(
    model: str,
    input_tokens: int,
    output_tokens: int,
    task: str,
    tool_used: Optional[str] = None,
    duration_ms: Optional[int] = None
) -> Dict:
    """
    Log a standard inference operation.
    
    Args:
        model: Model used
        input_tokens: Input token count
        output_tokens: Output token count
        task: What was done
        tool_used: Which tool triggered this (e.g., "pdf", "image", "web_search")
        duration_ms: Operation duration in milliseconds
    """
    metadata = {}
    if tool_used:
        metadata['tool'] = tool_used
    if duration_ms:
        metadata['duration_ms'] = duration_ms
    
    return log_openclaw_cost(
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        task=task,
        operation_type="inference",
        metadata=metadata
    )


def log_tool_usage(
    tool_name: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    task_description: str
) -> Dict:
    """
    Log cost from a specific tool usage.
    
    Args:
        tool_name: Name of the tool (e.g., "pdf", "image", "summarize")
        model: Model used
        input_tokens: Input tokens
        output_tokens: Output tokens
        task_description: What the tool did
    """
    return log_inference(
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        task=f"[{tool_name}] {task_description}",
        tool_used=tool_name
    )


if __name__ == "__main__":
    # Demo/test when run directly
    print("OpenClaw Cost Logger - Demo")
    print("=" * 50)
    
    # Log a sample entry
    result = log_openclaw_cost(
        model="moonshot/kimi-k2.5",
        input_tokens=2000,
        output_tokens=1000,
        task="Test operation",
        operation_type="demo"
    )
    
    print(f"Logged entry: ${result['entry']['cost']:.6f}")
    
    # Show today's summary
    summary = get_today_summary()
    print(f"\nToday's total: ${summary['total_cost']:.4f}")
    print(f"Requests today: {summary['request_count']}")
    
    # Check budget status
    status = check_budget_status()
    print(f"\nBudget status: {status['status']}")
    print(f"Percent used: {status['percent_used']:.1f}%")
