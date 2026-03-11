/**
 * Mission Control - Smart Calendar
 * Main Application Logic
 */

// ===== State Management =====
const state = {
    currentDate: new Date(),
    selectedDate: null,
    events: [],
    agentSessions: [],
    currentView: 'calendar'
};

// ===== DOM Elements =====
const elements = {
    calendarGrid: document.getElementById('calendar-grid'),
    monthYear: document.getElementById('month-year'),
    prevMonth: document.getElementById('prev-month'),
    nextMonth: document.getElementById('next-month'),
    btnToday: document.getElementById('btn-today'),
    selectedDate: document.getElementById('selected-date'),
    dayEventsCount: document.getElementById('day-events-count'),
    dayEventsList: document.getElementById('day-events-list'),
    sessionsList: document.getElementById('sessions-list'),
    eventModal: document.getElementById('event-modal'),
    btnNewEvent: document.getElementById('btn-new-event'),
    closeModal: document.getElementById('close-modal'),
    cancelEvent: document.getElementById('cancel-event'),
    eventForm: document.getElementById('event-form'),
    tasksList: document.getElementById('tasks-list'),
    agentsGrid: document.getElementById('agents-grid'),
    navTabs: document.querySelectorAll('.nav-tab'),
    views: document.querySelectorAll('.view')
};

// ===== Calendar Functions =====
function getMonthData(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { year, month, daysInMonth, startingDay };
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getMonthName(month) {
    const names = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return names[month];
}

function getEventsForDate(dateKey) {
    return state.events.filter(e => e.date === dateKey);
}

function renderCalendar() {
    const { year, month, daysInMonth, startingDay } = getMonthData(state.currentDate);
    
    // Update header
    elements.monthYear.textContent = `${getMonthName(month)} ${year}`;
    
    // Clear grid
    elements.calendarGrid.innerHTML = '';
    
    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const day = prevMonthDays - i;
        const dayEl = createDayElement(day, true);
        elements.calendarGrid.appendChild(dayEl);
    }
    
    // Current month days
    const today = new Date();
    const todayKey = formatDateKey(today);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = formatDateKey(date);
        const isToday = dateKey === todayKey;
        const isSelected = state.selectedDate === dateKey;
        const dayEvents = getEventsForDate(dateKey);
        
        const dayEl = createDayElement(day, false, isToday, isSelected, dayEvents, dateKey);
        elements.calendarGrid.appendChild(dayEl);
    }
    
    // Next month padding
    const totalCells = startingDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = createDayElement(day, true);
        elements.calendarGrid.appendChild(dayEl);
    }
}

function createDayElement(day, isOtherMonth, isToday = false, isSelected = false, events = [], dateKey = null) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    if (isOtherMonth) dayEl.classList.add('other-month');
    if (isToday) dayEl.classList.add('today');
    if (isSelected) dayEl.classList.add('selected');
    
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);
    
    if (!isOtherMonth && events.length > 0) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        const displayEvents = events.slice(0, 3);
        displayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `day-event ${event.type}`;
            eventEl.textContent = event.title;
            eventsContainer.appendChild(eventEl);
        });
        
        if (events.length > 3) {
            const moreEl = document.createElement('div');
            moreEl.className = 'day-event-more';
            moreEl.textContent = `+${events.length - 3} more`;
            eventsContainer.appendChild(moreEl);
        }
        
        dayEl.appendChild(eventsContainer);
    }
    
    if (!isOtherMonth && dateKey) {
        dayEl.addEventListener('click', () => selectDate(dateKey));
    }
    
    return dayEl;
}

function selectDate(dateKey) {
    state.selectedDate = dateKey;
    renderCalendar();
    renderDayDetails();
}

