// API Endpoints for Mission Control v2
// Serverless functions for Vercel deployment

// ============================================
// /api/spawn-agent
// ============================================
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, task, model, priority } = req.body;

  if (!type || !task) {
    return res.status(400).json({ error: 'Missing required fields: type, task' });
  }

  try {
    // In production, this would call OpenClaw API
    // For now, simulate the response
    const agent = {
      id: `agent-${Date.now()}`,
      type,
      task,
      model: model || 'gpt-4o',
      priority: priority || 'normal',
      status: 'running',
      spawnedAt: new Date().toISOString(),
      url: `${process.env.VERCEL_URL}/agent/${Date.now()}`
    };

    // Log to database or storage
    await logAgentSpawn(agent);

    return res.status(200).json({
      success: true,
      agent,
      message: `Agent ${agent.id} spawned successfully`
    });

  } catch (error) {
    console.error('Failed to spawn agent:', error);
    return res.status(500).json({
      error: 'Failed to spawn agent',
      details: error.message
    });
  }
}

// ============================================
// /api/agent-status
// ============================================
export async function getAgentStatus(req, res) {
  const { id } = req.query;

  try {
    // In production, query actual agent status
    const status = {
      id,
      status: 'running',
      progress: 65,
      logs: [
        { time: new Date().toISOString(), message: 'Agent initialized' },
        { time: new Date().toISOString(), message: 'Task started' }
      ]
    };

    return res.status(200).json(status);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// /api/costs
// ============================================
export async function getCosts(req, res) {
  try {
    const costs = {
      daily: 4.25,
      limit: 10,
      percentage: 42.5,
      history: [
        { date: '2026-03-08', amount: 3.80 },
        { date: '2026-03-09', amount: 4.25 }
      ],
      byModel: {
        'gpt-4o': 2.10,
        'claude-3': 1.50,
        'kimi-k2.5': 0.65
      }
    };

    return res.status(200).json(costs);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// /api/system-health
// ============================================
export async function getSystemHealth(req, res) {
  try {
    const health = {
      score: 87,
      status: 'healthy',
      checks: {
        agents: { status: 'ok', count: 9 },
        cron: { status: 'warning', failed: 2, total: 13 },
        memory: { status: 'ok', usage: '45%' },
        costs: { status: 'ok', percentage: 42.5 }
      },
      lastUpdated: new Date().toISOString()
    };

    return res.status(200).json(health);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// /api/natural-language
// ============================================
export async function parseNaturalLanguage(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Missing input' });
  }

  const patterns = {
    spawn: /spawn (\w+) (?:agent )?(?:to )?(.+)/i,
    status: /(?:what's |what is )?(?:the )?status (?:of )?(.+)/i,
    cost: /(?:show )?(?:me )?(?:the )?costs?/i,
    help: /help|what can you do/i
  };

  for (const [action, pattern] of Object.entries(patterns)) {
    const match = input.match(pattern);
    if (match) {
      return res.status(200).json({
        action,
        params: match.slice(1),
        confidence: 0.95
      });
    }
  }

  return res.status(200).json({
    action: 'unknown',
    error: 'Could not parse command',
    suggestion: 'Try: "spawn agent to...", "status of...", "show costs"'
  });
}

// ============================================
// /api/war-room/send
// ============================================
export async function sendWarRoomMessage(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, sender } = req.body;

  // Store message
  const msg = {
    id: Date.now(),
    message,
    sender: sender || 'user',
    timestamp: new Date().toISOString()
  };

  await storeMessage(msg);

  // Broadcast to connected clients (WebSocket)
  broadcastMessage(msg);

  return res.status(200).json({ success: true, message: msg });
}

// ============================================
// /api/war-room/messages
// ============================================
export async function getWarRoomMessages(req, res) {
  const { limit = 50 } = req.query;

  try {
    const messages = await fetchMessages(parseInt(limit));
    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ============================================
// Helper Functions
// ============================================

async function logAgentSpawn(agent) {
  // In production, save to database
  console.log('Agent spawned:', agent);
}

async function storeMessage(message) {
  // In production, save to database
  console.log('Message stored:', message);
}

async function fetchMessages(limit) {
  // In production, query database
  return [
    { id: 1, sender: 'system', message: 'Mission Control initialized', timestamp: new Date().toISOString() }
  ];
}

function broadcastMessage(message) {
  // In production, use WebSocket
  console.log('Broadcasting:', message);
}
