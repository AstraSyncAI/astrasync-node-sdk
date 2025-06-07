import { AstraSync } from '../index';
import { mcpAdapter, lettaAdapter, acpAdapter } from '../index';

describe('AstraSync SDK', () => {
  let client: AstraSync;

  beforeEach(() => {
    client = new AstraSync({ email: 'test@example.com' });
  });

  describe('Protocol Detection', () => {
    test('should detect MCP format', () => {
      const mcpAgent = {
        name: 'Test MCP Agent',
        description: 'Test agent',
        methods: { test: { description: 'Test method' } }
      };

      expect(mcpAdapter.detect(mcpAgent)).toBe(true);
      expect(lettaAdapter.detect(mcpAgent)).toBe(false);
      expect(acpAdapter.detect(mcpAgent)).toBe(false);
    });

    test('should detect Letta format', () => {
      const lettaAgent = {
        id: 'letta_123',
        memory: { core: 'test' },
        tools: ['test']
      };

      expect(lettaAdapter.detect(lettaAgent)).toBe(true);
      expect(mcpAdapter.detect(lettaAgent)).toBe(false);
      expect(acpAdapter.detect(lettaAgent)).toBe(false);
    });

    test('should detect ACP format', () => {
      const acpAgent = {
        agentId: 'ACP-123',
        skills: [],
        authentication: { schemes: ['oauth2'] }
      };

      expect(acpAdapter.detect(acpAgent)).toBe(true);
      expect(mcpAdapter.detect(acpAgent)).toBe(false);
      expect(lettaAdapter.detect(acpAgent)).toBe(false);
    });
  });

  describe('Email Validation', () => {
    test('should reject invalid email on construction', () => {
      expect(() => new AstraSync({ email: 'invalid' })).toThrow('Invalid email');
      expect(() => new AstraSync({ email: 'test@' })).toThrow('Invalid email');
      expect(() => new AstraSync({ email: '@example.com' })).toThrow('Invalid email');
    });

    test('should accept valid email', () => {
      expect(() => new AstraSync({ email: 'valid@example.com' })).not.toThrow();
      expect(() => new AstraSync({ email: 'test.user+tag@example.co.uk' })).not.toThrow();
    });
  });
});
