import { Agent, ProtocolAdapter, Skill } from '@astrasync/core';

export const acpAdapter: ProtocolAdapter = {
  name: 'acp',
  
  detect: (input: any): boolean => {
    if (typeof input === 'object' && input !== null) {
      // Look for ACP-specific fields
      return !!(
        (input.agentId || input.id) &&
        (input.skills || input.authentication || input.defaultInputModes)
      );
    }
    
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        return acpAdapter.detect(parsed);
      } catch {
        return false;
      }
    }
    
    return false;
  },
  
  parse: (input: any): Agent => {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    
    return {
      name: data.name || data.agentName || 'Unnamed ACP Agent',
      description: data.description || '',
      owner: data.owner || data.developer || 'Unknown',
      ownerUrl: data.ownerUrl || data.url,
      version: data.version || '1.0.0',
      capabilities: extractAcpCapabilities(data),
      skills: parseAcpSkills(data.skills),
      authentication: data.authentication,
      metadata: {
        acpId: data.agentId || data.id,
        schemaVersion: data.schemaVersion,
        defaultInputModes: data.defaultInputModes,
        defaultOutputModes: data.defaultOutputModes,
        source: 'acp'
      }
    };
  },
  
  supportedExtensions: ['.json', '.acp.json'],
  
  examples: [
    'acp-agent.json',
    '{"agentId": "AGENT-123", "name": "ACP Agent", "skills": []}'
  ]
};

function extractAcpCapabilities(data: any): string[] {
  const capabilities: string[] = [];
  
  // Extract from capabilities object
  if (data.capabilities) {
    if (typeof data.capabilities === 'object' && !Array.isArray(data.capabilities)) {
      Object.entries(data.capabilities).forEach(([key, value]) => {
        if (value === true) {
          capabilities.push(key);
        }
      });
    } else if (Array.isArray(data.capabilities)) {
      capabilities.push(...data.capabilities);
    }
  }
  
  // Add capabilities based on other fields
  if (data.streaming) capabilities.push('streaming');
  if (data.pushNotifications) capabilities.push('pushNotifications');
  if (data.auditTrail) capabilities.push('auditTrail');
  if (data.blockchainAttestation) capabilities.push('blockchainAttestation');
  
  return capabilities;
}

function parseAcpSkills(skills: any): number | Skill[] {
  if (!skills) return 0;
  
  if (typeof skills === 'number') return skills;
  
  if (Array.isArray(skills)) {
    return skills.map(skill => ({
      id: skill.id || skill.name,
      name: skill.name || skill.id,
      description: skill.description,
      tags: skill.tags || []
    }));
  }
  
  return 0;
}
