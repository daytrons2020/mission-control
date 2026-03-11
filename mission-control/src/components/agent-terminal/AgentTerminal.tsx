'use client';

import { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Terminal, Cpu, Activity, Trash2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  type: string;
  startedAt: Date;
  cpu?: number;
  memory?: number;
}

// Mock data for initial agents
const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agent-001',
    name: 'Data Processor',
    status: 'running',
    type: 'worker',
    startedAt: new Date(Date.now() - 3600000),
    cpu: 12,
    memory: 256,
  },
  {
    id: 'agent-002',
    name: 'Web Scraper',
    status: 'running',
    type: 'crawler',
    startedAt: new Date(Date.now() - 7200000),
    cpu: 8,
    memory: 128,
  },
  {
    id: 'agent-003',
    name: 'Email Handler',
    status: 'stopped',
    type: 'messenger',
    startedAt: new Date(Date.now() - 86400000),
  },
];

const AGENT_TYPES = [
  { value: 'worker', label: 'Worker', icon: Cpu },
  { value: 'crawler', label: 'Crawler', icon: Activity },
  { value: 'messenger', label: 'Messenger', icon: Terminal },
];

export default function AgentTerminal() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [newAgentName, setNewAgentName] = useState('');
  const [selectedType, setSelectedType] = useState('worker');
  const [isSpawning, setIsSpawning] = useState(false);

  // Simulate real-time updates for running agents
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === 'running') {
            return {
              ...agent,
              cpu: Math.floor(Math.random() * 30) + 5,
              memory: Math.floor(Math.random() * 400) + 100,
            };
          }
          return agent;
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const spawnAgent = () => {
    if (!newAgentName.trim()) return;
    
    setIsSpawning(true);
    
    // Simulate spawn delay
    setTimeout(() => {
      const newAgent: Agent = {
        id: `agent-${Date.now().toString(36)}`,
        name: newAgentName.trim(),
        status: 'running',
        type: selectedType,
        startedAt: new Date(),
        cpu: Math.floor(Math.random() * 20) + 5,
        memory: Math.floor(Math.random() * 200) + 100,
      };
      setAgents((prev) => [...prev, newAgent]);
      setNewAgentName('');
      setIsSpawning(false);
    }, 800);
  };

  const killAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, status: 'stopped' as const } : agent
      )
    );
  };

  const restartAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id
          ? { ...agent, status: 'running' as const, startedAt: new Date() }
          : agent
      )
    );
  };

  const deleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'running':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'stopped':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'error':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    const agentType = AGENT_TYPES.find((t) => t.value === type);
    const Icon = agentType?.icon || Cpu;
    return <Icon className="w-4 h-4" />;
  };

  const formatDuration = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const runningCount = agents.filter((a) => a.status === 'running').length;

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
                <p className="text-slate-400 text-sm">Mission Control • {runningCount} active agents</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="glass rounded-lg px-4 py-2">
                <span className="text-slate-400 text-sm">Total: </span>
                <span className="text-white font-semibold">{agents.length}</span>
              </div>
              <div className="glass rounded-lg px-4 py-2">
                <span className="text-slate-400 text-sm">Running: </span>
                <span className="text-emerald-400 font-semibold">{runningCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spawn Agent Section */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5 text-cyan-400" />
            Spawn New Agent
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && spawnAgent()}
              placeholder="Enter agent name..."
              className="flex-1 glass rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 bg-white/5"
            />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="glass rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer bg-white/5"
            >
              {AGENT_TYPES.map((type) => (
                <option key={type.value} value={type.value} className="bg-slate-800">
                  {type.label}
                </option>
              ))}
            </select>
            <button
              onClick={spawnAgent}
              disabled={!newAgentName.trim() || isSpawning}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-6 py-3 font-medium text-white flex items-center justify-center gap-2 min-w-[140px] transition-all shadow-lg shadow-cyan-500/25"
            >
              {isSpawning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Spawning...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Spawn Agent
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Agents List */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Active Agents
          </h2>
          
          {agents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No agents running. Spawn one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 group"
                >
                  {/* Agent Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(agent.status)}`}>
                      {getTypeIcon(agent.type)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{agent.name}</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{agent.type}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{formatDuration(agent.startedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  {agent.status === 'running' && (
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-slate-400 text-xs uppercase tracking-wider">CPU</div>
                        <div className="text-cyan-400 font-mono">{agent.cpu}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400 text-xs uppercase tracking-wider">MEM</div>
                        <div className="text-purple-400 font-mono">{agent.memory}MB</div>
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    {agent.status === 'running' ? (
                      <button
                        onClick={() => killAgent(agent.id)}
                        className="glass rounded-lg p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Kill Agent"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => restartAgent(agent.id)}
                        className="glass rounded-lg p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                        title="Restart Agent"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="glass rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Delete Agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>Mission Control v1.0 • Agent Terminal</p>
        </div>
      </div>
    </div>
  );
}