function renderDayDetails() {
    if (!state.selectedDate) {
        elements.selectedDate.textContent = 'Select a date';
        elements.dayEventsCount.textContent = '';
        elements.dayEventsList.innerHTML = '<p class="empty-state">Click on a day to view events</p>';
        return;
    }
    
    const date = new Date(state.selectedDate + 'T00:00:00');
    elements.selectedDate.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const events = getEventsForDate(state.selectedDate);
    elements.dayEventsCount.textContent = `${events.length} event${events.length !== 1 ? 's' : ''}`;
    
    if (events.length === 0) {
        elements.dayEventsList.innerHTML = '<p class="empty-state">No events for this day</p>';
    } else {
        elements.dayEventsList.innerHTML = events.map(event => `
            <div class="event-item" data-id="${event.id}">
                <div class="event-item-header">
                    <span class="event-dot ${event.type}"></span>
                    <span class="event-time">${event.time || 'All day'}</span>
                </div>
                <div class="event-title">${event.title}</div>
                ${event.project ? `<div class="event-project">${formatProjectName(event.project)}</div>` : ''}
            </div>
        `).join('');
    }
}

function formatProjectName(project) {
    const names = {
        'respiratory-education': 'Respiratory Education',
        'rt-scheduling': 'RT Scheduling',
        'trading-system': 'Trading System',
        'respiratory-tools': 'Respiratory Tools',
        'reselling': 'Reselling Business',
        'youtube': 'YouTube Empire',
        'kids-app': 'Kids App'
    };
    return names[project] || project;
}

// ===== Agent Sessions =====
function renderAgentSessions() {
    const sessions = [
        { name: 'Research Agent', task: 'Analyzing market data', active: true, emoji: '🔍' },
        { name: 'Code Agent', task: 'Building calendar component', active: true, emoji: '💻' },
        { name: 'Review Agent', task: 'Idle', active: false, emoji: '👁️' },
        { name: 'Scheduler', task: 'Next run in 2h', active: false, emoji: '⏰' }
    ];
    
    elements.sessionsList.innerHTML = sessions.map(session => `
        <div class="session-item ${session.active ? 'active' : ''}">
            <div class="session-avatar">${session.emoji}</div>
            <div class="session-info">
                <div class="session-name">${session.name}</div>
                <div class="session-task">${session.task}</div>
            </div>
            ${session.active ? '<div class="session-status"></div>' : ''}
        </div>
    `).join('');
}

// ===== Tasks View =====
function renderTasks() {
    const tasks = state.events.filter(e => e.type === 'task').sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (tasks.length === 0) {
        elements.tasksList.innerHTML = '<p class="empty-state">No tasks scheduled</p>';
        return;
    }
    
    elements.tasksList.innerHTML = tasks.map(task => `
        <div class="task-item" data-id="${task.id}">
            <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
            <div class="task-content">
                <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                <div class="task-meta">
                    <span>${new Date(task.date).toLocaleDateString()}</span>
                    ${task.project ? `<span class="task-tag">${formatProjectName(task.project)}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers for checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            checkbox.classList.toggle('checked');
            checkbox.nextElementSibling.querySelector('.task-title').classList.toggle('completed');
        });
    });
}

