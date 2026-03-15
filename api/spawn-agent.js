// API: /api/spawn-agent
// Spawns OpenClaw agents (connects to local OpenClaw gateway)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, task, model, priority } = req.body;

  if (!type || !task) {
    return res.status(400).json({ error: 'Missing required fields: type, task' });
  }

  try {
    // Try to connect to local OpenClaw gateway
    const OPENCLAW_GATEWAY = process.env.OPENCLAW_GATEWAY || 'http://127.0.0.1:18789';
    
    const openclawResponse = await fetch(`${OPENCLAW_GATEWAY}/v1/agents/spawn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENCLAW_TOKEN || ''}`
      },
      body: JSON.stringify({
        type,
        task,
        model: model || 'kimi-k2.5',
        priority: priority || 'normal'
      })
    });

    if (openclawResponse.ok) {
      const agentData = await openclawResponse.json();
      return res.status(200).json({
        success: true,
        id: agentData.id || `agent-${Date.now()}`,
        type,
        task,
        model: model || 'kimi-k2.5',
        status: 'running',
        spawnedAt: new Date().toISOString(),
        source: 'openclaw',
        url: `${OPENCLAW_GATEWAY}/agents/${agentData.id}`
      });
    }
    
    // If OpenClaw not available, return helpful error
    throw new Error('OpenClaw gateway not responding. Make sure OpenClaw is running on port 18789.');
    
  } catch (error) {
    console.error('[Spawn Agent] Error:', error);
    
    // Return error but with helpful info
    return res.status(503).json({
      error: 'OpenClaw not available',
      message: error.message,
      hint: 'Make sure OpenClaw desktop app is running',
      fallback: {
        canCreateLocal: true,
        message: 'Agent spawning requires OpenClaw to be running locally'
      }
    });
  }
}
