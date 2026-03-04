// API endpoint: /api/health.js
// Returns system health score and component status

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = '/Users/daytrons/.openclaw/workspace';

function getDiskUsage() {
  try {
    const output = execSync("df -h / | tail -1 | awk '{print $5}' | sed 's/%//'", { encoding: 'utf8' });
    return parseInt(output.trim()) || 0;
  } catch {
    return 0;
  }
}

function getMemoryInfo() {
  try {
    const output = execSync("vm_stat | grep 'Pages free' | awk '{print $3}' | sed 's/\\.//'", { encoding: 'utf8' });
    const freePages = parseInt(output.trim()) || 0;
    // Rough estimate: 4KB pages, assume 8GB total
    const totalPages = 2000000;
    return Math.min(100, Math.round((freePages / totalPages) * 100));
  } catch {
    return 75;
  }
}

function getGitStatus() {
  try {
    const output = execSync('git status --porcelain | wc -l', { 
      encoding: 'utf8',
      cwd: WORKSPACE_DIR
    });
    return parseInt(output.trim()) || 0;
  } catch {
    return 0;
  }
}

function getCronCount() {
  try {
    const output = execSync("crontab -l 2>/dev/null | grep -c '^[^#]' || echo 0", { encoding: 'utf8' });
    return parseInt(output.trim()) || 0;
  } catch {
    return 0;
  }
}

function calculateHealthScore() {
  const diskUsed = getDiskUsage();
  const memoryFree = getMemoryInfo();
  const uncommitted = getGitStatus();
  const cronJobs = getCronCount();
  
  // Component scores (0-100)
  const diskScore = Math.max(0, 100 - diskUsed);
  const memoryScore = memoryFree;
  const gitScore = Math.max(50, 100 - uncommitted);
  const cronScore = cronJobs > 0 ? 80 : 50;
  
  // Weights
  const weights = {
    disk: 0.25,
    memory: 0.20,
    git: 0.25,
    cron: 0.30
  };
  
  const totalScore = Math.round(
    diskScore * weights.disk +
    memoryScore * weights.memory +
    gitScore * weights.git +
    cronScore * weights.cron
  );
  
  const status = totalScore >= 80 ? 'healthy' : totalScore >= 60 ? 'warning' : 'critical';
  
  return {
    score: totalScore,
    status,
    timestamp: new Date().toISOString(),
    components: [
      { name: 'Disk Usage', score: diskScore, status: diskScore > 70 ? 'healthy' : diskScore > 50 ? 'warning' : 'critical', details: `${diskUsed}% used` },
      { name: 'Memory', score: memoryScore, status: memoryScore > 20 ? 'healthy' : 'warning', details: `~${memoryScore}% free` },
      { name: 'Git Status', score: gitScore, status: uncommitted === 0 ? 'healthy' : uncommitted < 10 ? 'warning' : 'critical', details: `${uncommitted} uncommitted` },
      { name: 'Cron Jobs', score: cronScore, status: cronJobs > 0 ? 'healthy' : 'warning', details: `${cronJobs} jobs scheduled` }
    ]
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
