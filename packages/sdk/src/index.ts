import {
  AstraSyncConfig,
  Agent,
  RegistrationResponse,
  VerificationResponse,
  ProtocolAdapter,
  ApiClient,
  readFileContent,
  calculateTrustScore,
  isValidEmail
} from '@astrasync/core';

import { mcpAdapter } from './protocols/mcp';
import { lettaAdapter } from './protocols/letta';
import { acpAdapter } from './protocols/acp';
import { openaiAdapter } from './protocols/openai';
import { autogptAdapter } from './protocols/autogpt';

export * from '@astrasync/core';

export class AstraSync {
  private config: AstraSyncConfig;
  private client: ApiClient;
  private adapters: Map<string, ProtocolAdapter>;

  constructor(config: Partial<AstraSyncConfig> & { email: string }) {
    if (!isValidEmail(config.email)) {
      throw new Error('Invalid email address');
    }

    this.config = {
      email: config.email,
      apiUrl: config.apiUrl,
      apiKey: config.apiKey,
      debug: config.debug || false,
      timeout: config.timeout || 30000
    };

    this.client = new ApiClient(this.config);
    
    // Initialize protocol adapters
    this.adapters = new Map([
      ['mcp', mcpAdapter],
      ['letta', lettaAdapter],
      ['acp', acpAdapter],
      ['openai', openaiAdapter],
      ['autogpt', autogptAdapter]
    ]);
  }

  /**
   * Register an AI agent with AstraSync
   * Automatically detects the agent format/protocol
   */
  async register(input: string | object): Promise<RegistrationResponse> {
    // Load file if input is a path
    let data = input;
    if (typeof input === 'string' && !input.trim().startsWith('{') && !input.trim().startsWith('[')) {
      // Assume it's a file path
      const content = await readFileContent(input);
      data = content;
    }

    // Auto-detect protocol
    const adapter = this.detectProtocol(data);
    if (!adapter) {
      throw new Error('Unable to detect agent format. Supported formats: MCP, Letta, ACP, OpenAI, AutoGPT');
    }

    if (this.config.debug) {
      console.log(`Detected protocol: ${adapter.name}`);
    }

    // Parse agent data
    const agent = await adapter.parse(data);
    
    // Calculate trust score
    const trustScore = calculateTrustScore(agent);

    // Build registration request
    const request = {
      email: this.config.email,
      agent: {
        ...agent,
        agentType: adapter.name as any,
        owner: agent.owner === 'Unknown' ? this.config.email : agent.owner,
        trustScore
      }
    };

    // Register with API
    const response = await this.client.register(request);

    // Enhance response with agent.json format
    if (response.agentId) {
      response.agentJson = this.generateAgentJson(response.agentId, agent, trustScore);
    }

    return response;
  }

  /**
   * Verify if an agent is registered
   */
  async verify(agentId: string): Promise<VerificationResponse> {
    if (!agentId) {
      throw new Error('Agent ID is required');
    }

    return this.client.verify(agentId);
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck();
  }

  /**
   * Add a custom protocol adapter
   */
  addProtocol(adapter: ProtocolAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Detect which protocol/format the input uses
   */
  private detectProtocol(input: any): ProtocolAdapter | null {
    for (const adapter of this.adapters.values()) {
      if (adapter.detect(input)) {
        return adapter;
      }
    }
    return null;
  }

  /**
   * Generate agent.json structure
   */
  private generateAgentJson(agentId: string, agent: Agent, trustScore: number): any {
    return {
      schemaVersion: '1.0.0',
      agentId,
      name: agent.name,
      description: agent.description,
      version: agent.version || '1.0.0',
      owner: agent.owner,
      ownerUrl: agent.ownerUrl,
      trustScore: {
        score_provider: 'AstraSync',
        score_uri: `${this.config.apiUrl || 'https://api.astrasync.ai'}/trust/${agentId}`,
        last_validated: new Date().toISOString(),
        value: `TEMP-${trustScore}%`
      },
      capabilities: agent.capabilities || [],
      authentication: agent.authentication,
      skills: agent.skills,
      registeredAt: new Date().toISOString()
    };
  }
}

// Export individual adapters for advanced usage
export { mcpAdapter, lettaAdapter, acpAdapter, openaiAdapter, autogptAdapter };

// Convenience function for quick registration
export async function quickRegister(
  email: string,
  agentPath: string | object
): Promise<RegistrationResponse> {
  const client = new AstraSync({ email });
  return client.register(agentPath);
}
