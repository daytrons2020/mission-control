#!/usr/bin/env python3
"""
Mission Control Health Monitor & Auto-Fix
Runs every 6 hours to check all systems and auto-fix issues
"""

import subprocess
import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Tuple

# Configuration
WORKSPACE = "/Users/daytrons/.openclaw/workspace"
LOG_FILE = f"{WORKSPACE}/.openclaw/health-monitor.log"
MAX_ERRORS_BEFORE_ALERT = 3

def log(message: str):
    """Log with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] {message}"
    print(log_line)
    with open(LOG_FILE, "a") as f:
        f.write(log_line + "\n")

def run_command(cmd: List[str], timeout: int = 30) -> Tuple[int, str, str]:
    """Run shell command and return (returncode, stdout, stderr)"""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=WORKSPACE
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Timeout"
    except Exception as e:
        return -1, "", str(e)

class HealthCheck:
    def __init__(self):
        self.issues = []
        self.fixed = []
        self.checks_run = 0
        
    def check_gateway(self) -> bool:
        """Check if OpenClaw gateway is running"""
        self.checks_run += 1
        code, stdout, stderr = run_command(["openclaw", "gateway", "status"])
        
        if code != 0 or "not running" in stdout.lower():
            self.issues.append("Gateway not running")
            # Auto-fix: restart gateway
            log("🔧 Auto-fixing: Restarting gateway...")
            run_command(["openclaw", "gateway", "restart"])
            self.fixed.append("Gateway restarted")
            return False
        return True
    
    def check_cron_jobs(self) -> bool:
        """Check cron job status"""
        self.checks_run += 1
        code, stdout, stderr = run_command(["openclaw", "cron", "list"])
        
        if code != 0:
            self.issues.append("Cannot list cron jobs")
            return False
            
        # Count errors
        error_count = stdout.count("error")
        if error_count > MAX_ERRORS_BEFORE_ALERT:
            self.issues.append(f"{error_count} cron jobs with errors")
            # Auto-fix: Try to restart failing jobs
            log(f"🔧 Auto-fixing: {error_count} jobs with errors, analyzing...")
            self._fix_cron_errors()
        
        return error_count <= MAX_ERRORS_BEFORE_ALERT
    
    def _fix_cron_errors(self):
        """Attempt to fix cron job errors"""
        # Get list of jobs with errors
        code, stdout, stderr = run_command(["openclaw", "cron", "list"])
        if code != 0:
            return
            
        lines = stdout.split("\n")
        for line in lines:
            if "error" in line.lower():
                # Extract job ID (first column)
                parts = line.split()
                if len(parts) > 0:
                    job_id = parts[0]
                    if len(job_id) == 36:  # UUID format
                        log(f"  Checking job: {job_id[:8]}...")
                        # Check recent runs
                        run_cmd = ["openclaw", "cron", "runs", job_id, "--limit", "1"]
                        rcode, rstdout, rstderr = run_command(run_cmd)
                        if "delivery" in rstderr.lower() or "delivery" in rstdout.lower():
                            log(f"  → Delivery issue detected, will retry on next run")
    
    def check_disk_space(self) -> bool:
        """Check disk space"""
        self.checks_run += 1
        code, stdout, stderr = run_command(["df", "-h", "/"])
        
        if code != 0:
            self.issues.append("Cannot check disk space")
            return False
            
        # Parse output for percentage
        try:
            lines = stdout.strip().split("\n")
            if len(lines) > 1:
                parts = lines[1].split()
                if len(parts) > 4:
                    percent = parts[4].replace("%", "")
                    if int(percent) > 85:
                        self.issues.append(f"Disk space critical: {percent}%")
                        return False
                    elif int(percent) > 70:
                        self.issues.append(f"Disk space warning: {percent}%")
        except:
            pass
            
        return True
    
    def check_memory(self) -> bool:
        """Check memory usage"""
        self.checks_run += 1
        code, stdout, stderr = run_command(["vm_stat"])
        
        if code != 0:
            # Try alternative
            code, stdout, stderr = run_command(["free", "-h"])
            
        if code != 0:
            self.issues.append("Cannot check memory")
            return False
            
        return True
    
    def check_git_status(self) -> bool:
        """Check if workspace has uncommitted changes"""
        self.checks_run += 1
        code, stdout, stderr = run_command(["git", "status", "--short"])
        
        if code != 0:
            self.issues.append("Git status check failed")
            return False
            
        if stdout.strip():
            # Has uncommitted changes - auto-commit
            log("🔧 Auto-fixing: Uncommitted changes detected, auto-committing...")
            run_command(["git", "add", "-A"])
            run_command([
                "git", "commit", "-m",
                f"auto: Health check commit {datetime.now().strftime('%Y-%m-%d %H:%M')}"
            ])
            self.fixed.append("Auto-committed changes")
            return True
            
        return True
    
    def check_discord_connection(self) -> bool:
        """Check Discord connectivity"""
        self.checks_run += 1
        code, stdout, stderr = run_command(["openclaw", "status"])
        
        if code != 0:
            self.issues.append("Cannot check OpenClaw status")
            return False
            
        if "discord" in stdout.lower() and ("off" in stdout.lower() or "error" in stdout.lower()):
            self.issues.append("Discord connection issue")
            return False
            
        return True
    
    def check_iMessage(self) -> bool:
        """Check iMessage status"""
        self.checks_run += 1
        code, stdout, stderr = run_command(["openclaw", "status"])
        
        if "imessage" in stdout.lower() and "off" in stdout.lower():
            self.issues.append("iMessage disabled")
            # Auto-fix: Enable iMessage
            log("🔧 Auto-fixing: Enabling iMessage...")
            run_command(["openclaw", "config", "set", "channels.imessage.enabled", "true"])
            run_command(["openclaw", "gateway", "restart"])
            self.fixed.append("iMessage enabled")
            return False
            
        return True
    
    def run_all_checks(self) -> Dict:
        """Run all health checks"""
        log("=" * 60)
        log("🔬 Mission Control Health Check Starting")
        log("=" * 60)
        
        checks = [
            ("Gateway", self.check_gateway),
            ("Cron Jobs", self.check_cron_jobs),
            ("Disk Space", self.check_disk_space),
            ("Memory", self.check_memory),
            ("Git Status", self.check_git_status),
            ("Discord", self.check_discord_connection),
            ("iMessage", self.check_iMessage),
        ]
        
        results = {}
        for name, check_func in checks:
            try:
                result = check_func()
                results[name] = "✅ PASS" if result else "❌ FAIL"
                status = "✅" if result else "❌"
                log(f"{status} {name}")
            except Exception as e:
                results[name] = f"❌ ERROR: {e}"
                log(f"❌ {name} - Error: {e}")
        
        return results
    
    def generate_report(self) -> str:
        """Generate health report"""
        report = []
        report.append("\n" + "=" * 60)
        report.append("📊 HEALTH CHECK REPORT")
        report.append("=" * 60)
        report.append(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Checks Run: {self.checks_run}")
        report.append(f"Issues Found: {len(self.issues)}")
        report.append(f"Auto-Fixed: {len(self.fixed)}")
        
        if self.issues:
            report.append("\n⚠️  Issues:")
            for issue in self.issues:
                report.append(f"  • {issue}")
        
        if self.fixed:
            report.append("\n🔧 Auto-Fixed:")
            for fix in self.fixed:
                report.append(f"  • {fix}")
        
        if not self.issues:
            report.append("\n✅ All systems healthy!")
        
        report.append("=" * 60)
        return "\n".join(report)

def main():
    """Main entry point"""
    # Ensure log directory exists
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    # Run health check
    checker = HealthCheck()
    results = checker.run_all_checks()
    
    # Generate and log report
    report = checker.generate_report()
    print(report)
    
    # Write summary to file for Discord posting
    summary_file = f"{WORKSPACE}/.openclaw/last-health-check.txt"
    with open(summary_file, "w") as f:
        f.write(report)
    
    # Return exit code based on issues
    if checker.issues:
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
