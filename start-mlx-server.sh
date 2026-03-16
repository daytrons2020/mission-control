#!/bin/bash
# Start MLX Server for Mission Control

echo "🚀 Starting MLX Server..."
echo "========================"

# Check if MLX is already running
if curl -s http://127.0.0.1:18888/v1/models > /dev/null 2>&1; then
    echo "✅ MLX Server is already running on port 18888"
    echo ""
    echo "To verify, run:"
    echo "  curl http://127.0.0.1:18888/v1/models"
    exit 0
fi

# Check for different MLX server options
echo "Checking for MLX server installations..."

# Option 1: Check if mlx_lm.server is available
if command -v mlx_lm.server &> /dev/null; then
    echo "✓ Found mlx_lm.server"
    echo ""
    echo "Starting MLX server with DeepSeek-R1-Distill-Qwen-14B-4bit..."
    echo "(This will download the model if not present - ~7GB)"
    echo ""
    mlx_lm.server --model mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit --port 18888
    exit 0
fi

# Option 2: Check if venv with mlx_lm exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/venv/bin/python3" ] && "$SCRIPT_DIR/venv/bin/python3" -c "import mlx_lm" 2>/dev/null; then
    echo "✓ Found mlx_lm in venv"
    echo ""
    echo "Starting MLX server with DeepSeek-R1-Distill-Qwen-14B-4bit..."
    echo "(This will download the model if not present - ~7GB)"
    echo ""
    "$SCRIPT_DIR/venv/bin/python3" -m mlx_lm.server --model mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit --port 18888
    exit 0
fi

# Option 3: Check if python-mlx is available globally
if python3 -c "import mlx_lm" 2>/dev/null; then
    echo "✓ Found mlx_lm Python module"
    echo ""
    echo "Starting MLX server..."
    python3 -m mlx_lm.server --model mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit --port 18888
    exit 0
fi

# Option 3: Check if ollama is available (fallback)
if command -v ollama &> /dev/null; then
    echo "✓ Found Ollama (using as fallback)"
    echo ""
    echo "Starting Ollama on port 18888..."
    echo "Note: Using Ollama instead of MLX"
    OLLAMA_HOST=127.0.0.1:18888 ollama serve
    exit 0
fi

# Not found
echo "❌ MLX Server not found!"
echo ""
echo "To install MLX, run one of these:"
echo ""
echo "Option 1 - Using pip:"
echo "  pip install mlx-lm"
echo ""
echo "Option 2 - Using conda:"
echo "  conda install -c conda-forge mlx-lm"
echo ""
echo "Option 3 - Install Ollama as fallback:"
echo "  curl -fsSL https://ollama.com/install.sh | sh"
echo ""
echo "After installation, run this script again."
