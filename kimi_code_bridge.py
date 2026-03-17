#!/usr/bin/env python3
"""
Kimi Code Bridge - Exposes Kimi Code CLI as an API endpoint
For complex coding tasks that need file editing and shell execution
"""

import asyncio
import json
import os
import re
import subprocess
import tempfile
import time
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
from aiohttp import web
import aiohttp

KIMI_CODE_PORT = 11436  # Different from smart router (11435)


class KimiCodeBridge:
    """Bridge between OpenAI-compatible API and Kimi Code CLI"""
    
    def __init__(self, work_dir: str = "/tmp/kimi-code-work"):
        self.work_dir = work_dir
        self.session: Optional[aiohttp.ClientSession] = None
        os.makedirs(work_dir, exist_ok=True)
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, *args):
        if self.session:
            await self.session.close()
    
    def is_coding_task(self, message: str) -> bool:
        """Check if task likely requires code editing"""
        coding_patterns = [
            r'\b(create|write|generate)\s+(a|an|the)?\s*(code|script|file|function|class|module)\b',
            r'\b(fix|debug|refactor|update|modify|edit)\s+(the|this)?\s*(code|file|script|function)\b',
            r'\b(implement|add)\s+(a|an|the)?\s*(feature|endpoint|route|function)\b',
            r'\b(build|make)\s+(a|an|the)?\s*(app|application|service|tool|script)\b',
            r'\.(py|js|ts|jsx|tsx|go|rs|java|cpp|c|h)\s+file\b',
            r'\breact\s+component\b',
            r'\bapi\s+endpoint\b',
            r'\bdatabase\s+(schema|migration|model)\b',
            r'\btest\s+(case|file|suite)\b',
        ]
        msg_lower = message.lower()
        return any(re.search(p, msg_lower) for p in coding_patterns)
    
    async def run_kimi_code(self, prompt: str, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Run Kimi Code CLI and capture output"""
        
        # Create unique work directory for this request
        req_dir = os.path.join(self.work_dir, f"req_{int(time.time())}_{os.urandom(4).hex()}")
        os.makedirs(req_dir, exist_ok=True)
        
        # Build command
        cmd = [
            "kimi",
            "--print",
            "--yolo",
            "--work-dir", req_dir,
            "--prompt", prompt
        ]
        
        if session_id:
            cmd.extend(["--session", session_id])
        
        try:
            # Run Kimi Code with timeout
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=req_dir
            )
            
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(),
                timeout=300  # 5 minute timeout for complex tasks
            )
            
            output = stdout.decode('utf-8', errors='replace')
            errors = stderr.decode('utf-8', errors='replace')
            
            # Parse the structured output
            result = self.parse_output(output, req_dir)
            result['exit_code'] = proc.returncode
            result['stderr'] = errors if errors else None
            
            return result
            
        except asyncio.TimeoutError:
            proc.kill()
            return {
                'success': False,
                'error': 'Timeout after 5 minutes',
                'content': 'Task took too long to complete',
                'files_created': [],
                'exit_code': -1
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'content': f'Failed to run Kimi Code: {e}',
                'files_created': [],
                'exit_code': -1
            }
    
    def parse_output(self, output: str, work_dir: str) -> Dict[str, Any]:
        """Parse Kimi Code's structured output"""
        
        # Extract the final assistant message
        content = ""
        files_created = []
        tool_calls = []
        
        # Find AgentMessage (final response)
        message_match = re.search(r'AgentMessage\(\s*content=(["\'])(.*?)\1', output, re.DOTALL)
        if message_match:
            content = message_match.group(2)
        else:
            # Fallback: extract from TurnEnd
            turn_match = re.search(r'TurnEnd\([^)]*assistant_output=(["\'])(.*?)\1', output, re.DOTALL)
            if turn_match:
                content = turn_match.group(2)
        
        # Find files created/modified
        for match in re.finditer(r'WriteFile\([^)]*path=(["\'])(.*?)\1', output):
            filepath = match.group(2)
            if not filepath.startswith('/'):
                filepath = os.path.join(work_dir, filepath)
            files_created.append(filepath)
        
        # Find tool calls
        for match in re.finditer(r"ToolCall\([^)]*name='([^']+)'", output):
            tool_calls.append(match.group(1))
        
        # If no content extracted, use summary
        if not content:
            # Look for ToolResult messages
            results = re.findall(r"message='([^']+)'", output)
            if results:
                content = "\n".join(results[-3:])  # Last 3 results
        
        return {
            'success': True,
            'content': content or 'Task completed. Check files for changes.',
            'files_created': list(set(files_created)),
            'tool_calls': list(set(tool_calls)),
            'raw_output': output[:5000]  # Truncated for debugging
        }
    
    async def handle_request(self, request_data: Dict) -> Dict:
        """Handle chat completion request"""
        messages = request_data.get("messages", [])
        if not messages:
            return {"error": "No messages provided"}
        
        # Get user message
        user_message = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_message = m.get("content", "")
                break
        
        # Check if it's a coding task
        is_coding = self.is_coding_task(user_message)
        
        print(f"\n[KimiCode] Request received")
        print(f"[KimiCode] Task type: {'Coding' if is_coding else 'General'}")
        print(f"[KimiCode] Running Kimi Code CLI...")
        
        # Run Kimi Code
        result = await self.run_kimi_code(user_message)
        
        if result.get('success'):
            print(f"[KimiCode] ✓ Success - {len(result.get('files_created', []))} files modified")
            
            # Format as OpenAI response
            response_content = result['content']
            
            # Add file info if files were created
            if result.get('files_created'):
                files_list = '\n'.join([f"  - {f}" for f in result['files_created'][:5]])
                response_content += f"\n\n---\nFiles modified:\n{files_list}"
            
            return {
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": response_content
                    },
                    "finish_reason": "stop"
                }],
                "model": "kimi-code",
                "_kimi_code_info": {
                    "files_modified": result.get('files_created', []),
                    "tool_calls": result.get('tool_calls', []),
                    "work_dir": self.work_dir
                }
            }
        else:
            print(f"[KimiCode] ✗ Failed: {result.get('error')}")
            return {
                "error": result.get('error', 'Unknown error'),
                "message": result.get('content', 'Task failed')
            }


