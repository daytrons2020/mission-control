import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Terminal, 
  Cpu, 
  Activity, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ModelSelector } from './components/model-selector';
import { missionControlApi, AgentStatus } from './lib/api';

// Map model IDs to agent IDs
// Note: Models are configured per agent in OpenClaw config
const MODEL_TO_AGENT: Record<string, string> = {
  'kimi': 'coder',
  'kimi-code': 'coder',
  'minimax': 'main',
  'openrouter': 'main',
  'ollama': 'main',
  'grok': 'main',
  'nano': 'main',
};

// Agent type definitions
const AGENT_TYPES = [
  { value: 'worker', label: 'Worker', icon: Cpu },
  { value: 'crawler', label: 'Crawler', icon: Activity },
  { value: 'messenger', label: 'Messenger', icon: Terminal },
];

export default function AgentTerminal() {
  // State
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  
  // Form state
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedType, setSelectedType] = useState('worker');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [isSpawning, setIsSpawning] = useState(false);

  // Polling ref
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check API health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  // Start polling when connected
  useEffect(() => {
    if (apiConnected) {
      fetchAgents();
      startPolling();
    }
    return () => stopPolling();
  }, [apiConnected]);

  const checkHealth = async () => {
    const healthy = await missionControlApi.healthCheck();
    setApiConnected(healthy);
    if (!healthy) {
      setError('API server not available. Run: npm run server');
    }
  };

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const data = await missionControlApi.listAgents();
      // Combine active and recent, with active first
      const allAgents = [...data.active, ...data.recent];
      setAgents(allAgents);
      setError(null);
    } catch (err) {
      setError('Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    // Poll every 3 seconds for real-time updates
    pollIntervalRef.current = setInterval(() => {
      fetchAgents();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const spawnAgent = async () => {
    if (!newAgentName.trim() || !selectedModel || !agentPrompt.trim()) return;
    
    setIsSpawning(true);
    setError(null);
    
    // Map model to agent ID
    const agentId = MODEL_TO_AGENT[selectedModel] || 'main';

    try {
      const result = await missionControlApi.spawnAgent({
        agentId,
        prompt: agentPrompt.trim(),
        label: newAgentName.trim(),
        timeoutMs: 600000, // 10 minutes
      });

      if (result.success) {
        // Clear form
        setNewAgentName('');
        setAgentPrompt('');
        setSelectedModel(null);
        
        // Refresh agents list immediately
        await fetchAgents();
      } else {
        setError(result.error || 'Failed to spawn agent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to spawn agent');
    } finally {
      setIsSpawning(false);
    }
  };

  const killAgent = async (runId: string) => {
    try {
      await missionControlApi.killAgent(runId);
      // Refresh list
      await fetchAgents();
    } catch (err) {
      setError('Failed to kill agent');
    }
  };

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'running':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'completed':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'killed':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'error':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'running':
        return <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'killed':
        return <Square className="w-4 h-4 text-amber-400" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-slate-400" />;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const runningCount = agents.filter(a => a.status === 'running').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Agent Terminal</h1>
                <p className="text-slate-400 text-sm">
                  Mission Control • {runningCount} active • {agents.length} total
                  {apiConnected === false && (
                    <span className="text-rose-400 ml-2">(API Disconnected)</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchAgents}
                disabled={isLoading}
                className="glass-button rounded-lg p-2 text-slate-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <div className="glass-panel rounded-lg px-4 py-2">
                <span className="text-slate-400 text-sm">Total: </span>
                <span className="text-white font-semibold">{agents.length}</span>
              </div>
              <div className="glass-panel rounded-lg px-4 py-2">
                <span className="text-slate-400 text-sm">Running: </span>
                <span className="text-emerald-400 font-semibold">{runningCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="glass-panel rounded-xl p-4 border border-rose-500/30 bg-rose-500/10">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <p className="text-rose-200">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-rose-400 hover:text-rose-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Spawn Agent Section */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Spawn New Agent</h2>
          </div>
          
          {/* Prompt Input */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-2">
              Task Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              placeholder="Describe what this agent should do... e.g., 'Write Python functions to process CSV data' or 'Research latest AI developments'"
              className="w-full h-24 glass-input rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* Agent Name */}
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2">
                Agent Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && spawnAgent()}
                placeholder="e.g., csv-processor"
                className="w-full glass-input rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            {/* Agent Type */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="glass-input rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer min-w-[140px]"
              >
                {AGENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-slate-800">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="flex-[2]">
              <label className="block text-sm text-slate-400 mb-2">
                AI Model <span className="text-rose-400">*</span>
              </label>
              <ModelSelector
                selectedModel={selectedModel}
                onSelectModel={setSelectedModel}
                prompt={agentPrompt}
              />
            </div>

            {/* Spawn Button */}
            <div className="flex items-end">
              <button
                onClick={spawnAgent}
                disabled={!newAgentName.trim() || !selectedModel || !agentPrompt.trim() || isSpawning || apiConnected === false}
                className="glass-button-primary rounded-xl px-6 py-3 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px] h-[46px]"
              >
                {isSpawning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Spawning...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Spawn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Agents List */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Active Agents
            {isLoading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
          </h2>
          
          {agents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents running. Spawn one to get started.</p>
              {apiConnected === false && (
                <p className="text-rose-400 mt-2 text-sm">
                  API server not connected. Run: npm run server
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.runId}
                  className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 group hover:scale-[1.01] transition-transform"
                >
                  {/* Agent Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">{agent.label}</h3>
                      <div className="flex items-center gap-2 text-sm flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-xs truncate max-w-[200px]" title={agent.task}>
                          {agent.task}
                        </span>
                        {agent.model && (
                          <>
                            <span className="text-slate-500">•</span>
                            <span className="text-cyan-400 text-xs">{agent.model}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Runtime */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-slate-400 text-xs uppercase tracking-wider">Runtime</div>
                      <div className="text-cyan-400 font-mono">{formatDuration(agent.runtimeMs || Date.now() - agent.startedAt)}</div>
                    </div>
                    {(agent.pendingDescendants ?? 0) > 0 && (
                      <div className="text-center">
                        <div className="text-slate-400 text-xs uppercase tracking-wider">Sub-tasks</div>
                        <div className="text-amber-400 font-mono">{agent.pendingDescendants}</div>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    {agent.status === 'running' && (
                      <button
                        onClick={() => killAgent(agent.runId)}
                        className="glass-button-danger rounded-lg p-2 text-rose-400 hover:text-rose-300 transition-colors"
                        title="Kill Agent"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model Legend */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
            Available Models
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name: 'Kimi', color: '#6366f1', icon: '🌙', desc: 'Long context' },
              { name: 'Kimi Code', color: '#8b5cf6', icon: '💻', desc: 'Programming' },
              { name: 'MiniMax', color: '#10b981', icon: '🌐', desc: 'Multilingual' },
              { name: 'OpenRouter', color: '#f59e0b', icon: '🔀', desc: 'Multi-model' },
              { name: 'Ollama', color: '#06b6d4', icon: '🖥️', desc: 'Local/Private' },
              { name: 'Grok', color: '#ef4444', icon: '⚡', desc: 'Real-time' },
              { name: 'Nano', color: '#ec4899', icon: '✨', desc: 'Fast/Local' },
            ].map((model) => (
              <div
                key={model.name}
                className="glass-card rounded-lg p-3 text-center"
              >
                <div
                  className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${model.color}20` }}
                >
                  {model.icon}
                </div>
                <div className="text-xs font-medium text-white/80">{model.name}</div>
                <div className="text-[10px] text-white/40">{model.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>Mission Control v1.0 • Live Agent Spawning via OpenClaw Gateway</p>
        </div>
      </div>
    </div>
  );
}
