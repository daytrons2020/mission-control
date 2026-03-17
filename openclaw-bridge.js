#!/usr/bin/env node
/**
 * OpenClaw Bridge - Real-time integration with OpenClaw
 * Reads session files directly
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'dashboard-data.json');
const OPENCLAW_DIR = path.join(process.env.HOME, '.openclaw/agents');

// Map OpenClaw agents to Mission Control
const AGENT_MAP = {
  'main': { name: 'Kimi (Lead AI)', emoji: '🎯', role: 'Lead AI', color: '#8b5cf6' },
  'coder': { name: 'Kimi-Code (You)', emoji: '💻', role: 'Code Specialist', color: '#ef4444' },
  'ai-engineer': { name: 'AI Engineer', emoji: '🤖', role: 'ML Pipeline', color: '#f59e0b' },
  'frontend-developer': { name: 'Frontend Dev', emoji: '🎨', role: 'UI/UX', color: '#ec4899' },
  'backend-developer': { name: 'Backend Dev', emoji: '⚙️', role: 'APIs', color: '#10b981' },
  'database-engineer': { name: 'Database Eng', emoji: '🗄️', role: 'Data', color: '#f59e0b' },
  'integration-specialist': { name: 'Integration Spec', emoji: '🔌', role: 'APIs', color: '#06b6d4' },
  'researcher': { name: 'Researcher', emoji: '🔍', role: 'Research', color: '#06b6d4' },
  'reviewer': { name: 'Reviewer', emoji: '👁️', role: 'Review', color: '#8b5cf6' }
};

const ACTIVITIES = {
  'main': ['Orchestrating', 'Coordinating', 'Reviewing plans'],
  'coder': ['Writing code', 'Debugging', 'Refactoring'],
  'ai-engineer': ['Training models', 'Running MLX', 'Optimizing'],
  'frontend-developer': ['Coding UI', 'Designing components', 'CSS work'],
  'backend-developer': ['Building APIs', 'Database work', 'Server config'],
  'database-engineer': ['Schema design', 'Query optimization', 'Migration'],
  'integration-specialist': ['API integration', 'Webhook setup', 'Discord bot'],
  'researcher': ['Market research', 'Data analysis', 'Documentation'],
  'reviewer': ['Code review', 'Testing', 'Quality check']
};

// Read sessions from agent's sessions.json
function readAgentSessions(agentId) {
  try {
    const file = path.join(OPENCLAW_DIR, agentId, 'sessions', 'sessions.json');
    if (!fs.existsSync(file)) return [];
    
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    // sessions.json is an object with session keys as properties
    return Object.entries(data).map(([key, session]) => ({
      key,
      ...session,
      agentId
    }));
  } catch (error) {
    console.error(`[Bridge] Error reading ${agentId}:`, error.message);
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
      
      // Check for recent activity (updated in last 10 min)
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
  
  return {
    sessions: allSessions,
    agentStats,
    totalSessions: allSessions.length
  };
}

// Process for dashboard
function processOpenClawData(data) {
  const now = Date.now();
  
  const agents = Object.entries(AGENT_MAP).map(([id, info]) => {
    const stats = data.agentStats[id] || { sessions: 0, active: 0, lastActivity: 0 };
    const isActive = stats.active > 0;
    const wasRecent = (now - stats.lastActivity) < (30 * 60 * 1000);
    
    let status = 'standby';
    if (isActive) status = 'busy';
    else if (wasRecent) status = 'online';
    
    const acts = ACTIVITIES[id] || ['Working'];
    
    return {
      name: info.name,
      emoji: info.emoji,
      role: info.role,
      status,
      activity: status === 'standby' ? 'Standby' : acts[Math.floor(Math.random() * acts.length)],
      sessions: stats.sessions,
      activeSessions: stats.active,
      color: info.color
    };
  });
  
  // Count models
  const models = {};
  data.sessions.forEach(s => {
    if (s.model) models[s.model] = (models[s.model] || 0) + 1;
  });
  
  // Recent activity from sessions
  const recent = data.sessions
    .filter(s => (s.updatedAt || 0) > (now - (60 * 60 * 1000)))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 10);
  
  const recentActivity = recent.map(s => {
    const agent = AGENT_MAP[s.agentId] || { name: s.agentId, emoji: '🤖' };
    return {
      time: new Date(s.updatedAt || Date.now()).toLocaleTimeString(),
      text: `${agent.name} - ${s.model || 'unknown'}`,
      icon: agent.emoji
    };
  });
  
  return {
    timestamp: new Date().toISOString(),
    stats: {
      totalTasks: data.totalSessions,
      inProgress: Object.values(data.agentStats).reduce((s, a) => s + a.active, 0),
      completed: data.totalSessions - Object.values(data.agentStats).reduce((s, a) => s + a.active, 0),
      activeAgents: agents.filter(a => a.status !== 'standby').length
    },
    agents,
    systemHealth: {
      openclaw: 'online',
      mlx: models['deepseek-14b'] ? 'online' : 'offline',
      discord: 'online',
      memory: 'healthy'
    },
    recentActivity,
    goals: { total: 5, active: 5, completed: 0 },
    modelsInUse: Object.entries(models).sort((a, b) => b[1] - a[1])
  };
}

function saveDashboardData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('[OpenClaw Bridge] ✓ Dashboard updated');
  } catch (error) {
    console.error('[OpenClaw Bridge] ✗ Save failed:', error.message);
  }
}

function sync() {
  console.log('[OpenClaw Bridge] Syncing...');
  
  const data = fetchOpenClawData();
  const dashboard = processOpenClawData(data);
  saveDashboardData(dashboard);
  
  console.log(`[OpenClaw Bridge] Agents: ${dashboard.stats.activeAgents} active / ${dashboard.agents.length} total`);
  console.log(`[OpenClaw Bridge] Sessions: ${dashboard.stats.totalTasks} total`);
  console.log(`[OpenClaw Bridge] Models: ${dashboard.modelsInUse.map(m => `${m[0]}(${m[1]})`).join(', ')}`);
}

// Run
sync();

// Export
module.exports = { sync, fetchOpenClawData, processOpenClawData };
