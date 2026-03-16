#!/usr/bin/env python3
"""
Intelligent Skip Router - MLX First with Smart Escalation
Skips MiniMax for clearly complex tasks that MLX can't handle
"""

import asyncio
import json
import os
import re
import time
import sys
from typing import Optional, Dict, Any, List, Tuple
from dataclasses import dataclass
from enum import Enum
from aiohttp import web
import aiohttp

MLX_PORT = 18888
KIMI_URL = "https://api.moonshot.cn/v1/chat/completions"
MINIMAX_URL = "https://api.minimaxi.chat/v1/text/chatcompletion_v2"
ROUTER_PORT = 11435

KIMI_API_KEY = os.environ.get('KIMI_API_KEY') or os.environ.get('MOONSHOT_API_KEY', '')
MINIMAX_API_KEY = os.environ.get('MINIMAX_API_KEY', '')


class TaskCategory(Enum):
    SIMPLE = "simple"           # MLX can handle
    MEDIUM = "medium"           # Try MiniMax if MLX fails
    COMPLEX = "complex"         # Skip MiniMax, go straight to Kimi
    RESEARCH = "research"       # Skip MiniMax, go straight to Kimi
    CREATIVE = "creative"       # Try MiniMax if MLX fails


@dataclass
class FailureAnalysis:
    failed: bool
    failure_type: str  # 'capability', 'timeout', 'error', 'unclear'
    confidence: float
    skip_minimax: bool  # If True, go straight to Kimi
    reasoning: str


