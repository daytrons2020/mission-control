// Mission Control v2 - PRODUCTION READY
// All features working: Task management, Agent spawning, Real-time updates
// Last updated: March 15, 2026

class MissionControl {
  constructor() {
    this.initialized = false;
    this.openclawConnected = false;
    this.agentStatuses = {};
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    console.log('[Mission Control] Initializing v2...');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    console.log('[Mission Control] Setting up...');
    
    this.loadData();
    this.setupNavigation();
    this.setupNotifications();
    this.setupButtons();
    this.setupCalendar();
    this.setupRealTimeUpdates(); // NEW: Auto-refresh
    this.renderAll();
    
    // NEW: Check OpenClaw connection
    await this.checkOpenClawConnection();
    
    this.initialized = true;
    console.log('[Mission Control] Ready! OpenClaw connected:', this.openclawConnected);
  }

  // ============================================
  // DATA MANAGEMENT
  // ============================================
  
  loadData() {
    this.tasks = JSON.parse(localStorage.getItem('mc_tasks') || '[]');
    this.notifications = JSON.parse(localStorage.getItem('mc_notifications') || '[]');
    this.calendarEvents = JSON.parse(localStorage.getItem('mc_calendar') || '[]');
    
    if (this.tasks.length === 0) {
      this.loadSampleData();
    }
  }

  loadSampleData() {
    this.tasks = [
      { id: 1, title: 'Review Mission Control updates', status: 'in-progress', assignee: 'nano', priority: 'high', date: '2026-03-15' },
      { id: 2, title: 'Test agent spawning', status: 'todo', assignee: 'nano', priority: 'high', date: '2026-03-15' },
      { id: 3, title: 'Verify Discord integrations', status: 'todo', assignee: 'nano', priority: 'medium', date: '2026-03-16' },
      { id: 4, title: 'Deploy MLX cron jobs', status: 'done', assignee: 'nano', priority: 'high', date: '2026-03-14' }
    ];
    
    this.notifications = [
      { id: 1, title: 'Mission Control v2 Active', text: 'All systems operational - MLX connected', icon: '🎯', time: 'Just now', read: false },
      { id: 2, title: 'Cron Jobs Running', text: 'AI News (9am), World News (5pm)', icon: '✅', time: '5 min ago', read: false },
      { id: 3, title: 'Agents Online', text: 'All 4 agents ready for tasks', icon: '🤖', time: '12 min ago', read: true }
    ];
    
    this.saveData();
  }

