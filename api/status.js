// API endpoint: /api/status.js
// Returns Mission Control system status

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_DIR = '/Users/daytrons/.openclaw/workspace';

function loadProjects() {
  try {
    const data = fs.readFileSync(path.join(WORKSPACE_DIR, 'projects/status.json'), 'utf8');
    return JSON.parse(data);
  } catch {
    return { projects: [] };
  }
}

function getGitStats() {
  try {
    const lastCommit = execSync('git log -1 --format="%h %s"', { 
      encoding: 'utf8',
      cwd: WORKSPACE_DIR
    }).trim();
    
    const uncommitted = parseInt(execSync('git status --porcelain | wc -l', {
      encoding: 'utf8',
      cwd: WORKSPACE_DIR
    }).trim()) || 0;
    
    return { lastCommit, uncommitted };
  } catch {
    return { lastCommit: 'Unknown', uncommitted: 0 };
  }
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
    const projects = loadProjects();
    const gitStats = getGitStats();
    
    const projectList = projects.projects || [];
    const active = projectList.filter(p => p.status === 'In Progress').length;
    const completed = projectList.filter(p => p.progress === 100).length;
    
    res.status(200).json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      projects: {
        total: projectList.length,
        active,
        completed,
        list: projectList.map(p => ({
          id: p.id,
          name: p.name,
          progress: p.progress,
          status: p.status,
          priority: p.priority
        }))
      },
      git: gitStats,
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
