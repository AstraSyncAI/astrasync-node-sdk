import { Agent, ProtocolAdapter } from '@astrasync/core';

export const mcpAdapter: ProtocolAdapter = {
  name: 'mcp',
  
  detect: (input: any): boolean => {
    // Check if it's an MCP agent object or file
    if (typeof input === 'object' && input !== null) {
      // Look for MCP-specific fields
      return !!(
        input.name &&
        (input.description || input.methods || input.version || input.mcpVersion)
      );
    }
    
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        return mcpAdapter.detect(parsed);
      } catch {
        return false;
      }
    }
    
    return false;
  },
  
  parse: (input: any): Agent => {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    
    return {
      name: data.name || 'Unnamed MCP Agent',
      description: data.description || '',
      owner: data.owner || data.author || 'Unknown',
      ownerUrl: data.url || data.homepage,
      version: data.version || '1.0.0',
      capabilities: extractMcpCapabilities(data),
      skills: data.methods ? Object.keys(data.methods).length : 0,
      metadata: {
        mcpVersion: data.mcpVersion,
        methods: data.methods,
        source: 'mcp'
      }
    };
  },
  
  supportedExtensions: ['.json', '.mcp.json'],
  
  examples: [
    'mcp-agent.json',
    '{"name": "My MCP Agent", "description": "An MCP protocol agent", "methods": {}}'
  ]
};

function extractMcpCapabilities(data: any): string[] {
  const capabilities: string[] = [];
  
  if (data.methods) {
    Object.keys(data.methods).forEach(method => {
      capabilities.push(`method:${method}`);
    });
  }
  
  if (data.capabilities) {
    if (Array.isArray(data.capabilities)) {
      capabilities.push(...data.capabilities);
    } else if (typeof data.capabilities === 'object') {
      Object.entries(data.capabilities).forEach(([key, value]) => {
        if (value) capabilities.push(key);
      });
    }
  }
  
  return capabilities;
}
