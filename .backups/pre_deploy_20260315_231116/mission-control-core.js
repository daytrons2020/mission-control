// Mission Control v2 - Core Functionality
// Implements missing features from improvement plan

class MissionControl {
  constructor() {
    this.agents = [];
    this.costs = { daily: 0, limit: 10, alerts: [] };
    this.updateInterval = null;
    this.init();
  }

  init() {
    this.loadState();
    this.startAutoUpdates();
    this.setupEventListeners();
    this.checkCostAlerts();
  }

  // ============================================
  // 1. FUNCTIONAL AGENT SPAWNING
  // ============================================
  
  async spawnAgent(agentType, task, options = {}) {
    console.log(`[Mission Control] Spawning ${agentType} agent...`);
    
    const agentConfig = {
      type: agentType,
      task: task,
      model: options.model || this.recommendModel(task),
      priority: options.priority || 'normal',
      spawnedAt: new Date().toISOString(),
      status: 'spawning'
    };

    // Update UI immediately
    this.addAgentToUI(agentConfig);
    
    // Simulate API call (replace with actual OpenClaw API)
    try {
      // In production, this would call:
      // const result = await fetch('/api/spawn-agent', {
      //   method: 'POST',
      //   body: JSON.stringify(agentConfig)
      // });
      
      // Simulate delay
      await this.delay(2000);
      
      agentConfig.status = 'running';
      agentConfig.id = `agent-${Date.now()}`;
      this.agents.push(agentConfig);
      this.updateAgentUI(agentConfig);
      
      this.logActivity(`Agent spawned: ${agentType}`, 'success');
      return agentConfig;
      
    } catch (error) {
      agentConfig.status = 'failed';
      this.updateAgentUI(agentConfig);
      this.logActivity(`Failed to spawn agent: ${error.message}`, 'error');
      throw error;
    }
  }

  recommendModel(task) {
    // Smart model recommendation based on task type
    if (task.includes('code') || task.includes('programming')) {
      return 'claude-3-opus';
    } else if (task.includes('research') || task.includes('analysis')) {
      return 'gpt-4';
    } else if (task.includes('quick') || task.includes('simple')) {
      return 'kimi-k2.5';
    }
    return 'gpt-4o';
  }

