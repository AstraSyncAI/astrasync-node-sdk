import { readFileSync } from 'fs';
import { Agent, AgentFormat, DetectionResult } from '../types';
import { parseLettaAgent } from '../adapters/letta';

export function detectAgentFormat(content: any): DetectionResult {
  // If it's a string, try to parse it
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch {
      // Check if it's a Letta .af file path
      if (content.endsWith('.af')) {
        try {
          const lettaAgent = parseLettaAgent(content);
          return {
            format: 'letta',
            confidence: 1.0,
            agent: lettaAgent
          };
        } catch {
          return { format: 'unknown', confidence: 0 };
        }
      }
      return { format: 'unknown', confidence: 0 };
    }
  }

  // MCP Detection
  if (content.protocol === 'ai-agent' && content.skills) {
    return {
      format: 'mcp',
      confidence: 0.95,
      agent: {
        name: content.name,
        description: content.description || 'MCP Agent',
        version: content.version,
        capabilities: content.skills?.map((s: any) => s.name) || []
      }
    };
  }

  // Letta Detection
  if (content.type === 'agent' && content.memory) {
    return {
      format: 'letta',
      confidence: 0.95,
      agent: {
        name: content.name || 'Letta Agent',
        description: content.description || 'Letta Agent',
        capabilities: ['memory', 'tools']
      }
    };
  }

  // ACP Detection
  if (content.agentId && content.authentication) {
    return {
      format: 'acp',
      confidence: 0.9,
      agent: {
        name: content.name || content.agentName || content.agentId,
        description: content.description || 'ACP Agent',
        capabilities: content.capabilities || []
      }
    };
  }

  // OpenAI Detection
  if (content.model && content.instructions) {
    return {
      format: 'openai',
      confidence: 0.9,
      agent: {
        name: content.name || 'OpenAI Assistant',
        description: content.instructions || 'OpenAI Assistant',
        capabilities: content.tools?.map((t: any) => t.type) || []
      }
    };
  }

  // AutoGPT Detection
  if (content.ai_name && content.ai_role) {
    return {
      format: 'autogpt',
      confidence: 0.9,
      agent: {
        name: content.ai_name,
        description: content.ai_role,
        capabilities: content.ai_goals || []
      }
    };
  }

  return { format: 'unknown', confidence: 0 };
}
