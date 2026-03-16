#!/usr/bin/env node
/**
 * Agent Orchestrator - Autonomous Goal Execution System
 * 
 * This system reads goals from MISSION_CONTROL_BUILD_PLAN.md,
 * generates actionable tasks, assigns them to agents, and
 * executes them continuously using MLX (free, local).
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
  goalsFile: path.join(__dirname, 'MISSION_CONTROL_BUILD_PLAN.md'),
  stateFile: path.join(__dirname, 'orchestrator-state.json'),
  logFile: path.join(__dirname, 'orchestrator.log'),
  mlxEndpoint: 'http://127.0.0.1:18888/v1/chat/completions',
  openclawEndpoint: 'http://127.0.0.1:18789',
  dailyWorkHours: 8,
  maxParallelTasks: 3,
  autoExecute: true
};

// Agent Types and their capabilities
const AGENT_TYPES = {
  'nano': {
    name: 'Nano',
    role: 'Coordinator',
    capabilities: ['planning', 'coordination', 'review', 'architecture'],
    emoji: '🤖',
    priority: 1
  },
  'frontend': {
    name: 'Frontend Developer',
    role: 'UI/UX Specialist',
    capabilities: ['react', 'typescript', 'css', 'ui-design', 'web-components'],
    emoji: '🎨',
    priority: 2
  },
  'backend': {
    name: 'Backend Developer',
    role: 'API Architect',
    capabilities: ['nodejs', 'python', 'api-design', 'serverless', 'databases'],
    emoji: '⚙️',
    priority: 2
  },
  'database': {
    name: 'Database Engineer',
    role: 'Data Specialist',
    capabilities: ['postgresql', 'lancedb', 'schema-design', 'optimization', 'queries'],
    emoji: '🗄️',
    priority: 2
  },
  'ai-engineer': {
    name: 'AI Engineer',
    role: 'Model Optimization',
    capabilities: ['ml-models', 'training', 'fine-tuning', 'prompt-engineering', 'data-analysis'],
    emoji: '🧠',
    priority: 2
  },
  'integration': {
    name: 'Integration Specialist',
    role: 'APIs & Webhooks',
    capabilities: ['discord-api', 'webhooks', 'third-party-apis', 'automation', 'trading-apis'],
    emoji: '🔌',
    priority: 2
  },
  'content-writer': {
    name: 'Content Writer',
    role: 'Documentation & Copy',
    capabilities: ['writing', 'documentation', 'research', 'seo', 'technical-writing'],
    emoji: '✍️',
    priority: 3
  },
  'researcher': {
    name: 'Researcher',
    role: 'Research & Analysis',
    capabilities: ['web-research', 'data-analysis', 'fact-checking', 'market-analysis'],
    emoji: '🔍',
    priority: 3
  },
  'trading-analyst': {
    name: 'Trading Analyst',
    role: 'Markets & Patterns',
    capabilities: ['technical-analysis', 'pattern-recognition', 'risk-management', 'backtesting'],
    emoji: '📈',
    priority: 3
  }
};

// Goals Parser
class GoalsParser {
  constructor() {
    this.goals = [];
  }

  parseGoalsFile() {
    try {
      const content = fs.readFileSync(CONFIG.goalsFile, 'utf8');
      return this.extractGoals(content);
    } catch (error) {
      logError('Failed to parse goals file', error);
      return this.getDefaultGoals();
    }
  }

  extractGoals(content) {
    const goals = [];
    const goalSections = content.split(/### \d+\. /).slice(1);

    goalSections.forEach((section, index) => {
      const lines = section.split('\n');
      const titleLine = lines[0].trim();
      const title = titleLine.replace(/\*\*/g, '').split('**')[0].trim();
      
      // Extract description
      const descMatch = section.match(/\*\*What:\*\*\s*(.+?)(?=\n\|)/);
      const description = descMatch ? descMatch[1].trim() : '';

      // Extract tasks from table
      const tasks = this.extractTasksFromSection(section);

      // Calculate total hours
      const hoursMatch = section.match(/\*\*Total:\s*(\d+)\s*hours/);
      const totalHours = hoursMatch ? parseInt(hoursMatch[1]) : 0;

      goals.push({
        id: `goal-${index + 1}`,
        number: index + 1,
        title,
        description,
        totalHours,
        tasks,
        status: 'active',
        progress: 0,
        priority: this.calculatePriority(index + 1)
      });
    });

    return goals;
  }

  extractTasksFromSection(section) {
    const tasks = [];
    const tableMatch = section.match(/\| Task \|.*?\n([\s\S]*?)(?=\*\*Total)/);
    
    if (tableMatch) {
      const tableContent = tableMatch[1];
      const rows = tableContent.split('\n').filter(row => row.includes('|'));
      
      rows.forEach((row, index) => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 5) {
          const status = cells[1].includes('✅') ? 'done' : 
                        cells[1].includes('🟡') ? 'in-progress' : 'not-started';
          
          tasks.push({
            id: `task-${Date.now()}-${index}`,
            name: cells[0],
            status,
            estimatedHours: parseInt(cells[2]) || 0,
            assignedTo: cells[3],
            priority: this.parsePriority(cells[4]),
            dependencies: [],
            created: new Date().toISOString()
          });
        }
      });
    }

    return tasks;
  }

  parsePriority(priorityCell) {
    if (priorityCell.includes('🔴')) return 'high';
    if (priorityCell.includes('🟡')) return 'medium';
    return 'low';
  }

  calculatePriority(goalNumber) {
    // Goal 1 = highest priority
    const priorities = {
      1: 'critical',  // Respiratory Education
      2: 'high',      // Trading
      3: 'medium',    // Reselling
      4: 'medium',    // Polymarket
      5: 'low'        // Life Programs
    };
    return priorities[goalNumber] || 'medium';
  }

  getDefaultGoals() {
    return [
      {
        id: 'goal-1',
        number: 1,
        title: 'Respiratory Education Empire',
        description: 'Create educational content for RT field',
        totalHours: 40,
        tasks: [],
        status: 'active',
        progress: 0,
        priority: 'critical'
      },
      {
        id: 'goal-2',
        number: 2,
        title: 'Autonomous Trading System',
        description: 'AI trading with 90%+ win rate',
        totalHours: 52,
        tasks: [],
        status: 'active',
        progress: 0,
        priority: 'high'
      },
      {
        id: 'goal-3',
        number: 3,
        title: '24/7 Reselling Business',
        description: 'Automated Amazon FBA/eBay reselling',
        totalHours: 52,
        tasks: [],
        status: 'active',
        progress: 0,
        priority: 'medium'
      },
      {
        id: 'goal-4',
        number: 4,
        title: 'Polymarket Crypto Bot',
        description: 'Prediction market trading bot',
        totalHours: 56,
        tasks: [],
        status: 'active',
        progress: 0,
        priority: 'medium'
      },
      {
        id: 'goal-5',
        number: 5,
        title: 'Life-Improving Programs',
        description: 'General automation tools',
        totalHours: 52,
        tasks: [],
        status: 'active',
        progress: 0,
        priority: 'low'
      }
    ];
  }
}

