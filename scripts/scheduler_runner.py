#!/usr/bin/env python3
"""
Run a single check from the market scheduler (for cron integration).
Usage: python3 scheduler_runner.py --task alerts --threshold 3
"""
import argparse
import sys
sys.path.insert(0, '/Users/daytrons/.openclaw/workspace/scripts')

from market_scheduler import MarketScheduler

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", choices=["alerts", "cost", "trends"], required=True)
    parser.add_argument("--threshold", type=float, default=3.0)
    args = parser.parse_args()
    
    scheduler = MarketScheduler()
    
    if args.task == "alerts":
        if args.threshold == 3.0:
            scheduler.check_alerts("market_watch")
        else:
            scheduler.check_alerts("smart_alerts")
    elif args.task == "cost":
        scheduler.cost_report()
    elif args.task == "trends":
        scheduler.trends_update()

if __name__ == "__main__":
    main()
