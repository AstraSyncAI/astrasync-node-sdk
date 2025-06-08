import { Agent, RegistrationResponse } from '../types';

const DEFAULT_API_URL = 'https://astrasync-api-production.up.railway.app';

export class AstraSyncAPI {
  private apiUrl: string;
  private email: string;

  constructor(email: string, apiUrl: string = DEFAULT_API_URL) {
    this.email = email;
    this.apiUrl = apiUrl;
  }

  async registerAgent(agent: Agent): Promise<RegistrationResponse> {
    const response = await fetch(`${this.apiUrl}/v1/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-source': 'sdk'
      },
      body: JSON.stringify({
        email: this.email,
        agent: {
          ...agent, // Spread first to allow overrides (fixes TS error)
          owner: this.email,
          capabilities: agent.capabilities || [],
          version: agent.version || '1.0.0'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Registration failed: ${error}`);
    }

    // Type assertion to fix TS error
    return response.json() as Promise<RegistrationResponse>;
  }

  async verifyAgent(agentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/verify/${agentId}`);
      // Type assertion for the response
      const data = await response.json() as { exists: boolean };
      return data.exists === true;
    } catch {
      return false;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
