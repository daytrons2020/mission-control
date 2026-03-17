#!/usr/bin/env python3
"""
Three-Tier Smart Router for Mission Control
Routes tasks to MLX 14B, MiniMax, or Kimi based on complexity
"""

import asyncio
import json
import os
import re
import time
import sys
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from enum import Enum
import aiohttp
from aiohttp import web

# Configuration
MLX_PORT = 18888
KIMI_URL = "https://api.moonshot.cn/v1/chat/completions"
MINIMAX_URL = "https://api.minimaxi.chat/v1/text/chatcompletion_v2"
ROUTER_PORT = 11435

def get_openclaw_key(provider: str) -> str:
    """Get API key from OpenClaw keychain"""
    try:
        import subprocess
        result = subprocess.run(
            ["openclaw", "auth", "get", provider],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            # Parse output - usually "KEY: value" format
            for line in result.stdout.split('\n'):
                if ':' in line and 'key' in line.lower():
                    return line.split(':', 1)[1].strip()
                # Try second word if format is different
                parts = line.split()
                if len(parts) >= 2:
                    return parts[-1].strip()
    except Exception:
        pass
    return ""

# API Keys - try OpenClaw first, then environment
KIMI_API_KEY = get_openclaw_key("moonshot") or os.environ.get('KIMI_API_KEY') or os.environ.get('MOONSHOT_API_KEY', '')
MINIMAX_API_KEY = get_openclaw_key("minimax") or os.environ.get('MINIMAX_API_KEY', '')

class TaskComplexity(Enum):
    SIMPLE = "simple"      # MLX 14B
    MEDIUM = "medium"      # MiniMax
    COMPLEX = "complex"    # Kimi K2.5

@dataclass
class TaskAnalysis:
    complexity: TaskComplexity
    confidence: float
    estimated_tokens: int
    reasoning: str
    recommended_model: str

class ThreeTierRouter:
    def __init__(self):
        self.mlx_url = f"http://127.0.0.1:{MLX_PORT}/v1/chat/completions"
        self.session: Optional[aiohttp.ClientSession] = None
        
        # Simple patterns -> MLX 14B
        self.simple_patterns = [
            r'^\s*(hi|hello|hey|yo)\s*$',
            r'^\s*(thanks|thank you|ty)\s*$',
            r'^(what is|what\'s|define)\s+\w+\??$',
            r'^explain\s+\w+\s+in\s+(one|a)\s+sentence',
            r'^(fix|correct)\s+this\s+syntax',
            r'^/(explain|fix|check|help)',
            r'^(create|write)\s+a\s+(simple|basic|short)\s+',
            r'^how\s+do\s+I\s+\w+\s+in\s+\w+',
            r'^(convert|change)\s+\w+\s+to\s+\w+',
        ]
        
        # Complex patterns -> Kimi
        self.complex_patterns = [
            r'(design|architect)\s+(a|an)\s+(system|platform|infrastructure)',
            r'(implement|build)\s+(a|an)\s+(complex|distributed|scalable)',
            r'(debug|troubleshoot)\s+(complex|complicated|production)',
            r'(review|audit)\s+(architecture|system|codebase)',
            r'(optimize|improve)\s+(performance|scalability|architecture)',
            r'\b(microservices?|distributed|scalable|enterprise)\b',
            r'\b(integrat(e|ion)|deploy(ment)?|pipeline|infrastructure)\b',
            r'(refactor|rewrite)\s+(entire|whole|legacy)',
            r'(migrate|upgrade)\s+.*\s+to\s+(new|different)',
            r'(compare|contrast|evaluate).*(approach|solution|technology)',
        ]
        
        # Medium patterns -> MiniMax
        self.medium_patterns = [
            r'(create|build|make)\s+(a|an)\s+(script|tool|function)',
            r'(implement|add)\s+(a|an)\s+(feature|endpoint|route)',
            r'(fix|debug)\s+(bug|issue|error|problem)',
            r'(write|generate)\s+(code|function|class)',
            r'(explain|describe)\s+(how|what|why)',
            r'^(how|what|why)\s+(do|is|are|should)',
            r'\b(api|database|component|module)\b',
            r'\b(react|vue|node|python|javascript)\b',
        ]
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    def analyze_task(self, messages: List[Dict]) -> TaskAnalysis:
        """Analyze task complexity"""
        text = " ".join([m.get("content", "") for m in messages if m.get("role") == "user"])
        text_lower = text.lower()
        word_count = len(text.split())
        
        simple_score = sum(1 for p in self.simple_patterns if re.search(p, text_lower, re.I))
        complex_score = sum(2 for p in self.complex_patterns if re.search(p, text_lower, re.I))
        medium_score = sum(1 for p in self.medium_patterns if re.search(p, text_lower, re.I))
        
        token_estimate = word_count * 1.3
        
        # Length heuristics
        if word_count < 30:
            simple_score += 1
        elif word_count > 200:
            complex_score += 1
        elif word_count > 80:
            medium_score += 1
        
        # Code blocks
        code_blocks = text.count('```')
        if code_blocks > 2:
            complex_score += 1
        elif code_blocks > 0:
            medium_score += 1
        
        # Determine tier
        if complex_score >= 3 or (complex_score > medium_score and complex_score > simple_score):
            return TaskAnalysis(
                complexity=TaskComplexity.COMPLEX,
                confidence=min(complex_score * 0.25, 0.9),
                estimated_tokens=int(token_estimate),
                reasoning=f"Complex patterns matched (C:{complex_score} M:{medium_score} S:{simple_score})",
                recommended_model="kimi"
            )
        elif simple_score >= 2 or word_count < 40:
            return TaskAnalysis(
                complexity=TaskComplexity.SIMPLE,
                confidence=min(simple_score * 0.4 + 0.3, 0.9),
                estimated_tokens=int(token_estimate),
                reasoning=f"Simple patterns matched (C:{complex_score} M:{medium_score} S:{simple_score})",
                recommended_model="mlx_14b"
            )
        else:
            return TaskAnalysis(
                complexity=TaskComplexity.MEDIUM,
                confidence=min(medium_score * 0.3 + 0.4, 0.8),
                estimated_tokens=int(token_estimate),
                reasoning=f"Medium complexity (C:{complex_score} M:{medium_score} S:{simple_score})",
                recommended_model="minimax"
            )
    
    async def query_mlx_14b(self, messages: List[Dict]) -> Optional[Dict]:
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
                timeout=aiohttp.ClientTimeout(total=30)
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception as e:
            print(f"MLX error: {e}", file=sys.stderr)
        return None
    
    async def query_minimax(self, messages: List[Dict]) -> Optional[Dict]:
        """Query MiniMax API"""
        if not MINIMAX_API_KEY:
            print("MiniMax: No API key", file=sys.stderr)
            return None
        
        # Convert messages to MiniMax format
        user_msg = ""
        for m in messages:
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
                    elif 'base_resp' in data and data['base_resp'].get('status_code') == 0:
                        return {
                            "choices": [{
                                "message": {
                                    "role": "assistant",
                                    "content": data.get('reply', '')
                                },
                                "finish_reason": "stop"
                            }]
                        }
        except Exception as e:
            print(f"MiniMax error: {e}", file=sys.stderr)
        return None
    
    async def query_kimi(self, messages: List[Dict]) -> Optional[Dict]:
        """Query Kimi API"""
        if not KIMI_API_KEY:
            print("Kimi: No API key", file=sys.stderr)
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
                timeout=aiohttp.ClientTimeout(total=120)
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception as e:
            print(f"Kimi error: {e}", file=sys.stderr)
        return None
    
    async def route_request(self, request_data: Dict) -> Dict:
        """Main routing logic with fallback chain"""
        messages = request_data.get("messages", [])
        if not messages:
            return {"error": "No messages provided"}
        
        # Analyze task
        analysis = self.analyze_task(messages)
        print(f"\n[Router] {analysis.complexity.value.upper()} (confidence: {analysis.confidence:.0%})", file=sys.stderr)
        print(f"[Router] {analysis.reasoning}", file=sys.stderr)
        
        result = None
        used_model = analysis.recommended_model
        
        # Try primary model
        if analysis.recommended_model == "mlx_14b":
            print("[Router] → MLX 14B", file=sys.stderr)
            result = await self.query_mlx_14b(messages)
            if result:
                print("[Router] ✓ MLX 14B success", file=sys.stderr)
            else:
                print("[Router] ✗ MLX failed, → MiniMax", file=sys.stderr)
                used_model = "minimax"
                result = await self.query_minimax(messages)
        
        elif analysis.recommended_model == "minimax":
            print("[Router] → MiniMax", file=sys.stderr)
            result = await self.query_minimax(messages)
            if result:
                print("[Router] ✓ MiniMax success", file=sys.stderr)
            else:
                print("[Router] ✗ MiniMax failed, → Kimi", file=sys.stderr)
                used_model = "kimi"
                result = await self.query_kimi(messages)
        
        else:  # complex -> kimi
            print("[Router] → Kimi K2.5", file=sys.stderr)
            result = await self.query_kimi(messages)
            if result:
                print("[Router] ✓ Kimi success", file=sys.stderr)
            else:
                print("[Router] ✗ Kimi failed, → MiniMax fallback", file=sys.stderr)
                used_model = "minimax"
                result = await self.query_minimax(messages)
        
        # Final fallback
        if not result and used_model != "mlx_14b":
            print("[Router] → Final fallback: MLX 14B", file=sys.stderr)
            result = await self.query_mlx_14b(messages)
            if result:
                used_model = "mlx_14b"
        
        if result:
            # Add routing info
            result['_routing'] = {
                'intended': analysis.recommended_model,
                'actual': used_model,
                'complexity': analysis.complexity.value,
                'confidence': analysis.confidence
            }
            return result
        
        return {"error": "All models failed", "fallback_recommendation": "manual_retry"}

# HTTP Server
routes = web.RouteTableDef()
router_instance: Optional[ThreeTierRouter] = None

@routes.get('/v1/models')
async def list_models(request):
    return web.json_response({
        "object": "list",
        "data": [{
            "id": "smart-agent",
            "object": "model",
            "created": int(time.time()),
            "owned_by": "three-tier-router"
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
        "router": "three-tier",
        "models": ["mlx-14b", "minimax", "kimi"]
    })

async def init_app():
    global router_instance
    router_instance = ThreeTierRouter()
    await router_instance.__aenter__()
    
    app = web.Application()
    app.add_routes(routes)
    
    async def cleanup(app):
        await router_instance.__aexit__()
    app.on_cleanup.append(cleanup)
    
    return app

def main():
    print(f"🧠 Three-Tier Smart Router starting on port {ROUTER_PORT}...")
    print(f"   URL: http://127.0.0.1:{ROUTER_PORT}")
    print(f"   Model: smart-agent (auto-routing)")
    print("")
    print("Routing Strategy:")
    print("  • Simple tasks  → MLX 14B (local, fast, free)")
    print("  • Medium tasks  → MiniMax (cloud, balanced)")
    print("  • Complex tasks → Kimi K2.5 (cloud, powerful)")
    print("")
    print("Fallback chain: MLX → MiniMax → Kimi → MLX")
    print("")
    print("Add to OpenClaw config:")
    print(f'  "baseUrl": "http://127.0.0.1:{ROUTER_PORT}/v1"')
    print("")
    
    app = asyncio.run(init_app())
    web.run_app(app, host='127.0.0.1', port=ROUTER_PORT, print=None)

if __name__ == "__main__":
    main()
