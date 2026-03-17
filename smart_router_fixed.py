#!/usr/bin/env python3
"""
Smart Router - Fixed Version with Proper Session Handling
"""

import asyncio
import json
import os
import re
import time
import sys
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from aiohttp import web
import aiohttp

MLX_PORT = 18888
KIMI_URL = "https://api.moonshot.cn/v1/chat/completions"
MINIMAX_URL = "https://api.minimaxi.chat/v1/text/chatcompletion_v2"
KIMI_CODE_URL = "http://127.0.0.1:11436/v1/chat/completions"
ROUTER_PORT = 11435

KIMI_API_KEY = os.environ.get('KIMI_API_KEY') or os.environ.get('MOONSHOT_API_KEY', '')
MINIMAX_API_KEY = os.environ.get('MINIMAX_API_KEY', '')


class SmartRouter:
    def __init__(self):
        self.mlx_url = f"http://127.0.0.1:{MLX_PORT}/v1/chat/completions"
        
        # Patterns
        self.capability_indicators = [
            r'\bi\s+(do\s+not|don\'t)\s+(have|possess|know)\b',
            r'\bi\s+(cannot|can\'t|am\s+unable\s+to)\s+(help|assist|provide)\b',
            r'\bthat\s+(is|would\s+be)\s+beyond\s+my\s+(capabilities|knowledge)\b',
        ]
    
    async def query_mlx(self, messages: List[Dict]) -> Optional[Dict]:
        """Query MLX 14B with fresh session"""
        payload = {
            "model": "mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000,
            "stream": False
        }
        
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    self.mlx_url,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
            except Exception as e:
                print(f"  MLX error: {e}", file=sys.stderr)
        return None
    
    async def query_kimi_code(self, messages: List[Dict]) -> Optional[Dict]:
        """Query Kimi Code"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(
                    KIMI_CODE_URL,
                    json={"messages": messages, "model": "kimi-code"},
                    timeout=aiohttp.ClientTimeout(total=180)
                ) as resp:
                    if resp.status == 200:
                        return await resp.json()
            except Exception as e:
                print(f"  Kimi Code error: {e}", file=sys.stderr)
        return None
    
    async def route_request(self, request_data: Dict) -> Dict:
        """Route: MLX first, then Kimi Code if needed"""
        messages = request_data.get("messages", [])
        if not messages:
            return {"error": "No messages"}
        
        user_message = messages[-1].get("content", "") if messages else ""
        print(f"\n[Router] Request: {user_message[:50]}...", file=sys.stderr)
        
        # Stage 1: Try MLX
        print("[Router] Trying MLX 14B...", file=sys.stderr)
        mlx_result = await self.query_mlx(messages)
        
        if mlx_result and 'choices' in mlx_result:
            print("[Router] ✓ MLX success", file=sys.stderr)
            mlx_result['_routing'] = {'used': 'mlx_14b', 'cost': 0}
            return mlx_result
        
        print("[Router] ⚠ MLX failed, trying Kimi Code...", file=sys.stderr)
        
        # Stage 2: Try Kimi Code
        kimi_code_result = await self.query_kimi_code(messages)
        
        if kimi_code_result and 'choices' in kimi_code_result:
            print("[Router] ✓ Kimi Code success", file=sys.stderr)
            kimi_code_result['_routing'] = {
                'used': 'kimi-code',
                'previous': 'mlx_14b',
                'note': 'File editing agent'
            }
            return kimi_code_result
        
        print("[Router] ✗ All failed", file=sys.stderr)
        return {"error": "All models failed", "attempted": ["mlx_14b", "kimi-code"]}


# HTTP Server
routes = web.RouteTableDef()

@routes.get('/v1/models')
async def list_models(request):
    return web.json_response({
        "object": "list",
        "data": [{"id": "intelligent-agent", "object": "model"}]
    })

@routes.post('/v1/chat/completions')
async def chat_completions(request):
    try:
        data = await request.json()
        router = SmartRouter()
        result = await router.route_request(data)
        if "error" in result:
            return web.json_response(result, status=503)
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)

@routes.get('/health')
async def health(request):
    return web.json_response({
        "status": "healthy",
        "router": "smart",
        "strategy": "mlx-first-kimi-code-fallback"
    })

def main():
    print(f"🧠 Smart Router on port {ROUTER_PORT}")
    print("  Strategy: MLX 14B → Kimi Code (on failure)")
    print("")
    app = web.Application()
    app.add_routes(routes)
    web.run_app(app, host='127.0.0.1', port=ROUTER_PORT, print=None)

if __name__ == "__main__":
    main()
