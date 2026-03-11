#!/usr/bin/env python3
"""
Ollama Health Check CLI

Monitors Ollama service status, checks model availability,
and provides failover recommendations.

Usage:
    ollama-health.py [options]

Options:
    --quick           Quick connectivity check only
    --model MODEL     Check specific model availability
    --list-models     List all available models
    --failover        Show failover recommendations
    --json            Output in JSON format
    --host HOST       Ollama host (default: localhost:11434)
    --timeout SEC     Connection timeout (default: 10)
    -h, --help        Show this help message
"""

import argparse
import json
import os
import socket
import subprocess
import sys
import time
from dataclasses import asdict, dataclass, field
from typing import Dict, List, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen


# Default models to check
DEFAULT_MODELS = [
    "qwen3:8b",
    "llama3.2",
    "llama3.2:1b",
    "llama3.2:3b",
    "phi4",
    "mistral",
    "gemma2:2b",
    "gemma2:9b",
]

# Fallback recommendations
FALLBACK_PROVIDERS = {
    "openai": {
        "models": ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        "strengths": ["General purpose", "Reliable", "Fast"],
        "env_var": "OPENAI_API_KEY",
    },
    "anthropic": {
        "models": ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
        "strengths": ["Reasoning", "Coding", "Long context"],
        "env_var": "ANTHROPIC_API_KEY",
    },
    "google": {
        "models": ["gemini-1.5-pro", "gemini-1.5-flash"],
        "strengths": ["Multimodal", "Large context", "Free tier"],
        "env_var": "GEMINI_API_KEY",
    },
    "groq": {
        "models": ["llama-3.2-90b-vision-preview", "mixtral-8x7b-32768"],
        "strengths": ["Very fast", "Open models", "Free tier"],
        "env_var": "GROQ_API_KEY",
    },
}


@dataclass
class HealthStatus:
    """Health check results."""

    healthy: bool = False
    host: str = "localhost:11434"
    version: Optional[str] = None
    response_time_ms: Optional[float] = None
    error: Optional[str] = None
    models: List[Dict] = field(default_factory=list)
    system_info: Dict = field(default_factory=dict)
    recommendations: List[str] = field(default_factory=list)


def get_ollama_host(args_host: Optional[str] = None) -> str:
    """Get Ollama host from args or environment."""
    if args_host:
        return args_host
    if os.environ.get("OLLAMA_HOST"):
        return os.environ.get("OLLAMA_HOST")
    return "localhost:11434"


def check_connectivity(host: str, timeout: int = 10) -> tuple[bool, Optional[float], Optional[str]]:
    """Check if Ollama is reachable."""
    try:
        # Parse host:port
        if ":" in host:
            hostname, port_str = host.rsplit(":", 1)
            port = int(port_str)
        else:
            hostname = host
            port = 11434

        start_time = time.time()
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((hostname, port))
        sock.close()
        response_time = (time.time() - start_time) * 1000

        if result == 0:
            return True, response_time, None
        else:
            error_msg = f"Connection failed (code {result})"
            if result == 61:  # Connection refused
                error_msg = "Connection refused - Ollama may not be running"
            elif result == 60:  # Timeout
                error_msg = "Connection timeout - check firewall/network"
            return False, None, error_msg
    except Exception as e:
        return False, None, str(e)


def get_version(host: str, timeout: int = 10) -> Optional[str]:
    """Get Ollama version via API."""
    try:
        url = f"http://{host}/api/version"
        req = Request(url, method="GET")
        with urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode())
            return data.get("version")
    except Exception:
        return None


def list_models_api(host: str, timeout: int = 10) -> List[Dict]:
    """List available models via API."""
    try:
        url = f"http://{host}/api/tags"
        req = Request(url, method="GET")
        with urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode())
            return data.get("models", [])
    except Exception:
        return []


def list_models_cli() -> List[str]:
    """List available models via CLI."""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            models = []
            for line in lines:
                parts = line.split()
                if parts:
                    models.append(parts[0])
            return models
    except Exception:
        pass
    return []


def check_model(host: str, model: str, timeout: int = 10) -> tuple[bool, Optional[str]]:
    """Check if a specific model is available and responsive."""
    try:
        url = f"http://{host}/api/generate"
        payload = json.dumps({
            "model": model,
            "prompt": "Hi",
            "stream": False,
            "options": {"num_predict": 1}
        }).encode()
        
        req = Request(
            url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode())
            if "response" in data or "done" in data:
                return True, None
            return False, "Unexpected response format"
    except URLError as e:
        return False, f"API error: {e.reason}"
    except Exception as e:
        return False, str(e)


