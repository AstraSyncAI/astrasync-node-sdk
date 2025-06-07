#!/usr/bin/env node

import { Command } from 'commander';
import { writeFile } from 'fs/promises';
import {
  createSpinner,
  printSuccess,
  printError,
  printInfo,
  printWarning,
  formatAgentId,
  formatTrustScore,
  isValidEmail
} from '@astrasync/core';
import { AstraSync } from '../index';
import { version } from '../../package.json';
import chalk from 'chalk';

const program = new Command();

program
  .name('astrasync')
  .description('CLI for AstraSync AI Agent Registration')
  .version(version);

// Register command
program
  .command('register <agent>')
  .description('Register an AI agent with AstraSync')
  .option('-e, --email <email>', 'Developer email (required)')
  .option('-o, --output <file>', 'Save registration result to file')
  .option('-d, --debug', 'Enable debug mode')
  .action(async (agentPath: string, options) => {
    try {
      // Get email from options or environment
      const email = options.email || process.env.ASTRASYNC_EMAIL;
      
      if (!email) {
        printError('Email is required. Use --email flag or set ASTRASYNC_EMAIL environment variable');
        process.exit(1);
      }

      if (!isValidEmail(email)) {
        printError('Invalid email address');
        process.exit(1);
      }

      const spinner = createSpinner('Registering agent...');
      
      try {
        const client = new AstraSync({
          email,
          debug: options.debug
        });

        // Check if it's inline JSON
        let input: string | object = agentPath;
        if (agentPath.trim().startsWith('{')) {
          try {
            input = JSON.parse(agentPath);
            spinner.text = 'Detected inline JSON input...';
          } catch {
            // Not JSON, treat as file path
          }
        }

        spinner.text = 'Detecting agent format...';
        
        const result = await client.register(input);
        
        spinner.succeed('Agent registered successfully!');
        
        console.log('');
        printSuccess(`Agent ID: ${formatAgentId(result.agentId)}`);
        printInfo(`Trust Score: ${formatTrustScore(result.trustScore || 'TEMP-95')}`);
        printInfo(`Status: ${chalk.yellow(result.status)}`);
        
        if (result.blockchain) {
          printInfo(`Blockchain: ${chalk.yellow(result.blockchain.status)}`);
        }
        
        // Save to file if requested
        if (options.output) {
          await writeFile(options.output, JSON.stringify(result, null, 2));
          console.log('');
          printSuccess(`Registration saved to ${chalk.cyan(options.output)}`);
        }

        // Show next steps
        console.log('');
        printInfo('Next steps:');
        console.log(`  1. Check your email (${chalk.cyan(email)}) for updates`);
        console.log(`  2. Visit ${chalk.cyan('https://astrasync.ai/alphaSignup')} to join the alpha`);
        console.log(`  3. Your agent will receive a permanent ID upon blockchain registration`);
        
      } catch (error: any) {
        spinner.fail('Registration failed');
        printError(error.message);
        
        if (options.debug && error.stack) {
          console.error(chalk.gray(error.stack));
        }
        
        process.exit(1);
      }
    } catch (error: any) {
      printError(error.message);
      process.exit(1);
    }
  });

// Verify command
program
  .command('verify <agentId>')
  .description('Verify if an agent is registered')
  .option('-d, --debug', 'Enable debug mode')
  .action(async (agentId: string, options) => {
    try {
      const email = process.env.ASTRASYNC_EMAIL || 'verify@astrasync.ai';
      
      const spinner = createSpinner(`Verifying agent ${formatAgentId(agentId)}...`);
      
      const client = new AstraSync({
        email,
        debug: options.debug
      });

      const result = await client.verify(agentId);
      
      if (result.exists) {
        spinner.succeed('Agent verified!');
        console.log('');
        printSuccess(`Agent ID: ${formatAgentId(result.agentId!)}`);
        printInfo(`Status: ${chalk.green(result.status || 'registered')}`);
        if (result.trustScore) {
          printInfo(`Trust Score: ${formatTrustScore(result.trustScore)}`);
        }
        if (result.registeredAt) {
          printInfo(`Registered: ${new Date(result.registeredAt).toLocaleString()}`);
        }
      } else {
        spinner.fail('Agent not found');
        printWarning(`No agent found with ID: ${agentId}`);
      }
    } catch (error: any) {
      printError(error.message);
      process.exit(1);
    }
  });

