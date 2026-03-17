#!/usr/bin/env python3
"""
Smart Router with Automatic Model Switching
Switches to 24B for complex tasks, back to 14B for simple ones
"""

import asyncio
import json
import os
import re
import subprocess
import time
from typing import Optional, Dict, Any, List
from aiohttp import web
import aiohttp

MLX_PORT = 18888
KIMI_CODE_PORT = 11436
ROUTER_PORT = 11435
SWITCH_SCRIPT = os.path.expanduser("~/switch_mlx_model.sh")
MODEL_STATE_FILE = os.path.expanduser("~/.current_mlx_model")


class SmartRouterWithSwitching:
    """Router that switches MLX models based on task complexity"""
    
    def __init__(self):
        self.mlx_url = f"http://127.0.0.1:{MLX_PORT}/v1/chat/completions"
        self.kimi_code_url = f"http://127.0.0.1:{KIMI_CODE_PORT}/v1/chat/completions"
        self.last_model_switch = 0
        self.switch_cooldown = 30  # Don't switch more often than 30s
    
    def get_current_model(self) -> str:
        """Check which model is currently loaded"""
        try:
            with open(MODEL_STATE_FILE, 'r') as f:
                return f.read().strip()
        except:
            return "14b"  # Default
    
    async def switch_model(self, target: str) -> bool:
        """Switch MLX model (14b or 24b)"""
        current = self.get_current_model()
        if current == target:
            return True
        
        # Check cooldown
        if time.time() - self.last_model_switch < self.switch_cooldown:
            print(f"  [Switch] Cooling down, keeping {current}", file=sys.stderr)
            return False
        
        print(f"  [Switch] Switching from {current} to {target}...", file=sys.stderr)
        
        try:
            proc = await asyncio.create_subprocess_exec(
                "bash", SWITCH_SCRIPT, target,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
            
            if proc.returncode == 0:
                self.last_model_switch = time.time()
                print(f"  [Switch] ✓ Now using {target}", file=sys.stderr)
                return True
            else:
                print(f"  [Switch] ✗ Failed: {stderr.decode()[:200]}", file=sys.stderr)
                return False
        except Exception as e:
            print(f"  [Switch] ✗ Error: {e}", file=sys.stderr)
            return False
    
    def is_complex_task(self, message: str) -> bool:
        """Determine if task needs 24B model"""
        complex_patterns = [
            r'\b(architecture|design|system)\b',
            r'\b(algorithm|optimize|performance)\b',
            r'\b(refactor|rewrite)\s+(entire|complex)\b',
            r'\b(microservice|distributed|scalable)\b',
            r'\b(machine\s+learning|AI\s+model|neural)\b',
            r'\b(debug|troubleshoot)\s+(complex|difficult)\b',
            r'\b(explain|analyze)\s+(in\s+depth|deeply)\b',
            r'\bcompare\s+and\s+contrast\b',
            r'\bstep\s+by\s+step\s+(explanation|guide)\b',
        ]
        
        msg_lower = message.lower()
        word_count = len(message.split())
        
        # Long messages often need more power
        if word_count > 200:
            return True
        
        # Check patterns
        for pattern in complex_patterns:
            if re.search(pattern, msg_lower):
                return True
        
        return False
    
    async def query_mlx(self, messages: List[Dict], model: str = "14b") -> Optional[Dict]:
        """Query MLX server"""
        model_id = (
            "mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit" if model == "14b"
            else "mlx-community/Mistral-Small-24B-Instruct-2501-4bit"
        )
        
        payload = {
            "model": model_id,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000,
            "stream": False
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    self.mlx_url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60 if model == "14b" else 120)
                ) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        data['_mlx_model'] = model
                        return data
            except Exception as e:
                print(f"  MLX {model} error: {e}", file=sys.stderr)
        return None
    
    async def query_kimi_code(self, messages: List[Dict]) -> Optional[Dict]:
        """Query Kimi Code for file editing"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    self.kimi_code_url,
                    json={"messages": messages, "model": "kimi-code"},
                    timeout=aiohttp.ClientTimeout(total=180)
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
            except Exception as e:
                print(f"  Kimi Code error: {e}", file=sys.stderr)
        return None
    
    async def route_request(self, request_data: Dict) -> Dict:
        """Route with automatic model switching"""
        messages = request_data.get("messages", [])
        if not messages:
            return {"error": "No messages"}
        
        user_message = messages[-1].get("content", "") if messages else ""
        is_coding = any(kw in user_message.lower() for kw in [
            'create', 'write', 'generate', 'file', 'script', 'code', 
            'implement', 'function', 'class', 'component'
        ])
        is_complex = self.is_complex_task(user_message)
        
        print(f"\n[Router] Request: {user_message[:50]}...", file=sys.stderr)
        print(f"[Router] Coding: {is_coding}, Complex: {is_complex}", file=sys.stderr)
        
        # Coding tasks -> Kimi Code (file editing)
        if is_coding:
            print("[Router] Coding task -> Kimi Code", file=sys.stderr)
            result = await self.query_kimi_code(messages)
            if result:
                result['_routing'] = {'used': 'kimi-code', 'reason': 'coding_task'}
                return result
        
        # Complex tasks -> Try 24B
        if is_complex:
            print("[Router] Complex task -> Switching to 24B", file=sys.stderr)
            if await self.switch_model("24b"):
                result = await self.query_mlx(messages, "24b")
                if result:
                    result['_routing'] = {
                        'used': 'mlx_24b',
                        'reason': 'complex_task',
                        'switched': True
                    }
                    return result
                print("[Router] 24B failed, falling back to 14B", file=sys.stderr)
            
            # Fallback to 14B
            await self.switch_model("14b")
        
        # Default/Simple tasks -> 14B
        current = self.get_current_model()
        if current == "24b" and not is_complex:
            print("[Router] Simple task -> Switching back to 14B", file=sys.stderr)
            await self.switch_model("14b")
        
        print(f"[Router] Using {self.get_current_model()}", file=sys.stderr)
        result = await self.query_mlx(messages, "14b")
        
        if result:
            result['_routing'] = {
                'used': f"mlx_{self.get_current_model()}",
                'reason': 'default'
            }
            return result
        
        # Final fallback
        print("[Router] All failed", file=sys.stderr)
        return {"error": "All models failed"}


# HTTP Server
routes = web.RouteTableDef()

@routes.get('/v1/models')
async def list_models(request):
    return web.json_response({
        "object": "list",
        "data": [{"id": "auto-switching-agent", "object": "model"}]
    })

@routes.post('/v1/chat/completions')
async def chat_completions(request):
    try:
        data = await request.json()
        router = SmartRouterWithSwitching()
        result = await router.route_request(data)
        if "error" in result:
            return web.json_response(result, status=503)
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@routes.get('/health')
async def health(request):
    current_model = "14b"
    try:
        with open(MODEL_STATE_FILE, 'r') as f:
            current_model = f.read().strip()
    except:
        pass
    
    return web.json_response({
        "status": "healthy",
        "router": "auto-switching",
        "current_model": current_model,
        "strategy": "mlx-14b/24b-auto-switch + kimi-code"
    })

def main():
    print(f"🧠 Smart Router with Model Switching on port {ROUTER_PORT}")
    print("  Strategy:")
    print("    • Simple tasks -> MLX 14B (fast)")
    print("    • Complex tasks -> MLX 24B (powerful)")
    print("    • Coding tasks -> Kimi Code (file editing)")
    print("  Auto-switches based on task complexity")
    print("")
    
    app = web.Application()
    app.add_routes(routes)
    web.run_app(app, host='127.0.0.1', port=ROUTER_PORT, print=None)

if __name__ == "__main__":
    import sys
    main()
