// Office Style Task Management Functions

// Initialize the office task view
function initOfficeTasks() {
  renderCommandStats();
  renderWorkstations();
  renderKanbanBoard();
  renderActivityWall();
  renderPresenceList();
}

// Render command center stats
function renderCommandStats() {
  const tasks = dashboardData?.tasks || { active: [], completed: [] };
  const allTasks = [...tasks.active, ...(tasks.completed || [])];
  const agents = dashboardData?.agents || [];
  
  document.getElementById('cmd-total-tasks').textContent = allTasks.length;
  document.getElementById('cmd-active-tasks').textContent = tasks.active.length;
  document.getElementById('cmd-completed-tasks').textContent = tasks.completed?.length || 0;
  document.getElementById('cmd-agents-busy').textContent = agents.filter(a => a.status === 'busy').length;
}

// Render agent workstations (left panel)
function renderWorkstations() {
  const container = document.getElementById('workstations-grid');
  const count = document.getElementById('workstation-count');
  if (!container) return;
  
  const agents = dashboardData?.agents || [];
  count.textContent = agents.length;
  
  if (agents.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No agents online</p></div>';
    return;
  }
  
  container.innerHTML = agents.map(agent => {
    const isBusy = agent.status === 'busy';
    const currentTask = isBusy ? 'Working on task...' : 'Available';
    const progress = isBusy ? Math.floor(Math.random() * 60) + 20 : 0;
    
    return `
      <div class="workstation ${isBusy ? 'busy' : 'idle'}" onclick="showAgentWorkstation('${agent.id}')">
        <div class="workstation-header">
          <div class="workstation-avatar">${agent.emoji}</div>
          <div class="workstation-info">
            <div class="workstation-name">${agent.name}</div>
            <div class="workstation-role">${agent.role}</div>
          </div>
          <div class="status-indicator ${agent.status}"></div>
        </div>
        <div class="workstation-task">${currentTask}</div>
        ${isBusy ? `
          <div class="workstation-progress">
            <div class="workstation-progress-fill" style="width: ${progress}%"></div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Render Kanban board (center)
function renderKanbanBoard() {
  const tasks = dashboardData?.tasks?.active || [];
  const completed = dashboardData?.tasks?.completed || [];
  
  // Distribute tasks to columns
  const backlog = tasks.filter((t, i) => i % 4 === 0);
  const inProgress = tasks.filter((t, i) => i % 4 === 1);
  const review = tasks.filter((t, i) => i % 4 === 2);
  const done = completed.slice(0, 4);
  
  renderKanbanColumn('backlog', backlog);
  renderKanbanColumn('progress', inProgress);
  renderKanbanColumn('review', review);
  renderKanbanColumn('done', done);
}

function renderKanbanColumn(columnId, tasks) {
  const container = document.getElementById(`${columnId}-tasks`);
  const count = document.getElementById(`${columnId === 'progress' ? 'progress' : columnId}-count`);
  if (!container) return;
  
  count.textContent = tasks.length;
  
  if (tasks.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary); font-size: 13px;">No tasks</div>';
    return;
  }
  
  container.innerHTML = tasks.map(task => {
    const agent = dashboardData?.agents?.find(a => a.name === task.assignee) || { emoji: '🤖', name: 'Unknown' };
    const priority = task.priority || 'medium';
    const progress = Math.floor(Math.random() * 40) + 30;
    
    return `
      <div class="kanban-task" onclick="openTaskDetail('${task.id}')">
        <div class="kanban-task-header">
          <span class="kanban-task-priority priority-${priority}">${priority}</span>
        </div>
        <div class="kanban-task-title">${task.name}</div>
        <div class="kanban-task-footer">
          <div class="kanban-task-assignee">
            <div class="assignee-avatar">${agent.emoji}</div>
            <span>${agent.name}</span>
          </div>
          <div class="kanban-task-due">📅 ${task.due || 'No date'}</div>
        </div>
        ${columnId !== 'done' && columnId !== 'backlog' ? `
          <div class="kanban-task-progress">
            <div class="kanban-task-progress-fill" style="width: ${progress}%; background: ${columnId === 'in-progress' ? 'var(--accent)' : 'var(--warning)'}"></div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Render activity wall (right panel)
function renderActivityWall() {
  const container = document.getElementById('activity-wall');
  if (!container) return;
  
  const activities = [
    { avatar: '🎯', text: '<strong>Kimi</strong> assigned a new task', time: '2 min ago' },
    { avatar: '💻', text: '<strong>Kimi-Code</strong> completed code review', time: '5 min ago' },
    { avatar: '🎨', text: '<strong>Frontend Dev</strong> started working on UI', time: '12 min ago' },
    { avatar: '🗄️', text: '<strong>Database Eng</strong> updated schema', time: '25 min ago' },
    { avatar: '🤖', text: '<strong>AI Engineer</strong> trained new model', time: '1 hour ago' },
    { avatar: '🔗', text: '<strong>Integration Spec</strong> fixed webhook', time: '2 hours ago' }
  ];
  
  container.innerHTML = activities.map(a => `
    <div class="activity-item">
      <div class="activity-avatar">${a.avatar}</div>
      <div class="activity-content">
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

// Render agent presence list
function renderPresenceList() {
  const container = document.getElementById('presence-list');
  if (!container) return;
  
  const agents = dashboardData?.agents || [];
  
  container.innerHTML = agents.map(agent => `
    <div class="presence-item">
      <span class="presence-dot ${agent.status === 'online' || agent.status === 'busy' ? 'online' : ''}"></span>
      <span>${agent.emoji} ${agent.name.split(' ')[0]}</span>
    </div>
  `).join('');
}

// Open task detail modal
function openTaskDetail(taskId) {
  const tasks = [...(dashboardData?.tasks?.active || []), ...(dashboardData?.tasks?.completed || [])];
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const agent = dashboardData?.agents?.find(a => a.name === task.assignee) || { emoji: '🤖', name: 'Unknown' };
  
  document.getElementById('detail-title').textContent = task.name;
  document.getElementById('detail-status').textContent = task.status || 'In Progress';
  document.getElementById('detail-assignee').innerHTML = `
    <div class="assignee-avatar">${agent.emoji}</div>
    <span>${agent.name}</span>
  `;
  document.getElementById('detail-due').textContent = task.due || 'No due date';
  document.getElementById('detail-priority').textContent = (task.priority || 'medium').toUpperCase();
  document.getElementById('detail-priority').className = `kanban-task-priority priority-${task.priority || 'medium'}`;
  
  const progress = Math.floor(Math.random() * 60) + 20;
  document.getElementById('detail-progress-text').textContent = `${progress}%`;
  document.getElementById('detail-progress-bar').style.width = `${progress}%`;
  
  document.getElementById('detail-description').textContent = 
    `Task assigned to ${agent.name}. ${task.priority === 'high' ? 'High priority task requiring immediate attention.' : 'Standard priority task.'}`;
  
  document.getElementById('task-detail-overlay').classList.add('show');
}

// Close task detail modal
function closeTaskDetail() {
  document.getElementById('task-detail-overlay').classList.remove('show');
}

// Show create task modal
function showCreateTaskModal() {
  const name = prompt('Task name:');
  if (name) {
    showToast(`Task "${name}" created!`, 'success');
    // Add to active tasks
    if (!dashboardData.tasks) dashboardData.tasks = { active: [], completed: [] };
    dashboardData.tasks.active.push({
      id: `task_${Date.now()}`,
      name,
      assignee: 'Unassigned',
      priority: 'medium',
      due: 'Today',
      status: 'pending'
    });
    renderKanbanBoard();
    renderCommandStats();
  }
}

// Show agent workstation detail
function showAgentWorkstation(agentId) {
  const agent = dashboardData?.agents?.find(a => a.id === agentId);
  if (!agent) return;
  
  showModal(`${agent.emoji} ${agent.name}`, `
    <div style="display: grid; gap: 16px;">
      <div><strong>Role:</strong> ${agent.role}</div>
      <div><strong>Status:</strong> ${agent.status}</div>
      <div><strong>Current Task:</strong> ${agent.status === 'busy' ? 'Working on assigned tasks' : 'Available for work'}</div>
      <div><strong>Tasks Completed:</strong> ${agent.tasksCompleted || 0}</div>
      <div><strong>Success Rate:</strong> ${agent.successRate || '95%'}</div>
    </div>
  `);
}

// Refresh tasks
function refreshTasks() {
  showToast('Refreshing tasks...', 'success');
  renderCommandStats();
  renderWorkstations();
  renderKanbanBoard();
  renderActivityWall();
}

// Filter task view
function filterTaskView(filter) {
  showToast(`Filtered: ${filter}`, 'success');
  // Implement filtering logic
  renderKanbanBoard();
}

// Task actions
function editTask() {
  showToast('Edit mode activated', 'success');
}

function updateTaskProgress() {
  showToast('Progress updated!', 'success');
  closeTaskDetail();
}

function markTaskComplete() {
  showToast('Task marked as complete! ✅', 'success');
  closeTaskDetail();
  renderKanbanBoard();
  renderCommandStats();
}

// Initialize when tab is shown
document.querySelector('[data-tab="tasks"]')?.addEventListener('click', () => {
  setTimeout(initOfficeTasks, 100);
});