// Health check command
program
  .command('health')
  .description('Check AstraSync API health')
  .action(async () => {
    const spinner = createSpinner('Checking API health...');
    
    try {
      const client = new AstraSync({
        email: 'health@check.com'
      });

      const healthy = await client.healthCheck();
      
      if (healthy) {
        spinner.succeed('API is healthy!');
        printSuccess('AstraSync API is operational');
      } else {
        spinner.fail('API is not responding');
        printError('Unable to reach AstraSync API');
        process.exit(1);
      }
    } catch (error: any) {
      spinner.fail('Health check failed');
      printError(error.message);
      process.exit(1);
    }
  });

// Detect command
program
  .command('detect <agent>')
  .description('Detect the format/protocol of an agent file')
  .action(async (agentPath: string) => {
    try {
      printInfo(`Analyzing ${chalk.cyan(agentPath)}...`);
      
      const client = new AstraSync({
        email: 'detect@astrasync.ai'
      });

      // Use private method through type assertion
      const detectProtocol = (client as any).detectProtocol.bind(client);
      
      let data = agentPath;
      if (!agentPath.trim().startsWith('{')) {
        const { readFileContent } = await import('@astrasync/core');
        data = await readFileContent(agentPath);
      }

      const adapter = detectProtocol(data);
      
      if (adapter) {
        printSuccess(`Detected format: ${chalk.green(adapter.name.toUpperCase())}`);
        console.log('');
        printInfo('This agent can be registered with:');
        console.log(chalk.gray(`  astrasync register ${agentPath} --email your@email.com`));
      } else {
        printError('Unable to detect agent format');
        printInfo('Supported formats: MCP, Letta, ACP, OpenAI, AutoGPT');
      }
    } catch (error: any) {
      printError(error.message);
      process.exit(1);
    }
  });

// Examples command
program
  .command('examples')
  .description('Show example agent formats')
  .action(() => {
    console.log(chalk.bold('\n📚 AstraSync Agent Format Examples\n'));
    
    console.log(chalk.yellow('MCP Agent:'));
    console.log(chalk.gray(JSON.stringify({
      name: "My MCP Agent",
      description: "An MCP protocol agent",
      version: "1.0.0",
      methods: {
        greet: { description: "Say hello" }
      }
    }, null, 2)));
    
    console.log(chalk.yellow('\nLetta Agent:'));
    console.log(chalk.gray(JSON.stringify({
      id: "agent_123",
      name: "Letta Assistant",
      memory: { core: {} },
      tools: ["web_search", "calculator"]
    }, null, 2)));
    
    console.log(chalk.yellow('\nACP Agent:'));
    console.log(chalk.gray(JSON.stringify({
      agentId: "AGENT-456",
      name: "ACP Protocol Agent",
      skills: [
        { id: "skill1", name: "Data Analysis" }
      ],
      authentication: { schemes: ["oauth2"] }
    }, null, 2)));
    
    console.log(chalk.yellow('\nOpenAI Assistant:'));
    console.log(chalk.gray(JSON.stringify({
      assistant_id: "asst_789",
      name: "GPT Assistant",
      model: "gpt-4",
      tools: [
        { type: "code_interpreter" }
      ]
    }, null, 2)));
    
    console.log(chalk.yellow('\nAutoGPT Agent:'));
    console.log(chalk.gray(JSON.stringify({
      ai_name: "ResearchBot",
      ai_role: "Research Assistant",
      ai_goals: [
        "Research topics",
        "Summarize findings"
      ]
    }, null, 2)));
    
    console.log(chalk.bold('\n💡 Usage Examples:\n'));
    console.log(chalk.gray('  # Register from file'));
    console.log('  astrasync register agent.json --email dev@example.com\n');
    console.log(chalk.gray('  # Register inline JSON'));
    console.log('  astrasync register \'{"name":"Test","description":"Demo"}\' --email dev@example.com\n');
    console.log(chalk.gray('  # Save registration result'));
    console.log('  astrasync register agent.af --email dev@example.com --output result.json\n');
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
