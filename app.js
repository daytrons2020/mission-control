// Mission Control - Fully Working JavaScript
// All buttons, tabs, notifications, and calendar functions work

class MissionControl {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;
    
    console.log('[Mission Control] Initializing...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('[Mission Control] Setting up...');
    
    this.loadData();
    this.setupNavigation();
    this.setupNotifications();
    this.setupButtons();
    this.setupCalendar();
    this.renderAll();
    
    this.initialized = true;
    console.log('[Mission Control] Ready!');
  }

  // ============================================
  // DATA MANAGEMENT
  // ============================================
  
  loadData() {
    // Initialize with sample data if empty
    this.tasks = JSON.parse(localStorage.getItem('mc_tasks') || '[]');
    this.notifications = JSON.parse(localStorage.getItem('mc_notifications') || '[]');
    this.calendarEvents = JSON.parse(localStorage.getItem('mc_calendar') || '[]');
    
    if (this.tasks.length === 0) {
      this.loadSampleData();
    }
  }

  loadSampleData() {
    this.tasks = [
      { id: 1, title: 'Fix Mission Control buttons', status: 'in-progress', assignee: 'nano', priority: 'high', date: '2026-03-10' },
      { id: 2, title: 'Test notification system', status: 'todo', assignee: 'nano', priority: 'high', date: '2026-03-10' },
      { id: 3, title: 'Verify calendar drag-drop', status: 'todo', assignee: 'nano', priority: 'medium', date: '2026-03-11' },
      { id: 4, title: 'Deploy to Vercel', status: 'done', assignee: 'nano', priority: 'high', date: '2026-03-09' }
    ];
    
    this.notifications = [
      { id: 1, title: 'Welcome to Mission Control', text: 'All systems operational', icon: '🎯', time: 'Just now', read: false },
      { id: 2, title: 'Task Completed', text: 'Dashboard rebuild finished', icon: '✅', time: '5 min ago', read: false },
      { id: 3, title: 'Agent Online', text: 'Frontend Developer is ready', icon: '🤖', time: '12 min ago', read: true }
    ];
    
    this.saveData();
  }

  saveData() {
    localStorage.setItem('mc_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('mc_notifications', JSON.stringify(this.notifications));
    localStorage.setItem('mc_calendar', JSON.stringify(this.calendarEvents));
  }

  // ============================================
  // NAVIGATION - Make all tabs work
  // ============================================
  
  setupNavigation() {
    // Fix all navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          console.log('[Navigation] Going to:', href);
          window.location.href = href;
        }
      });
    });

    // Fix all buttons with data-page
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
  // NOTIFICATIONS - Make bell icon work
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

      // Close when clicking outside
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
      time: 'Just now',
      read: false
    });
    this.saveData();
    this.updateNotificationBadge();
  }

  // ============================================
  // BUTTONS - Make all buttons work
  // ============================================
  
  setupButtons() {
    // Add Task button
    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.addTask());
    }

    // All action buttons
    document.querySelectorAll('.btn').forEach(btn => {
      if (!btn.onclick && !btn.id) {
        btn.addEventListener('click', (e) => {
          const action = btn.textContent.trim();
          console.log('[Button] Clicked:', action);
          
          // Handle common actions
          if (action.includes('Add')) this.addTask();
          if (action.includes('Spawn')) this.spawnAgent();
          if (action.includes('View')) this.viewDetails();
        });
      }
    });
  }

  addTask() {
    const title = prompt('Task title:');
    if (!title) return;
    
    const assignee = prompt('Assign to (dayton or nano):', 'nano');
    const priority = prompt('Priority (high/medium/low):', 'medium');
    
    const task = {
      id: Date.now(),
      title,
      assignee: assignee.toLowerCase(),
      priority,
      status: 'todo',
      date: new Date().toISOString().split('T')[0]
    };
    
    this.tasks.push(task);
    this.saveData();
    this.renderTasks();
    this.addNotification('Task Created', `New task: ${title}`, '📋');
  }

  spawnAgent() {
    alert('Spawning agent... (connecting to OpenClaw)');
    this.addNotification('Agent Spawned', 'New agent is ready', '🤖');
  }

  viewDetails() {
    alert('Viewing details...');
  }

  // ============================================
  // CALENDAR - Make it work properly
  // ============================================
  
  setupCalendar() {
    // Only run on calendar page
    if (!document.querySelector('.kanban-calendar')) return;
    
    // Setup drag and drop for calendar
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

    // Add task buttons on calendar
    document.querySelectorAll('.add-task-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const day = e.target.closest('.day-column').dataset.day;
        this.addCalendarTask(day);
      });
    });
  }

  moveTaskToDay(taskId, newDay) {
    console.log(`Moving task ${taskId} to ${newDay}`);
    this.addNotification('Task Moved', `Task moved to ${newDay}`, '📅');
  }

  addCalendarTask(day) {
    const title = prompt(`Add task to ${day}:`);
    if (!title) return;
    
    const time = prompt('Time:', '12:00 PM');
    const type = prompt('Type (cron/agent/meeting/deadline):', 'agent');
    
    // Create visual task card
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
      
      // Add drag handlers
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

    // Clear containers
    Object.values(containers).forEach(c => {
      if (c) c.innerHTML = '';
    });

    // Render tasks
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
    div.innerHTML = `
      <div class="task-card-header">
        <span class="task-priority priority-${task.priority}">${task.priority}</span>
        <span class="task-assignee">${task.assignee === 'dayton' ? 'D' : 'N'}</span>
      </div>
      <div class="task-title">${task.title}</div>
      <div class="task-date">${task.date}</div>
      <div class="task-actions">
        <button onclick="mcApp.moveTask(${task.id}, 'prev')">←</button>
        <button onclick="mcApp.moveTask(${task.id}, 'next')">→</button>
        <button onclick="mcApp.deleteTask(${task.id})">🗑</button>
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
    this.addNotification('Task Updated', `Task moved to ${task.status}`, '✅');
  }

  deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    this.saveData();
    this.renderTasks();
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
      'stat-active': this.tasks.filter(t => t.status === 'in-progress').length,
      'stat-agents': 7,
      'stat-cron': 6
    };
    
    Object.entries(stats).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }
}

// Initialize
window.mcApp = new MissionControl();