class IntelligentSkipRouter:
    """MLX first, but skip MiniMax for clearly complex failures"""
    
    def __init__(self):
        self.mlx_url = f"http://127.0.0.1:{MLX_PORT}/v1/chat/completions"
        self.session: Optional[aiohttp.ClientSession] = None
        
        # Task category patterns
        self.complex_patterns = [
            r'\b(architecture|system\s+design|microservices?|distributed)\b',
            r'\b(integration|deploy|infrastructure|pipeline|devops)\b',
            r'\b(optimize|performance\s+tuning|scalability|load\s+balanc)\b',
            r'\b(refactor|rewrite)\s+(legacy|entire|monolith)\b',
            r'\b(design\s+pattern|architectural\s+decision)\b',
            r'\b(security\s+audit|penetration\s+test|vulnerability)\b',
            r'\b(machine\s+learning|AI\s+model|neural\s+network|training)\b',
            r'\b(blockchain|smart\s+contract|web3|crypto)\b',
        ]
        
        self.research_patterns = [
            r'\b(research|find|compare|analyze)\s+(technologies|solutions|options)\b',
            r'\b(best\s+practice|industry\s+standard|benchmark)\b',
            r'\b(market\s+analysis|competitor|trend\s+analysis)\b',
            r'\b(what\s+is|how\s+does)\s+(work|function|compare\s+to)\b',
        ]
        
        self.medium_patterns = [
            r'\b(create|build|make)\s+(script|tool|function|component)\b',
            r'\b(implement|add)\s+(feature|endpoint|API|route)\b',
            r'\b(fix|debug)\s+(bug|issue|error)\b',
            r'\b(write|generate)\s+(code|function|class|module)\b',
            r'\b(explain|describe)\s+(how|what)\s+to\b',
        ]
        
        # Failure type indicators
        self.capability_indicators = [
            r'\bi\s+(do\s+not|don\'t)\s+(have|possess|know)\b',
            r'\bi\s+(cannot|can\'t|am\s+unable\s+to)\s+(help|assist|provide)\b',
            r'\bthat\s+(is|would\s+be)\s+beyond\s+my\s+(capabilities|knowledge)\b',
            r'\bi\'m\s+not\s+(equipped|designed|able)\s+to\b',
            r'\bthis\s+requires\s+(expertise|knowledge)\s+beyond\b',
            r'\b(you|i)\s+should\s+(consult|ask|seek)\s+(an\s+expert|a\s+specialist)\b',
        ]
        
        self.unclear_indicators = [
            r'\bi\s+need\s+(more\s+)?(context|information|clarification)\b',
            r'\bcan\s+you\s+(please\s+)?(clarify|specify|explain)\b',
            r'\b(not\s+sure|unclear)\s+(what|which|how)\b',
        ]
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    def categorize_task(self, message: str) -> TaskCategory:
        """Categorize task to determine escalation path"""
        msg_lower = message.lower()
        
        # Check complex first (highest priority)
        if any(re.search(p, msg_lower) for p in self.complex_patterns):
            return TaskCategory.COMPLEX
        
        # Check research
        if any(re.search(p, msg_lower) for p in self.research_patterns):
            return TaskCategory.RESEARCH
        
        # Check medium
        if any(re.search(p, msg_lower) for p in self.medium_patterns):
            return TaskCategory.MEDIUM
        
        # Default to simple
        return TaskCategory.SIMPLE
    
    def analyze_failure(self, response_text: str, user_message: str) -> FailureAnalysis:
        """Analyze WHY MLX failed to determine escalation path"""
        text_lower = response_text.lower()
        msg_lower = user_message.lower()
        
        # Check for capability limitations (should skip MiniMax)
        for pattern in self.capability_indicators:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return FailureAnalysis(
                    failed=True,
                    failure_type='capability',
                    confidence=0.85,
                    skip_minimax=True,
                    reasoning="MLX explicitly stated capability limitation"
                )
        
        # Check for unclear request (don't escalate, ask for clarification)
        for pattern in self.unclear_indicators:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return FailureAnalysis(
                    failed=True,
                    failure_type='unclear',
                    confidence=0.70,
                    skip_minimax=True,  # Skip because it's not a capability issue
                    reasoning="Request unclear, needs clarification not escalation"
                )
        
        # Check response quality
        if len(response_text.strip()) < 30:
            return FailureAnalysis(
                failed=True,
                failure_type='error',
                confidence=0.60,
                skip_minimax=False,
                reasoning="Response too short, possible error"
            )
        
        # Check for hallucination (repetitive nonsense)
        words = response_text.split()
        if len(words) > 20:
            unique_ratio = len(set(w.lower() for w in words)) / len(words)
            if unique_ratio < 0.4:
                return FailureAnalysis(
                    failed=True,
                    failure_type='error',
                    confidence=0.75,
                    skip_minimax=False,
                    reasoning="Possible hallucination (repetitive content)"
                )
        
        # Check if just echoes input
        user_words = set(msg_lower.split())
        response_words = set(text_lower.split())
        if len(user_words) > 5:
            overlap = len(user_words & response_words) / len(user_words)
            if overlap > 0.75 and len(response_text) < len(user_message) * 2:
                return FailureAnalysis(
                    failed=True,
                    failure_type='error',
                    confidence=0.65,
                    skip_minimax=False,
                    reasoning="Response mostly echoes input"
                )
        
        # Default: assume it worked
        return FailureAnalysis(
            failed=False,
            failure_type='none',
            confidence=0.5,
            skip_minimax=False,
            reasoning="Response appears valid"
        )
    
    async def query_mlx(self, messages: List[Dict], timeout: int = 45) -> Tuple[Optional[Dict], FailureAnalysis]:
        """Query MLX and analyze the result"""
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
                    data = await resp.json()
                    if 'choices' in data:
                        response_text = data['choices'][0].get('message', {}).get('content', '')
                        user_msg = messages[-1].get('content', '') if messages else ''
                        analysis = self.analyze_failure(response_text, user_msg)
                        return data, analysis
                    else:
                        return data, FailureAnalysis(True, 'error', 0.5, False, "No choices in response")
                else:
                    error_text = await resp.text()
                    return None, FailureAnalysis(True, 'error', 0.5, False, f"HTTP {resp.status}")
        except asyncio.TimeoutError:
            return None, FailureAnalysis(True, 'timeout', 0.8, False, "MLX timeout")
        except Exception as e:
            return None, FailureAnalysis(True, 'error', 0.5, False, str(e))
    
    async def query_minimax(self, messages: List[Dict]) -> Optional[Dict]:
        """Query MiniMax"""
        if not MINIMAX_API_KEY:
            return None
        
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
                    if 'choices' in data:
                        return data
                    reply = data.get('reply', '')
                    return {
                        "choices": [{
                            "message": {"role": "assistant", "content": reply},
                            "finish_reason": "stop"
                        }],
                        "model": "minimax"
                    }
        except Exception as e:
            print(f"  MiniMax error: {e}", file=sys.stderr)
        return None
    
    async def query_kimi(self, messages: List[Dict]) -> Optional[Dict]:
        """Query Kimi"""
        if not KIMI_API_KEY:
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
                    data['model'] = 'kimi'
                    return data
        except Exception as e:
            print(f"  Kimi error: {e}", file=sys.stderr)
        return None
    
    async def route_request(self, request_data: Dict) -> Dict:
        """Main routing with intelligent skip logic"""
        messages = request_data.get("messages", [])
        if not messages:
            return {"error": "No messages provided"}
        
        user_message = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_message = m.get("content", "")
                break
        
        # Pre-categorize the task
        category = self.categorize_task(user_message)
        print(f"\n[Router] Task category: {category.value}", file=sys.stderr)
        
        # === STAGE 1: Try MLX ===
        print(f"[Router] Stage 1: MLX 14B...", file=sys.stderr)
        mlx_result, analysis = await self.query_mlx(messages, timeout=45)
        
        if mlx_result and not analysis.failed:
            print(f"[Router] ✓ MLX success", file=sys.stderr)
            mlx_result['_routing'] = {
                'used': 'mlx_14b',
                'cost': 0,
                'category': category.value
            }
            return mlx_result
        
        # MLX failed - analyze why
        print(f"[Router] ⚠ MLX {analysis.failure_type}: {analysis.reasoning}", file=sys.stderr)
        
        # If unclear request, return MLX's clarification request
        if analysis.failure_type == 'unclear':
            print(f"[Router] → Returning clarification request (no escalation)", file=sys.stderr)
            mlx_result['_routing'] = {
                'used': 'mlx_14b',
                'cost': 0,
                'note': 'clarification_needed'
            }
            return mlx_result
        
        # Determine escalation path
        skip_minimax = analysis.skip_minimax or category in [TaskCategory.COMPLEX, TaskCategory.RESEARCH]
        
        if skip_minimax:
            print(f"[Router] → Skipping MiniMax (capability issue or complex task)", file=sys.stderr)
        else:
            # === STAGE 2: Try MiniMax ===
            print(f"[Router] Stage 2: MiniMax...", file=sys.stderr)
            minimax_result = await self.query_minimax(messages)
            
            if minimax_result:
                print(f"[Router] ✓ MiniMax success", file=sys.stderr)
                minimax_result['_routing'] = {
                    'used': 'minimax',
                    'previous': 'mlx_14b',
                    'cost': 'medium',
                    'category': category.value,
                    'mlx_failure': analysis.failure_type
                }
                return minimax_result
            
            print(f"[Router] ⚠ MiniMax failed", file=sys.stderr)
        
        # === STAGE 3: Kimi (final) ===
        print(f"[Router] Stage 3: Kimi K2.5...", file=sys.stderr)
        kimi_result = await self.query_kimi(messages)
        
        if kimi_result:
            print(f"[Router] ✓ Kimi success", file=sys.stderr)
            kimi_result['_routing'] = {
                'used': 'kimi',
                'previous': 'mlx_14b' if skip_minimax else 'minimax',
                'skipped': 'minimax' if skip_minimax else None,
                'cost': 'high',
                'category': category.value,
                'mlx_failure': analysis.failure_type
            }
            return kimi_result
        
        # All failed
        print(f"[Router] ✗ All models failed", file=sys.stderr)
        return {
            "error": "All models failed",
            "attempted": ['mlx_14b'] + (['minimax'] if not skip_minimax else []) + ['kimi'],
            "category": category.value
        }