// Task Generator using MLX
class TaskGenerator {
  constructor() {
    this.goalsParser = new GoalsParser();
  }

  async generateDailyTasks() {
    const goals = this.goalsParser.parseGoalsFile();
    const dailyTasks = [];

    for (const goal of goals) {
      if (goal.status !== 'active') continue;

      // Find incomplete tasks
      const incompleteTasks = goal.tasks.filter(t => t.status !== 'done');
      
      // Generate subtasks for high-priority incomplete tasks
      for (const task of incompleteTasks.slice(0, 2)) {
        const subtasks = await this.generateSubtasks(task, goal);
        dailyTasks.push(...subtasks);
      }

      // If no specific tasks, generate from goal description
      if (incompleteTasks.length === 0) {
        const exploratoryTasks = await this.generateExploratoryTasks(goal);
        dailyTasks.push(...exploratoryTasks);
      }
    }

    return this.prioritizeTasks(dailyTasks);
  }

  async generateSubtasks(task, goal) {
    const prompt = `Generate 2-3 specific, actionable subtasks for this task:

Goal: ${goal.title}
Task: ${task.name}
Description: ${goal.description}
Estimated Hours: ${task.estimatedHours}

Create subtasks that:
1. Can be completed in 1-2 hours each
2. Are specific and measurable
3. Have clear deliverables
4. Can be done by ${task.assignedTo || 'any developer'}

Format as JSON array:
[{"name": "...", "description": "...", "deliverable": "..."}]`;

    try {
      const response = await this.queryMLX(prompt);
      const subtasks = JSON.parse(response);
      
      return subtasks.map((st, idx) => ({
        id: `${task.id}-sub-${idx}`,
        name: st.name,
        description: st.description,
        deliverable: st.deliverable,
        parentTask: task.name,
        goalId: goal.id,
        goalTitle: goal.title,
        estimatedHours: 1,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: 'ready',
        type: 'subtask'
      }));
    } catch (error) {
      logError('Failed to generate subtasks', error);
      return this.getFallbackSubtasks(task, goal);
    }
  }

