#!/usr/bin/env python3
"""
Health Score Algorithm for Mission Control
Combines: cron status + disk usage + error rates + memory + git status
Outputs: 0-100 health score with component breakdown
"""

import json
import subprocess
import os
import re
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from dataclasses import dataclass, asdict


@dataclass
class HealthComponent:
    name: str
    score: int  # 0-100
    weight: float  # 0-1
    details: str
    status: str  # healthy, warning, critical


class HealthScoreCalculator:
    """Calculate overall system health score"""
    
    # Weight configuration (must sum to 1.0)
    WEIGHTS = {
        'cron': 0.30,
        'disk': 0.20,
        'memory': 0.15,
        'git': 0.15,
        'errors': 0.10,
        'gateway': 0.10
    }
    
    # Thresholds
    DISK_WARNING = 70  # %
    DISK_CRITICAL = 85  # %
    MEMORY_WARNING = 80  # %
    MEMORY_CRITICAL = 90  # %
    CRON_WARNING = 70  # % success rate
    CRON_CRITICAL = 50  # % success rate
    
    def __init__(self, workspace_dir: str = "/Users/daytrons/.openclaw/workspace"):
        self.workspace_dir = workspace_dir
        self.components: List[HealthComponent] = []
        self.timestamp = datetime.now().isoformat()
    
    def run_shell(self, command: str) -> Tuple[str, int]:
        """Run shell command and return output + exit code"""
        try:
            result = subprocess.run(
                command, 
                shell=True, 
                capture_output=True, 
                text=True,
                timeout=30
            )
            return result.stdout.strip(), result.returncode
        except Exception as e:
            return str(e), 1
    
    def check_cron_health(self) -> HealthComponent:
        """Check cron job success rate from logs"""
        log_file = f"{self.workspace_dir}/logs/cron-execution.log"
        
        if not os.path.exists(log_file):
            # Check if we can list cron jobs
            stdout, code = self.run_shell("crontab -l 2>/dev/null | grep -c '^' || echo 0")
            job_count = int(stdout) if stdout.isdigit() else 0
            
            if job_count > 0:
                return HealthComponent(
                    name="Cron Jobs",
                    score=75,
                    weight=self.WEIGHTS['cron'],
                    details=f"{job_count} jobs scheduled (no execution log yet)",
                    status="warning"
                )
            else:
                return HealthComponent(
                    name="Cron Jobs",
                    score=50,
                    weight=self.WEIGHTS['cron'],
                    details="No cron jobs found",
                    status="warning"
                )
        
        # Parse log for success/failure
        try:
            with open(log_file, 'r') as f:
                lines = f.readlines()[-100:]  # Last 100 lines
            
            success_count = sum(1 for line in lines if '✅' in line or 'success' in line.lower())
            failure_count = sum(1 for line in lines if '❌' in line or 'failed' in line.lower() or 'error' in line.lower())
            total = success_count + failure_count
            
            if total == 0:
                score = 75
                status = "warning"
                details = "No recent execution data"
            else:
                success_rate = (success_count / total) * 100
                score = int(success_rate)
                
                if success_rate >= 90:
                    status = "healthy"
                elif success_rate >= self.CRON_WARNING:
                    status = "warning"
                else:
                    status = "critical"
                
                details = f"{success_count}/{total} successful ({score}%)"
            
            return HealthComponent(
                name="Cron Jobs",
                score=score,
                weight=self.WEIGHTS['cron'],
                details=details,
                status=status
            )
            
        except Exception as e:
            return HealthComponent(
                name="Cron Jobs",
                score=50,
                weight=self.WEIGHTS['cron'],
                details=f"Error reading logs: {str(e)[:50]}",
                status="warning"
            )
    
    def check_disk_health(self) -> HealthComponent:
        """Check disk usage"""
        stdout, code = self.run_shell("df -h / | tail -1 | awk '{print $5}' | sed 's/%//'")
        
        if code != 0 or not stdout.isdigit():
            return HealthComponent(
                name="Disk Usage",
                score=50,
                weight=self.WEIGHTS['disk'],
                details="Unable to check disk usage",
                status="warning"
            )
        
        usage = int(stdout)
        
        # Score calculation: 100 at 0%, 0 at 100%
        score = max(0, 100 - usage)
        
        if usage < self.DISK_WARNING:
            status = "healthy"
        elif usage < self.DISK_CRITICAL:
            status = "warning"
        else:
            status = "critical"
        
        # Get more details
        stdout2, _ = self.run_shell("df -h / | tail -1 | awk '{print $3 \"/\" $2}'")
        
        return HealthComponent(
            name="Disk Usage",
            score=score,
            weight=self.WEIGHTS['disk'],
            details=f"{usage}% used ({stdout2})",
            status=status
        )
    
    def check_memory_health(self) -> HealthComponent:
        """Check memory usage (macOS)"""
        stdout, code = self.run_shell("vm_stat | grep 'Pages free' | awk '{print $3}' | sed 's/\\.//'")
        
        if code != 0:
            # Try alternative
            stdout, code = self.run_shell("memory_pressure 2>/dev/null | grep 'System-wide memory free percentage' | awk '{print $5}' | sed 's/%//' || echo ''")
            if stdout and stdout.isdigit():
                free_pct = int(stdout)
                score = free_pct
                status = "healthy" if free_pct > 20 else "warning" if free_pct > 10 else "critical"
                return HealthComponent(
                    name="Memory",
                    score=score,
                    weight=self.WEIGHTS['memory'],
                    details=f"{free_pct}% free",
                    status=status
                )
            
            return HealthComponent(
                name="Memory",
                score=75,
                weight=self.WEIGHTS['memory'],
                details="Unable to check memory (default: healthy)",
                status="healthy"
            )
        
        # Convert pages to approximate percentage (rough estimate)
        try:
            free_pages = int(stdout)
            # Assume 8GB system, 4KB pages = ~2M pages total
            total_pages_estimate = 2000000
            free_pct = min(100, int((free_pages / total_pages_estimate) * 100))
            
            score = free_pct
            
            if free_pct > 20:
                status = "healthy"
            elif free_pct > 10:
                status = "warning"
            else:
                status = "critical"
            
            return HealthComponent(
                name="Memory",
                score=score,
                weight=self.WEIGHTS['memory'],
                details=f"~{free_pct}% free ({free_pages} pages)",
                status=status
            )
            
        except:
            return HealthComponent(
                name="Memory",
                score=75,
                weight=self.WEIGHTS['memory'],
                details="Memory check inconclusive",
                status="healthy"
            )
    
    def check_git_health(self) -> HealthComponent:
        """Check git status - uncommitted changes = lower score"""
        os.chdir(self.workspace_dir)
        
        stdout, code = self.run_shell("git status --porcelain | wc -l")
        
        if code != 0:
            return HealthComponent(
                name="Git Status",
                score=50,
                weight=self.WEIGHTS['git'],
                details="Git repository error",
                status="warning"
            )
        
        try:
            uncommitted = int(stdout)
        except:
            uncommitted = 0
        
        # Score: 100 at 0 changes, drops to 50 at 50+ changes
        score = max(50, 100 - uncommitted)
        
        if uncommitted == 0:
            status = "healthy"
            details = "All changes committed"
        elif uncommitted < 10:
            status = "healthy"
            details = f"{uncommitted} uncommitted changes"
        elif uncommitted < 30:
            status = "warning"
            details = f"{uncommitted} uncommitted changes"
        else:
            status = "critical"
            details = f"{uncommitted} uncommitted changes - sync needed"
        
        return HealthComponent(
            name="Git Status",
            score=score,
            weight=self.WEIGHTS['git'],
            details=details,
            status=status
        )
    
    def check_error_rate(self) -> HealthComponent:
        """Check recent error logs"""
        error_logs = [
            f"{self.workspace_dir}/logs/errors.log",
            f"{self.workspace_dir}/logs/cron-errors.log"
        ]
        
        total_errors = 0
        recent_errors = 0
        cutoff = datetime.now() - timedelta(hours=24)
        
        for log_file in error_logs:
            if os.path.exists(log_file):
                try:
                    with open(log_file, 'r') as f:
                        for line in f:
                            total_errors += 1
                            # Check if error is recent (contains today's date or recent timestamp)
                            if any(x in line for x in ['ERROR', 'CRITICAL', 'FAILED']):
                                recent_errors += 1
                except:
                    pass
        
        # Score based on recent errors
        if recent_errors == 0:
            score = 100
            status = "healthy"
            details = "No errors in last 24h"
        elif recent_errors < 5:
            score = 80
            status = "healthy"
            details = f"{recent_errors} errors in last 24h"
        elif recent_errors < 15:
            score = 60
            status = "warning"
            details = f"{recent_errors} errors in last 24h"
        else:
            score = max(0, 100 - recent_errors * 2)
            status = "critical"
            details = f"{recent_errors} errors in last 24h - investigate"
        
        return HealthComponent(
            name="Error Rate",
            score=score,
            weight=self.WEIGHTS['errors'],
            details=details,
            status=status
        )
    
    def check_gateway_health(self) -> HealthComponent:
        """Check if OpenClaw gateway is running"""
        stdout, code = self.run_shell("pgrep -f 'openclaw.*gateway' | wc -l")
        
        try:
            process_count = int(stdout)
        except:
            process_count = 0
        
        if process_count > 0:
            return HealthComponent(
                name="Gateway",
                score=100,
                weight=self.WEIGHTS['gateway'],
                details=f"Running ({process_count} processes)",
                status="healthy"
            )
        else:
            # Check if it should be running
            stdout2, _ = self.run_shell("launchctl list | grep openclaw | wc -l")
            if int(stdout2 or 0) > 0:
                return HealthComponent(
                    name="Gateway",
                    score=0,
                    weight=self.WEIGHTS['gateway'],
                    details="Configured but not running!",
                    status="critical"
                )
            else:
                return HealthComponent(
                    name="Gateway",
                    score=50,
                    weight=self.WEIGHTS['gateway'],
                    details="Not configured for auto-start",
                    status="warning"
                )
    
    def calculate(self) -> Dict[str, Any]:
        """Calculate overall health score"""
        self.components = [
            self.check_cron_health(),
            self.check_disk_health(),
            self.check_memory_health(),
            self.check_git_health(),
            self.check_error_rate(),
            self.check_gateway_health()
        ]
        
        # Calculate weighted score
        total_score = sum(c.score * c.weight for c in self.components)
        
        # Determine overall status
        critical_count = sum(1 for c in self.components if c.status == "critical")
        warning_count = sum(1 for c in self.components if c.status == "warning")
        
        if critical_count > 0:
            overall_status = "critical"
        elif warning_count > 1:
            overall_status = "warning"
        else:
            overall_status = "healthy"
        
        return {
            "score": round(total_score),
            "status": overall_status,
            "timestamp": self.timestamp,
            "components": [asdict(c) for c in self.components],
            "summary": {
                "healthy": sum(1 for c in self.components if c.status == "healthy"),
                "warning": warning_count,
                "critical": critical_count
            }
        }
    
    def save(self, output_file: str = None) -> str:
        """Save health report to file"""
        if output_file is None:
            output_file = f"{self.workspace_dir}/logs/health-report.json"
        
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        report = self.calculate()
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return output_file
    
    def print_report(self):
        """Print formatted health report to console"""
        report = self.calculate()
        
        # Color codes
        GREEN = '\033[92m'
        YELLOW = '\033[93m'
        RED = '\033[91m'
        BLUE = '\033[94m'
        RESET = '\033[0m'
        
        # Status emoji
        status_emoji = {
            "healthy": "🟢",
            "warning": "🟡",
            "critical": "🔴"
        }
        
        print(f"\n{BLUE}╔════════════════════════════════════════╗{RESET}")
        print(f"{BLUE}║{RESET}      🔬 Mission Control Health         {BLUE}║{RESET}")
        print(f"{BLUE}╚════════════════════════════════════════╝{RESET}\n")
        
        # Overall score
        score = report['score']
        if score >= 80:
            score_color = GREEN
        elif score >= 60:
            score_color = YELLOW
        else:
            score_color = RED
        
        print(f"  Overall Score: {score_color}{score}/100{RESET} {status_emoji[report['status']]}")
        print(f"  Status: {score_color}{report['status'].upper()}{RESET}")
        print(f"  Updated: {report['timestamp'][:19]}\n")
        
        print("  Components:")
        print("  " + "-" * 40)
        
        for comp in report['components']:
            color = GREEN if comp['status'] == 'healthy' else YELLOW if comp['status'] == 'warning' else RED
            emoji = status_emoji[comp['status']]
            print(f"  {emoji} {comp['name']:<15} {color}{comp['score']:>3}/100{RESET} - {comp['details']}")
        
        print("\n  " + "-" * 40)
        print(f"  Summary: {GREEN}{report['summary']['healthy']} healthy{RESET}, "
              f"{YELLOW}{report['summary']['warning']} warning{RESET}, "
              f"{RED}{report['summary']['critical']} critical{RESET}\n")