// ===== Agents View =====
function renderAgents() {
    const agents = [
        { name: 'Research Agent', emoji: '🔍', status: 'Active', tasks: 12, uptime: '2h 34m', success: '98%' },
        { name: 'Code Agent', emoji: '💻', status: 'Active', tasks: 8, uptime: '1h 12m', success: '100%' },
        { name: 'Review Agent', emoji: '👁️', status: 'Idle', tasks: 45, uptime: '4h 20m', success: '95%' },
        { name: 'Scheduler', emoji: '⏰', status: 'Scheduled', tasks: 156, uptime: '12h 00m', success: '99%' },
        { name: 'Backup Agent', emoji: '💾', status: 'Idle', tasks: 3, uptime: '30m', success: '100%' },
        { name: 'Notifier', emoji: '🔔', status: 'Active', tasks: 89, uptime: '6h 45m', success: '97%' }
    ];
    
    elements.agentsGrid.innerHTML = agents.map(agent => `
        <div class="agent-card">
            <div class="agent-card-header">
                <div class="agent-card-avatar">${agent.emoji}</div>
                <div class="agent-card-info">
                    <h4>${agent.name}</h4>
                    <span>${agent.status}</span>
                </div>
            </div>
            <div class="agent-card-stats">
                <div class="agent-stat">
                    <div class="agent-stat-value">${agent.tasks}</div>
                    <div class="agent-stat-label">Tasks</div>
                </div>
                <div class="agent-stat">
                    <div class="agent-stat-value">${agent.uptime}</div>
                    <div class="agent-stat-label">Uptime</div>
                </div>
                <div class="agent-stat">
                    <div class="agent-stat-value">${agent.success}</div>
                    <div class="agent-stat-label">Success</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Modal Functions =====
function openModal() {
    elements.eventModal.classList.add('active');
    if (state.selectedDate) {
        document.getElementById('event-date').value = state.selectedDate;
    } else {
        document.getElementById('event-date').value = formatDateKey(new Date());
    }
}

function closeModal() {
    elements.eventModal.classList.remove('active');
    elements.eventForm.reset();
}

function handleEventSubmit(e) {
    e.preventDefault();
    
    const event = {
        id: Date.now().toString(),
        title: document.getElementById('event-title').value,
        date: document.getElementById('event-date').value,
        time: document.getElementById('event-time').value,
        type: document.getElementById('event-type').value,
        description: document.getElementById('event-description').value,
        project: document.getElementById('event-project').value,
        completed: false
    };
    
    state.events.push(event);
    saveEvents();
    
    renderCalendar();
    if (state.selectedDate === event.date) {
        renderDayDetails();
    }
    if (state.currentView === 'tasks') {
        renderTasks();
    }
    
    closeModal();
}

// ===== View Navigation =====
function switchView(viewName) {
    state.currentView = viewName;
    
    elements.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === viewName);
    });
    
    elements.views.forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}-view`);
    });
    
    if (viewName === 'tasks') {
        renderTasks();
    } else if (viewName === 'agents') {
        renderAgents();
    }
}

// ===== Storage =====
function saveEvents() {
    localStorage.setItem('mission-control-events', JSON.stringify(state.events));
}

function loadEvents() {
    const stored = localStorage.getItem('mission-control-events');
    if (stored) {
        state.events = JSON.parse(stored);
    } else {
        // Sample events for demonstration
        const today = new Date();
        const todayKey = formatDateKey(today);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowKey = formatDateKey(tomorrow);
        
        state.events = [
            { id: '1', title: 'Team Standup', date: todayKey, time: '09:00', type: 'meeting', project: 'trading-system', description: 'Daily sync' },
            { id: '2', title: 'Review PRs', date: todayKey, time: '14:00', type: 'task', project: 'respiratory-tools', description: 'Code review' },
            { id: '3', title: 'Deploy Update', date: tomorrowKey, time: '16:00', type: 'deadline', project: 'rt-scheduling', description: 'Production deployment' },
            { id: '4', title: 'Agent Training', date: todayKey, time: '11:00', type: 'agent', project: '', description: 'Model fine-tuning session' }
        ];
        saveEvents();
    }
}

// ===== Event Listeners =====
function initEventListeners() {
    elements.prevMonth.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderCalendar();
    });
    
    elements.nextMonth.addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderCalendar();
    });
    
    elements.btnToday.addEventListener('click', () => {
        state.currentDate = new Date();
        selectDate(formatDateKey(new Date()));
    });
    
    elements.btnNewEvent.addEventListener('click', openModal);
    elements.closeModal.addEventListener('click', closeModal);
    elements.cancelEvent.addEventListener('click', closeModal);
    elements.eventModal.addEventListener('click', (e) => {
        if (e.target === elements.eventModal) closeModal();
    });
    elements.eventForm.addEventListener('submit', handleEventSubmit);
    
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchView(tab.dataset.view));
    });
}

// ===== Initialization =====
function init() {
    loadEvents();
    renderCalendar();
    renderAgentSessions();
    initEventListeners();
    
    // Select today by default
    selectDate(formatDateKey(new Date()));
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