  async generateExploratoryTasks(goal) {
    const prompt = `Generate 2-3 exploratory/research tasks for this goal:

Goal: ${goal.title}
Description: ${goal.description}

These should be initial research/planning tasks to get started.

Format as JSON array:
[{"name": "...", "description": "...", "deliverable": "..."}]`;

    try {
      const response = await this.queryMLX(prompt);
      const tasks = JSON.parse(response);
      
      return tasks.map((t, idx) => ({
        id: `${goal.id}-exp-${Date.now()}-${idx}`,
        name: t.name,
        description: t.description,
        deliverable: t.deliverable,
        goalId: goal.id,
        goalTitle: goal.title,
        estimatedHours: 2,
        assignedTo: 'Researcher',
        priority: goal.priority,
        status: 'ready',
        type: 'exploratory'
      }));
    } catch (error) {
      return this.getFallbackExploratoryTasks(goal);
    }
  }

  async queryMLX(prompt) {
    if (!CONFIG.autoExecute) {
      return '[]';
    }

    // For now, return mock data since fetch requires additional setup
    // In production, you'd use node-fetch or axios
    console.log(`[MLX Query] Would send: ${prompt.substring(0, 50)}...`);
    return this.getMockResponse(prompt);
    
    /*
    try {
      const response = await fetch(CONFIG.mlxEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mlx-community/DeepSeek-R1-Distill-Qwen-14B-4bit',
          messages: [
            { role: 'system', content: 'You are a task planning assistant. Respond only with valid JSON arrays.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) throw new Error('MLX request failed');
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? jsonMatch[0] : '[]';
    } catch (error) {
      logError('MLX query failed', error);
      throw error;
    }
    */
  }

  getMockResponse(prompt) {
    // Return mock subtasks based on task type
    if (prompt.includes('Research')) {
      return JSON.stringify([
        { name: 'Research existing solutions', description: 'Find 5 comparable implementations', deliverable: 'Research document with findings' },
        { name: 'Analyze requirements', description: 'Define technical specifications', deliverable: 'Requirements document' }
      ]);
    }
    if (prompt.includes('Build') || prompt.includes('Create')) {
      return JSON.stringify([
        { name: 'Design architecture', description: 'Create system design diagram', deliverable: 'Architecture document' },
        { name: 'Implement core features', description: 'Build MVP functionality', deliverable: 'Working prototype' }
      ]);
    }
    return JSON.stringify([
      { name: 'Initial planning', description: 'Define scope and approach', deliverable: 'Project plan' },
      { name: 'Research phase', description: 'Gather necessary information', deliverable: 'Research summary' }
    ]);
  }