  addAgentToUI(agent) {
    const terminal = document.querySelector('.terminal-content');
    if (terminal) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.innerHTML = `
        <span class="terminal-time">${new Date().toLocaleTimeString()}</span>
        <span class="terminal-status spawning">●</span>
        <span class="terminal-text">Spawning ${agent.type} agent...</span>
      `;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }
  }

  updateAgentUI(agent) {
    // Update agent status in UI
    const terminal = document.querySelector('.terminal-content');
    if (terminal) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      const statusColor = agent.status === 'running' ? 'green' : 'red';
      line.innerHTML = `
        <span class="terminal-time">${new Date().toLocaleTimeString()}</span>
        <span class="terminal-status ${statusColor}">●</span>
        <span class="terminal-text">Agent ${agent.id} ${agent.status}</span>
      `;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }
  }

  // ============================================
  // 2. COST ALERTS (50/75/90%)
  // ============================================
  
  checkCostAlerts() {
    const percentage = (this.costs.daily / this.costs.limit) * 100;
    
    if (percentage >= 90 && !this.costs.alerts.includes(90)) {
      this.triggerCostAlert(90, 'critical');
    } else if (percentage >= 75 && !this.costs.alerts.includes(75)) {
      this.triggerCostAlert(75, 'warning');
    } else if (percentage >= 50 && !this.costs.alerts.includes(50)) {
      this.triggerCostAlert(50, 'info');
    }
  }

  triggerCostAlert(threshold, level) {
    this.costs.alerts.push(threshold);
    
    const alert = {
      type: 'cost',
      level: level,
      message: `Daily cost at ${threshold}% ($${this.costs.daily.toFixed(2)} / $${this.costs.limit})`,
      timestamp: new Date().toISOString()
    };
    
    this.showAlert(alert);
    this.logActivity(`Cost alert: ${threshold}%`, level);
    
    // Send to Discord if configured
    if (window.discordWebhook) {
      this.notifyDiscord(alert);
    }
  }

  showAlert(alert) {
    const alertContainer = document.getElementById('alert-container') || document.body;
    const alertEl = document.createElement('div');
    alertEl.className = `alert alert-${alert.level}`;
    alertEl.innerHTML = `
      <div class="alert-content">
        <span class="alert-icon">${this.getAlertIcon(alert.level)}</span>
        <span class="alert-message">${alert.message}</span>
      </div>
      <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;
    alertContainer.appendChild(alertEl);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => alertEl.remove(), 10000);
  }

  getAlertIcon(level) {
    const icons = {
      critical: '🔴',
      warning: '🟡',
      info: '🔵',
      success: '🟢'
    };
    return icons[level] || 'ℹ️';
  }

  // ============================================
  // 3. SELF-ACCOUNTABILITY SYSTEM
  // ============================================
  
  startAutoUpdates() {
    // Update every 30 minutes
    this.updateInterval = setInterval(() => {
      this.performAutoUpdate();
    }, 30 * 60 * 1000);
    
    // Initial update
    this.performAutoUpdate();
  }

  async performAutoUpdate() {
    console.log('[Mission Control] Performing auto-update...');
    
    const update = {
      timestamp: new Date().toISOString(),
      agentCount: this.agents.length,
      activeAgents: this.agents.filter(a => a.status === 'running').length,
      dailyCost: this.costs.daily,
      systemHealth: await this.checkSystemHealth()
    };
    
    // Update UI
    this.updateDashboard(update);
    
    // Log to memory
    this.logToMemory(update);
    
    // Check for issues
    if (update.systemHealth.score < 70) {
      this.showAlert({
        type: 'health',
        level: 'warning',
        message: `System health at ${update.systemHealth.score}%. Check logs.`
      });
    }
  }

  async checkSystemHealth() {
    // Check various system metrics
    const checks = {
      agents: this.agents.filter(a => a.status === 'running').length > 0,
      costs: this.costs.daily < this.costs.limit,
      memory: this.checkMemoryUsage(),
      cron: this.checkCronJobs()
    };
    
    const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100;
    
    return { score: Math.round(score), checks };
  }

  checkMemoryUsage() {
    // Simulate memory check
    return true;
  }

  checkCronJobs() {
    // Simulate cron check
    return true;
  }

  updateDashboard(update) {
    // Update stats in UI
    const stats = {
      'agent-count': update.agentCount,
      'active-agents': update.activeAgents,
      'daily-cost': `$${update.dailyCost.toFixed(2)}`,
      'health-score': `${update.systemHealth.score}%`
    };
    
    Object.entries(stats).forEach(([id, value]) => {
      const el = document.getElementById(`stat-${id}`);
      if (el) el.textContent = value;
    });
  }

  logToMemory(update) {
    // Save to localStorage or API
    const logs = JSON.parse(localStorage.getItem('mc-logs') || '[]');
    logs.push(update);
    localStorage.setItem('mc-logs', JSON.stringify(logs.slice(-100))); // Keep last 100
  }

  // ============================================
  // 4. NATURAL LANGUAGE INPUT
  // ============================================
  
  parseNaturalLanguage(input) {
    const patterns = {
      spawn: /spawn (\w+) (?:agent )?(?:to )?(.+)/i,
      status: /(?:what's |what is )?(?:the )?status (?:of )?(.+)/i,
      cost: /(?:show )?(?:me )?(?:the )?costs?/i,
      help: /help|what can you do/i
    };
    
    for (const [action, pattern] of Object.entries(patterns)) {
      const match = input.match(pattern);
      if (match) {
        return this.executeCommand(action, match);
      }
    }
    
    return { error: 'Unknown command. Try: "spawn agent to...", "status of...", "show costs"' };
  }

  executeCommand(action, match) {
    switch (action) {
      case 'spawn':
        const [, type, task] = match;
        this.spawnAgent(type, task);
        return { success: true, message: `Spawning ${type} agent for: ${task}` };
        
      case 'status':
        const target = match[1];
        return { success: true, message: `Status of ${target}: ${this.getStatus(target)}` };
        
      case 'cost':
        return { success: true, message: `Daily cost: $${this.costs.daily.toFixed(2)} / $${this.costs.limit}` };
        
      case 'help':
        return { success: true, message: 'Available commands: spawn agent, status, costs, help' };
        
      default:
        return { error: 'Command not implemented' };
    }
  }

  getStatus(target) {
    // Return status of agent/project
    const agent = this.agents.find(a => a.type === target || a.id === target);
    return agent ? agent.status : 'Not found';
  }

  // ============================================
  // 5. WAR ROOM CHAT
  // ============================================
  
  sendWarRoomMessage(message, sender = 'user') {
    const chat = document.querySelector('.war-room-messages');
    if (!chat) return;
    
    const msgEl = document.createElement('div');
    msgEl.className = `war-room-message ${sender}`;
    msgEl.innerHTML = `
      <div class="message-header">
        <span class="message-sender">${sender === 'user' ? 'You' : 'Mission Control'}</span>
        <span class="message-time">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="message-content">${message}</div>
    `;
    
    chat.appendChild(msgEl);
    chat.scrollTop = chat.scrollHeight;
    
    // If user message, process it
    if (sender === 'user') {
      this.processWarRoomMessage(message);
    }
  }

  processWarRoomMessage(message) {
    // Check if it's a natural language command
    const result = this.parseNaturalLanguage(message);
    
    if (result.success) {
      setTimeout(() => {
        this.sendWarRoomMessage(result.message, 'system');
      }, 500);
    } else if (result.error) {
      setTimeout(() => {
        this.sendWarRoomMessage(result.error, 'system');
      }, 500);
    }
  }

  // ============================================
  // 6. CROSS-PLATFORM SYNC
  // ============================================
  
  async syncToDiscord(data) {
    if (!window.discordWebhook) return;
    
    try {
      await fetch(window.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: this.formatDiscordMessage(data)
        })
      });
    } catch (error) {
      console.error('Failed to sync to Discord:', error);
    }
  }

  formatDiscordMessage(data) {
    return `**[Mission Control]** ${data.message}`;
  }

  notifyDiscord(alert) {
    this.syncToDiscord(alert);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================
  
  logActivity(message, type = 'info') {
    console.log(`[Mission Control] ${type}: ${message}`);
    
    // Add to activity feed
    const feed = document.querySelector('.activity-feed');
    if (feed) {
      const item = document.createElement('div');
      item.className = `activity-item ${type}`;
      item.innerHTML = `
        <span class="activity-time">${new Date().toLocaleTimeString()}</span>
        <span class="activity-text">${message}</span>
      `;
      feed.insertBefore(item, feed.firstChild);
    }
  }

  loadState() {
    const saved = localStorage.getItem('mc-state');
    if (saved) {
      const state = JSON.parse(saved);
      this.agents = state.agents || [];
      this.costs = state.costs || { daily: 0, limit: 10, alerts: [] };
    }
  }

  saveState() {
    localStorage.setItem('mc-state', JSON.stringify({
      agents: this.agents,
      costs: this.costs
    }));
  }

  setupEventListeners() {
    // Natural language input
    const nlInput = document.getElementById('natural-language-input');
    if (nlInput) {
      nlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const result = this.parseNaturalLanguage(e.target.value);
          if (result.success) {
            this.logActivity(result.message, 'success');
          } else {
            this.logActivity(result.error, 'error');
          }
          e.target.value = '';
        }
      });
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize Mission Control on page load
document.addEventListener('DOMContentLoaded', () => {
  window.missionControl = new MissionControl();
});
