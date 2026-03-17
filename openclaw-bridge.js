#!/usr/bin/env node
/**
 * OpenClaw Bridge - Real-time integration with OpenClaw
 * Reads session files and updates dashboard data
 * PRESERVES existing dashboard structure
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'dashboard-data.json');
const OPENCLAW_DIR = path.join(process.env.HOME, '.openclaw/agents');

// Map OpenClaw agents to Mission Control
const AGENT_MAP = {
  'main': { id: 'kimi', name: 'Kimi (Lead AI)', emoji: '🎯', role: 'Lead AI', cost: '$0.02', costClass: 'medium', description: 'Lead orchestrator' },
  'coder': { id: 'kimi-code', name: 'Kimi-Code (You)', emoji: '💻', role: 'Code Specialist', cost: '$0.02', costClass: 'medium', description: 'Code specialist' },
  'ai-engineer': { id: 'ai-engineer', name: 'AI Engineer', emoji: '🤖', role: 'ML Pipeline', cost: '$0.03', costClass: 'high', description: 'Complex AI/ML tasks' },
  'frontend-developer': { id: 'frontend-dev', name: 'Frontend Dev', emoji: '🎨', role: 'UI/UX', cost: '$0.02', costClass: 'medium', description: 'UI components' },
  'backend-developer': { id: 'backend-dev', name: 'Backend Dev', emoji: '⚙️', role: 'APIs', cost: '$0.02', costClass: 'medium', description: 'API development' },
  'database-engineer': { id: 'db-eng', name: 'Database Eng', emoji: '🗄️', role: 'Data', cost: '$0.02', costClass: 'medium', description: 'Database design' },
  'integration-specialist': { id: 'integration', name: 'Integration Spec', emoji: '🔌', role: 'APIs', cost: '$0.02', costClass: 'medium', description: 'API integration' },
  'researcher': { id: 'researcher', name: 'Researcher', emoji: '🔍', role: 'Research', cost: '$0.025', costClass: 'high', description: 'Deep research' },
  'reviewer': { id: 'reviewer', name: 'Reviewer', emoji: '👁️', role: 'Review', cost: '$0.02', costClass: 'medium', description: 'Code review' },
  'mlx-deepseek': { id: 'mlx', name: 'MLX (Local)', emoji: '🍎', role: 'Primary - Try First', cost: 'FREE', costClass: 'free', description: 'Apple Silicon MLX - FREE tier' }
};

// Read existing dashboard data (preserve structure)
function readExistingData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return null;
  }
}

// Read sessions from agent's sessions.json
function readAgentSessions(agentId) {
  try {
    const file = path.join(OPENCLAW_DIR, agentId, 'sessions', 'sessions.json');
    if (!fs.existsSync(file)) return [];
    
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Object.entries(data).map(([key, session]) => ({
      key,
      ...session,
      agentId
    }));
  } catch {
    return [];
  }
}

// Fetch all OpenClaw data
function fetchOpenClawData() {
  const now = Date.now();
  const tenMinutesAgo = now - (10 * 60 * 1000);
  
  const allSessions = [];
  const agentStats = {};
  
  Object.keys(AGENT_MAP).forEach(agentId => {
    const sessions = readAgentSessions(agentId);
    
    agentStats[agentId] = {
      sessions: sessions.length,
      active: 0,
      models: new Set(),
      lastActivity: 0
    };
    
    sessions.forEach(session => {
      allSessions.push(session);
      
      if (session.model) agentStats[agentId].models.add(session.model);
      
      const updatedAt = session.updatedAt || session.timestamp;
      if (updatedAt) {
        agentStats[agentId].lastActivity = Math.max(
          agentStats[agentId].lastActivity,
          updatedAt
        );
        
        if (updatedAt > tenMinutesAgo) {
          agentStats[agentId].active++;
        }
      }
    });
  });
  
  return { sessions: allSessions, agentStats, totalSessions: allSessions.length };
}

// Process for dashboard - PRESERVE existing structure
function processOpenClawData(data, existingData) {
  const now = Date.now();
  
  // Map agents while preserving existing data
  const agents = Object.entries(AGENT_MAP).map(([id, info]) => {
    const stats = data.agentStats[id] || { sessions: 0, active: 0, lastActivity: 0 };
    const isActive = stats.active > 0;
    const wasRecent = (now - stats.lastActivity) < (30 * 60 * 1000);
    
    let status = 'standby';
    if (isActive) status = 'busy';
    else if (wasRecent) status = 'online';
    
    // Get existing agent data if available
    const existingAgent = existingData?.agents?.find(a => a.id === info.id);
    
    return {
      id: info.id,
      name: info.name,
      emoji: info.emoji,
      model: existingAgent?.model || info.id,
      cost: info.cost,
      costClass: info.costClass,
      role: info.role,
      status,
      activity: status === 'standby' ? 'Standby' : (existingAgent?.activity || 'Working'),
      tasksCompleted: existingAgent?.tasksCompleted || stats.sessions,
      successRate: existingAgent?.successRate || '95%',
      description: info.description,
      sessions: stats.sessions,
      activeSessions: stats.active
    };
  });
  
  // Recent activity
  const recent = data.sessions
    .filter(s => (s.updatedAt || 0) > (now - (60 * 60 * 1000)))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 10);
  
  const recentActivity = recent.map(s => {
    const agent = AGENT_MAP[s.agentId] || { name: s.agentId, emoji: '🤖' };
    return {
      time: new Date(s.updatedAt || Date.now()).toLocaleTimeString(),
      text: `${agent.name} - ${s.model || 'working'}`,
      icon: agent.emoji
    };
  });
  
  // Build output preserving existing structure
  const output = {
    // Preserve existing data sections
    ...(existingData || {}),
    
    // Update timestamp
    timestamp: new Date().toISOString(),
    
    // Update stats
    stats: {
      totalTasks: existingData?.stats?.totalTasks || data.totalSessions,
      inProgress: agents.filter(a => a.status === 'busy').length,
      completed: data.totalSessions,
      activeAgents: agents.filter(a => a.status !== 'standby').length
    },
    
    // Update agents
    agents,
    
    // Update activity
    recentActivity: recentActivity.length > 0 ? recentActivity : (existingData?.recentActivity || []),
    
    // Preserve goals (convert if needed)
    goals: Array.isArray(existingData?.goals) ? existingData.goals : 
           (existingData?.goals ? [] : getDefaultGoals()),
    
    // Preserve other sections
    tasks: existingData?.tasks || getDefaultTasks(),
    routing: existingData?.routing || getDefaultRouting(),
    costs: existingData?.costs || getDefaultCosts(),
    communication: existingData?.communication || getDefaultCommunication(),
    memory: existingData?.memory || getDefaultMemory(),
    activeTasks: existingData?.activeTasks || []
  };
  
  return output;
}

// Default data sections
function getDefaultGoals() {
  return [
    { id: 1, name: "Respiratory Therapy Directory", progress: 75, status: "active", tasks: { completed: 15, total: 20 }, agent: "Frontend Developer", agentIcon: "💻", due: "Jan 25" },
    { id: 2, name: "Polymarket Trading Bot", progress: 30, status: "active", tasks: { completed: 6, total: 20 }, agent: "Trading Analyst", agentIcon: "📈", due: "Feb 15" },
    { id: 3, name: "Amazon Reselling System", progress: 45, status: "active", tasks: { completed: 9, total: 20 }, agent: "Integration Specialist", agentIcon: "🔗", due: "Feb 28" },
    { id: 4, name: "Life Improving Tools", progress: 10, status: "pending", tasks: { completed: 2, total: 20 }, agent: "AI Engineer", agentIcon: "🤖", due: "Mar 30" },
    { id: 5, name: "Personal Website Portfolio", progress: 60, status: "active", tasks: { completed: 12, total: 20 }, agent: "Content Writer", agentIcon: "✍️", due: "Jan 30" }
  ];
}

function getDefaultTasks() {
  return {
    active: [
      { id: "T-001", name: "Design homepage layout", assignee: "Frontend Developer", priority: "high", due: "Today", goalId: 1 },
      { id: "T-002", name: "Set up API endpoints", assignee: "Backend Developer", priority: "high", due: "Tomorrow", goalId: 1 },
      { id: "T-003", name: "Research trading patterns", assignee: "Trading Analyst", priority: "medium", due: "In 2 days", goalId: 2 },
      { id: "T-004", name: "Configure webhook integration", assignee: "Integration Specialist", priority: "medium", due: "Jan 22", goalId: 3 }
    ],
    completed: [
      { id: "T-000", name: "Initial project setup", assignee: "AI Engineer", completedAt: "Jan 15" },
      { id: "T-005", name: "Database schema design", assignee: "Backend Developer", completedAt: "Jan 14" }
    ]
  };
}

function getDefaultRouting() {
  return {
    strategy: "Hybrid Cascade",
    description: "MLX First → Escalate if Needed",
    stats: { mlxAttempts: 142, mlxSuccess: 128, escalations: 14, directRouting: 5, escalationRate: "9.9%", mlxSuccessRate: "90.1%" }
  };
}

function getDefaultCosts() {
  return {
    today: 0.23,
    week: 1.47,
    month: 4.82,
    budget: { daily: 1.00, weekly: 7.00, monthly: 30.00 },
    projectedSavings: "~$15/month",
    byModel: {
      mlx: { cost: 0, tasks: 128, label: "FREE" },
      "kimi-code": { cost: 0.26, tasks: 13, label: "$0.26" },
      kimi: { cost: 0.16, tasks: 8, label: "$0.16" },
      minimax: { cost: 0.03, tasks: 2, label: "$0.03" },
      nano: { cost: 0.04, tasks: 8, label: "$0.04" }
    }
  };
}

function getDefaultCommunication() {
  return {
    features: ["Real-time chat with agents", "Task management via chat", "Status queries", "Timeline estimates", "Broadcast messaging", "Quick action buttons"],
    commands: [
      { command: "status", description: "Check agent's current work" },
      { command: "how long left?", description: "Get ETA for current task" },
      { command: "add task: [name]", description: "Create new task" },
      { command: "@all [message]", description: "Broadcast to all agents" }
    ]
  };
}

function getDefaultMemory() {
  return {
    totalDocuments: 156,
    totalChunks: 3420,
    lastUpdated: new Date().toISOString(),
    sources: [
      { id: "doc_001", title: "Project Requirements v2", chunks: 45, added: "Jan 15", source: "Notion" },
      { id: "doc_002", title: "API Documentation", chunks: 120, added: "Jan 14", source: "Confluence" }
    ]
  };
}

// Run bridge
function run() {
  console.log('[Bridge] Starting OpenClaw bridge...');
  
  const existingData = readExistingData();
  const openclawData = fetchOpenClawData();
  const processed = processOpenClawData(openclawData, existingData);
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(processed, null, 2));
  
  console.log(`[Bridge] Updated dashboard data:`);
  console.log(`  - Agents: ${processed.agents.length}`);
  console.log(`  - Active: ${processed.stats.activeAgents}`);
  console.log(`  - Sessions: ${processed.stats.completed}`);
  console.log(`  - Goals: ${processed.goals?.length || 0}`);
  console.log(`  - Tasks: ${processed.tasks?.active?.length || 0} active`);
  
  return processed;
}

// Run if called directly
if (require.main === module) {
  run();
}

module.exports = { run, fetchOpenClawData, processOpenClawData };
