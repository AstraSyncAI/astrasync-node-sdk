import { Agent, RegistrationResponse } from '../types';

const DEFAULT_API_URL = 'https://astrasync.ai/api';

export class AstraSyncAPI {
  private apiUrl: string;
  private email: string;
  private apiKey?: string;
  private password?: string;

  constructor(email: string, apiKey?: string, password?: string, apiUrl: string = DEFAULT_API_URL) {
    this.email = email;
    this.apiKey = apiKey;
    this.password = password;
    this.apiUrl = apiUrl;

    if (!apiKey && !password) {
      throw new Error('Authentication required: provide either apiKey or password');
    }
  }

  private async getAuthToken(): Promise<string> {
    if (this.apiKey) {
      return this.apiKey;
    }

    if (this.password) {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-source': 'sdk'
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Authentication failed: ${error}`);
      }

      const { data } = await response.json();
      return data.token;
    }

    throw new Error('No authentication method available');
  }

  async registerAgent(agent: Agent): Promise<RegistrationResponse> {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.apiUrl}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-source': 'sdk'
      },
      body: JSON.stringify({
        name: agent.name,
        description: agent.description,
        owner: this.email
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
