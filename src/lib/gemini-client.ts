"""
/**
 * Gemini API Client
 * Communicates with the FastAPI backend for security analysis
 */

export interface AgentVote {
  id: string;
  name: string;
  decision: boolean;
  severity: string;
  confidence: number;
  attack_type: string;
  reasoning: string;
  recommendation: string;
  score: number;
}

export interface AnalysisResult {
  consensus_score: number;
  final_verdict: 'BLOCK' | 'ALLOW' | 'REVIEW';
  threat_detected: boolean;
  votes: AgentVote[];
  analysis_details: {
    threat_votes: number;
    safe_votes: number;
    total_agents: number;
    bft_threshold: number;
    metadata?: Record<string, any>;
  };
}

export interface AgentInfo {
  id: string;
  name: string;
  specialty: string;
}

class GeminiClient {
  private apiBaseUrl: string;

  constructor(baseUrl?: string) {
    this.apiBaseUrl = baseUrl || this.getApiBaseUrl();
  }

  private getApiBaseUrl(): string {
    // Try environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    // Default to localhost
    return 'http://localhost:8000';
  }

  /**
   * Check if the backend is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get information about all agents
   */
  async getAgents(): Promise<AgentInfo[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/agents`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      return data.agents;
    } catch (error) {
      console.error('Failed to get agents:', error);
      throw error;
    }
  }

  /**
   * Analyze a security log with all agents
   * Returns consensus voting result
   */
  async analyzeLog(log: string, metadata?: Record<string, any>): Promise<AnalysisResult> {
    if (!log.trim()) {
      throw new Error('Log cannot be empty');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          log: log.trim(),
          metadata: metadata || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze with a specific agent only
   */
  async analyzeWithAgent(
    agentId: string,
    log: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    if (!log.trim()) {
      throw new Error('Log cannot be empty');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze/agent/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          log: log.trim(),
          metadata: metadata || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Agent analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get frontend configuration
   */
  async getConfig(): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/config`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Failed to fetch config');
      return await response.json();
    } catch (error) {
      console.error('Failed to get config:', error);
      return {};
    }
  }
}

// Export singleton instance
export const geminiClient = new GeminiClient();

export default geminiClient;
"""
