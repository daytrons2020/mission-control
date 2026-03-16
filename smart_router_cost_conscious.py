#!/usr/bin/env python3
"""
Cost-Conscious Smart Router for Mission Control
ALL tasks start with MLX 14B. Only escalate to paid APIs on failure.
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

# Configuration
MLX_PORT = 18888
KIMI_URL = "https://api.moonshot.cn/v1/chat/completions"
MINIMAX_URL = "https://api.minimaxi.chat/v1/text/chatcompletion_v2"
ROUTER_PORT = 11435

# API Keys from environment (only used on escalation)
KIMI_API_KEY = os.environ.get('KIMI_API_KEY') or os.environ.get('MOONSHOT_API_KEY', '')
MINIMAX_API_KEY = os.environ.get('MINIMAX_API_KEY', '')


class CostConsciousRouter:
    """Router that tries MLX first, escalates only on failure"""
    
    def __init__(self):
        self.mlx_url = f"http://127.0.0.1:{MLX_PORT}/v1/chat/completions"
        self.session: Optional[aiohttp.ClientSession] = None
        
        # Patterns indicating MLX failure/inability
        self.failure_indicators = [
            r'\bi\s+(cannot|can\'t|am\s+unable|do\s+not\s+know)\b',
            r'\bsorry,?\s+i\s+(don\'t|do\s+not)\b',
            r'\bi\s+don\'t\s+have\s+(access|the\s+ability)\b',
            r'\bthat\s+(is|would\s+be)\s+beyond\s+my\s+capabilities\b',
            r'\bi\'m\s+not\s+(sure|certain|able)\s+(how|if|what)\b',
            r'\b(i\s+need|requires?)\s+(more\s+context|clarification)\b',
        ]
        
        # Complex task indicators - escalate faster for these if MLX struggles
        self.complex_indicators = [
            r'\b(architecture|system\s+design|microservices?)\b',
            r'\b(integrat(e|ing)|deployment|infrastructure)\b',
            r'\b(optimization|performance\s+tuning)\b',
            r'\b(refactor|rewrite)\s+(entire|legacy)\b',
        ]
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    def detect_failure(self, response_text: str, user_message: str) -> tuple[bool, str]:
        """Detect if MLX response indicates failure/inability"""
        text_lower = response_text.lower()
        msg_lower = user_message.lower()
        
        # Check for explicit failure phrases
        for pattern in self.failure_indicators:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True, f"Failure phrase detected: '{pattern}'"
        
        # Empty or too short responses
        if len(response_text.strip()) < 20:
            return True, "Response too short/empty"
        
        # Check if response is just repeating the question
        user_words = set(msg_lower.split())
        response_words = set(text_lower.split())
        overlap = len(user_words & response_words) / max(len(user_words), 1)
        if overlap > 0.8 and len(response_text) < len(user_message) * 1.5:
            return True, "Response mostly repeats input"
        
        # Check for hallucination patterns (nonsense repetition)
        words = response_text.split()
        if len(words) > 10:
            unique_ratio = len(set(words)) / len(words)
            if unique_ratio < 0.3:  # Too much repetition
                return True, "Possible hallucination (high repetition)"
        
        return False, "Response appears valid"
    
    def is_complex_task(self, message: str) -> bool:
        """Check if task is likely complex (for faster escalation)"""
        msg_lower = message.lower()
        return any(re.search(p, msg_lower) for p in self.complex_indicators)
    
    async def query_mlx(self, messages: List[Dict], timeout: int = 45) -> Optional[Dict]:
        """Query MLX 14B"""
        payload = {
            "model": "mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 2000,
            "stream": False
        }
        
        try:
            async with self.session.post(
                self.mlx_url,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=timeout)
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
                else:
                    error = await resp.text()
                    print(f"  MLX HTTP error: {resp.status}", file=sys.stderr)
                    return None
        except asyncio.TimeoutError:
            print("  MLX timeout", file=sys.stderr)
            return None
        except Exception as e:
            print(f"  MLX error: {e}", file=sys.stderr)
            return None
    
    async def query_minimax(self, messages: List[Dict]) -> Optional[Dict]:
        """Query MiniMax as first escalation"""
        if not MINIMAX_API_KEY:
            print("  MiniMax: No API key", file=sys.stderr)
            return None
        
        # Get last user message
        user_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_msg = m.get("content", "")
                break
        
        payload = {
            "model": "MiniMax-Text-01",
            "messages": [{"role": "user", "content": user_msg}],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        headers = {
            "Authorization": f"Bearer {MINIMAX_API_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            async with self.session.post(
                MINIMAX_URL,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # Convert to OpenAI format
                    if 'choices' in data:
                        return data
                    # Handle MiniMax specific format
                    reply = data.get('reply', data.get('choices', [{}])[0].get('message', {}).get('content', ''))
                    return {
                        "choices": [{
                            "message": {"role": "assistant", "content": reply},
                            "finish_reason": "stop"
                        }],
                        "model": "minimax-escalation"
                    }
        except Exception as e:
            print(f"  MiniMax error: {e}", file=sys.stderr)
        return None
    
    async def query_kimi(self, messages: List[Dict]) -> Optional[Dict]:
        """Query Kimi as final escalation"""
        if not KIMI_API_KEY:
            print("  Kimi: No API key", file=sys.stderr)
            return None
        
        payload = {
            "model": "kimi-k2.5",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        headers = {
            "Authorization": f"Bearer {KIMI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            async with self.session.post(
                KIMI_URL,
                json=payload,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=90)
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    data['model'] = 'kimi-escalation'
                    return data
        except Exception as e:
            print(f"  Kimi error: {e}", file=sys.stderr)
        return None
    
    async def route_request(self, request_data: Dict) -> Dict:
        """Main routing: MLX first, escalate only on failure"""
        messages = request_data.get("messages", [])
        if not messages:
            return {"error": "No messages provided"}
        
        # Get user message for analysis
        user_message = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_message = m.get("content", "")
                break
        
        is_complex = self.is_complex_task(user_message)
        if is_complex:
            print(f"\n[Router] Complex task detected, may escalate faster", file=sys.stderr)
        
        # === STAGE 1: Try MLX 14B ===
        print(f"\n[Router] Stage 1: Trying MLX 14B...", file=sys.stderr)
        mlx_result = await self.query_mlx(messages, timeout=45 if not is_complex else 30)
        
        if mlx_result and 'choices' in mlx_result:
            response_text = mlx_result['choices'][0].get('message', {}).get('content', '')
            failed, reason = self.detect_failure(response_text, user_message)
            
            if not failed:
                print(f"[Router] ✓ MLX 14B succeeded", file=sys.stderr)
                mlx_result['_routing'] = {
                    'used': 'mlx_14b',
                    'escalated': False,
                    'cost': 0
                }
                return mlx_result
            else:
                print(f"[Router] ⚠ MLX indicates failure: {reason}", file=sys.stderr)
        else:
            print(f"[Router] ⚠ MLX no response", file=sys.stderr)
        
        # === STAGE 2: Escalate to MiniMax ===
        print(f"[Router] Stage 2: Escalating to MiniMax...", file=sys.stderr)
        minimax_result = await self.query_minimax(messages)
        
        if minimax_result:
            print(f"[Router] ✓ MiniMax succeeded", file=sys.stderr)
            minimax_result['_routing'] = {
                'used': 'minimax',
                'escalated': True,
                'previous_attempt': 'mlx_14b',
                'cost': 'medium'
            }
            return minimax_result
        
        print(f"[Router] ⚠ MiniMax failed", file=sys.stderr)
        
        # === STAGE 3: Final escalation to Kimi ===
        print(f"[Router] Stage 3: Escalating to Kimi K2.5...", file=sys.stderr)
        kimi_result = await self.query_kimi(messages)
        
        if kimi_result:
            print(f"[Router] ✓ Kimi succeeded", file=sys.stderr)
            kimi_result['_routing'] = {
                'used': 'kimi',
                'escalated': True,
                'previous_attempts': ['mlx_14b', 'minimax'],
                'cost': 'high'
            }
            return kimi_result
        
        # === ALL FAILED ===
        print(f"[Router] ✗ All models failed", file=sys.stderr)
        return {
            "error": "All models failed to respond",
            "attempted": ["mlx_14b", "minimax", "kimi"],
            "message": "The task could not be completed. Please try again or simplify your request."
        }


# HTTP Server
routes = web.RouteTableDef()
router_instance: Optional[CostConsciousRouter] = None


@routes.get('/v1/models')
async def list_models(request):
    return web.json_response({
        "object": "list",
        "data": [{
            "id": "cost-conscious-agent",
            "object": "model",
            "created": int(time.time()),
            "owned_by": "mlx-first-router"
        }]
    })


@routes.post('/v1/chat/completions')
async def chat_completions(request):
    try:
        data = await request.json()
        result = await router_instance.route_request(data)
        
        if "error" in result:
            return web.json_response(result, status=503)
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@routes.get('/health')
async def health(request):
    return web.json_response({
        "status": "healthy",
        "router": "cost-conscious",
        "strategy": "mlx-first-escalate-on-failure",
        "models": ["mlx-14b", "minimax", "kimi"]
    })


async def init_app():
    global router_instance
    router_instance = CostConsciousRouter()
    await router_instance.__aenter__()
    
    app = web.Application()
    app.add_routes(routes)
    
    async def cleanup(app):
        await router_instance.__aexit__()
    app.on_cleanup.append(cleanup)
    
    return app


def main():
    print(f"🧠 Cost-Conscious Router starting on port {ROUTER_PORT}...")
    print(f"   URL: http://127.0.0.1:{ROUTER_PORT}")
    print(f"   Model: cost-conscious-agent")
    print("")
    print("Strategy: MLX-First Escalation (Cost-Optimized)")
    print("  1. ALL tasks → MLX 14B (free, local)")
    print("  2. If MLX fails → MiniMax (medium cost)")
    print("  3. If MiniMax fails → Kimi (higher cost)")
    print("")
    print("Escalation triggers:")
    print("  • 'I cannot' / 'I'm unable' responses")
    print("  • Empty/very short responses")
    print("  • Repeating input without answering")
    print("  • Timeout or errors")
    print("")
    print("Add to OpenClaw config:")
    print(f'  "baseUrl": "http://127.0.0.1:{ROUTER_PORT}/v1"')
    print("")
    
    app = asyncio.run(init_app())
    web.run_app(app, host='127.0.0.1', port=ROUTER_PORT, print=None)


if __name__ == "__main__":
    main()
