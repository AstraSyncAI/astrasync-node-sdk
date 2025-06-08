import { readFileSync } from 'fs';
import { Agent } from '../types';

export function parseLettaAgent(filePath: string): Agent {
  // For .af files, we read as JSON for now
  // TODO: Add proper ZIP handling for .af files in future version
  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    return {
      name: data.name || 'Letta Agent',
      description: data.description || 'Letta Agent',
      version: data.version || '1.0.0',
      capabilities: data.capabilities || ['memory', 'tools']
    };
  } catch (error) {
    // If parsing fails, return default
    return {
      name: 'Letta Agent',
      description: 'Imported Letta Agent',
      version: '1.0.0',
      capabilities: ['memory', 'tools']
    };
  }
}
