/**
 * OpenClaw API Service for Mission Control
 * Connects to local OpenClaw gateway for real-time data
 */

class OpenClawService {
  constructor() {
    this.baseUrl = 'http://127.0.0.1:18789';
    this.token = '7b586e91b0b8625e5536418f5cc3e176c4fb721f155cd502';
    this.cacheKey = 'mc_openclaw_data';
    this.cacheTimestampKey = 'mc_openclaw_timestamp';
    this.refreshInterval = 60000; // 1 minute
  }

  /**
   * Make authenticated request to OpenClaw gateway
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`[OpenClaw] Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get gateway status
   */
  async getGatewayStatus() {
    return await this.request('/status');
  }

  /**
   * Get active sessions (agents)
   */
  async getActiveSessions() {
    try {
      const data = await this.request('/sessions?activeMinutes=60');
      return data.sessions || [];
    } catch (error) {
      console.error('[OpenClaw] Error getting sessions:', error);
      return [];
    }
  }

  /**
   * Get cron jobs
   */
  async getCronJobs() {
    try {
      // Try to get cron jobs from gateway
      const data = await this.request('/cron/list');
      return data.jobs || [];
    } catch (error) {
      console.error('[OpenClaw] Error getting cron jobs:', error);
      return [];
    }
  }

  /**
   * Get agent configurations
   */
  async getAgentConfigs() {
    try {
      const data = await this.request('/config/agents');
      return data.agents || [];
    } catch (error) {
      console.error('[OpenClaw] Error getting agent configs:', error);
      return [];
    }
  }

  /**
   * Spawn a new agent
   */
  async spawnAgent(agentId, task) {
    try {
      return await this.request('/sessions/spawn', {
        method: 'POST',
        body: JSON.stringify({
          agentId,
          task,
          mode: 'run'
        })
      });
    } catch (error) {
      console.error('[OpenClaw] Error spawning agent:', error);
      throw error;
    }
  }

  /**
   * Get combined dashboard data
   */
  async getDashboardData() {
    try {
      const [sessions, jobs] = await Promise.all([
        this.getActiveSessions(),
        this.getCronJobs()
      ]);

      // Map sessions to agent status
      const agentStatus = this.mapSessionsToAgents(sessions);

      // Calculate health score
      const healthScore = this.calculateHealthScore(jobs, sessions);

      return {
        agents: agentStatus,
        cronJobs: jobs,
        healthScore,
        activeSessions: sessions.length,
        lastUpdated: new Date().toISOString(),
        connected: true
      };
    } catch (error) {
      console.error('[OpenClaw] Error getting dashboard data:', error);
      return {
        agents: [],
        cronJobs: [],
        healthScore: 0,
        activeSessions: 0,
        lastUpdated: new Date().toISOString(),
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Map sessions to agent status
   */
  mapSessionsToAgents(sessions) {
    const agentMap = new Map();

    sessions.forEach(session => {
      const agentId = session.agentId || 'unknown';
      if (!agentMap.has(agentId)) {
        agentMap.set(agentId, {
          id: agentId,
          name: this.formatAgentName(agentId),
          status: 'busy',
          sessions: [],
          lastActive: session.lastActiveAt
        });
      }
      agentMap.get(agentId).sessions.push(session);
    });

    return Array.from(agentMap.values());
  }

  /**
   * Format agent ID to readable name
   */
  formatAgentName(agentId) {
    const names = {
      'main': 'Nano (Coordinator)',
      'coder': 'Coder',
      'researcher': 'Researcher',
      'reviewer': 'Reviewer',
      'integration-specialist': 'Integration Specialist',
      'frontend-developer': 'Frontend Developer',
      'database-engineer': 'Database Engineer',
      'backend-developer': 'Backend Developer',
      'ai-engineer': 'AI Engineer'
    };
    return names[agentId] || agentId;
  }

  /**
   * Calculate system health score
   */
  calculateHealthScore(jobs, sessions) {
    let score = 100;

    // Deduct for failed cron jobs
    const failedJobs = jobs.filter(j => j.lastRunStatus === 'error').length;
    score -= failedJobs * 10;

    // Deduct for no active sessions
    if (sessions.length === 0) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  /**
   * Check if OpenClaw is reachable
   */
  async isConnected() {
    try {
      await this.getGatewayStatus();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create global instance
window.openClawService = new OpenClawService();
