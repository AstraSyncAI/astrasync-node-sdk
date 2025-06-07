import { Agent, ProtocolAdapter } from '@astrasync/core';

export const openaiAdapter: ProtocolAdapter = {
  name: 'openai',
  
  detect: (input: any): boolean => {
    if (typeof input === 'object' && input !== null) {
      // Look for OpenAI Assistant specific fields
      return !!(
        input.assistant_id ||
        (input.model && input.instructions) ||
        (input.tools && Array.isArray(input.tools) && 
         input.tools.some((t: any) => t.type === 'code_interpreter' || t.type === 'retrieval'))
      );
    }
    
    if (typeof input === 'string') {
      try {
        const parsed = JSON.parse(input);
        return openaiAdapter.detect(parsed);
      } catch {
        return false;
      }
    }
    
    return false;
  },
  
  parse: (input: any): Agent => {
    const data = typeof input === 'string' ? JSON.parse(input) : input;
    
    return {
      name: data.name || 'OpenAI Assistant',
      description: data.instructions || data.description || '',
      owner: data.owner || 'OpenAI User',
      version: '1.0.0',
      capabilities: extractOpenAICapabilities(data),
      skills: countOpenAITools(data),
      metadata: {
        assistantId: data.assistant_id || data.id,
        model: data.model,
        temperature: data.temperature,
        tools: data.tools,
        fileIds: data.file_ids,
        source: 'openai'
      }
    };
  },
  
  supportedExtensions: ['.json'],
  
  examples: [
    'openai-assistant.json',
    '{"assistant_id": "asst_123", "name": "My Assistant", "model": "gpt-4", "tools": []}'
  ]
};

function extractOpenAICapabilities(data: any): string[] {
  const capabilities: string[] = [];
  
  if (data.model) capabilities.push(`model:${data.model}`);
  
  if (data.tools && Array.isArray(data.tools)) {
    data.tools.forEach((tool: any) => {
      if (tool.type === 'code_interpreter') capabilities.push('code_interpreter');
      if (tool.type === 'retrieval') capabilities.push('retrieval');
      if (tool.type === 'function') capabilities.push('functions');
    });
  }
  
  if (data.file_ids && data.file_ids.length > 0) {
    capabilities.push('file_access');
  }
  
  return capabilities;
}

function countOpenAITools(data: any): number {
  if (!data.tools || !Array.isArray(data.tools)) return 0;
  
  return data.tools.filter((tool: any) => tool.type === 'function').length;
}