# HTTP Server
routes = web.RouteTableDef()
router_instance: Optional[IntelligentSkipRouter] = None


@routes.get('/v1/models')
async def list_models(request):
    return web.json_response({
        "object": "list",
        "data": [{
            "id": "intelligent-agent",
            "object": "model",
            "created": int(time.time()),
            "owned_by": "intelligent-skip-router"
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
        "router": "intelligent-skip",
        "strategy": "mlx-first-smart-escalation",
        "features": ["task-categorization", "failure-analysis", "minimax-skip"]
    })


async def init_app():
    global router_instance
    router_instance = IntelligentSkipRouter()
    await router_instance.__aenter__()
    
    app = web.Application()
    app.add_routes(routes)
    
    async def cleanup(app):
        await router_instance.__aexit__()
    app.on_cleanup.append(cleanup)
    
    return app


def main():
    print(f"🧠 Intelligent Skip Router on port {ROUTER_PORT}")
    print(f"   Strategy: Smart Escalation (Skip MiniMax when appropriate)")
    print("")
    print("Task Categories:")
    print("  • Simple/Creative  → MLX → MiniMax → Kimi (if needed)")
    print("  • Complex/Research → MLX → Kimi (skips MiniMax)")
    print("")
    print("Skip triggers:")
    print("  • MLX says 'I cannot' / 'beyond my capabilities'")
    print("  • Architecture/design tasks")
    print("  • Research/analysis tasks")
    print("  • ML/blockchain/security tasks")
    print("")
    print("Add to OpenClaw:")
    print(f'  "baseUrl": "http://127.0.0.1:{ROUTER_PORT}/v1"')
    print("")
    
    app = asyncio.run(init_app())
    web.run_app(app, host='127.0.0.1', port=ROUTER_PORT, print=None)


if __name__ == "__main__":
    main()