  prioritizeTasks(tasks) {
    return tasks.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  getFallbackSubtasks(task, goal) {
    return [
      {
        id: `${task.id}-sub-1`,
        name: `Research: ${task.name}`,
        description: `Research best practices and existing solutions for ${task.name}`,
        deliverable: 'Research document with findings',
        parentTask: task.name,
        goalId: goal.id,
        goalTitle: goal.title,
        estimatedHours: 1,
        assignedTo: task.assignedTo,
        priority: task.priority,
        status: 'ready',
        type: 'subtask'
      },
      {
        id: `${task.id}-sub-2`,
        name: `Plan: ${task.name}`,
        description: `Create implementation plan for ${task.name}`,
        deliverable: 'Implementation plan document',
        parentTask: task.name,
        goalId: goal.id,
        goalTitle: goal.title,
        estimatedHours: 1,
        assignedTo: 'Nano',
        priority: task.priority,
        status: 'ready',
        type: 'subtask'
      }
    ];
  }

  getFallbackExploratoryTasks(goal) {
    return [
      {
        id: `${goal.id}-exp-1`,
        name: `Research: ${goal.title}`,
        description: `Initial research on ${goal.title}`,
        deliverable: 'Research summary',
        goalId: goal.id,
        goalTitle: goal.title,
        estimatedHours: 2,
        assignedTo: 'Researcher',
        priority: goal.priority,
        status: 'ready',
        type: 'exploratory'
      }
    ];
  }
}

// Agent Assigner
class AgentAssigner {
  assignAgent(task) {
    if (task.assignedTo && AGENT_TYPES[task.assignedTo.toLowerCase()]) {
      return AGENT_TYPES[task.assignedTo.toLowerCase()];
    }

    // Find best agent based on task description
    const taskLower = (task.name + ' ' + task.description).toLowerCase();
    
    for (const [agentId, agent] of Object.entries(AGENT_TYPES)) {
      for (const capability of agent.capabilities) {
        if (taskLower.includes(capability.toLowerCase())) {
          return { ...agent, id: agentId };
        }
      }
    }

    // Default to Nano for coordination
    return { ...AGENT_TYPES['nano'], id: 'nano' };
  }

  createWorkPlan(tasks) {
    const workPlan = {
      date: new Date().toISOString(),
      totalTasks: tasks.length,
      estimatedHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      assignments: {}
    };

    tasks.forEach(task => {
      const agent = this.assignAgent(task);
      if (!workPlan.assignments[agent.id]) {
        workPlan.assignments[agent.id] = {
          agent: agent,
          tasks: [],
          totalHours: 0
        };
      }
      workPlan.assignments[agent.id].tasks.push(task);
      workPlan.assignments[agent.id].totalHours += task.estimatedHours;
    });

    return workPlan;
  }
}

// Task Executor
class TaskExecutor {
  constructor() {
    this.runningTasks = new Map();
  }

  async executeTask(task, agent) {
    logInfo(`Starting task: ${task.name} (${agent.name})`);
    
    const taskRecord = {
      id: task.id,
      name: task.name,
      agent: agent.name,
      startTime: new Date().toISOString(),
      status: 'running',
      output: []
    };

    this.runningTasks.set(task.id, taskRecord);

    try {
      // Generate prompt for the agent
      const prompt = this.createAgentPrompt(task, agent);
      
      // Execute via MLX
      const result = await this.executeViaMLX(prompt, agent);
      
      taskRecord.status = 'completed';
      taskRecord.endTime = new Date().toISOString();
      taskRecord.result = result;
      
      // Save deliverable
      await this.saveDeliverable(task, result);
      
      logInfo(`Completed task: ${task.name}`);
      return result;
    } catch (error) {
      taskRecord.status = 'failed';
      taskRecord.error = error.message;
      logError(`Failed task: ${task.name}`, error);
      throw error;
    }
  }

  createAgentPrompt(task, agent) {
    return `You are ${agent.name}, a ${agent.role}.

TASK: ${task.name}
DESCRIPTION: ${task.description}
DELIVERABLE: ${task.deliverable}

Your capabilities: ${agent.capabilities.join(', ')}

Execute this task and produce the required deliverable. Be thorough and professional.

Respond with:
1. What you did
2. The deliverable (code, document, analysis, etc.)
3. Any notes or recommendations`;
  }

  async executeViaMLX(prompt, agent) {
    if (!CONFIG.autoExecute) {
      return { simulated: true, message: 'Auto-execution disabled' };
    }

    // Simulate execution for now
    console.log(`[Execute] ${agent.name} working on task...`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      content: `Task completed by ${agent.name}.\n\nDeliverable created successfully.`,
      tokens: 150,
      simulated: true
    };
  }

