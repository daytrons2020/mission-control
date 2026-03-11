# Mission Control Platform - Tech Stack

## Core Platform
| Component | Technology | Purpose |
|-----------|------------|---------|
| Agent Runtime | OpenClaw | Agent orchestration and execution |
| Gateway | OpenClaw (port 18789) | Local API and control |
| Session Management | OpenClaw | Isolated agent sessions |

## AI/ML
| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary Model | Kimi K2.5 | Cloud inference, free tier |
| Local Model | Ollama qwen3:8b | Fast local inference |
| Fallback #1 | OpenRouter/auto | Routing optimization |
| Fallback #2 | MiniMax M2.5 | Complex reasoning |
| Fallback #3 | Grok 4 | Web search capabilities |

## Messaging & Communication
| Component | Technology | Purpose |
|-----------|------------|---------|
| User Interface | Discord | Primary interaction channel |
| Alternative | iMessage | Secondary DM channel |
| Inter-agent | File-based (requests.md) | Async coordination |
| Events (planned) | NATS | Real-time event streaming |

## Data Storage
| Component | Technology | Purpose |
|-----------|------------|---------|
| Agent Memory | Markdown files | Long-term context |
| Progress State | Markdown files | Task tracking |
| Requests | Markdown files | Inter-agent communication |
| Config | JSON (OpenClaw) | System configuration |
| Metrics | JSON/CSV | Performance data |

## Frontend (Planned)
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18 + TypeScript | UI components |
| Build Tool | Vite 5 | Development and building |
| Styling | Tailwind CSS | Responsive design |
| State | TanStack Query | Server state management |
| Deployment | Vercel | Hosting and previews |

## Backend Services
| Component | Technology | Purpose |
|-----------|------------|---------|
| Logic | Go or Python | Service implementation |
| Database | SQLite/PostgreSQL | Structured data |
| Caching | In-memory | Fast access |
| Queue | File-based or NATS | Async processing |

## DevOps
| Component | Technology | Purpose |
|-----------|------------|---------|
| Version Control | GitHub | Code management |
| CI/CD | GitHub Actions | Automated deployment |
| Monitoring | Custom scripts | Health checks |
| Logging | File-based | Debug and audit |
