#!/usr/bin/env python3
"""
Cron Job Health Monitor
Monitors cron jobs, identifies errors, and provides diagnostics.
"""

import os
import sys
import json
import subprocess
import re
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Tuple


@dataclass
class CronJob:
    """Represents a single cron job"""
    schedule: str
    command: str
    source: str  # crontab, /etc/cron.d, etc.
    user: Optional[str] = None
    line_number: Optional[int] = None
    is_active: bool = True
    last_run_status: Optional[str] = None
    last_run_time: Optional[str] = None
    error_count: int = 0
    
    def __hash__(self):
        return hash((self.schedule, self.command, self.source))


@dataclass
class HealthReport:
    """Overall health report for cron jobs"""
    timestamp: str
    total_jobs: int
    active_jobs: int
    inactive_jobs: int
    jobs_with_errors: int
    jobs: List[Dict]
    errors: List[Dict]
    suggestions: List[str]


class CronHealthMonitor:
    """Main monitoring class for cron jobs"""
    
    def __init__(self):
        self.jobs: List[CronJob] = []
        self.errors: List[Dict] = []
        self.suggestions: List[str] = []
        
    def run(self, verbose: bool = False, check_logs: bool = True) -> HealthReport:
        """Run full health check"""
        self.jobs = []
        self.errors = []
        self.suggestions = []
        
        # Collect all cron jobs
        self._collect_user_crontabs()
        self._collect_system_cron()
        self._collect_cron_d()
        self._collect_anacron()
        
        # Check job health
        if check_logs:
            self._check_job_logs()
        
        self._validate_jobs()
        self._generate_suggestions()
        
        report = HealthReport(
            timestamp=datetime.now().isoformat(),
            total_jobs=len(self.jobs),
            active_jobs=sum(1 for j in self.jobs if j.is_active),
            inactive_jobs=sum(1 for j in self.jobs if not j.is_active),
            jobs_with_errors=len(self.errors),
            jobs=[asdict(j) for j in self.jobs],
            errors=self.errors,
            suggestions=self.suggestions
        )
        
        if verbose:
            self._print_report(report)
        
        return report
    
    def _collect_user_crontabs(self):
        """Collect user crontab entries"""
        try:
            result = subprocess.run(
                ['crontab', '-l'],
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                self._parse_crontab(result.stdout, 'user-crontab')
        except FileNotFoundError:
            pass
    
    def _collect_system_cron(self):
        """Collect system-wide cron jobs"""
        system_crontabs = ['/etc/crontab', '/etc/cron.deny', '/etc/cron.allow']
        for crontab in system_crontabs:
            if os.path.exists(crontab):
                try:
                    with open(crontab, 'r') as f:
                        self._parse_crontab(f.read(), crontab, user='root')
                except PermissionError:
                    pass
    
    def _collect_cron_d(self):
        """Collect jobs from /etc/cron.d"""
        cron_d = '/etc/cron.d'
        if os.path.isdir(cron_d):
            for filename in os.listdir(cron_d):
                filepath = os.path.join(cron_d, filename)
                if os.path.isfile(filepath):
                    try:
                        with open(filepath, 'r') as f:
                            self._parse_crontab(f.read(), filepath, user='root')
                    except PermissionError:
                        pass
    
    def _collect_anacron(self):
        """Collect anacron jobs"""
        anacrontab = '/etc/anacrontab'
        if os.path.exists(anacrontab):
            try:
                with open(anacrontab, 'r') as f:
                    self._parse_anacrontab(f.read())
            except PermissionError:
                pass
    
    def _parse_crontab(self, content: str, source: str, user: Optional[str] = None):
        """Parse crontab content"""
        lines = content.split('\n')
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue
            
            # Skip environment variables
            if '=' in line and not any(c in line for c in '*?,'):
                continue
            
            # Parse cron line
            job = self._parse_cron_line(line, source, user, line_num)
            if job:
                self.jobs.append(job)
    
    def _parse_cron_line(self, line: str, source: str, user: Optional[str], line_num: int) -> Optional[CronJob]:
        """Parse a single cron line"""
        # Handle @reboot, @daily, etc.
        special_schedules = {
            '@reboot': '@reboot',
            '@yearly': '0 0 1 1 *',
            '@annually': '0 0 1 1 *',
            '@monthly': '0 0 1 * *',
            '@weekly': '0 0 * * 0',
            '@daily': '0 0 * * *',
            '@midnight': '0 0 * * *',
            '@hourly': '0 * * * *'
        }
        
        parts = line.split()
        
        # Check for special schedule
        if parts[0] in special_schedules:
            schedule = special_schedules[parts[0]]
            command = ' '.join(parts[1:])
            return CronJob(
                schedule=schedule,
                command=command,
                source=source,
                user=user,
                line_number=line_num
            )
        
        # Standard 5-field cron
        if len(parts) >= 6:
            schedule = ' '.join(parts[:5])
            command = ' '.join(parts[5:])
            return CronJob(
                schedule=schedule,
                command=command,
                source=source,
                user=user,
                line_number=line_num
            )
        
        return None
    
    def _parse_anacrontab(self, content: str):
        """Parse anacrontab content"""
        lines = content.split('\n')
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            parts = line.split()
            if len(parts) >= 4:
                period = parts[0]
                delay = parts[1]
                job_id = parts[2]
                command = ' '.join(parts[3:])
                
                job = CronJob(
                    schedule=f'anacron:{period}d',
                    command=command,
                    source='/etc/anacrontab',
                    user='root',
                    line_number=line_num
                )
                self.jobs.append(job)
    
    def _check_job_logs(self):
        """Check system logs for cron job execution status"""
        # Try different log sources
        log_sources = [
            '/var/log/syslog',
            '/var/log/cron',
            '/var/log/messages',
            '/var/log/system.log'  # macOS
        ]
        
        for log_file in log_sources:
            if os.path.exists(log_file):
                self._parse_log_file(log_file)
                break
        
        # Also check macOS unified logging
        if sys.platform == 'darwin':
            self._check_macos_logs()
    
    def _parse_log_file(self, log_file: str):
        """Parse a log file for cron entries"""
        try:
            # Get last 1000 lines
            result = subprocess.run(
                ['tail', '-n', '1000', log_file],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    self._analyze_log_line(line)
        except (subprocess.CalledProcessError, FileNotFoundError):
            pass
    
    def _check_macos_logs(self):
        """Check macOS unified logs for cron"""
        try:
            result = subprocess.run(
                ['log', 'show', '--predicate', 'subsystem == "com.apple.cron"', 
                 '--last', '24h', '--style', 'compact'],
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                for line in result.stdout.split('\n'):
                    self._analyze_log_line(line)
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
            pass
    
    def _analyze_log_line(self, line: str):
        """Analyze a log line for cron job status"""
        # Look for cron execution patterns
        cron_patterns = [
            r'CRON\[\d+\]:.*\((\w+)\) CMD \((.+)\)',
            r'cron.*\((\w+)\).*CMD \((.+)\)',
        ]
        
        for pattern in cron_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                user = match.group(1)
                command = match.group(2)
                
                # Update job status
                for job in self.jobs:
                    if job.command in command or command in job.command:
                        job.last_run_time = self._extract_timestamp(line)
                        job.last_run_status = 'executed'
                
                # Check for errors in the same line
                if any(err in line.lower() for err in ['error', 'fail', 'exit', 'code']):
                    self.errors.append({
                        'type': 'execution_error',
                        'command': command,
                        'user': user,
                        'log_line': line[:200],
                        'severity': 'high'
                    })
    
    def _extract_timestamp(self, line: str) -> Optional[str]:
        """Extract timestamp from log line"""
        # Common timestamp patterns
        patterns = [
            r'(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})',
            r'(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, line)
            if match:
                return match.group(1)
        return None
    
    def _validate_jobs(self):
        """Validate cron jobs for common issues"""
        for job in self.jobs:
            # Check for missing commands
            if not job.command.strip():
                self.errors.append({
                    'type': 'empty_command',
                    'job': asdict(job),
                    'message': 'Cron job has no command specified',
                    'severity': 'high'
                })
                job.is_active = False
            
            # Check for non-existent scripts
            if job.command.startswith('/') or job.command.startswith('~'):
                cmd_path = job.command.split()[0].replace('~', os.path.expanduser('~'))
                if not os.path.exists(cmd_path) and not any(
                    cmd_path.startswith(s) for s in ['/bin/', '/usr/bin/', '/sbin/', '/usr/sbin/']
                ):
                    self.errors.append({
                        'type': 'missing_script',
                        'job': asdict(job),
                        'message': f'Script does not exist: {cmd_path}',
                        'severity': 'high'
                    })
            
            # Validate cron schedule
            if not self._is_valid_schedule(job.schedule):
                self.errors.append({
                    'type': 'invalid_schedule',
                    'job': asdict(job),
                    'message': f'Invalid cron schedule: {job.schedule}',
                    'severity': 'medium'
                })
            
            # Check for common misconfigurations
            if '%' in job.command and not job.command.startswith('mail'):
                self.errors.append({
                    'type': 'percent_in_command',
                    'job': asdict(job),
                    'message': 'Command contains % which may need escaping in cron',
                    'severity': 'low'
                })
            
            if ' 2>&1' not in job.command and '>' not in job.command:
                self.suggestions.append(
                    f"Consider adding output redirection to job: {job.command[:50]}..."
                )
    
    def _is_valid_schedule(self, schedule: str) -> bool:
        """Check if a cron schedule is valid"""
        if schedule.startswith('anacron:'):
            return True
        if schedule in ['@reboot', '@yearly', '@annually', '@monthly', '@weekly', '@daily', '@midnight', '@hourly']:
            return True
        
        parts = schedule.split()
        if len(parts) != 5:
            return False
        
        # Basic validation of each field
        for part in parts:
            if part != '*' and not re.match(r'^[\d,\-\*/]+$', part):
                return False
        
        return True
    
    def _generate_suggestions(self):
        """Generate suggestions for improving cron setup"""
        if not self.jobs:
            self.suggestions.append("No cron jobs found. Check if cron service is running.")
        
        # Check for PATH issues
        for job in self.jobs:
            if job.command.startswith('python') or job.command.startswith('node'):
                if not job.command.startswith('/'):
                    self.suggestions.append(
                        f"Use absolute path for interpreter in: {job.command[:50]}..."
                    )
        
        # Check for duplicate jobs
        command_counts = {}
        for job in self.jobs:
            cmd = job.command.split()[0] if job.command else ''
            command_counts[cmd] = command_counts.get(cmd, 0) + 1
        
        for cmd, count in command_counts.items():
            if count > 1:
                self.suggestions.append(
                    f"Duplicate job detected: '{cmd}' appears {count} times"
                )
        
        # Check for overly frequent jobs
        for job in self.jobs:
            if job.schedule == '* * * * *':
                self.suggestions.append(
                    f"Job runs every minute (may cause resource issues): {job.command[:50]}..."
                )
        
        # General best practices
        if not any('MAILTO' in str(j.command) for j in self.jobs):
            self.suggestions.append("Consider setting MAILTO to receive cron error emails")
    
    def _print_report(self, report: HealthReport):
        """Print formatted health report"""
        print("\n" + "=" * 70)
        print("CRON JOB HEALTH REPORT")
        print("=" * 70)
        print(f"Generated: {report.timestamp}")
        print(f"\nSUMMARY:")
        print(f"  Total Jobs: {report.total_jobs}")
        print(f"  Active: {report.active_jobs}")
        print(f"  Inactive: {report.inactive_jobs}")
        print(f"  Jobs with Errors: {report.jobs_with_errors}")
        
        if report.jobs:
            print(f"\n{'=' * 70}")
            print("CRON JOBS:")
            print("=" * 70)
            for job in report.jobs:
                status = "✓" if job['is_active'] else "✗"
                print(f"\n  {status} [{job['source']}]")
                print(f"    Schedule: {job['schedule']}")
                print(f"    Command: {job['command'][:60]}{'...' if len(job['command']) > 60 else ''}")
                if job['last_run_time']:
                    print(f"    Last Run: {job['last_run_time']} ({job['last_run_status']})")
        
        if report.errors:
            print(f"\n{'=' * 70}")
            print("ERRORS FOUND:")
            print("=" * 70)
            for error in report.errors:
                severity_icon = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(error['severity'], "⚪")
                print(f"\n  {severity_icon} {error['type'].upper()}")
                print(f"     {error['message']}")
                if 'job' in error and isinstance(error['job'], dict):
                    print(f"     Job: {error['job'].get('command', 'N/A')[:50]}...")
        
        if report.suggestions:
            print(f"\n{'=' * 70}")
            print("SUGGESTIONS:")
            print("=" * 70)
            for suggestion in report.suggestions:
                print(f"  💡 {suggestion}")
        
        print("\n" + "=" * 70)


def main():
    parser = argparse.ArgumentParser(
        description='Cron Job Health Monitor',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                    # Run health check
  %(prog)s --verbose          # Run with detailed output
  %(prog)s --json             # Output as JSON
  %(prog)s --no-logs          # Skip log analysis (faster)
        """
    )
    parser.add_argument('-v', '--verbose', action='store_true',
                        help='Print detailed report')
    parser.add_argument('-j', '--json', action='store_true',
                        help='Output as JSON')
    parser.add_argument('--no-logs', action='store_true',
                        help='Skip log analysis')
    parser.add_argument('-o', '--output', type=str,
                        help='Save report to file')
    
    args = parser.parse_args()
    
    monitor = CronHealthMonitor()
    report = monitor.run(
        verbose=args.verbose,
        check_logs=not args.no_logs
    )
    
    if args.json:
        output = json.dumps(asdict(report), indent=2)
        print(output)
    elif not args.verbose:
        # Minimal output
        print(f"Cron Health: {report.total_jobs} jobs, {report.jobs_with_errors} errors")
        if report.errors:
            print("\nErrors found:")
            for error in report.errors:
                print(f"  - {error['message']}")
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(asdict(report), f, indent=2)
        print(f"\nReport saved to: {args.output}")
    
    # Exit with error code if issues found
    sys.exit(1 if report.jobs_with_errors > 0 else 0)


if __name__ == '__main__':
    main()