def get_system_info() -> Dict:
    """Get system resource information."""
    info = {}
    
    # Try to get memory info
    try:
        if sys.platform == "darwin":  # macOS
            result = subprocess.run(
                ["vm_stat"], capture_output=True, text=True, timeout=5
            )
            info["memory_check"] = "vm_stat available"
        elif sys.platform == "linux":
            result = subprocess.run(
                ["free", "-h"], capture_output=True, text=True, timeout=5
            )
            info["memory"] = result.stdout.strip()
    except Exception as e:
        info["memory_error"] = str(e)
    
    # Check for GPU
    try:
        result = subprocess.run(
            ["system_profiler", "SPDisplaysDataType"],
            capture_output=True, text=True, timeout=5
        )
        if "Metal" in result.stdout or "GPU" in result.stdout:
            info["gpu"] = "Available (Metal)"
    except Exception:
        pass
    
    try:
        result = subprocess.run(
            ["nvidia-smi"], capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            info["gpu"] = "NVIDIA GPU available"
    except Exception:
        pass
    
    return info


def get_failover_recommendations() -> List[Dict]:
    """Get available fallback providers."""
    available = []
    for provider, config in FALLBACK_PROVIDERS.items():
        api_key = os.environ.get(config["env_var"])
        available.append({
            "provider": provider,
            "configured": api_key is not None and api_key.strip() != "",
            "models": config["models"],
            "strengths": config["strengths"],
            "env_var": config["env_var"],
        })
    return available


def generate_recommendations(status: HealthStatus) -> List[str]:
    """Generate troubleshooting recommendations."""
    recommendations = []
    
    if not status.healthy:
        recommendations.append("Start Ollama: ollama serve")
        recommendations.append("Check if Ollama is installed: which ollama")
        recommendations.append(f"Verify OLLAMA_HOST is set correctly (current: {status.host})")
        
        # Check for common issues
        if status.error and "refused" in status.error.lower():
            recommendations.append("Ollama service is not running. Start it with: ollama serve")
    
    if status.models:
        total_size = sum(m.get("size", 0) for m in status.models)
        if total_size > 50 * 1024 * 1024 * 1024:  # > 50GB
            recommendations.append("Consider removing unused models to free disk space")
    
    # Add fallback recommendations
    fallbacks = get_failover_recommendations()
    configured = [f for f in fallbacks if f["configured"]]
    if configured:
        recommendations.append(f"Fallback providers configured: {', '.join(c['provider'] for c in configured)}")
    else:
        recommendations.append("No fallback providers configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, etc. for failover")
    
    return recommendations


def run_health_check(
    host: str, 
    timeout: int, 
    check_model_name: Optional[str] = None
) -> HealthStatus:
    """Run full health check."""
    status = HealthStatus(host=host)
    
    # Check connectivity
    connected, response_time, error = check_connectivity(host, timeout)
    status.healthy = connected
    status.response_time_ms = response_time
    status.error = error
    
    if not connected:
        status.recommendations = generate_recommendations(status)
        return status
    
    # Get version
    status.version = get_version(host, timeout)
    
    # List models via API
    status.models = list_models_api(host, timeout)
    
    # Check specific model if requested
    if check_model_name:
        model_names = [m.get("name", "") for m in status.models]
        model_found = any(check_model_name == m or m.startswith(check_model_name + ":") for m in model_names)
        
        if model_found:
            model_ok, model_error = check_model(host, check_model_name, timeout)
            if not model_ok:
                status.error = f"Model {check_model_name} found but not responsive: {model_error}"
                status.healthy = False
        else:
            status.error = f"Model {check_model_name} not found. Run: ollama pull {check_model_name}"
            status.healthy = False
    
    # Get system info
    status.system_info = get_system_info()
    
    # Generate recommendations
    status.recommendations = generate_recommendations(status)
    
    return status


def print_status(status: HealthStatus, json_output: bool = False):
    """Print health status."""
    if json_output:
        print(json.dumps(asdict(status), indent=2))
        return
    
    # Header
    print("=" * 60)
    print("OLLAMA HEALTH CHECK")
    print("=" * 60)
    
    # Connection status
    if status.healthy:
        print(f"\n✅ Status: HEALTHY")
        if status.response_time_ms:
            print(f"   Response time: {status.response_time_ms:.1f}ms")
    else:
        print(f"\n❌ Status: UNHEALTHY")
        if status.error:
            print(f"   Error: {status.error}")
    
    print(f"   Host: {status.host}")
    
    if status.version:
        print(f"   Version: {status.version}")
    
    # Models
    if status.models:
        print(f"\n📦 Available Models ({len(status.models)}):")
        for model in sorted(status.models, key=lambda x: x.get("name", "")):
            name = model.get("name", "unknown")
            size = model.get("size", 0)
            size_str = format_size(size)
            print(f"   • {name} ({size_str})")
    
    # System info
    if status.system_info:
        print(f"\n💻 System Info:")
        for key, value in status.system_info.items():
            if "\n" in str(value):
                print(f"   {key}:")
                for line in str(value).split("\n")[:5]:
                    print(f"      {line}")
            else:
                print(f"   {key}: {value}")
    
    # Recommendations
    if status.recommendations:
        print(f"\n💡 Recommendations:")
        for rec in status.recommendations:
            print(f"   • {rec}")
    
    print("\n" + "=" * 60)


def print_quick_check(host: str, timeout: int):
    """Print quick connectivity check."""
    connected, response_time, error = check_connectivity(host, timeout)
    
    if connected:
        print(f"✅ Ollama is running on {host}")
        if response_time:
            print(f"   Response time: {response_time:.1f}ms")
        sys.exit(0)
    else:
        print(f"❌ Ollama is not reachable on {host}")
        if error:
            print(f"   Error: {error}")
        sys.exit(1)


def print_models(host: str, timeout: int):
    """Print available models."""
    models = list_models_api(host, timeout)
    
    if not models:
        # Try CLI fallback
        cli_models = list_models_cli()
        if cli_models:
            print(f"Available Models ({len(cli_models)}):")
            for name in cli_models:
                print(f"  {name}")
            return
        print("No models found or Ollama is not running.")
        sys.exit(1)
    
    print(f"Available Models ({len(models)}):")
    for model in sorted(models, key=lambda x: x.get("name", "")):
        name = model.get("name", "unknown")
        size = format_size(model.get("size", 0))
        modified = model.get("modified", "unknown")
        print(f"  {name:30} {size:>10}  {modified}")


def print_failover():
    """Print failover recommendations."""
    fallbacks = get_failover_recommendations()
    
    print("=" * 60)
    print("FALLBACK PROVIDERS")
    print("=" * 60)
    
    for fb in fallbacks:
        status = "✅ Configured" if fb["configured"] else "❌ Not configured"
        print(f"\n{fb['provider'].upper()}")
        print(f"   Status: {status}")
        print(f"   Models: {', '.join(fb['models'][:2])}")
        print(f"   Strengths: {', '.join(fb['strengths'])}")
        if not fb["configured"]:
            print(f"   Setup: export {fb['env_var']}=your_api_key")
    
    print("\n" + "=" * 60)


def format_size(size_bytes: int) -> str:
    """Format bytes to human readable."""
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} PB"