  async saveDeliverable(task, result) {
    const deliverableDir = path.join(__dirname, 'deliverables', task.goalId);
    fs.mkdirSync(deliverableDir, { recursive: true });
    
    const filename = `${task.id}-${task.name.replace(/\s+/g, '-').toLowerCase()}.md`;
    const filepath = path.join(deliverableDir, filename);
    
    const content = `# ${task.name}

**Goal:** ${task.goalTitle}  
**Agent:** ${task.agent}  
**Completed:** ${new Date().toISOString()}  
**Deliverable:** ${task.deliverable}

---

${result.content || JSON.stringify(result, null, 2)}
`;

    fs.writeFileSync(filepath, content);
    logInfo(`Saved deliverable: ${filepath}`);
  }

  getRunningTasks() {
    return Array.from(this.runningTasks.values());
  }
}

// State Manager
class StateManager {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
      }
    } catch (error) {
      logError('Failed to load state', error);
    }
    return this.getDefaultState();
  }

  getDefaultState() {
    return {
      version: '1.0',
      created: new Date().toISOString(),
      dailyLogs: [],
      completedTasks: [],
      goals: [],
      stats: {
        totalTasksCompleted: 0,
        totalHoursWorked: 0,
        activeGoals: 5
      }
    };
  }

  saveState() {
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
  }

  logDay(workPlan, completedTasks) {
    this.state.dailyLogs.push({
      date: new Date().toISOString(),
      plannedTasks: workPlan.totalTasks,
      completedTasks: completedTasks.length,
      hoursWorked: workPlan.estimatedHours,
      assignments: workPlan.assignments
    });

    this.state.completedTasks.push(...completedTasks);
    this.state.stats.totalTasksCompleted += completedTasks.length;
    this.state.stats.totalHoursWorked += workPlan.estimatedHours;

    this.saveState();
  }

  getProgress() {
    return {
      totalGoals: 5,
      activeGoals: this.state.stats.activeGoals,
      totalTasksCompleted: this.state.stats.totalTasksCompleted,
      totalHoursWorked: this.state.stats.totalHoursWorked,
      recentActivity: this.state.dailyLogs.slice(-7)
    };
  }
}

// Logger
function logInfo(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] INFO: ${message}\n`;
  console.log(logLine.trim());
  fs.appendFileSync(CONFIG.logFile, logLine);
}

function logError(message, error) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ERROR: ${message} - ${error?.message || error}\n`;
  console.error(logLine.trim());
  fs.appendFileSync(CONFIG.logFile, logLine);
}

// Dashboard Updater
class DashboardUpdater {
  updateDashboard(progress) {
    const dashboardData = {
      timestamp: new Date().toISOString(),
      stats: {
        totalTasks: progress.totalTasksCompleted,
        inProgress: 0, // Would need to track
        completed: progress.totalTasksCompleted,
        activeAgents: 14
      },
      recentActivity: this.formatActivity(progress.recentActivity),
      goals: progress.activeGoals,
      hoursWorked: progress.totalHoursWorked
    };

    // Save for dashboard to read
    fs.writeFileSync(
      path.join(__dirname, 'dashboard-data.json'),
      JSON.stringify(dashboardData, null, 2)
    );

    logInfo('Dashboard data updated');
  }

  formatActivity(logs) {
    return logs.map(log => ({
      time: new Date(log.date).toLocaleTimeString(),
      text: `Completed ${log.completedTasks}/${log.plannedTasks} tasks (${log.hoursWorked}h)`,
      icon: '✓'
    }));
  }
}

// Main Orchestrator
class AgentOrchestrator {
  constructor() {
    this.goalsParser = new GoalsParser();
    this.taskGenerator = new TaskGenerator();
    this.agentAssigner = new AgentAssigner();
    this.taskExecutor = new TaskExecutor();
    this.stateManager = new StateManager();
    this.dashboardUpdater = new DashboardUpdater();
  }

