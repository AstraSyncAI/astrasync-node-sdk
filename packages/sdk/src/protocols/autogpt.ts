import { Agent, ProtocolAdapter } from '@astrasync/core';

export const autogptAdapter: ProtocolAdapter = {
  name: 'autogpt',
  
  detect: (input: any): boolean => {
    if (typeof input === 'object' && input !== null) {
      // Look for AutoGPT specific fields
      return !!(
        input.ai_name ||
        input.ai_role ||
        (input.ai_goals && Array.isArray(input.ai_goals)) ||
        input.agent_settings ||
        input.command_registry
      );
    }
    
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        return autogptAdapter.detect(parsed);
      } catch {
        return false;
      }
    }
    
    return false;
  },
  
  parse: (input: any): Agent => {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    
    return {
      name: data.ai_name || data.agent_name || 'AutoGPT Agent',
      description: data.ai_role || data.description || formatGoals(data.ai_goals),
      owner: data.owner || 'AutoGPT User',
      version: data.version || '1.0.0',
      capabilities: extractAutoGPTCapabilities(data),
      skills: countAutoGPTCommands(data),
      metadata: {
        aiGoals: data.ai_goals,
        commandRegistry: data.command_registry,
        constraints: data.constraints,
        resources: data.resources,
        evaluationCriteria: data.evaluation_criteria,
        source: 'autogpt'
      }
    };
  },
  
  supportedExtensions: ['.json', '.yaml', '.yml'],
  
  examples: [
    'autogpt-agent.json',
    '{"ai_name": "ResearchBot", "ai_role": "Research Assistant", "ai_goals": ["Research topics", "Summarize findings"]}'
  ]
};

function formatGoals(goals: string[] | undefined): string {
  if (!goals || goals.length === 0) return 'AutoGPT Agent';
  return `Agent with goals: ${goals.join(', ')}`;
}

function extractAutoGPTCapabilities(data: any): string[] {
  const capabilities: string[] = [];
  
  // Extract from command registry
  if (data.command_registry) {
    if (Array.isArray(data.command_registry)) {
      data.command_registry.forEach((cmd: any) => {
        if (cmd.name) capabilities.push(`command:${cmd.name}`);
      });
    } else if (typeof data.command_registry === 'object') {
      Object.keys(data.command_registry).forEach(cmd => {
        capabilities.push(`command:${cmd}`);
      });
    }
  }
  
  // Extract from resources
  if (data.resources && Array.isArray(data.resources)) {
    data.resources.forEach((resource: string) => {
      capabilities.push(`resource:${resource}`);
    });
  }
  
  // Common AutoGPT capabilities
  if (data.can_write_files) capabilities.push('file_write');
  if (data.can_read_files) capabilities.push('file_read');
  if (data.can_execute_commands) capabilities.push('command_execution');
  if (data.can_search_web) capabilities.push('web_search');
  
  return capabilities;
}

function countAutoGPTCommands(data: any): number {
  if (!data.command_registry) return 0;
  
  if (Array.isArray(data.command_registry)) {
    return data.command_registry.length;
  }
  
  if (typeof data.command_registry === 'object') {
    return Object.keys(data.command_registry).length;
  }
  
  return 0;
}
