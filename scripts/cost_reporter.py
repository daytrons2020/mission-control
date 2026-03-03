#!/usr/bin/env python3
"""
Cost tracker reporter - outputs Discord-formatted cost summary.
"""
import json
import subprocess

def fetch_costs():
    """Run cost tracker and return parsed data."""
    result = subprocess.run(
        ["python3", "/Users/daytrons/.agents/skills/openclaw-cost-tracker/scripts/cost_tracker.py", 
         "--days", "1", "--format", "json"],
        capture_output=True, text=True, timeout=15
    )
    return json.loads(result.stdout)

def main():
    data = fetch_costs()
    
    grand = data.get('grandTotal', {})
    daily = data.get('daily', [{}])[-1]  # Most recent day
    
    print("💰 **Hourly Cost Report**")
    print(f"\n**Today:** ${grand.get('totalCost', 0):.2f} | {grand.get('totalTokens', 0):,} tokens | {grand.get('totalRequests', 0)} requests")
    
    if data.get('models'):
        print("\n**By Model:**")
        for m in data['models'][:3]:  # Top 3
            print(f"• {m['model']}: {m['totalTokens']:,} tokens ({m['requestCount']} reqs)")
    
    print(f"\n_Files scanned: {data.get('meta', {}).get('filesScanned', 0)}_")

if __name__ == "__main__":
    main()
