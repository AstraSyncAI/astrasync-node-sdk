/**
 * AstraSync SDK Quick Start Example
 * 
 * This example demonstrates the auto-detection capabilities of the SDK
 * Try running with different agent formats!
 */

import { AstraSync, printSuccess, printInfo, formatAgentId } from '@astrasync/sdk';

// Example agent formats
const mcpAgent = {
  name: "Customer Support Bot",
  description: "An AI agent that handles customer inquiries",
  version: "2.0.0",
  methods: {
    answerQuestion: { description: "Answer customer questions" },
    escalateToHuman: { description: "Escalate complex issues" }
  }
};

const lettaAgent = {
  id: "letta_12345",
  name: "Memory Assistant",
  memory: {
    core_memory: "I help users remember important information"
  },
  tools: ["calendar", "reminders", "notes"],
  model: "gpt-4"
};

const acpAgent = {
  agentId: "ACP-DEMO-001",
  name: "Compliance Monitor",
  description: "Monitors AI agent activities for compliance",
  skills: [
    {
      id: "audit-analyzer",
      name: "Audit Analyzer",
      description: "Analyzes agent interactions for compliance"
    }
  ],
  capabilities: {
    streaming: true,
    auditTrail: true,
    blockchainAttestation: true
  }
};

async function main() {
  // Initialize the SDK with your email
  const client = new AstraSync({
    email: process.env.ASTRASYNC_EMAIL || 'developer@example.com',
    debug: true // Enable debug mode to see protocol detection
  });

  console.log('🚀 AstraSync SDK Quick Start\n');

  try {
    // Example 1: Register MCP Agent
    console.log('1️⃣  Registering MCP Agent...');
    const mcpResult = await client.register(mcpAgent);
    printSuccess(`MCP Agent registered: ${formatAgentId(mcpResult.agentId)}`);
    console.log('');

    // Example 2: Register Letta Agent  
    console.log('2️⃣  Registering Letta Agent...');
    const lettaResult = await client.register(lettaAgent);
    printSuccess(`Letta Agent registered: ${formatAgentId(lettaResult.agentId)}`);
    console.log('');

    // Example 3: Register ACP Agent
    console.log('3️⃣  Registering ACP Agent...');
    const acpResult = await client.register(acpAgent);
    printSuccess(`ACP Agent registered: ${formatAgentId(acpResult.agentId)}`);
    console.log('');

    // Example 4: Register from file path
    console.log('4️⃣  Registering from file...');
    printInfo('Create an agent.json file and pass the path:');
    console.log('   const result = await client.register("./agent.json")');
    console.log('');

    // Example 5: Verify an agent
    console.log('5️⃣  Verifying agent...');
    const verification = await client.verify(mcpResult.agentId);
    if (verification.exists) {
      printSuccess(`Agent ${mcpResult.agentId} is verified!`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Run the example
main().catch(console.error);
