#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
exec python3 smart_router_intelligent_skip.py
