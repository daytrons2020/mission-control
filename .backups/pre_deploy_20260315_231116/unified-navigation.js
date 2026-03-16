// Unified Navigation System for Mission Control + Binary Command Center
// This script adds cross-linking between both dashboards

class UnifiedNavigation {
  constructor() {
    this.missionControlUrl = 'https://mission-control-o52l.vercel.app/dashboard.html';
    this.binaryCommandUrl = 'https://frontend-wheat-five-e0jlij8zl2.vercel.app/';
    this.currentLocation = window.location.href;
    this.init();
  }

  init() {
    this.addNavigationBar();
    this.addQuickSwitchPanel();
    this.syncNotifications();
  }

  // Add unified navigation bar to both dashboards
  addNavigationBar() {
    const isMissionControl = this.currentLocation.includes('mission-control');
    const isBinaryCommand = this.currentLocation.includes('frontend-wheat');

    if (!isMissionControl && !isBinaryCommand) return;

    const navBar = document.createElement('div');
    navBar.className = 'unified-nav-bar';
    navBar.innerHTML = `
      <div class="nav-container">
        <div class="nav-brand">
          <span class="nav-logo">🎯</span>
          <span class="nav-title">Dayton's Command Suite</span>
        </div>
        <div class="nav-links">
          <a href="${this.missionControlUrl}" class="nav-link ${isMissionControl ? 'active' : ''}">
            <span class="nav-icon">🎛️</span>
            Mission Control
          </a>
          <a href="${this.binaryCommandUrl}" class="nav-link ${isBinaryCommand ? 'active' : ''}">
            <span class="nav-icon">📈</span>
            Binary Command
          </a>
        </div>
        <div class="nav-status">
          <span class="status-indicator online"></span>
          <span class="status-text">Systems Online</span>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .unified-nav-bar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(15, 15, 20, 0.95);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 10000;
        font-family: 'Inter', sans-serif;
      }
      .nav-container {
        max-width: 1400px;
        margin: 0 auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 24px;
      }
      .nav-brand {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .nav-logo {
        font-size: 24px;
      }
      .nav-title {
        font-weight: 600;
        font-size: 16px;
        color: #fff;
      }
      .nav-links {
        display: flex;
        gap: 8px;
      }
      .nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s;
      }
      .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      .nav-link.active {
        background: rgba(139, 92, 246, 0.2);
        color: #8b5cf6;
        border: 1px solid rgba(139, 92, 246, 0.3);
      }
      .nav-icon {
        font-size: 16px;
      }
      .nav-status {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulse 2s infinite;
      }
      .status-indicator.warning {
        background: #f59e0b;
        box-shadow: 0 0 8px #f59e0b;
      }
      .status-indicator.error {
        background: #ef4444;
        box-shadow: 0 0 8px #ef4444;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .status-text {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
      }
      body {
        padding-top: 60px !important;
      }
    `;

    document.head.appendChild(styles);
    document.body.insertBefore(navBar, document.body.firstChild);
  }

  // Add quick switch panel for fast navigation
  addQuickSwitchPanel() {
    const panel = document.createElement('div');
    panel.className = 'quick-switch-panel';
    panel.innerHTML = `
      <button class="quick-switch-btn" onclick="unifiedNav.toggleQuickMenu()">
        <span>⚡</span>
      </button>
      <div class="quick-menu" id="quick-menu">
        <div class="quick-menu-header">Quick Actions</div>
        <a href="${this.missionControlUrl}" class="quick-item">
          <span class="quick-icon">🎛️</span>
          <div class="quick-info">
            <div class="quick-title">Mission Control</div>
            <div class="quick-desc">Agents, tasks, system</div>
          </div>
        </a>
        <a href="${this.binaryCommandUrl}" class="quick-item">
          <span class="quick-icon">📈</span>
          <div class="quick-info">
            <div class="quick-title">Binary Command</div>
            <div class="quick-desc">Trading, patterns, GEX</div>
          </div>
        </a>
        <div class="quick-divider"></div>
        <div class="quick-item" onclick="unifiedNav.spawnQuickAgent()">
          <span class="quick-icon">🤖</span>
          <div class="quick-info">
            <div class="quick-title">Spawn Agent</div>
            <div class="quick-desc">Quick agent deployment</div>
          </div>
        </div>
        <div class="quick-item" onclick="unifiedNav.showCostStatus()">
          <span class="quick-icon">💰</span>
          <div class="quick-info">
            <div class="quick-title">Cost Status</div>
            <div class="quick-desc">Daily usage: $2.45</div>
          </div>
        </div>
      </div>
    `;

    const styles = document.createElement('style');
    styles.textContent = `
      .quick-switch-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10001;
      }
      .quick-switch-btn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .quick-switch-btn:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 30px rgba(139, 92, 246, 0.6);
      }
      .quick-menu {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 280px;
        background: rgba(15, 15, 20, 0.98);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 16px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(10px);
        transition: all 0.3s;
      }
      .quick-menu.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      .quick-menu-header {
        font-size: 12px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .quick-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
        color: inherit;
      }
      .quick-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      .quick-icon {
        font-size: 20px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
      }
      .quick-info {
        flex: 1;
      }
      .quick-title {
        font-weight: 500;
        font-size: 14px;
        color: #fff;
      }
      .quick-desc {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 2px;
      }
      .quick-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 12px 0;
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(panel);
  }

  toggleQuickMenu() {
    const menu = document.getElementById('quick-menu');
    menu.classList.toggle('active');
  }

  spawnQuickAgent() {
    // Quick agent spawn dialog
    const type = prompt('Agent type (coder, researcher, etc.):');
    if (type) {
      alert(`Spawning ${type} agent... (connect to API)`);
      // In production: window.missionControl.spawnAgent(type, 'Quick task');
    }
  }

  showCostStatus() {
    alert('Daily Cost: $2.45 / $10.00 (24.5%)');
  }

  // Sync notifications between both dashboards
  syncNotifications() {
    // Check for notifications from other dashboard
    const notifications = JSON.parse(localStorage.getItem('mc-notifications') || '[]');
    
    notifications.forEach(notif => {
      if (!notif.seen) {
        this.showNotification(notif.message, notif.type);
        notif.seen = true;
      }
    });

    localStorage.setItem('mc-notifications', JSON.stringify(notifications));
  }

  showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `unified-notification ${type}`;
    notif.innerHTML = `
      <span class="notif-message">${message}</span>
      <button onclick="this.parentElement.remove()">×</button>
    `;
    
    const container = document.getElementById('notification-container') || document.body;
    container.appendChild(notif);
    
    setTimeout(() => notif.remove(), 5000);
  }
}

// Initialize
const unifiedNav = new UnifiedNavigation();