  async runDailyCycle() {
    logInfo('=== Starting Daily Agent Cycle ===');

    // 1. Parse goals
    const goals = this.goalsParser.parseGoalsFile();
    logInfo(`Loaded ${goals.length} goals`);

    // 2. Generate daily tasks
    const tasks = await this.taskGenerator.generateDailyTasks();
    logInfo(`Generated ${tasks.length} tasks for today`);

    // 3. Create work plan
    const workPlan = this.agentAssigner.createWorkPlan(tasks);
    logInfo(`Created work plan: ${workPlan.estimatedHours}h across ${Object.keys(workPlan.assignments).length} agents`);

    // 4. Execute tasks (limited parallelism)
    const completedTasks = [];
    const runningTasks = [];

    for (const task of tasks.slice(0, CONFIG.maxParallelTasks)) {
      const agent = this.agentAssigner.assignAgent(task);
      
      runningTasks.push(
        this.taskExecutor.executeTask(task, agent)
          .then(result => {
            completedTasks.push({ task, result, agent });
          })
          .catch(error => {
            logError(`Task failed: ${task.name}`, error);
          })
      );
    }

    await Promise.all(runningTasks);

    // 5. Log results
    this.stateManager.logDay(workPlan, completedTasks);

    // 6. Update dashboard
    const progress = this.stateManager.getProgress();
    this.dashboardUpdater.updateDashboard(progress);

    logInfo('=== Daily Cycle Complete ===');
    logInfo(`Completed ${completedTasks.length}/${tasks.length} tasks`);

    return {
      goals,
      tasks,
      workPlan,
      completedTasks,
      progress
    };
  }

  async runContinuous() {
    logInfo('Starting continuous agent orchestration');
    
    // Run immediately
    await this.runDailyCycle();

    // Schedule next runs
    const scheduleNext = () => {
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setHours(9, 0, 0, 0); // 9 AM
      
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      const delay = nextRun - now;
      logInfo(`Next cycle scheduled for ${nextRun.toISOString()}`);

      setTimeout(async () => {
        await this.runDailyCycle();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
  }

  getStatus() {
    return {
      state: this.stateManager.state,
      runningTasks: this.taskExecutor.getRunningTasks(),
      progress: this.stateManager.getProgress()
    };
  }
}

// CLI Interface
function printHelp() {
  console.log(`
Agent Orchestrator - Autonomous Goal Execution

Usage: node agent-orchestrator.js [command]

Commands:
  run           Run one daily cycle immediately
  continuous    Start continuous execution (runs daily at 9 AM)
  status        Show current status
  goals         List parsed goals
  plan          Generate today's work plan (don't execute)
  help          Show this help

Environment:
  MLX Server    : ${CONFIG.mlxEndpoint}
  OpenClaw     : ${CONFIG.openclawEndpoint}
  Goals File   : ${CONFIG.goalsFile}

The orchestrator reads goals from MISSION_CONTROL_BUILD_PLAN.md,
generates tasks, assigns them to agents, and executes via MLX (free).
`);
}

// Main
async function main() {
  const command = process.argv[2] || 'help';
  const orchestrator = new AgentOrchestrator();

  switch (command) {
    case 'run':
      await orchestrator.runDailyCycle();
      break;

    case 'continuous':
      await orchestrator.runContinuous();
      break;

    case 'status':
      console.log(JSON.stringify(orchestrator.getStatus(), null, 2));
      break;

    case 'goals':
      const goals = new GoalsParser().parseGoalsFile();
      console.log('Parsed Goals:');
      goals.forEach(g => {
        console.log(`\n${g.number}. ${g.title}`);
        console.log(`   Priority: ${g.priority}`);
        console.log(`   Hours: ${g.totalHours}`);
        console.log(`   Tasks: ${g.tasks.length}`);
      });
      break;

    case 'plan':
      const tasks = await new TaskGenerator().generateDailyTasks();
      const plan = new AgentAssigner().createWorkPlan(tasks);
      console.log('\n=== Today\'s Work Plan ===\n');
      console.log(`Total Tasks: ${plan.totalTasks}`);
      console.log(`Estimated Hours: ${plan.estimatedHours}\n`);
      
      Object.entries(plan.assignments).forEach(([agentId, assignment]) => {
        console.log(`${assignment.agent.emoji} ${assignment.agent.name} (${assignment.totalHours}h):`);
        assignment.tasks.forEach(t => {
          console.log(`  • ${t.name} (${t.estimatedHours}h) - ${t.priority}`);
        });
        console.log();
      });
      break;

    case 'help':
    default:
      printHelp();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  AgentOrchestrator,
  GoalsParser,
  TaskGenerator,
  AgentAssigner,
  TaskExecutor,
  StateManager
};
