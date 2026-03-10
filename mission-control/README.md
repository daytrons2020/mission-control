# Mission Control

AI Agent Terminal with live agent spawning, real-time status updates, and intelligent model recommendations.

## Features

- **Live Agent Spawning**: Spawn AI agents directly from the UI using OpenClaw Gateway
- **Real-Time Status Updates**: 3-second polling for agent status (running, completed, error, killed)
- **7 AI Models**: Kimi, Kimi Code, MiniMax, OpenRouter, Ollama, Grok, Nano
- **Auto-Recommendation**: AI analyzes your prompt and suggests the best model
- **Glassmorphism UI**: Modern frosted glass aesthetic with glow effects
- **Kill Agents**: Stop running agents directly from the UI

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React UI      │────▶│  Express API     │────▶│ OpenClaw        │
│   (Port 5173)   │     │  (Port 3001)     │     │ Gateway         │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Agent Process   │
                        │  (Background)    │
                        └──────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the API Server

```bash
npm run server
```

The API server runs on port 3001 and proxies requests to the OpenClaw Gateway.

### 3. Start the UI (in a new terminal)

```bash
npm run dev:ui
```

Or start both together:

```bash
npm run dev
```

### 4. Open the App

Navigate to [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check API and Gateway health |
| `/api/agents/list` | GET | List all agents (active + recent) |
| `/api/agents/available` | GET | Get configured OpenClaw agents |
| `/api/agents/status/:runId` | GET | Get specific agent status |
| `/api/agent/spawn` | POST | Spawn a new agent |
| `/api/agents/kill/:runId` | POST | Kill a running agent |

### Spawn Agent Request

```json
{
  "agentId": "coder",
  "prompt": "Write a Python function to calculate fibonacci numbers",
  "label": "fibonacci-agent",
  "timeoutMs": 600000
}
```

### Spawn Agent Response

```json
{
  "success": true,
  "runId": "agent-1234567890-1",
  "sessionKey": "agent-1234567890-1",
  "label": "fibonacci-agent"
}
```

## Models

| Model | Maps to Agent | Best For | Context | Speed | Cost |
|-------|---------------|----------|---------|-------|------|
| Kimi | coder | Long documents, research | 200K | Medium | $$ |
| Kimi Code | coder | Programming, debugging | 200K | Medium | $$ |
| MiniMax | main | Translation, general tasks | 32K | Fast | $ |
| OpenRouter | main | Flexibility, cost optimization | 128K | Medium | Varies |
| Ollama | main | Privacy, offline use | 32K | Fast | Free |
| Grok | main | Real-time info, creativity | 128K | Fast | $$ |
| Nano | main | Quick tasks, summaries | 8K | Fast | Free |

## Project Structure

```
mission-control/
├── server.cjs                   # Express API server
├── src/
│   ├── components/
│   │   └── model-selector/      # Model selector component
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   ├── models.ts            # Model configs
│   │   └── utils.ts             # Utilities
│   ├── types/
│   │   └── models.ts            # TypeScript interfaces
│   ├── AgentTerminal.tsx        # Main UI component
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Styles
├── package.json
└── README.md
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | API server port |

## Troubleshooting

### API Server Not Connected

If you see "API Disconnected" in the UI:

1. Make sure the server is running: `npm run server`
2. Check the server is on port 3001: `curl http://localhost:3001/health`
3. Check OpenClaw Gateway is running: `openclaw gateway status`

### Agent Spawn Fails

1. Verify OpenClaw is configured: `openclaw agents list`
2. Check agent exists: `openclaw agents list --json`
3. Test agent manually: `openclaw agent --agent coder --message "test"`

### Port Already in Use

```bash
# Kill existing server
pkill -f "node server.cjs"
# Or use a different port
PORT=3002 npm run server
```

## Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## License

MIT
