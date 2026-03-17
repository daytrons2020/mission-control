// Calendar Functions

let currentDate = new Date();

function initCalendar() {
  renderCalendar();
  renderUpcomingEvents();
  renderDueTasks();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Update header
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
  
  // Get calendar days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const container = document.getElementById('calendar-days');
  let html = '';
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month"><div class="day-number">${daysInPrevMonth - i}</div></div>`;
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = isDateToday(year, month, day);
    const events = getEventsForDay(year, month, day);
    
    html += `
      <div class="calendar-day ${isToday ? 'today' : ''}" onclick="showDayDetails(${year}, ${month}, ${day})">
        <div class="day-number">${day}</div>
        <div class="day-events">
          ${events.map(e => `<div class="day-event ${e.type}">${e.title}</div>`).join('')}
        </div>
      </div>
    `;
  }
  
  // Next month days to fill grid
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const remaining = totalCells - (firstDay + daysInMonth);
  for (let day = 1; day <= remaining; day++) {
    html += `<div class="calendar-day other-month"><div class="day-number">${day}</div></div>`;
  }
  
  container.innerHTML = html;
}

function isDateToday(year, month, day) {
  const today = new Date();
  return today.getFullYear() === year && 
         today.getMonth() === month && 
         today.getDate() === day;
}

function getEventsForDay(year, month, day) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const calendar = dashboardData?.calendar || [];
  return calendar.filter(e => e.date === dateStr).slice(0, 3);
}

function renderUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;
  
  const events = [
    { date: '18', month: 'Mar', title: 'Team Standup', time: '9:00 AM' },
    { date: '20', month: 'Mar', title: 'Sprint Review', time: '2:00 PM' },
    { date: '25', month: 'Mar', title: 'Milestone Deadline', time: '5:00 PM' }
  ];
  
  container.innerHTML = events.map(e => `
    <div class="upcoming-event" onclick="showEventDetail('${e.title}')">
      <div class="event-date">
        <span class="day">${e.date}</span>
        <span>${e.month}</span>
      </div>
      <div class="event-info">
        <div class="event-title">${e.title}</div>
        <div class="event-time">${e.time}</div>
      </div>
    </div>
  `).join('');
}

function renderDueTasks() {
  const container = document.getElementById('due-tasks');
  if (!container) return;
  
  const tasks = dashboardData?.tasks?.active?.slice(0, 5) || [];
  
  if (tasks.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 13px;">No tasks due this week</p>';
    return;
  }
  
  container.innerHTML = tasks.map(task => {
    const day = new Date().getDate() + Math.floor(Math.random() * 5);
    return `
      <div class="due-task-item" onclick="openTaskDetail('${task.id}')">
        <div class="task-due">
          <span class="day">${day}</span>
          <span>Mar</span>
        </div>
        <div class="task-info">
          <div class="task-title">${task.name}</div>
          <div class="task-assignee">${task.assignee}</div>
        </div>
      </div>
    `;
  }).join('');
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function goToToday() {
  currentDate = new Date();
  renderCalendar();
}

function showDayDetails(year, month, day) {
  const dateStr = `${monthNames[month]} ${day}, ${year}`;
  const events = getEventsForDay(year, month, day);
  
  document.getElementById('event-modal-title').textContent = dateStr;
  document.getElementById('event-modal-body').innerHTML = events.length > 0 
    ? events.map(e => `<p>• ${e.title} (${e.type})</p>`).join('')
    : '<p>No events for this day</p>';
  
  document.getElementById('event-modal').classList.add('show');
}

function showEventDetail(title) {
  document.getElementById('event-modal-title').textContent = title;
  document.getElementById('event-modal-body').innerHTML = `<p>Event details for: ${title}</p>`;
  document.getElementById('event-modal').classList.add('show');
}

function closeEventModal() {
  document.getElementById('event-modal').classList.remove('show');
}

function showAddEventModal() {
  const title = prompt('Event title:');
  if (title) {
    showToast(`Event "${title}" added!`, 'success');
  }
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Initialize when tab is shown
document.querySelector('[data-tab="calendar"]')?.addEventListener('click', () => {
  setTimeout(initCalendar, 100);
});
