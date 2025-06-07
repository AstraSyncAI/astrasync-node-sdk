// Core types shared across all AstraSync packages

export interface AstraSyncConfig {
  email: string;
  apiUrl?: string;
  apiKey?: string; // Future auth support
  debug?: boolean;
  timeout?: number;
}

export interface Agent {
  name: string;
  description: string;
  owner: string;
  ownerUrl?: string;
  capabilities?: string[];
  version?: string;
  skills?: number | Skill[];
  authentication?: AuthenticationScheme;
  metadata?: Record<string, any>;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
}

export interface AuthenticationScheme {
  schemes?: string[];
  required?: boolean;
}

export interface RegistrationRequest {
  email: string;
  agent: Agent & {
    agentType?: 'mcp' | 'letta' | 'acp' | 'openai' | 'autogpt' | 'custom';
    [key: string]: any; // Protocol-specific fields
  };
}

export interface RegistrationResponse {
  agentId: string;
  status: 'registered' | 'pending' | 'failed';
  message: string;
  trustScore?: string;
  blockchain?: {
    status: string;
    txHash?: string;
    message?: string;
  };
  agentJson?: AgentJson;
}

export interface AgentJson {
  schemaVersion: string;
  agentId: string;
  name: string;
  description: string;
  version: string;
  owner: string;
  ownerUrl?: string;
  url?: string;
  documentationUrl?: string;
  trustScore: {
    score_provider: string;
    score_uri: string;
    last_validated: string;
    signature?: string;
  };
  capabilities: Record<string, boolean>;
  authentication?: any;
  skills?: any[];
  registeredAt: string;
}

export interface VerificationResponse {
  exists: boolean;
  agentId?: string;
  status?: string;
  registeredAt?: string;
  trustScore?: string;
}

export interface ProtocolAdapter {
  name: string;
  detect: (input: any) => boolean;
  parse: (input: any) => Agent;
  supportedExtensions?: string[];
  examples?: string[];
}

export interface LogEvent {
  event: 'registration_attempt' | 'registration_success' | 'registration_failed' | 'registration_error';
  data: {
    email: string;
    agentName?: string;
    protocol?: string;
    source: string;
    error?: string;
    timestamp: string;
  };
}
