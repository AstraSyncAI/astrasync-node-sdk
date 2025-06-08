import { AstraSync } from '@astrasyncai/sdk';
import mcpAgent from './mcp-agent.json';

async function main() {
  const client = new AstraSync({
    developerEmail: 'developer@example.com'
  });

  try {
    const result = await client.register(mcpAgent);
    console.log('Registration successful:', result);
  } catch (error) {
    console.error('Registration failed:', error);
  }
}

main();
