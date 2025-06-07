import { RegistrationRequest, RegistrationResponse, VerificationResponse, LogEvent } from './types';

const DEFAULT_API_URL = 'https://astrasync-api-production.up.railway.app';

export class ApiClient {
  private apiUrl: string;
  private apiKey?: string;
  private timeout: number;
  private debug: boolean;

  constructor(config: {
    apiUrl?: string;
    apiKey?: string;
    timeout?: number;
    debug?: boolean;
  }) {
    this.apiUrl = config.apiUrl || DEFAULT_API_URL;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.debug = config.debug || false;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    headers: Record<string, string> = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${path}`;
    
    if (this.debug) {
      console.log(`[AstraSync] ${method} ${url}`);
      if (body) console.log('[AstraSync] Body:', JSON.stringify(body, null, 2));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-source': 'sdk',
          ...headers,
          ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      if (this.debug) {
        console.log('[AstraSync] Response:', JSON.stringify(data, null, 2));
      }

      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async register(request: RegistrationRequest): Promise<RegistrationResponse> {
    // Log the attempt first
    await this.logAttempt({
      event: 'registration_attempt',
      data: {
        email: request.email,
        agentName: request.agent.name,
        protocol: request.agent.agentType || 'unknown',
        source: 'sdk',
        timestamp: new Date().toISOString()
      }
    }).catch(() => {}); // Don't fail registration if logging fails

    try {
      const response = await this.request<RegistrationResponse>(
        'POST',
        '/v1/register',
        request
      );

      // Log success
      await this.logAttempt({
        event: 'registration_success',
        data: {
          email: request.email,
          agentName: request.agent.name,
          protocol: request.agent.agentType || 'unknown',
          source: 'sdk',
          timestamp: new Date().toISOString()
        }
      }).catch(() => {});

      return response;
    } catch (error: any) {
      // Log failure
      await this.logAttempt({
        event: 'registration_failed',
        data: {
          email: request.email,
          agentName: request.agent.name,
          protocol: request.agent.agentType || 'unknown',
          source: 'sdk',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }).catch(() => {});

      throw error;
    }
  }

  async verify(agentId: string): Promise<VerificationResponse> {
    return this.request<VerificationResponse>('GET', `/v1/verify/${agentId}`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.request('GET', '/');
      return true;
    } catch {
      return false;
    }
  }

  private async logAttempt(event: LogEvent): Promise<void> {
    try {
      await this.request('POST', '/v1/log-attempt', event);
    } catch (error) {
      if (this.debug) {
        console.error('[AstraSync] Failed to log attempt:', error);
      }
    }
  }
}