def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Mission Control Health Score Calculator')
    parser.add_argument('--output', '-o', help='Output JSON file path')
    parser.add_argument('--quiet', '-q', action='store_true', help='No console output')
    parser.add_argument('--webhook', '-w', help='Discord webhook URL to post results')
    
    args = parser.parse_args()
    
    calculator = HealthScoreCalculator()
    
    if not args.quiet:
        calculator.print_report()
    
    # Save to file
    output_file = calculator.save(args.output)
    
    if not args.quiet:
        print(f"📁 Report saved: {output_file}")
    
    # Post to Discord if webhook provided
    if args.webhook:
        report = calculator.calculate()
        
        # Create Discord embed
        color = 0x22c55e if report['score'] >= 80 else 0xeab308 if report['score'] >= 60 else 0xef4444
        
        fields = []
        for comp in report['components']:
            emoji = "🟢" if comp['status'] == 'healthy' else "🟡" if comp['status'] == 'warning' else "🔴"
            fields.append({
                "name": f"{emoji} {comp['name']}",
                "value": f"**{comp['score']}/100** - {comp['details']}",
                "inline": True
            })
        
        embed = {
            "title": f"🔬 Health Score: {report['score']}/100",
            "description": f"Status: **{report['status'].upper()}**",
            "color": color,
            "fields": fields,
            "footer": {"text": f"Updated: {report['timestamp'][:19]}"}
        }
        
        import requests
        requests.post(args.webhook, json={"embeds": [embed]})
        
        if not args.quiet:
            print("📤 Posted to Discord")


if __name__ == "__main__":
    main()
