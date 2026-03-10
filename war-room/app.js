/**
 * War Room - Mission Control Interface
 * JavaScript for interactive functionality
 */

// DOM Elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesArea = document.getElementById('messagesArea');
const typingIndicator = document.getElementById('typingIndicator');
const historyList = document.getElementById('historyList');

// State
let isTyping = false;
let messageHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    focusInput();
    scrollToBottom();
});

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', autoResize);
    
    // History item clicks
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

/**
 * Auto-resize textarea based on content
 */
function autoResize() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

/**
 * Focus the message input
 */
function focusInput() {
    messageInput.focus();
}

/**
 * Send a message
 */
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    
    // Add user message
    addMessage({
        type: 'user',
        author: 'You',
        text: text,
        time: getCurrentTime()
    });
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Simulate agent response (replace with actual agent integration)
    setTimeout(() => {
        hideTypingIndicator();
        addMessage({
            type: 'agent',
            author: 'Nano',
            text: `Received: "${text}"\n\nI'm processing your command. This is a placeholder response - integrate with your agent system for real responses.`,
            time: getCurrentTime()
        });
    }, 1500);
}

/**
 * Add a message to the chat
 */
function addMessage({ type, author, text, time }) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}-message`;
    
    const avatarIcon = getAvatarIcon(type);
    const badge = type === 'agent' ? '<span class="badge agent-badge">Agent</span>' : '';
    
    messageEl.innerHTML = `
        <div class="message-avatar">
            <span class="avatar-icon">${avatarIcon}</span>
        </div>
        <div class="message-content glass-panel">
            <div class="message-header">
                <span class="message-author">${author}</span>
                ${badge}
                <span class="message-time">${time}</span>
            </div>
            <div class="message-body">
                ${formatMessageText(text)}
            </div>
        </div>
    `;
    
    messagesArea.appendChild(messageEl);
    scrollToBottom();
    
    // Store in history
    messageHistory.push({ type, author, text, time });
}

/**
 * Format message text (handle newlines, etc.)
 */
function formatMessageText(text) {
    return text.split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join('');
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get avatar icon based on message type
 */
function getAvatarIcon(type) {
    switch (type) {
        case 'user': return '👤';
        case 'agent': return '🤖';
        case 'system': return '🎯';
        default: return '💬';
    }
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    typingIndicator.classList.add('hidden');
}

/**
 * Scroll messages to bottom
 */
function scrollToBottom() {
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

/**
 * Get current time formatted
 */
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
    });
}

/**
 * Add system message
 */
function addSystemMessage(text) {
    addMessage({
        type: 'system',
        author: 'System',
        text: text,
        time: getCurrentTime()
    });
}

/**
 * Add agent message
 */
function addAgentMessage(agentName, text) {
    addMessage({
        type: 'agent',
        author: agentName,
        text: text,
        time: getCurrentTime()
    });
}

/**
 * Update connection status
 */
function updateConnectionStatus(status, text) {
    const connIcon = document.querySelector('.conn-icon');
    const connText = document.querySelector('.conn-text');
    
    if (connIcon && connText) {
        connIcon.textContent = status === 'connected' ? '🟢' : status === 'warning' ? '🟡' : '🔴';
        connText.textContent = text;
    }
}

/**
 * Update real-time indicator
 */
function updateRealTimeIndicator(active) {
    const badge = document.querySelector('.real-time-badge');
    if (badge) {
        badge.style.opacity = active ? '1' : '0.5';
    }
}

/**
 * Add activity to feed
 */
function addActivity(text) {
    const activityFeed = document.querySelector('.activity-feed');
    if (activityFeed) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <span class="activity-time">${getCurrentTime()}</span>
            <span class="activity-text">${escapeHtml(text)}</span>
        `;
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        
        // Keep only last 10 activities
        while (activityFeed.children.length > 10) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }
}

/**
 * Update agent status
 */
function updateAgentStatus(agentName, status) {
    const agentItems = document.querySelectorAll('.agent-item');
    agentItems.forEach(item => {
        const nameEl = item.querySelector('.agent-name');
        if (nameEl && nameEl.textContent === agentName) {
            item.className = `agent-item ${status}`;
            const statusEl = item.querySelector('.agent-status');
            if (statusEl) {
                statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            }
        }
    });
}

// Export functions for external use
window.WarRoom = {
    addMessage,
    addSystemMessage,
    addAgentMessage,
    updateConnectionStatus,
    updateRealTimeIndicator,
    addActivity,
    updateAgentStatus,
    scrollToBottom
};