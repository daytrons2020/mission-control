const express = require('express');
const { spawn, exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store for active agents (in-memory, will reset on server restart)
const activeAgents = new Map();
let agentCounter = 0;

// Helper to execute OpenClaw commands
function execOpenClaw(command, timeout = 30000) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout }, (error, stdout, stderr) => {
      if (error && !stdout) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const result = await execOpenClaw('openclaw gateway call health --json');
    const health = JSON.parse(result);
    res.json({ ok: true, gateway: health });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

// List all agents (active and recent)
app.get('/api/agents/list', async (req, res) => {
  try {
    // Get session info from OpenClaw gateway
    const result = await execOpenClaw('openclaw gateway call health --json');
    const health = JSON.parse(result);
    
    // Extract agent sessions from all configured agents
    const allSessions = [];
    
    if (health.agents) {
      for (const agent of health.agents) {
        if (agent.sessions && agent.sessions.recent) {
          for (const session of agent.sessions.recent) {
            // Only include subagent sessions
            if (session.key && session.key.includes(':subagent:')) {
              allSessions.push({
                runId: session.key,
                sessionKey: session.key,
                label: session.key.split(':').pop().substring(0, 12),
                task: 'Agent task',
                status: 'running',
                runtimeMs: session.age || 0,
                model: 'unknown',
                startedAt: Date.now() - (session.age || 0),
              });
            }
          }
        }
      }
    }

    // Merge with our tracked agents - sanitize output
    const trackedAgents = Array.from(activeAgents.values()).map(agent => ({
      runId: agent.runId,
      sessionKey: agent.sessionKey,
      label: agent.label,
      task: agent.task,
      status: agent.status,
      model: agent.model,
      startedAt: agent.startedAt,
      endedAt: agent.endedAt,
      runtimeMs: agent.runtimeMs,
      exitCode: agent.exitCode,
      agentId: agent.agentId,
    }));
    
    res.json({
      total: trackedAgents.length,
      active: trackedAgents.filter(a => a.status === 'running'),
      recent: trackedAgents.filter(a => a.status !== 'running'),
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    // Return tracked agents on error
    const trackedAgents = Array.from(activeAgents.values());
    res.json({ 
      total: trackedAgents.length,
      active: trackedAgents.filter(a => a.status === 'running'),
      recent: trackedAgents.filter(a => a.status !== 'running'),
    });
  }
});

// Spawn a new agent
app.post('/api/agent/spawn', async (req, res) => {
  const { agentId, prompt, model, label, timeoutMs } = req.body;

  if (!agentId || !prompt) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: agentId and prompt',
    });
  }

  try {
    agentCounter++;
    const runId = `agent-${Date.now()}-${agentCounter}`;
    const agentLabel = label || `task-${agentCounter}`;
    
    // Store agent info immediately
    const agentInfo = {
      runId,
      sessionKey: runId,
      label: agentLabel,
      task: prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''),
      status: 'running',
      model: model || 'default',
      startedAt: Date.now(),
      agentId,
      fullPrompt: prompt,
    };

    activeAgents.set(runId, agentInfo);

    // Spawn the agent using openclaw agent command
    // This runs in background and we track it
    const escapedPrompt = prompt.replace(/"/g, '\\"').replace(/\n/g, ' ');
    
    // Build command - model is configured per agent in OpenClaw
    let agentCommand = `openclaw agent --agent ${agentId}`;
    agentCommand += ` --message "${escapedPrompt}" --json`;

    console.log(`Spawning agent: ${agentCommand}`);

    // Execute agent in background
    const child = spawn('sh', ['-c', agentCommand], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.error(`Agent ${runId} stderr:`, data.toString());
    });

    child.on('close', (code) => {
      console.log(`Agent ${runId} exited with code ${code}`);
      const agent = activeAgents.get(runId);
      if (agent) {
        agent.status = code === 0 ? 'completed' : 'error';
        agent.exitCode = code;
        agent.output = output;
        agent.endedAt = Date.now();
        agent.runtimeMs = agent.endedAt - agent.startedAt;
      }
    });

    // Unref so it doesn't block server shutdown
    child.unref();

    // Store child process reference
    agentInfo.process = child;
    agentInfo.pid = child.pid;

    res.json({
      success: true,
      runId,
      sessionKey: runId,
      label: agentLabel,
    });
  } catch (error) {
    console.error('Error spawning agent:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get agent status
app.get('/api/agents/status/:runId', async (req, res) => {
  const { runId } = req.params;

  const agent = activeAgents.get(runId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  // Update runtime
  if (agent.status === 'running') {
    agent.runtimeMs = Date.now() - agent.startedAt;
  }

  res.json({
    runId: agent.runId,
    sessionKey: agent.sessionKey,
    label: agent.label,
    task: agent.task,
    status: agent.status,
    runtimeMs: agent.runtimeMs,
    model: agent.model,
    startedAt: agent.startedAt,
    endedAt: agent.endedAt,
    exitCode: agent.exitCode,
  });
});

// Kill an agent
app.post('/api/agents/kill/:runId', async (req, res) => {
  const { runId } = req.params;

  const agent = activeAgents.get(runId);
  
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  if (agent.status !== 'running') {
    return res.json({ success: true, message: 'Agent already stopped' });
  }

  try {
    // Kill the process
    if (agent.process && agent.pid) {
      process.kill(-agent.pid, 'SIGTERM'); // Negative PID kills process group
    }
    
    agent.status = 'killed';
    agent.endedAt = Date.now();
    agent.runtimeMs = agent.endedAt - agent.startedAt;

    res.json({ success: true });
  } catch (error) {
    console.error('Error killing agent:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get available agents (configured agents)
app.get('/api/agents/available', async (req, res) => {
  try {
    const result = await execOpenClaw('openclaw agents list --json');
    const agents = JSON.parse(result);
    res.json(agents.map(a => ({
      agentId: a.agentId,
      name: a.name || a.agentId,
      isDefault: a.isDefault,
    })));
  } catch (error) {
    // Return default agents if command fails
    res.json([
      { agentId: 'main', name: 'Main', isDefault: true },
      { agentId: 'coder', name: 'Coder' },
      { agentId: 'researcher', name: 'Researcher' },
      { agentId: 'reviewer', name: 'Reviewer' },
    ]);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Mission Control API server running on port ${PORT}`);
  console.log(`Gateway proxy for OpenClaw agent management`);
});
