/**
 * GitHub Data Service for Mission Control
 * Fetches project data from GitHub API (no authentication required for public repos)
 */

const GITHUB_API_BASE = 'https://api.github.com/repos/daytrons2020/mission-control/contents';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/daytrons2020/mission-control/main';

/**
 * Fetch and parse TASKS.md to get project list
 */
async function fetchTasks() {
  try {
    const response = await fetch(`${GITHUB_RAW_BASE}/TASKS.md`);
    if (!response.ok) throw new Error('Failed to fetch TASKS.md');
    
    const markdown = await response.text();
    return parseTasksMarkdown(markdown);
  } catch (error) {
    console.error('[GitHub Service] Error fetching tasks:', error);
    return { projects: [], lastUpdated: null };
  }
}

/**
 * Parse TASKS.md markdown to extract project data
 */
function parseTasksMarkdown(markdown) {
  const projects = [];
  const lines = markdown.split('\n');
  
  // Parse the table in TASKS.md
  let inTable = false;
  
  for (const line of lines) {
    // Detect table start (header row)
    if (line.includes('| Project | Status | Progress | Priority |')) {
      inTable = true;
      continue;
    }
    
    // Skip separator line
    if (line.includes('|---------|')) continue;
    
    // Parse table rows
    if (inTable && line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      if (parts.length >= 4) {
        const [name, statusEmoji, progress, priority] = parts;
        
        // Extract status from emoji
        let status = 'planning';
        if (statusEmoji.includes('🟢')) status = 'active';
        else if (statusEmoji.includes('🟡')) status = 'planning';
        else if (statusEmoji.includes('🔴')) status = 'blocked';
        
        // Parse progress percentage
        const progressMatch = progress.match(/(\d+)%/);
        const progressValue = progressMatch ? parseInt(progressMatch[1]) : 0;
        
        projects.push({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          status: status,
          progress: progressValue,
          priority: priority.toLowerCase(),
          rawStatus: statusEmoji
        });
      }
    }
    
    // Exit table on empty line after table content
    if (inTable && line.trim() === '' && projects.length > 0) {
      inTable = false;
    }
  }
  
  // Extract last updated date
  const lastUpdatedMatch = markdown.match(/\*\*Last Updated:\*\*\s*(.+)/);
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1].trim() : null;
  
  return { projects, lastUpdated };
}

/**
 * Fetch build plan data
 */
async function fetchBuildPlan() {
  try {
    const response = await fetch(`${GITHUB_RAW_BASE}/MISSION_CONTROL_BUILD_PLAN.md`);
    if (!response.ok) throw new Error('Failed to fetch build plan');
    
    const markdown = await response.text();
    return parseBuildPlan(markdown);
  } catch (error) {
    console.error('[GitHub Service] Error fetching build plan:', error);
    return { goals: [], totalHours: 0 };
  }
}

/**
 * Parse build plan markdown
 */
function parseBuildPlan(markdown) {
  const goals = [];
  const goalMatches = markdown.matchAll(/### \d+\.\s+(.+?)\n\*\*What:\*\*\s*(.+?)(?=###|$)/gs);
  
  for (const match of goalMatches) {
    const [_, title, description] = match;
    
    // Extract hours for this goal
    const hoursMatch = markdown.match(/\*\*Total:\*\*\s*(\d+)\s*hours/);
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    
    goals.push({
      title: title.trim(),
      description: description.trim().split('\n')[0],
      estimatedHours: hours
    });
  }
  
  // Extract total hours
  const totalMatch = markdown.match(/\*\*Grand Total:\*\*\s*~?(\d+)h/);
  const totalHours = totalMatch ? parseInt(totalMatch[1]) : 0;
  
  return { goals, totalHours };
}

/**
 * Get all dashboard data in one call
 */
async function fetchDashboardData() {
  console.log('[GitHub Service] Fetching dashboard data...');
  
  const [tasksData, buildPlanData] = await Promise.all([
    fetchTasks(),
    fetchBuildPlan()
  ]);
  
  // Calculate stats
  const totalProjects = tasksData.projects.length;
  const activeProjects = tasksData.projects.filter(p => p.status === 'active').length;
  const avgProgress = totalProjects > 0 
    ? Math.round(tasksData.projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    : 0;
  
  // Priority breakdown
  const highPriority = tasksData.projects.filter(p => p.priority === 'high').length;
  const mediumPriority = tasksData.projects.filter(p => p.priority === 'medium').length;
  const lowPriority = tasksData.projects.filter(p => p.priority === 'low').length;
  
  return {
    projects: tasksData.projects,
    goals: buildPlanData.goals,
    stats: {
      totalProjects,
      activeProjects,
      planningProjects: tasksData.projects.filter(p => p.status === 'planning').length,
      blockedProjects: tasksData.projects.filter(p => p.status === 'blocked').length,
      avgProgress,
      highPriority,
      mediumPriority,
      lowPriority
    },
    lastUpdated: tasksData.lastUpdated || new Date().toISOString(),
    fetchedAt: new Date().toISOString()
  };
}

// Export for use in app.js
window.GitHubService = {
  fetchDashboardData,
  fetchTasks,
  fetchBuildPlan
};
