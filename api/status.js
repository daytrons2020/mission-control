// API endpoint: /api/status.js
// Returns Mission Control system status
// Vercel-compatible version (no local filesystem dependencies)

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const isVercel = process.env.VERCEL === '1';
    const deploymentUrl = process.env.VERCEL_URL || 'localhost';
    
    res.status(200).json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      environment: {
        platform: isVercel ? 'vercel' : 'local',
        url: isVercel ? `https://${deploymentUrl}` : 'http://localhost',
        region: process.env.VERCEL_REGION || 'unknown'
      },
      projects: {
        total: 0,
        active: 0,
        completed: 0,
        list: []
      },
      git: {
        lastCommit: 'N/A (serverless)',
        uncommitted: 0
      },
      agent: {
        name: 'Nano',
        version: '2.0',
        status: 'online'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
};