def main():
    parser = argparse.ArgumentParser(
        description="Ollama Health Check - Monitor service status and model availability",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                          # Full health check
  %(prog)s --quick                  # Quick connectivity check
  %(prog)s --model llama3.2         # Check specific model
  %(prog)s --list-models            # List all models
  %(prog)s --failover               # Show fallback options
  %(prog)s --json                   # JSON output
        """
    )
    
    parser.add_argument("--quick", action="store_true", help="Quick connectivity check only")
    parser.add_argument("--model", type=str, help="Check specific model availability")
    parser.add_argument("--list-models", action="store_true", help="List all available models")
    parser.add_argument("--failover", action="store_true", help="Show failover recommendations")
    parser.add_argument("--json", action="store_true", help="Output in JSON format")
    parser.add_argument("--host", type=str, help="Ollama host (default: localhost:11434)")
    parser.add_argument("--timeout", type=int, default=10, help="Connection timeout in seconds")
    
    args = parser.parse_args()
    
    host = get_ollama_host(args.host)
    
    # Handle specific modes
    if args.quick:
        print_quick_check(host, args.timeout)
        return
    
    if args.list_models:
        print_models(host, args.timeout)
        return
    
    if args.failover:
        print_failover()
        return
    
    # Run full health check
    status = run_health_check(host, args.timeout, args.model)
    print_status(status, args.json)
    
    # Exit with appropriate code
    if not status.healthy:
        if status.error and "not found" in status.error.lower():
            sys.exit(2)  # Model not available
        elif status.error and "memory" in status.error.lower():
            sys.exit(3)  # Resource constraints
        else:
            sys.exit(1)  # Connection error
    
    sys.exit(0)


if __name__ == "__main__":
    main()
