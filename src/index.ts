import { Agent, RegistrationResponse, AstraSyncOptions, AgentFormat } from './types';
import { AstraSyncAPI } from './utils/api';
import { detectAgentFormat } from './utils/detector';
import { calculateTrustScore } from './utils/trustScore';

export class AstraSync {
  private api: AstraSyncAPI;

  constructor(options: AstraSyncOptions) {
    this.api = new AstraSyncAPI(options.developerEmail, options.apiUrl);
  }

  async register(agentData: any): Promise<RegistrationResponse> {
    // Auto-detect format
    const detection = detectAgentFormat(agentData);
    
    if (detection.format === 'unknown' || !detection.agent) {
      throw new Error('Unable to detect agent format. Please check your agent data.');
    }

    // Calculate trust score
    const trustScore = calculateTrustScore(detection.agent);

    // Register with API
    const response = await this.api.registerAgent(detection.agent);

    // Enhance response with detected format
    return {
      ...response,
      detectedFormat: detection.format,
      trustScore: `${trustScore}%`
    };
  }

  async verify(agentId: string): Promise<boolean> {
    return this.api.verifyAgent(agentId);
  }

  detect(agentData: any): AgentFormat {
    return detectAgentFormat(agentData).format;
  }

  async health(): Promise<boolean> {
    return this.api.checkHealth();
  }
}

// Export everything
export * from './types';
export { detectAgentFormat } from './utils/detector';
export { calculateTrustScore } from './utils/trustScore';