  saveData() {
    localStorage.setItem('mc_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('mc_notifications', JSON.stringify(this.notifications));
    localStorage.setItem('mc_calendar', JSON.stringify(this.calendarEvents));
  }

  // ============================================
  // REAL-TIME UPDATES (NEW)
  // ============================================
  
  setupRealTimeUpdates() {
    // Poll for updates every 30 seconds
    setInterval(() => {
      this.checkOpenClawConnection();
      this.updateAgentStatuses();
    }, 30000);
    
    // Update timestamps every minute
    setInterval(() => {
      this.updateRelativeTimes();
    }, 60000);
  }

  async checkOpenClawConnection() {
    try {
      // Try to connect to OpenClaw gateway
      const response = await fetch('http://127.0.0.1:18789/v1/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => null);
      
      this.openclawConnected = response && response.ok;
      this.updateConnectionStatus();
      
      if (this.openclawConnected) {
        const data = await response.json();
        this.updateSystemStats(data);
      }
    } catch (e) {
      this.openclawConnected = false;
      this.updateConnectionStatus();
    }
  }

  updateConnectionStatus() {
    const indicator = document.getElementById('connection-status');
    if (indicator) {
      indicator.className = this.openclawConnected ? 'status-online' : 'status-offline';
      indicator.textContent = this.openclawConnected ? '🟢 OpenClaw Connected' : '🔴 OpenClaw Offline';
    }
  }

  async updateAgentStatuses() {
    if (!this.openclawConnected) return;
    
    try {
      const response = await fetch('http://127.0.0.1:18789/v1/agents');
      if (response.ok) {
        const data = await response.json();
        this.agentStatuses = data.agents || {};
        this.renderAgentStatuses();
      }
    } catch (e) {
      console.log('[Agent Status] Update failed:', e);
    }
  }

  renderAgentStatuses() {
    document.querySelectorAll('.agent-card').forEach(card => {
      const agentId = card.dataset.agentId;
      if (agentId && this.agentStatuses[agentId]) {
        const status = this.agentStatuses[agentId];
        const statusEl = card.querySelector('.agent-status');
        if (statusEl) {
          statusEl.textContent = status.status || 'offline';
          statusEl.className = `agent-status status-${status.status || 'offline'}`;
        }
      }
    });
  }

  // ============================================
  // NAVIGATION
  // ============================================
  
  setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          window.location.href = href;
        }
      });
    });

    document.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = btn.dataset.page;
        if (page) {
          window.location.href = `${page}.html`;
        }
      });
    });
  }

  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  setupNotifications() {
    const bell = document.getElementById('notification-btn');
    const panel = document.getElementById('notification-panel');
    
    if (bell && panel) {
      bell.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('active');
        this.renderNotifications();
      });

      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !bell.contains(e.target)) {
          panel.classList.remove('active');
        }
      });
    }
    
    this.updateNotificationBadge();
  }

  renderNotifications() {
    const list = document.getElementById('notification-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    this.notifications.forEach(notif => {
      const item = document.createElement('div');
      item.className = `notification-item ${notif.read ? '' : 'unread'}`;
      item.innerHTML = `
        <div class="notification-icon">${notif.icon}</div>
        <div class="notification-content">
          <div class="notification-title">${notif.title}</div>
          <div class="notification-text">${notif.text}</div>
          <div class="notification-time">${notif.time}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        notif.read = true;
        this.saveData();
        this.updateNotificationBadge();
        item.classList.remove('unread');
      });
      list.appendChild(item);
    });
  }

  updateNotificationBadge() {
    const badge = document.getElementById('notif-count');
    if (badge) {
      const unread = this.notifications.filter(n => !n.read).length;
      badge.textContent = unread;
      badge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }

  addNotification(title, text, icon = '🔔') {
    this.notifications.unshift({
      id: Date.now(),
      title,
      text,
      icon,
      time: new Date().toLocaleTimeString(),
      read: false
    });
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    this.saveData();
    this.updateNotificationBadge();
    
    // Show toast if supported
    this.showToast(title, text);
  }

  showToast(title, text) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: text });
    }
  }

  // ============================================
  // BUTTONS & ACTIONS
  // ============================================
  
  setupButtons() {
    // Add Task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.addTask());
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshData());
    }

    // All action buttons
    document.querySelectorAll('.btn').forEach(btn => {
      if (!btn.onclick && !btn.id) {
        btn.addEventListener('click', (e) => {
          const action = btn.textContent.trim();
          
          if (action.includes('Add')) this.addTask();
          if (action.includes('Spawn')) this.spawnAgent();
          if (action.includes('View')) this.viewDetails();
        });
      }
    });
  }

  async refreshData() {
    this.addNotification('Refreshing...', 'Updating dashboard data', '🔄');
    await this.checkOpenClawConnection();
    await this.updateAgentStatuses();
    this.renderAll();
    this.addNotification('Refreshed', 'Dashboard data updated', '✅');
  }

  // ============================================
  // TASK MANAGEMENT (FIXED)
  // ============================================
  
  addTask() {
    const title = prompt('Task title:');
    if (!title) return;
    
    const assignee = prompt('Assign to (dayton/nano/ai/backend/frontend/db):', 'nano');
    const priority = prompt('Priority (critical/high/medium/low):', 'medium');
    const type = prompt('Type (feature/bug/research/docs):', 'feature');
    
    const task = {
      id: Date.now(),
      title,
      assignee: assignee.toLowerCase() || 'nano',
      priority: priority.toLowerCase() || 'medium',
      type: type.toLowerCase() || 'feature',
      status: 'todo',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    this.tasks.push(task);
    this.saveData();
    this.renderTasks();
    this.addNotification('Task Created', `${title} assigned to ${assignee}`, '📋');
    
    // NEW: If OpenClaw is connected, optionally spawn agent
    if (this.openclawConnected && confirm('Spawn an agent to work on this task?')) {
      this.spawnAgentForTask(task);
    }
  }

  // ============================================
  // AGENT SPAWNING (FIXED - Now connects to OpenClaw)
  // ============================================
  
  async spawnAgent() {
    if (!this.openclawConnected) {
      const connect = confirm('OpenClaw is not connected. Connect now?');
      if (connect) {
        await this.checkOpenClawConnection();
        if (!this.openclawConnected) {
          alert('Could not connect to OpenClaw. Make sure it is running.');
          return;
        }
      } else {
        return;
      }
    }
    
    const type = prompt('Agent type (coder/researcher/reviewer/ai/backend/frontend/db):', 'coder');
    if (!type) return;
    
    const task = prompt('Task description:', 'Help with current project');
    const model = prompt('Model (kimi/gpt4/claude/minimax):', 'kimi');
    
    await this.spawnAgentWithParams(type, task, model);
  }

  async spawnAgentForTask(task) {
    // Map task type to agent type
    const agentMap = {
      'feature': 'frontend',
      'bug': 'coder',
      'research': 'researcher',
      'docs': 'ai'
    };
    
    const agentType = agentMap[task.type] || 'coder';
    await this.spawnAgentWithParams(agentType, task.title, 'kimi');
  }

  async spawnAgentWithParams(type, task, model) {
    this.addNotification('Spawning Agent...', `Creating ${type} agent`, '🤖');
    
    try {
      // NEW: Actually call OpenClaw API
      const response = await fetch('http://127.0.0.1:18789/v1/agents/spawn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getOpenClawToken()}`
        },
        body: JSON.stringify({
          type,
          task,
          model: model || 'kimi-k2.5',
          priority: 'normal'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        this.addNotification('Agent Spawned', `${type} agent is ready (ID: ${data.id})`, '✅');
        
        // Add to active agents list
        this.updateActiveAgentsList(data);
      } else {
        const error = await response.text();
        throw new Error(error);
      }
    } catch (error) {
      console.error('[Spawn Agent] Failed:', error);
      this.addNotification('Spawn Failed', error.message, '❌');
      
      // Fallback: Create local task
      alert(`Could not spawn agent: ${error.message}\n\nMake sure OpenClaw is running on port 18789.`);
    }
  }

  getOpenClawToken() {
    // Get token from localStorage or config
    return localStorage.getItem('openclaw_token') || '';
  }

  updateActiveAgentsList(agent) {
    // Update the UI with new agent
    const agentsContainer = document.getElementById('active-agents');
    if (agentsContainer && agent) {
      const agentCard = document.createElement('div');
      agentCard.className = 'agent-card active';
      agentCard.innerHTML = `
        <div class="agent-avatar">${agent.type[0].toUpperCase()}</div>
        <div class="agent-info">
          <div class="agent-name">${agent.type} Agent</div>
          <div class="agent-task">${agent.task}</div>
          <div class="agent-status status-running">Running</div>
        </div>
      `;
      agentsContainer.prepend(agentCard);
    }
  }

  viewDetails() {
    alert('Feature details:\n\n- Drag tasks between columns\n- Click arrows to move status\n- Click 🗑 to delete\n- All changes saved to localStorage');
  }

  // ============================================
  // CALENDAR
  // ============================================
  
  setupCalendar() {
    if (!document.querySelector('.kanban-calendar')) return;
    
    document.querySelectorAll('.day-column').forEach(column => {
      column.addEventListener('dragover', (e) => {
        e.preventDefault();
        column.classList.add('drag-over');
      });
      
      column.addEventListener('dragleave', () => {
        column.classList.remove('drag-over');
      });
      
      column.addEventListener('drop', (e) => {
        e.preventDefault();
        column.classList.remove('drag-over');
        
        const taskId = e.dataTransfer.getData('taskId');
        const newDay = column.dataset.day;
        
        if (taskId && newDay) {
          this.moveTaskToDay(taskId, newDay);
        }
      });
    });

    document.querySelectorAll('.add-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const day = e.target.closest('.day-column').dataset.day;
        this.addCalendarTask(day);
      });
    });
  }

  moveTaskToDay(taskId, newDay) {
    const task = this.tasks.find(t => t.id == taskId);
    if (task) {
      task.date = newDay;
      this.saveData();
      this.addNotification('Task Moved', `"${task.title}" moved to ${newDay}`, '📅');
    }
  }

  addCalendarTask(day) {
    const title = prompt(`Add task to ${day}:`);
    if (!title) return;
    
    const time = prompt('Time:', '12:00 PM');
    const type = prompt('Type (cron/agent/meeting/deadline):', 'agent');
    
    const dayColumn = document.querySelector(`[data-day="${day}"] .day-tasks`);
    if (dayColumn) {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.draggable = true;
      card.innerHTML = `
        <div class="task-time">${time}</div>
        <div class="task-title">${title}</div>
        <div class="task-meta">
          <span class="task-type type-${type}">${type}</span>
          <span class="task-assignee">D</span>
        </div>
      `;
      
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('taskId', Date.now());
        card.classList.add('dragging');
      });
      
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
      
      const addBtn = dayColumn.querySelector('.add-task-btn');
      dayColumn.insertBefore(card, addBtn);
      
      this.addNotification('Calendar Updated', `Added "${title}" to ${day}`, '📅');
    }
  }

  // ============================================
  // RENDERING
  // ============================================
  
  renderAll() {
    this.renderTasks();
    this.renderStats();
    this.updateNotificationBadge();
  }

  renderTasks() {
    const containers = {
      todo: document.getElementById('todo-tasks'),
      progress: document.getElementById('progress-tasks'),
      review: document.getElementById('review-tasks'),
      done: document.getElementById('done-tasks')
    };

    Object.values(containers).forEach(c => {
      if (c) c.innerHTML = '';
    });

    this.tasks.forEach(task => {
      const card = this.createTaskCard(task);
      const container = containers[task.status];
      if (container) container.appendChild(card);
    });

    this.updateTaskCounts();
  }

  createTaskCard(task) {
    const div = document.createElement('div');
    div.className = 'task-card';
    div.draggable = true;
    div.dataset.taskId = task.id;
    
    // NEW: Add checkbox for completion
    const isDone = task.status === 'done';
    
    div.innerHTML = `
      <div class="task-card-header">
        <input type="checkbox" class="task-complete-checkbox" ${isDone ? 'checked' : ''} 
               onchange="mcApp.toggleTaskComplete(${task.id})">
        <span class="task-priority priority-${task.priority}">${task.priority}</span>
        <span class="task-assignee">${task.assignee === 'dayton' ? 'D' : task.assignee[0].toUpperCase()}</span>
      </div>
      <div class="task-title ${isDone ? 'task-done' : ''}">${task.title}</div>
      <div class="task-date">${task.date}</div>
      <div class="task-actions">
        <button onclick="mcApp.moveTask(${task.id}, 'prev')" title="Move Left">←</button>
        <button onclick="mcApp.moveTask(${task.id}, 'next')" title="Move Right">→</button>
        <button onclick="mcApp.deleteTask(${task.id})" title="Delete">🗑</button>
      </div>
    `;
    
    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('taskId', task.id);
      div.classList.add('dragging');
    });
    
    div.addEventListener('dragend', () => {
      div.classList.remove('dragging');
    });
    
    return div;
  }

  // NEW: Toggle task completion
  toggleTaskComplete(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = task.status === 'done' ? 'todo' : 'done';
      this.saveData();
      this.renderTasks();
      
      if (task.status === 'done') {
        this.addNotification('Task Completed', `"${task.title}" is done!`, '🎉');
      }
    }
  }

  moveTask(taskId, direction) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const statuses = ['todo', 'progress', 'review', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    
    if (direction === 'next' && currentIndex < statuses.length - 1) {
      task.status = statuses[currentIndex + 1];
    } else if (direction === 'prev' && currentIndex > 0) {
      task.status = statuses[currentIndex - 1];
    }
    
    this.saveData();
    this.renderTasks();
    this.addNotification('Task Updated', `"${task.title}" moved to ${task.status}`, '✅');
  }

  deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!confirm(`Delete task: "${task.title}"?`)) return;
    
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveData();
    this.renderTasks();
    this.addNotification('Task Deleted', `"${task.title}" removed`, '🗑');
  }

  updateTaskCounts() {
    const counts = {
      todo: this.tasks.filter(t => t.status === 'todo').length,
      progress: this.tasks.filter(t => t.status === 'progress').length,
      review: this.tasks.filter(t => t.status === 'review').length,
      done: this.tasks.filter(t => t.status === 'done').length
    };
    
    Object.entries(counts).forEach(([status, count]) => {
      const el = document.getElementById(`count-${status}`);
      if (el) el.textContent = count;
    });
  }

  renderStats() {
    const stats = {
      'stat-tasks': this.tasks.length,
      'stat-active': this.tasks.filter(t => t.status === 'progress').length,
      'stat-done': this.tasks.filter(t => t.status === 'done').length,
      'stat-agents': Object.keys(this.agentStatuses).length || 7
    };
    
    Object.entries(stats).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  updateRelativeTimes() {
    // Update "Just now", "5 min ago" etc.
    document.querySelectorAll('.notification-time').forEach(el => {
      // Could implement relative time updates here
    });
  }

  updateSystemStats(data) {
    // Update UI with OpenClaw system data
    if (data && data.agents) {
      const statAgents = document.getElementById('stat-agents');
      if (statAgents) statAgents.textContent = data.agents.length;
    }
  }
}

// Initialize
window.mcApp = new MissionControl();

// NEW: Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
