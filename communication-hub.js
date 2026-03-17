/**
 * Communication Hub - Real-time Agent Chat & Task Management
 * 
 * Features:
 * - Chat with any agent directly
 * - See real-time task progress
 * - Ask questions ("how long left?", "status?")
 * - Add/suggest/remove tasks via chat
 * - Broadcast messages to all agents
 */

const EventEmitter = require('events');

class CommunicationHub extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.conversations = new Map();
    this.activeTasks = new Map();
    this.messageHistory = [];
    this.maxHistory = 100;
  }

  /**
   * Register an agent with the hub
   */
  registerAgent(agentId, agentConfig) {
    this.agents.set(agentId, {
      id: agentId,
      name: agentConfig.name,
      emoji: agentConfig.emoji,
      model: agentConfig.model,
      status: 'idle',
      currentTask: null,
      lastSeen: Date.now(),
      messages: []
    });
    
    this.emit('agent:registered', { agentId, ...agentConfig });
  }

  /**
   * Send a message to a specific agent
   */
  async sendMessage(agentId, message, type = 'user') {
    const timestamp = new Date().toISOString();
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      type,
      content: message,
      timestamp,
      sender: type === 'user' ? 'You' : this.agents.get(agentId)?.name || agentId
    };

    // Store in agent's messages
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.messages.push(msg);
      agent.lastSeen = Date.now();
    }

    // Add to global history
    this.messageHistory.push(msg);
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory.shift();
    }

    this.emit('message:received', msg);

    // Auto-respond if it's a user message
    if (type === 'user') {
      const response = await this.generateAgentResponse(agentId, message);
      return response;
    }

    return msg;
  }

  /**
   * Broadcast a message to all agents
   */
  broadcast(message, from = 'system') {
    const promises = Array.from(this.agents.keys()).map(agentId => 
      this.sendMessage(agentId, message, from === 'user' ? 'user' : 'broadcast')
    );
    
    this.emit('message:broadcast', { message, from, recipients: this.agents.size });
    return Promise.all(promises);
  }

  /**
   * Generate agent response based on message intent
   */
  async generateAgentResponse(agentId, userMessage) {
    const agent = this.agents.get(agentId);
    if (!agent) return null;

    const intent = this.parseIntent(userMessage);
    const context = this.getAgentContext(agentId);

    let response;
    switch (intent.type) {
      case 'status':
        response = this.generateStatusResponse(agent, context);
        break;
      case 'timeline':
        response = this.generateTimelineResponse(agent, context);
        break;
      case 'add_task':
        response = await this.handleAddTask(agent, intent.data);
        break;
      case 'remove_task':
        response = await this.handleRemoveTask(agent, intent.data);
        break;
      case 'suggestion':
        response = this.handleSuggestion(agent, intent.data);
        break;
      case 'help':
        response = this.generateHelpResponse(agent);
        break;
      default:
        response = this.generateGeneralResponse(agent, userMessage, context);
    }

    const responseMsg = {
      id: `msg_${Date.now()}_response`,
      agentId,
      type: 'agent',
      content: response,
      timestamp: new Date().toISOString(),
      sender: agent.name,
      emoji: agent.emoji,
      intent: intent.type
    };

    agent.messages.push(responseMsg);
    this.messageHistory.push(responseMsg);
    this.emit('message:response', responseMsg);

    return responseMsg;
  }

  /**
   * Parse user message intent
   */
  parseIntent(message) {
    const lower = message.toLowerCase();
    
    // Status queries
    if (/status|progress|how.*doing|what.*working/i.test(lower)) {
      return { type: 'status', data: null };
    }
    
    // Timeline queries
    if (/how long|time left|eta|when.*done|deadline|remaining/i.test(lower)) {
      return { type: 'timeline', data: null };
    }
    
    // Add task
    const addMatch = lower.match(/add task[,:]?\s*(.+)|create task[,:]?\s*(.+)|new task[,:]?\s*(.+)/i);
    if (addMatch) {
      const taskName = addMatch[1] || addMatch[2] || addMatch[3];
      return { type: 'add_task', data: { taskName: taskName.trim() } };
    }
    
    // Remove task
    const removeMatch = lower.match(/remove task[,:]?\s*(.+)|delete task[,:]?\s*(.+)|cancel task[,:]?\s*(.+)/i);
    if (removeMatch) {
      const taskName = removeMatch[1] || removeMatch[2] || removeMatch[3];
      return { type: 'remove_task', data: { taskName: taskName.trim() };
    }
    
    // Suggestion
    if (/suggest|recommend|what about|how about|maybe|consider/i.test(lower)) {
      return { type: 'suggestion', data: { suggestion: message } };
    }
    
    // Help
    if (/help|commands|what can.*do|options/i.test(lower)) {
      return { type: 'help', data: null };
    }
    
    return { type: 'general', data: { message } };
  }

  /**
   * Get agent's current context
   */
  getAgentContext(agentId) {
    const agent = this.agents.get(agentId);
    const tasks = Array.from(this.activeTasks.values())
      .filter(t => t.assignedTo === agentId);
    
    return {
      agent,
      activeTasks: tasks,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length
    };
  }

  /**
   * Generate status response
   */
  generateStatusResponse(agent, context) {
    const { activeTasks, completedTasks, inProgressTasks, pendingTasks } = context;
    
    if (inProgressTasks === 0 && pendingTasks === 0) {
      return `${agent.emoji} I'm currently idle and ready for new tasks! I've completed ${completedTasks} tasks so far.`;
    }
    
    const currentTask = activeTasks.find(t => t.status === 'in_progress');
    let response = `${agent.emoji} **Current Status:**\n`;
    
    if (currentTask) {
      response += `📝 Working on: "${currentTask.name}" (${currentTask.progress}%)\n`;
    }
    
    response += `📊 Tasks: ${inProgressTasks} in progress, ${pendingTasks} pending, ${completedTasks} completed`;
    
    return response;
  }

  /**
   * Generate timeline response
   */
  generateTimelineResponse(agent, context) {
    const { activeTasks, inProgressTasks } = context;
    
    if (inProgressTasks === 0) {
      return `${agent.emoji} I'm not working on any active tasks right now. Ready to start when you are!`;
    }
    
    const currentTask = activeTasks.find(t => t.status === 'in_progress');
    if (!currentTask) {
      return `${agent.emoji} No active tasks with timeline estimates.`;
    }
    
    const remaining = 100 - currentTask.progress;
    const estimatedMinutes = Math.ceil((remaining / currentTask.progress) * currentTask.timeSpent);
    
    return `${agent.emoji} **Timeline for "${currentTask.name}":**\n` +
           `⏱️ Progress: ${currentTask.progress}% complete\n` +
           `🕐 Time spent: ${this.formatDuration(currentTask.timeSpent)}\n` +
           `📅 Estimated remaining: ~${this.formatDuration(estimatedMinutes)}\n` +
           `✅ Expected completion: ${this.getETA(estimatedMinutes)}`;
  }

  /**
   * Handle add task
   */
  async handleAddTask(agent, data) {
    const taskId = `task_${Date.now()}`;
    const task = {
      id: taskId,
      name: data.taskName,
      assignedTo: agent.id,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      timeSpent: 0
    };
    
    this.activeTasks.set(taskId, task);
    agent.status = 'busy';
    
    this.emit('task:added', { task, agent });
    
    return `${agent.emoji} **Task Added!** ✅\n` +
           `📝 "${data.taskName}"\n` +
           `👤 Assigned to: ${agent.name}\n` +
           `🆔 Task ID: ${taskId}\n\n` +
           `I'll start working on this shortly. You can check status anytime by asking "status?"`;
  }

  /**
   * Handle remove task
   */
  async handleRemoveTask(agent, data) {
    // Find matching task
    const tasks = Array.from(this.activeTasks.values())
      .filter(t => t.assignedTo === agent.id && 
        (t.name.toLowerCase().includes(data.taskName.toLowerCase()) || t.id === data.taskName));
    
    if (tasks.length === 0) {
      return `${agent.emoji} I couldn't find a task matching "${data.taskName}". Use "status" to see my current tasks.`;
    }
    
    const task = tasks[0];
    this.activeTasks.delete(task.id);
    
    this.emit('task:removed', { task, agent });
    
    return `${agent.emoji} **Task Removed** 🗑️\n` +
           `📝 "${task.name}" has been removed from my queue.`;
  }

  /**
   * Handle suggestion
   */
  handleSuggestion(agent, data) {
    this.emit('suggestion:received', { agent, suggestion: data.suggestion });
    
    return `${agent.emoji} **Suggestion Noted** 💡\n` +
           `I'll consider your suggestion: "${data.suggestion}"\n\n` +
           `Would you like me to:\n` +
           `• Add this as a task?\n` +
           `• Discuss with other agents?\n` +
           `• Research this further?`;
  }

  /**
   * Generate help response
   */
  generateHelpResponse(agent) {
    return `${agent.emoji} **How to communicate with me:**\n\n` +
           `📊 **Status Queries:**\n` +
           `• "status" or "progress" - See what I'm working on\n` +
           `• "how long left?" or "eta" - Get timeline estimates\n\n` +
           `📝 **Task Management:**\n` +
           `• "add task: [name]" - Create new task\n` +
           `• "remove task: [name]" - Delete a task\n\n` +
           `💡 **Suggestions:**\n` +
           `• "suggest: [idea]" or "what about..." - Share ideas\n\n` +
           `📢 **Broadcast:**\n` +
           `• "@all [message]" - Message all agents`;
  }

  /**
   * Generate general response
   */
  generateGeneralResponse(agent, message, context) {
    // Simple acknowledgment with personality
    const responses = [
      `${agent.emoji} Got it! I'm ${agent.status === 'idle' ? 'ready to help' : 'on it'}.`,
      `${agent.emoji} Message received. Anything specific you'd like me to work on?`,
      `${agent.emoji} Thanks for the update! Current status: ${context.inProgressTasks} tasks in progress.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Update task progress
   */
  updateTaskProgress(taskId, progress, status = null) {
    const task = this.activeTasks.get(taskId);
    if (!task) return false;
    
    task.progress = Math.min(100, Math.max(0, progress));
    if (status) task.status = status;
    task.lastUpdated = Date.now();
    
    this.emit('task:progress', { task, progress });
    
    // Notify if completed
    if (progress === 100) {
      task.status = 'completed';
      task.completedAt = Date.now();
      const agent = this.agents.get(task.assignedTo);
      this.emit('task:completed', { task, agent });
    }
    
    return true;
  }

  /**
   * Get all conversations
   */
  getConversations() {
    return Array.from(this.agents.values()).map(agent => ({
      agentId: agent.id,
      agentName: agent.name,
      emoji: agent.emoji,
      status: agent.status,
      currentTask: agent.currentTask,
      lastMessage: agent.messages[agent.messages.length - 1] || null,
      unreadCount: agent.messages.filter(m => m.type === 'agent' && !m.read).length
    }));
  }

  /**
   * Get messages for an agent
   */
  getMessages(agentId, limit = 50) {
    const agent = this.agents.get(agentId);
    if (!agent) return [];
    return agent.messages.slice(-limit);
  }

  /**
   * Get active tasks
   */
  getActiveTasks() {
    return Array.from(this.activeTasks.values())
      .sort((a, b) => b.lastUpdated - a.lastUpdated);
  }

  /**
   * Format duration
   */
  formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  /**
   * Get ETA
   */
  getETA(minutesFromNow) {
    const eta = new Date(Date.now() + minutesFromNow * 60000);
    return eta.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
}

module.exports = CommunicationHub;

// Demo/test
if (require.main === module) {
  const hub = new CommunicationHub();
  
  // Register agents
  hub.registerAgent('mlx', { name: 'MLX (Local)', emoji: '🍎', model: 'deepseek-14b' });
  hub.registerAgent('kimi-code', { name: 'Kimi-Code', emoji: '💻', model: 'kimi-code-v1' });
  
  // Listen to events
  hub.on('message:response', (msg) => {
    console.log(`\n${msg.emoji} ${msg.sender}: ${msg.content}\n`);
  });
  
  // Demo conversation
  async function demo() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║           Communication Hub Demo                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    await hub.sendMessage('mlx', 'status');
    await hub.sendMessage('mlx', 'add task: Optimize database queries');
    await hub.sendMessage('mlx', 'how long left?');
    await hub.sendMessage('kimi-code', 'status');
  }
  
  demo();
}
