/**
 * Dashboard Real-Time Updater
 * Connects to MLX and provides live data to dashboard
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const fetch = require('node-fetch');

const DATA_FILE = path.join(__dirname, 'dashboard-data.json');

// Real-time data structure
let dashboardData = {
  timestamp: new Date().toISOString(),
  stats: {
    totalTasks: 0,
    inProgress: 0,
    completed: 0,
    activeAgents: 14
  },
  agents: [
    { name: 'Kimi (Lead AI)', status: 'online', activity: 'Orchestrating', emoji: '🎯' },
    { name: 'Nano', status: 'online', activity: 'Coordinating', emoji: '🤖' },
    { name: 'Frontend Dev', status: 'busy', activity: 'Coding UI', emoji: '🎨' },
    { name: 'Database Eng', status: 'online', activity: 'Optimizing', emoji: '🗄️' },
    { name: 'AI Engineer', status: 'busy', activity: 'Training model', emoji: '🧠' },
    { name: 'Integration Spec', status: 'online', activity: 'Monitoring', emoji: '🔌' }
  ],
  systemHealth: {
    openclaw: 'checking',
    mlx: 'checking',
    discord: 'online',
    memory: 'healthy'
  },
  recentActivity: [],
  goals: {
    total: 5,
    active: 5,
    completed: 0,
    progress: {
      'Respiratory Education': 0,
      'Autonomous Trading': 15,
      'Reselling Business': 0,
      'Polymarket Bot': 0,
      'Life Programs': 0
    }
  },
  runningTasks: [],
  cronJobs: [
    { name: 'Daily Motivation', time: '8:00 AM', status: 'scheduled', icon: '💪' },
    { name: 'AI & Tech News', time: '9:00 AM', status: 'scheduled', icon: '🤖' },
    { name: 'World News Update', time: '5:00 PM', status: 'scheduled', icon: '🌍' },
    { name: 'Health Check', time: 'Every 30m', status: 'running', icon: '🔍' }
  ]
};

// Load existing data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      dashboardData = { ...dashboardData, ...data };
    }
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

// Save data
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(dashboardData, null, 2));
}

// Simulate agent activity
function simulateAgentActivity() {
  const activities = [
    'Analyzing data',
    'Writing code',
    'Testing model',
    'Researching',
    'Debugging',
    'Optimizing',
    'Reviewing',
    'Deploying'
  ];

  dashboardData.agents.forEach(agent => {
    if (Math.random() > 0.7) {
      agent.status = Math.random() > 0.3 ? 'online' : 'busy';
      agent.activity = activities[Math.floor(Math.random() * activities.length)];
    }
  });
}

// Check system health
async function checkSystemHealth() {
  // Check OpenClaw
  try {
    const response = await fetch('http://127.0.0.1:18789/v1/status', {
      method: 'GET',
      timeout: 5000
    });
    dashboardData.systemHealth.openclaw = response.ok ? 'online' : 'error';
  } catch {
    dashboardData.systemHealth.openclaw = 'offline';
  }

  // Check MLX
  try {
    const response = await fetch('http://127.0.0.1:18888/v1/models', {
      method: 'GET',
      timeout: 5000
    });
    dashboardData.systemHealth.mlx = response.ok ? 'online' : 'error';
  } catch {
    dashboardData.systemHealth.mlx = 'offline';
  }
}

// Add activity
function addActivity(text, icon = '●') {
  dashboardData.recentActivity.unshift({
    time: new Date().toLocaleTimeString(),
    text,
    icon,
    timestamp: Date.now()
  });

  // Keep only last 20
  if (dashboardData.recentActivity.length > 20) {
    dashboardData.recentActivity = dashboardData.recentActivity.slice(0, 20);
  }
}

// Simulate autonomous work
function simulateAutonomousWork() {
  const possibleTasks = [
    { name: 'Researching RT curriculum standards', agent: 'Researcher', goal: 'Respiratory Education' },
    { name: 'Analyzing trading patterns', agent: 'Trading Analyst', goal: 'Autonomous Trading' },
    { name: 'Building backtesting framework', agent: 'Backend Dev', goal: 'Autonomous Trading' },
    { name: 'Researching Amazon FBA API', agent: 'Researcher', goal: 'Reselling Business' },
    { name: 'Designing prediction models', agent: 'AI Engineer', goal: 'Polymarket Bot' },
    { name: 'Creating UI components', agent: 'Frontend Dev', goal: 'Respiratory Education' },
    { name: 'Optimizing database queries', agent: 'Database Eng', goal: 'Life Programs' },
    { name: 'Testing ML models', agent: 'AI Engineer', goal: 'Autonomous Trading' }
  ];

  if (Math.random() > 0.6) {
    const task = possibleTasks[Math.floor(Math.random() * possibleTasks.length)];
    const agent = AGENT_TYPES[task.agent.toLowerCase().replace(' ', '-')];
    
    if (agent) {
      dashboardData.runningTasks.push({
        id: Date.now(),
        name: task.name,
        agent: agent.name,
        agentEmoji: agent.emoji,
        goal: task.goal,
        startTime: new Date().toISOString(),
        progress: Math.floor(Math.random() * 100)
      });

      addActivity(`${agent.emoji} ${agent.name} started: ${task.name}`, agent.emoji);

      // Keep only last 5 running tasks
      if (dashboardData.runningTasks.length > 5) {
        dashboardData.runningTasks.shift();
      }

      // Update goal progress
      if (Math.random() > 0.7) {
        const currentProgress = dashboardData.goals.progress[task.goal];
        dashboardData.goals.progress[task.goal] = Math.min(currentProgress + 1, 100);
      }
    }
  }

  // Complete some tasks
  dashboardData.runningTasks = dashboardData.runningTasks.filter(task => {
    if (Math.random() > 0.8) {
      addActivity(`✓ ${task.agent} completed: ${task.name}`, '✓');
      dashboardData.stats.completed++;
      return false;
    }
    task.progress = Math.min(task.progress + Math.floor(Math.random() * 10), 100);
    return true;
  });

  // Update stats
  dashboardData.stats.inProgress = dashboardData.runningTasks.length;
  dashboardData.stats.totalTasks = dashboardData.stats.completed + dashboardData.stats.inProgress;
}

// Update loop
function startUpdateLoop() {
  // Initial load
  loadData();

  // Update every 5 seconds
  setInterval(() => {
    simulateAgentActivity();
    simulateAutonomousWork();
    checkSystemHealth();
    dashboardData.timestamp = new Date().toISOString();
    saveData();
  }, 5000);

  // Health check every 30 seconds
  setInterval(() => {
    checkSystemHealth();
  }, 30000);

  console.log('Real-time dashboard updater started');
  console.log('Data file:', DATA_FILE);
  console.log('Updates every 5 seconds');
}

// HTTP API for dashboard to fetch data
function startAPI() {
  const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/api/dashboard' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(dashboardData));
    } else if (req.url === '/api/activity' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          addActivity(data.text, data.icon);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(3001, () => {
    console.log('Dashboard API running on http://localhost:3001');
    console.log('Endpoint: GET /api/dashboard');
  });
}

// Start
if (require.main === module) {
  startUpdateLoop();
  startAPI();
}

module.exports = { dashboardData, addActivity };
