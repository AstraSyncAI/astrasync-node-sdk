import { Agent, ProtocolAdapter } from '@astrasync/core';
import { open, Entry, ZipFile } from 'yauzl';
import { promisify } from 'util';

const openZip = promisify(open);

export const lettaAdapter: ProtocolAdapter = {
  name: 'letta',
  
  detect: (input: any): boolean => {
    // Check if it's a Letta agent
    if (typeof input === 'object' && input !== null) {
      // Look for Letta-specific fields
      return !!(
        (input.id || input.agent_id) &&
        (input.memory || input.agent_state || input.model)
      );
    }
    
    if (typeof input === 'string') {
      // Check if it's JSON format (new Letta format)
      if (input.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(input);
          return lettaAdapter.detect(parsed);
        } catch {
          return false;
        }
      }
      
      // Could be a ZIP file path or content
      return input.endsWith('.af') || isZipContent(input);
    }
    
    return false;
  },
  
  parse: async (input: any): Promise<Agent> => {
    // Handle JSON format (new Letta format)
    if (typeof input === 'string' && input.trim().startsWith('{')) {
      const data = JSON.parse(input);
      return parseLettaJson(data);
    }
    
    // Handle object directly
    if (typeof input === 'object' && input !== null) {
      return parseLettaJson(input);
    }
    
    // Handle ZIP format (legacy)
    if (typeof input === 'string' && (input.endsWith('.af') || isZipContent(input))) {
      // This would need to be implemented with proper ZIP handling
      throw new Error('ZIP format support coming soon');
    }
    
    throw new Error('Invalid Letta agent format');
  },
  
  supportedExtensions: ['.af', '.json'],
  
  examples: [
    'agent.af',
    'letta-agent.json',
    '{"id": "123", "name": "Letta Agent", "memory": {}}'
  ]
};

function parseLettaJson(data: any): Agent {
  return {
    name: data.name || data.agent_name || `Agent_${data.id || data.agent_id}`,
    description: data.description || data.persona || 'Letta agent',
    owner: data.owner || data.user || data.user_id || 'Unknown',
    version: data.version || '1.0.0',
    capabilities: extractLettaCapabilities(data),
    skills: countLettaSkills(data),
    metadata: {
      lettaId: data.id || data.agent_id,
      model: data.model,
      memory: data.memory,
      tools: data.tools,
      source: 'letta'
    }
  };
}

function extractLettaCapabilities(data: any): string[] {
  const capabilities: string[] = [];
  
  if (data.memory) capabilities.push('memory');
  if (data.tools && data.tools.length > 0) capabilities.push('tools');
  if (data.streaming) capabilities.push('streaming');
  if (data.model) capabilities.push(`model:${data.model}`);
  
  return capabilities;
}

function countLettaSkills(data: any): number {
  let count = 0;
  
  if (data.tools && Array.isArray(data.tools)) {
    count += data.tools.length;
  }
  
  if (data.functions && Array.isArray(data.functions)) {
    count += data.functions.length;
  }
  
  return count;
}

function isZipContent(content: string): boolean {
  // Check for ZIP file magic bytes (PK)
  return content.startsWith('PK');
}
