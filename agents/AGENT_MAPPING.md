# Mission Control - Agent Mapping & Model Assignment

## Agent to OpenClaw Agent Mapping

| Specialist Role | OpenClaw Agent | Model | Fallback |
|-----------------|----------------|-------|----------|
| **Integration Specialist** | `coder` | Kimi K2.5 | MiniMax M2.5 |
| **Frontend Developer** | `coder` | **Ollama qwen3:8b** | Kimi K2.5 |
| **Database Engineer** | `researcher` | Kimi K2.5 | MiniMax M2.5 |
| **Backend Developer** | `coder` | Kimi K2.5 | MiniMax M2.5 |
| **AI Engineer** | `researcher` | MiniMax M2.5 | Kimi K2.5 |
| **Coordinator** | `main` | Kimi K2.5 | Grok 4 |

## Model Assignment Rationale

### Frontend Developer → Ollama qwen3:8b
- **Fast local responses** for UI iterations
- **Zero API costs** for frequent design tweaks
- **Private** — UI code stays local
- **Good at** component generation, styling, layout
- **Fallback to Kimi** if Ollama is slow/unavailable

### All Other Roles → Kimi K2.5 (or MiniMax for reasoning)
- **Reliable** for critical tasks (integrations, backend, database)
- **Better reasoning** for complex analysis
- **Consistent** performance

## How to Spawn Agents

### Frontend Developer (Ollama)
```bash
sessions_spawn \
  --task "Create React component for..." \
  --agentId coder \
  --model ollama/qwen3:8b \
  --mode run
```

### Integration Specialist (Kimi)
```bash
sessions_spawn \
  --task "Set up Discord webhook..." \
  --agentId coder \
  --model moonshot/kimi-k2.5 \
  --mode run
```

### Database Engineer (Kimi)
```bash
sessions_spawn \
  --task "Design schema for..." \
  --agentId researcher \
  --model moonshot/kimi-k2.5 \
  --mode run
```

## Workspace References

Each agent has SOUL.md and progress tracking at:
- `workspace/agents/integration-specialist/`
- `workspace/agents/frontend-developer/`
- `workspace/agents/database-engineer/`
- `workspace/agents/backend-developer/`
- `workspace/agents/ai-engineer/`
- `workspace/agents/coordinator/`