# HTTP Server
routes = web.RouteTableDef()
bridge_instance: Optional[KimiCodeBridge] = None


@routes.get('/v1/models')
async def list_models(request):
    return web.json_response({
        "object": "list",
        "data": [{
            "id": "kimi-code",
            "object": "model",
            "created": int(time.time()),
            "owned_by": "kimi-code-bridge"
        }]
    })


@routes.post('/v1/chat/completions')
async def chat_completions(request):
    try:
        data = await request.json()
        result = await bridge_instance.handle_request(data)
        
        if "error" in result:
            return web.json_response(result, status=503)
        return web.json_response(result)
    except Exception as e:
        return web.json_response({"error": str(e)}, status=500)


@routes.get('/health')
async def health(request):
    # Check if kimi is available
    kimi_available = False
    try:
        result = subprocess.run(['which', 'kimi'], capture_output=True)
        kimi_available = result.returncode == 0
    except:
        pass
    
    return web.json_response({
        "status": "healthy" if kimi_available else "kimi_not_found",
        "bridge": "kimi-code",
        "features": ["file-editing", "shell-execution", "code-generation"],
        "kimi_available": kimi_available
    })


async def init_app():
    global bridge_instance
    bridge_instance = KimiCodeBridge()
    await bridge_instance.__aenter__()
    
    app = web.Application()
    app.add_routes(routes)
    
    async def cleanup(app):
        await bridge_instance.__aexit__()
    app.on_cleanup.append(cleanup)
    
    return app


def main():
    print(f"💻 Kimi Code Bridge starting on port {KIMI_CODE_PORT}...")
    print(f"   URL: http://127.0.0.1:{KIMI_CODE_PORT}")
    print(f"   Model: kimi-code (full agent with file editing)")
    print("")
    print("Capabilities:")
    print("  • Create/edit files")
    print("  • Run shell commands")
    print("  • Search and analyze code")
    print("  • Multi-step implementation")
    print("")
    print("Use with Smart Router for:")
    print("  • Complex coding tasks")
    print("  • When MLX/MiniMax/Kimi fail")
    print("  • File editing operations")
    print("")
    
    app = asyncio.run(init_app())
    web.run_app(app, host='127.0.0.1', port=KIMI_CODE_PORT, print=None)


if __name__ == "__main__":
    main()
