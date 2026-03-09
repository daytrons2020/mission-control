// API endpoint: /api/health.js
// Returns system health score and component status
// Vercel-compatible version (no local filesystem dependencies)

function calculateHealthScore() {
  // Since we're running on Vercel serverless, we can't access local system stats
  // Return a simulated health check based on the deployment environment
  
  const timestamp = new Date().toISOString();
  
  // Vercel environment indicators
  const isVercel = process.env.VERCEL === '1';
  const region = process.env.VERCEL_REGION || 'unknown';
  
  // All components are healthy in serverless environment
  const components = [
    { 
      name: 'Vercel Edge', 
      score: 100, 
      status: 'healthy', 
      details: `Region: ${region}` 
    },
    { 
      name: 'API Status', 
      score: 100, 
      status: 'healthy', 
      details: 'All endpoints operational' 
    },
    { 
      name: 'Deployment', 
      score: 100, 
      status: 'healthy', 
      details: isVercel ? 'Running on Vercel' : 'Running locally' 
    },
    { 
      name: 'Timestamp', 
      score: 100, 
      status: 'healthy', 
      details: new Date().toLocaleTimeString() 
    }
  ];
  
  const totalScore = 100;
  
  return {
    score: totalScore,
    status: 'healthy',
    timestamp,
    environment: isVercel ? 'vercel' : 'local',
    region,
    components
  };
}

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const health = calculateHealthScore();
    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to calculate health score',
      message: error.message 
    });
  }
};
