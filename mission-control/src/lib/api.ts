// API client for Mission Control Backend
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:3001/api';

export interface SpawnAgentRequest {
  agentId: string;
  prompt: string;
  label?: string;
  timeoutMs?: number;
}

export interface SpawnAgentResponse {
  success: boolean;
  runId?: string;
  sessionKey?: string;
  label?: string;
  error?: string;
}

export interface AgentStatus {
  runId: string;
  sessionKey: string;
  label: string;
  task: string;
  status: 'running' | 'completed' | 'error' | 'killed';
  runtimeMs: number;
  model: string;
  startedAt: number;
  pendingDescendants?: number;
}

export interface AgentListResponse {
  total: number;
  active: AgentStatus[];
  recent: AgentStatus[];
}

export interface AvailableAgent {
  agentId: string;
  name: string;
  isDefault?: boolean;
}

class MissionControlAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Spawn a new agent
   */
  async spawnAgent(request: SpawnAgentRequest): Promise<SpawnAgentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/agent/spawn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to spawn agent: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('Error spawning agent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get list of active and recent agents
   */
  async listAgents(): Promise<AgentListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list agents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing agents:', error);
      return { total: 0, active: [], recent: [] };
    }
  }

  /**
   * Get status of a specific agent
   */
  async getAgentStatus(runId: string): Promise<AgentStatus | null> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/status/${runId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get agent status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting agent status:', error);
      return null;
    }
  }

  /**
   * Kill a running agent
   */
  async killAgent(runId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/kill/${runId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error killing agent:', error);
      return false;
    }
  }

  /**
   * Get available agents (configured agents in OpenClaw)
   */
  async getAvailableAgents(): Promise<AvailableAgent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/agents/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get available agents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting available agents:', error);
      // Return default agents
      return [
        { agentId: 'main', name: 'Main', isDefault: true },
        { agentId: 'coder', name: 'Coder' },
        { agentId: 'researcher', name: 'Researcher' },
        { agentId: 'reviewer', name: 'Reviewer' },
      ];
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const healthUrl = import.meta.env.DEV ? '/health' : 'http://localhost:3001/health';
      const response = await fetch(healthUrl, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const missionControlApi = new MissionControlAPI();
export default missionControlApi;
